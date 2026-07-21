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

export async function POST(req: NextRequest) {
  try {
    if (!PBN_SERVICE_URL || !PBN_SERVICE_API_KEY) {
      console.error("PBN_SERVICE_URL / PBN_SERVICE_API_KEY not configured");
      return NextResponse.json(
        { error: "Preview service isn't configured yet. Please try again later." },
        { status: 500 }
      );
    }

    const incoming = await req.formData();
    const imageFile = incoming.get("image") as File | null;
    const sets = (incoming.get("sets") as string) || "";
    const extraCodes = (incoming.get("extraCodes") as string) || "";
    const difficulty = (incoming.get("difficulty") as string) || "standard";

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (!sets.trim() && !extraCodes.trim()) {
      return NextResponse.json(
        { error: "Select at least one marker set or enter marker codes first." },
        { status: 400 }
      );
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
      // default), not {"error": "..."} -- normalize it here so the
      // create page only ever has to look for one shape.
      return NextResponse.json(
        { error: data.detail || "Something went wrong generating your preview. Please try again." },
        { status: res.status }
      );
    }

    if (!data.owned) {
      // Shouldn't normally happen -- the route above already requires
      // sets/extraCodes to be non-empty, so "owned" should always come
      // back populated. Defensive check in case matching genuinely
      // fails for some other reason.
      return NextResponse.json(
        { error: "We couldn't generate a preview with those markers. Try selecting a larger set." },
        { status: 422 }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("generate-preview error:", e);
    return NextResponse.json(
      { error: "Something went wrong generating your preview. Please try again." },
      { status: 500 }
    );
  }
}
