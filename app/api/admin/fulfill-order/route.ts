import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfillOrder";

// ── ADMIN: manual fulfillment-trigger endpoint (2026-07-24). Lets you
// manually run the exact same post-payment flow the LemonSqueezy
// webhook will eventually call -- generate-full -> GCS write ->
// delivery email -- BEFORE that webhook is actually wired up. Check out
// for real (or in test mode) on LemonSqueezy, grab the orderId
// LemonSqueezy's custom_data carried through (the same one
// /api/submit-order generated and create-checkout passed along), then
// POST it here.
//
// Same auth pattern as resend-links: a single shared secret
// (ADMIN_SECRET env var, separate from the webservice's own X-API-Key)
// rather than real auth, since this is a one-person internal tool.
// ADMIN_SECRET is already set in Vercel (see resend-links).
//
// Not meant to be called from the website itself. Once the real webhook
// is wired to call fulfillOrder() directly, this stays available as a
// manual-trigger fallback (e.g. re-running fulfillment for an order the
// webhook somehow never fired for) -- resend-links only re-sends links
// for an order that's ALREADY been fulfilled once; this is for one that
// hasn't been yet.
//
// Usage (from Terminal, once ADMIN_SECRET is set in Vercel):
//   curl -X POST https://creabeastudio.com/api/admin/fulfill-order \
//     -H "X-Admin-Key: <your ADMIN_SECRET value>" \
//     -H "Content-Type: application/json" \
//     -d '{"orderId": "PBN-...."}'
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  const expectedKey = process.env.ADMIN_SECRET;

  if (!expectedKey) {
    return NextResponse.json({ error: "ADMIN_SECRET is not configured" }, { status: 500 });
  }
  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const orderId = (body?.orderId as string || "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    await fulfillOrder(orderId);
    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    console.error("fulfill-order error:", e.message);
    return NextResponse.json({ error: e.message || "Fulfillment failed" }, { status: 500 });
  }
}
