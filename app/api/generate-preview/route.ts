import { NextRequest, NextResponse } from "next/server";

// Cloud Run generation can take up to ~20-30s at the live-preview
// resolution (see webservice/README.md's "Live preview resolution"
// section). Default Vercel serverless timeout is 10s on Hobby, up to
// 60s on Pro -- this route will 504 on Hobby without an upgrade.
export const runtime = "nodejs";
export const maxDuration = 60;
export const preferredRegion = 'fra1';

// Set in Vercel's environment variables (Project Settings -> Environment
// Variables), NOT in this file and NOT prefixed with NEXT_PUBLIC_ --
// this must stay server-side only, same rule as any other secret. See
// webservice/README.md for where PBN_SERVICE_URL and PBN_SERVICE_API_KEY
// come from (the `gcloud run deploy` output and the API key it printed).
const PBN_SERVICE_URL = process.env.PBN_SERVICE_URL;
const PBN_SERVICE_API_KEY = process.env.PBN_SERVICE_API_KEY;

// UPDATED (2026-07-27): returns error CODES ("NO_IMAGE",
// "NO_MARKERS_SELECTED", "SERVICE_UNAVAILABLE", "GENERATION_FAILED",
// "NO_MATCH_FOUND") instead of hardcoded English sentences -- see
// lib/apiErrors.ts. This also means the Python backend's own
// `data.detail` text (FastAPI's default error shape) is no longer
// forwarded to the client at all -- it's arbitrary, not guaranteed to
// be customer-facing-appropriate wording, and definitely not
// translated. It's still logged server-side via console.error so
// nothing is lost for debugging; the customer just always sees a
// translated GENERATION_FAILED instead.
//
// UPDATED (2026-08-06, multi-brand): now calls /generate-multi-way
// instead of /generate-three-way, per [[multi-brand-pbn-expansion]]'s
// backend work (deployed 2026-08-05). `sets`/`extraCodes` coming from
// create/page.tsx can now freely mix Guangna and Languo tokens in the
// same comma-separated string -- this route doesn't need to know or
// care which brand a given token belongs to, it just forwards the
// combined string through unchanged (same as before).
//
// FIX (2026-08-06, supersedes the note above): create/page.tsx's UI no
// longer blocks an empty-markers preview call -- selecting no markers
// is now a deliberate valid choice (generates the "natural"/
// unconstrained branch instead of forcing a Guangna-366 default, per
// Mirjam's explicit fix request). So this route must NOT reject an
// empty sets/extraCodes request anymore -- that's now a normal,
// expected case, not an error. The NO_MARKERS_SELECTED check is
// removed entirely; NO_IMAGE (no photo) is still a real error below.
export async function POST(req: NextRequest) {
  try {
    if (!PBN_SERVICE_URL || !PBN_SERVICE_API_KEY) {
      console.error("PBN_SERVICE_URL / PBN_SERVICE_API_KEY not configured");
      return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 500 });
    }

    const incoming = await req.formData();
    const imageFile = incoming.get("image") as File | null;
    const sets = (incoming.get("sets") as string) || "";
    const extraCodes = (incoming.get("extraCodes") as string) || "";
    const difficulty = (incoming.get("difficulty") as string) || "standard";

    if (!imageFile) {
      return NextResponse.json({ error: "NO_IMAGE" }, { status: 400 });
    }

    // /generate-multi-way expects "file" (not "image"), plus
    // "sets"/"extra_codes" (not "extraCodes") -- same field-name
    // translation this route has always done for /generate-three-way,
    // unchanged.
    // FIX (2026-08-06): this route used to send preset="Default", but
    // main.py's PRESETS dict only has "Family"/"AG"/"Y" (no "Default")
    // -- that was already invalid before today's multi-brand change,
    // just never actually exercised until now. Omitting the field
    // entirely lets FastAPI's own Form(DEFAULT_PRESET) fallback apply
    // ("AG"), matching what every other endpoint already defaults to.
    const forwardForm = new FormData();
    forwardForm.append("file", imageFile);
    forwardForm.append("difficulty", difficulty);
    // PIVOT (2026-08-06, per Mirjam): dropped the second "Optimum"
    // rendered branch entirely -- one branch only, at full 3000px
    // generation quality instead of the old 1500px live-preview
    // shortcut. Real timing data (her own curl tests against live
    // Cloud Run): single-branch 3000px ~33s, right in line with the
    // OLD two-branch/1500px baseline (~28-32s) -- so this isn't a
    // slower tradeoff, it's roughly wait-time-neutral for a real
    // quality improvement. See [[multi-brand-pbn-expansion]] notes.
    forwardForm.append("generation_max_side", "3000");
    // FIX (2026-08-06, per Mirjam): the displayed preview image was
    // coming back at full generation size, which is slow to transfer/
    // render in the browser for no visual benefit -- generation_max_side
    // controls GENERATION quality (kept at 3000 above), preview_max_side
    // controls the size of the actual image returned for display. Her
    // own curl trials confirmed 600px is plenty and fast; explicitly
    // setting it here rather than relying on the backend's own default
    // removes any ambiguity about what's actually being requested.
    forwardForm.append("preview_max_side", "600");
    if (sets.trim()) forwardForm.append("sets", sets);
    if (extraCodes.trim()) forwardForm.append("extra_codes", extraCodes);
    // include_natural has no equivalent param on /generate-multi-way --
    // whether "natural" comes back is decided server-side (only when
    // owned_ids resolves empty), not something this route controls.

    const res = await fetch(`${PBN_SERVICE_URL}/generate-multi-way`, {
      method: "POST",
      headers: { "X-API-Key": PBN_SERVICE_API_KEY },
      body: forwardForm,
    });

    const data = await res.json();

    if (!res.ok) {
      // Cloud Run's own error shape is {"detail": "..."} (FastAPI's
      // default) -- logged for debugging only, never forwarded to the
      // client (see note above).
      console.error("generate-multi-way backend error:", data.detail);
      return NextResponse.json({ error: "GENERATION_FAILED" }, { status: res.status });
    }

    // FIX (2026-08-06): "owned" being null is now a VALID case (no
    // markers selected -> natural-only response), not an error --
    // this check now only fires on the genuinely broken case: neither
    // owned NOR natural came back, which would mean the backend
    // failed to produce any usable branch at all.
    if (!data.owned && !data.natural) {
      return NextResponse.json({ error: "NO_MATCH_FOUND" }, { status: 422 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("generate-preview error:", e);
    return NextResponse.json({ error: "GENERATION_FAILED" }, { status: 500 });
  }
}