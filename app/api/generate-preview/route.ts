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
    if (!sets.trim() && !extraCodes.trim()) {
      return NextResponse.json({ error: "NO_MARKERS_SELECTED" }, { status: 400 });
    }

    // Cloud Run's /generate-three-way expects "file" (not "image"), plus
    // "sets"/"extra_codes" (not "extraCodes") -- field names deliberately
    // differ from this route's own incoming form so the browser-facing
    // contract can stay in whatever shape suits the create page, while
    // this route is the one place that has to know the Cloud Run
    // service's actual field names.
    const forwardForm = new FormData();
    forwardForm.append("file", imageFile);
    forwardForm.append("preset", "Default");
    forwardForm.append("difficulty", difficulty);
    if (sets.trim()) forwardForm.append("sets", sets);
    if (extraCodes.trim()) forwardForm.append("extra_codes", extraCodes);
    // include_natural intentionally omitted -- defaults to false
    // server-side, which is what the create page needs (owned + full366
    // + upsell only, per webservice/main.py's PREVIEW_MAX_SIDE_OVERRIDE
    // and include_natural defaults).

    const res = await fetch(`${PBN_SERVICE_URL}/generate-three-way`, {
      method: "POST",
      headers: { "X-API-Key": PBN_SERVICE_API_KEY },
      body: forwardForm,
    });

    const data = await res.json();

    if (!res.ok) {
      // Cloud Run's own error shape is {"detail": "..."} (FastAPI's
      // default) -- logged for debugging only, never forwarded to the
      // client (see note above).
      console.error("generate-three-way backend error:", data.detail);
      return NextResponse.json({ error: "GENERATION_FAILED" }, { status: res.status });
    }

    if (!data.owned) {
      // Shouldn't normally happen -- the route above already requires
      // sets/extraCodes to be non-empty, so "owned" should always come
      // back populated. Defensive check in case matching genuinely
      // fails for some other reason.
      return NextResponse.json({ error: "NO_MATCH_FOUND" }, { status: 422 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("generate-preview error:", e);
    return NextResponse.json({ error: "GENERATION_FAILED" }, { status: 500 });
  }
}