# main.py
#
# Small FastAPI service providing two endpoints for CreaBeaStudio's
# photo editor: background removal and background blur. Both share the
# same underlying segmentation step (rembg) — blur just uses the mask
# differently than removal does.
#
# Deploy target: Render (free tier works fine — see deployment notes
# in README.md). Designed to be called ONLY from your Next.js API route
# (server-to-server), never directly from the browser, so CORS is
# locked down to that one trusted origin via an environment variable.

import io
import os
import threading

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, ImageFilter

app = FastAPI(title="CreaBeaStudio Photo Tools")

# ── CORS ────────────────────────────────────────────────────────────────
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ── MODEL SESSION — lazy-loaded, not loaded at import time ──────────────
# IMPORTANT: `rembg` itself (and the `onnxruntime` it pulls in) is now
# imported INSIDE get_session() below, not at the top of this file.
# Importing onnxruntime is slow on a CPU-starved host (Render's free
# tier gives just 0.1 CPU) — doing it at module level was eating into
# Render's startup port-scan window before uvicorn could even bind,
# causing "Port scan timeout reached, no open ports detected" even
# though the app would have started fine given more time. Keeping the
# top of this file light (just FastAPI/PIL) lets uvicorn bind almost
# immediately; the first real request pays the rembg/onnxruntime import
# cost once, lazily.
#
# "u2netp" is the deliberately lightweight model in this family (~4.7MB
# vs ~170MB for isnet-general-use/u2net) — a safer fit for 512MB RAM.
MODEL_NAME = os.environ.get("BG_MODEL_NAME", "u2netp")

_session = None
_session_lock = threading.Lock()


def get_session():
    global _session
    if _session is None:
        with _session_lock:
            if _session is None:  # re-check inside the lock
                from rembg import new_session  # deferred import — see note above
                _session = new_session(MODEL_NAME)
    return _session


@app.on_event("startup")
def warm_up_in_background():
    """
    Kicks off model loading in a background thread right after the
    server starts accepting connections — NOT before. This is safe
    because Render's port-scan only checks for an open socket, which
    uvicorn already provides before this event fires; the actual model
    import/download still happens off the main thread, so it can't block
    startup the way the old module-level loading did.
    Benefit: by the time a real user clicks "Remove Background," the
    slow one-time import + model download has likely already finished
    in the background, instead of that cost landing on their first
    request. get_session()'s lock means this can't race with (or
    duplicate) a real request that arrives before warm-up finishes.
    """
    def _warm():
        try:
            get_session()
            print("Warm-up complete: model loaded and ready.")
        except Exception as e:
            print(f"Warm-up failed (non-fatal, will retry on first real request): {e}")

    threading.Thread(target=_warm, daemon=True).start()


@app.get("/health")
def health():
    """Lightweight endpoint to check the service is up (and to pre-warm
    it from your frontend before a user actually needs it, if you want)."""
    return {"status": "ok"}


# Max dimension (longest side) fed into the ML model. Real customer
# photos (often 10+ megapixels from a phone camera) decoded into memory
# alongside the model's own memory use can spike well past Render's
# free-tier 512MB limit during actual inference — even though the model
# FILE itself is tiny. Downscaling before inference keeps peak memory
# bounded regardless of the original photo's size; the resulting mask
# is then upscaled back to the original resolution, so the final output
# still uses the photo's full original detail. 1024 is a conservative,
# safe choice for a 512MB host.
MAX_INFERENCE_DIM = int(os.environ.get("MAX_INFERENCE_DIM", "1024"))


def _get_full_res_mask(original: "Image.Image") -> "Image.Image":
    """
    Runs background removal on a DOWNSCALED copy of `original` (bounded
    by MAX_INFERENCE_DIM) to keep memory use safe regardless of the
    input photo's real size, then upscales the resulting alpha mask
    back to `original`'s exact size. Returns that full-resolution mask
    (an "L" mode image) — callers composite it against the full-res
    original themselves.
    """
    from rembg import remove  # deferred import — keeps startup fast

    w, h = original.size
    longest = max(w, h)
    if longest > MAX_INFERENCE_DIM:
        scale = MAX_INFERENCE_DIM / longest
        small = original.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    else:
        small = original

    buf = io.BytesIO()
    small.convert("RGB").save(buf, format="JPEG", quality=90)
    small_bytes = buf.getvalue()

    cutout_bytes = remove(small_bytes, session=get_session())
    cutout = Image.open(io.BytesIO(cutout_bytes)).convert("RGBA")
    small_mask = cutout.split()[3]  # alpha channel = subject mask, at the SMALL size

    # Upscale the mask back to the original photo's true resolution.
    full_res_mask = small_mask.resize(original.size, Image.LANCZOS)
    return full_res_mask


@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """
    Returns the uploaded photo with its background removed — a
    transparent PNG with just the subject, at the ORIGINAL photo's full
    resolution (inference itself runs on a downscaled copy for memory
    safety; only the resulting mask gets scaled back up).
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image.")

    input_bytes = await file.read()

    try:
        original = Image.open(io.BytesIO(input_bytes)).convert("RGB")
        mask = _get_full_res_mask(original)

        result = original.convert("RGBA")
        result.putalpha(mask)

        buf = io.BytesIO()
        result.save(buf, format="PNG")
        output_bytes = buf.getvalue()
    except Exception as e:
        raise HTTPException(500, f"Background removal failed: {e}")

    return Response(content=output_bytes, media_type="image/png")


@app.post("/blur-background")
async def blur_background(file: UploadFile = File(...), blur_strength: int = 18):
    """
    Returns the uploaded photo with the background blurred and the
    subject left sharp, at the ORIGINAL photo's full resolution.
    `blur_strength` controls the Gaussian blur radius (higher = more
    blurred), default 18 is a moderate "portrait mode" style blur.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image.")

    input_bytes = await file.read()

    try:
        original = Image.open(io.BytesIO(input_bytes)).convert("RGB")
        mask = _get_full_res_mask(original)

        blurred = original.filter(ImageFilter.GaussianBlur(blur_strength))

        # Sharp subject where mask is opaque, blurred elsewhere.
        result = Image.composite(original, blurred, mask)
    except Exception as e:
        raise HTTPException(500, f"Background blur failed: {e}")

    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=92)
    return Response(content=buf.getvalue(), media_type="image/jpeg")
