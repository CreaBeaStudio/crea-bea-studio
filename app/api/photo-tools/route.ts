// app/api/photo-tools/route.ts
//
// Proxies background-removal/blur requests to the separate Python
// (FastAPI + rembg) service. The browser only ever talks to this route
// on your own domain — it never sees the Python service's URL, avoids
// CORS entirely, and gives you one place to add rate-limiting or auth
// later if needed.
//
// Requires an environment variable:
//   BG_SERVICE_URL = https://your-service-name.onrender.com
// (set in .env.local for testing, and in Vercel's project settings for
// production)

import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Vercel's own platform-level function timeout is SEPARATE
// from any timeout set in this file's code below, and by default can be
// much shorter than expected (as low as 5-10s on the Hobby plan). If the
// platform kills this function first, the friendly error message below
// never gets a chance to run — the caller just gets a generic Vercel 504
// instead. Setting this explicitly avoids relying on an unpredictable
// default. 60 is the safe ceiling for Hobby without Fluid Compute
// enabled — raise it if your plan/Fluid Compute settings allow more.
export const maxDuration = 60;

const BG_SERVICE_URL = process.env.BG_SERVICE_URL;

export async function POST(req: NextRequest) {
  if (!BG_SERVICE_URL) {
    return NextResponse.json(
      { error: "Photo tools service is not configured (missing BG_SERVICE_URL)." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const action = formData.get("action"); // "remove" | "blur"
  const blurStrength = formData.get("blurStrength");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (action !== "remove" && action !== "blur") {
    return NextResponse.json({ error: "Invalid action — must be 'remove' or 'blur'." }, { status: 400 });
  }

  const endpointPath = action === "remove" ? "/remove-background" : "/blur-background";
  const url = new URL(endpointPath, BG_SERVICE_URL);
  // blur_strength must be a QUERY param on the FastAPI side — confirmed
  // by testing, since FastAPI doesn't auto-read it from form-data when
  // mixed with an UploadFile parameter.
  if (action === "blur" && blurStrength) {
    url.searchParams.set("blur_strength", String(blurStrength));
  }

  const upstreamForm = new FormData();
  const fileName = file instanceof File ? file.name : "photo.jpg";
  upstreamForm.append("file", file, fileName);

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(url.toString(), {
      method: "POST",
      body: upstreamForm,
      // Stay safely UNDER maxDuration above (60s) so our own friendly
      // error fires first, instead of Vercel's platform timeout cutting
      // the function off mid-flight with a generic 504.
      signal: AbortSignal.timeout(55_000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "The photo tools service is unreachable right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  if (!upstreamRes.ok) {
    const text = await upstreamRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Photo tools service error: ${text || upstreamRes.statusText}` },
      { status: upstreamRes.status }
    );
  }

  const contentType = upstreamRes.headers.get("content-type") || "application/octet-stream";
  const buffer = await upstreamRes.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
}
