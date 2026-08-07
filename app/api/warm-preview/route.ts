import { NextResponse } from "next/server";

// Save this file as app/api/warm-preview/route.ts
//
// NEW (2026-08-06, per Mirjam): fire-and-forget pre-warm ping. The
// create page calls this as soon as it mounts (see the useEffect
// added to create/page.tsx) -- well before the customer has picked
// any markers or clicked "Generate" -- so Cloud Run has a head start
// spinning up an instance during the time the customer spends
// filling out the form. Doesn't guarantee a warm instance (a very
// fast customer could still hit a cold one), but costs nothing
// ongoing (no min-instances) and meaningfully reduces how often a
// cold start is actually felt.
//
// Deliberately hits /health (cheap, no image processing) rather than
// /generate-multi-way -- the goal is just to get a container running,
// not to do real work.

const PBN_SERVICE_URL = process.env.PBN_SERVICE_URL;

export async function GET() {
  if (!PBN_SERVICE_URL) {
    return NextResponse.json({ warmed: false }, { status: 200 });
  }
  try {
    // Don't await forever -- this is best-effort, and the customer's
    // own page load shouldn't be blocked by it either way (the client
    // calls this without awaiting the response, see create/page.tsx).
    await fetch(`${PBN_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ warmed: true }, { status: 200 });
  } catch {
    // Cold-start ping failing silently is fine -- worst case, the
    // customer's actual generate request just hits a cold instance,
    // same as today.
    return NextResponse.json({ warmed: false }, { status: 200 });
  }
}
