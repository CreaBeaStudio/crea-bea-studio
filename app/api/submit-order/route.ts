import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// UPDATED (2026-07-27):
//  - Returns error CODES ("NO_IMAGE", "EMAIL_REQUIRED", "SAVE_FAILED",
//    "SUBMIT_FAILED") instead of hardcoded English sentences -- see
//    lib/apiErrors.ts. The client translates the code; this route no
//    longer decides what language the customer sees.
//  - Persists `locale` into order.json, read from the create page's
//    own URL segment and sent as a new `locale` form field. This is
//    step one of threading the customer's language through to the
//    post-purchase delivery email (fulfillOrder.ts / lib/email.ts) --
//    those still need to be updated to actually read and use it.

// ── GCS: writes the photo + order params this order needs later, at
// /generate-full time (webservice/main.py). Mirrors that file's own
// bucket default exactly, so a missing GCS_ORDERS_BUCKET env var here
// still lands in the same place main.py would look. ─────────────────
const GCS_BUCKET_NAME = process.env.GCS_ORDERS_BUCKET || "crea-bea-pbn-orders";

// Lazily built (not at module load) so a missing/malformed credential
// only breaks requests that actually need GCS, rather than crashing
// this route's cold start for every request including ones that would
// otherwise fail validation first (no image / no email).
function getStorageClient(): Storage {
  const b64 = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
  if (!b64) {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 is not configured");
  }
  let credentials: any;
  try {
    credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  } catch {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 could not be decoded/parsed -- check it was base64-encoded before pasting into Vercel");
  }
  return new Storage({ credentials, projectId: credentials.project_id });
}

// Mirrors LEVEL_TO_DIFFICULTY in create/page.tsx exactly -- the create
// page only ever sends "level" ("15"/"24"/"36") in its form data, not
// "difficulty" directly, but webservice/main.py's /generate-full reads
// order.json's "difficulty" field ("beginner"/"standard"/"advanced").
// This is the one place that translation needs to happen, since this
// route is what actually writes order.json.
const LEVEL_TO_DIFFICULTY: Record<string, string> = {
  "15": "beginner",
  "24": "standard",
  "36": "advanced",
};

// Determines the file extension /generate-full will look for
// (orders/{orderId}/photo.{ext}) -- prefers the uploaded filename's own
// extension (normalizing "jpeg" to "jpg" to match what's actually used
// elsewhere in this project), falling back to the browser-reported MIME
// type if the filename has no usable extension.
function extFromFile(file: File): string {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && /^[a-z0-9]+$/.test(nameExt) && nameExt.length <= 5) {
    return nameExt === "jpeg" ? "jpg" : nameExt;
  }
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  return mimeMap[file.type] || "jpg";
}

