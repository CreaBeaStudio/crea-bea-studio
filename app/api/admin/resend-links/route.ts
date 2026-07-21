import { NextRequest, NextResponse } from "next/server";
import { resendOrderEmail } from "@/lib/fulfillOrder";

// ── ADMIN: manual re-issue endpoint (2026-07-17). Use when a customer
// says they never got their delivery email, or their link expired --
// re-sends the SAME files with freshly-signed 30-day links, without
// re-running generation (the underlying files already exist in GCS; see
// resendOrderEmail() in lib/fulfillOrder.ts for why this is cheap).
//
// Protected by a single shared secret (ADMIN_SECRET env var, separate
// from the webservice's own X-API-Key) rather than real auth, since
// this is a one-person internal tool -- same tradeoff as the
// webservice's API key, just scoped to this one route. Set
// ADMIN_SECRET in Vercel (any random string) before using this.
//
// Usage (from Terminal, once ADMIN_SECRET is set in Vercel):
//   curl -X POST https://creabeastudio.com/api/admin/resend-links \
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

    await resendOrderEmail(orderId);
    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    console.error("resend-links error:", e.message);
    return NextResponse.json({ error: e.message || "Resend failed" }, { status: 500 });
  }
}