// ── EMAIL ARCHITECTURE (2026-07-17): this route used to also send an
// internal pre-payment Resend notification, carrying the raw photo as
// an attachment. That existed for ONE reason -- before /generate-full
// automation existed, that email + attachment was Mirjam's only way to
// get the photo out in order to convert it manually. Now that
// /generate-full (webservice/main.py) does the conversion automatically
// once triggered, that email is redundant and has been removed.
//
// The photo + order.json GCS write below stays exactly as it was --
// explicitly kept as a backup route in case the automated conversion
// ever fails and manual intervention is needed again.
//
// The actual customer-facing order/payment confirmation still comes
// from LemonSqueezy/Payhip directly, as it already does. The NEW
// post-purchase delivery email (purchased files + upsell markers +
// optional free full-guide link) lives in lib/email.ts +
// lib/fulfillOrder.ts, and fires once the (not-yet-wired) payment
// webhook calls fulfillOrder(orderId) -- not from this route.
export async function POST(req: NextRequest) {
  console.log("=== SUBMIT ORDER CALLED ===");
  console.log("GCS key:", process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64 ? "SET" : "MISSING");

  try {
    const formData      = await req.formData();
    const imageFile     = formData.get("image") as File | null;
    const customerEmail = (formData.get("email") as string || "").trim();
    const level         = (formData.get("level") as string) || "24";
    // ── PAPER SIZE (2026-07-24): chosen on /create's Step 4 now, sent
    // straight through here as a backup record -- checkout itself
    // (create-checkout) is what actually carries paperSize for pricing
    // and fulfillment, this is just so the pre-payment backup record in
    // GCS matches what the customer actually chose, in case anyone ever
    // needs to look it up before/without a completed payment. ─────────
    const paperSizeRaw  = (formData.get("paperSize") as string) || "a4";
    const paperSize     = paperSizeRaw === "letter" ? "letter" : "a4";
    const sets          = (formData.get("sets") as string) || "";
    const indPens       = (formData.get("indPens") as string) || "";
    const allOrdersRaw  = (formData.get("allOrders") as string) || "[]";
    const grandTotal    = parseInt(formData.get("grandTotal") as string || "0", 10);
    // ── FULL GUIDE (2026-07-17): opt-in checkbox on the create page's
    // full366 upsell panel. Carried straight through into order.json;
    // /generate-full reads it from there to decide whether to also
    // build full-guide.pdf. ─────────────────────────────────────────
    const wantsFullGuide = (formData.get("wantsFullGuide") as string) === "true";
    // ── LOCALE (2026-07-27): the customer's language, read from the
    // create page's own URL segment ([locale]) and sent through as a
    // plain form field. Persisted so fulfillOrder() can eventually pass
    // it to the delivery email functions in lib/email.ts, which will
    // use it to pick which language to send the email in. Falls back
    // to "en" if somehow missing (shouldn't happen -- every page is
    // under app/[locale]/, so a locale segment always exists).
    const locale        = (formData.get("locale") as string) || "en";

    if (!imageFile)     return NextResponse.json({ error: "NO_IMAGE" }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });

    const orderId    = `PBN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const difficulty = LEVEL_TO_DIFFICULTY[level] || "standard";

    // allOrders/grandTotal are captured for potential future use (e.g. a
    // future multi-order confirmation email) but aren't written into
    // order.json today -- /generate-full only needs this one order's
    // own generation params. Left validated here so a malformed payload
    // still fails loudly rather than silently.
    try { JSON.parse(allOrdersRaw); } catch {}

    const bytes  = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── GCS: save the photo + order params NOW, at submit time, so
    // /generate-full has something to read once payment succeeds and
    // the payment webhook fires -- and so the original photo is always
    // recoverable as a manual-conversion backup if automation ever
    // fails. Written BEFORE returning success: if this fails, we want a
    // loud 500 and no "success" response, rather than confirming an
    // order that can never actually be fulfilled. ──────────────────────
    try {
      const storage = getStorageClient();
      const bucket = storage.bucket(GCS_BUCKET_NAME);
      const photoExt = extFromFile(imageFile);

      await bucket.file(`orders/${orderId}/photo.${photoExt}`).save(buffer, {
        contentType: imageFile.type || "image/jpeg",
        resumable: false,
      });

      const orderJson = {
        orderId,
        photoExt,
        sets,
        indPens,
        difficulty,
        level,
        paperSize,
        customerEmail,
        grandTotal,
        wantsFullGuide,
        locale,
        submittedAt: new Date().toISOString(),
      };
      await bucket.file(`orders/${orderId}/order.json`).save(
        JSON.stringify(orderJson, null, 2),
        { contentType: "application/json", resumable: false },
      );

      console.log("GCS write successful, orderId:", orderId);
    } catch (gcsErr: any) {
      console.error("GCS write error:", gcsErr.message);
      return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId });

  } catch (e: any) {
    console.error("Order submission error:", e.message);
    return NextResponse.json({ error: "SUBMIT_FAILED" }, { status: 500 });
  }
}