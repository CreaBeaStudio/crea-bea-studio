import { NextRequest, NextResponse } from "next/server";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";

// Save this file as app/api/admin/mark-swatch-paid/route.ts
//
// Manual test endpoint: writes the SAME paid.json flag lemon-webhook's
// custom-swatch branch writes on a real LemonSqueezy payment, so you
// can test /swatch-download end-to-end (poll -> reconstruct selection
// -> auto-download the full PDF) without needing a real payment or a
// deployment LemonSqueezy can actually reach. Requires the order to
// already exist (i.e. you've gone through "Unlock full Set" far enough
// for /api/submit-swatch-order to have saved selection.json) -- this
// only marks it paid, it doesn't create the order.
//
// Same auth pattern as the other admin routes: a single shared secret
// (ADMIN_SECRET env var) rather than real auth, since this is a
// one-person internal tool.
//
// Usage (from Terminal, once ADMIN_SECRET is set):
//   curl -X POST http://localhost:3000/api/admin/mark-swatch-paid \
//     -H 'X-Admin-Key: YOUR_KEY' \
//     -H "Content-Type: application/json" \
//     -d '{"orderId": "SWATCH-...."}'
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
    if (!/^SWATCH-\d+-[a-f0-9]{6}$/.test(orderId)) {
      return NextResponse.json({ error: "That doesn't look like a swatch order id (expected SWATCH-<timestamp>-<hex>)" }, { status: 400 });
    }

    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`swatch-orders/${orderId}/selection.json`);
    const [selectionExists] = await selectionFile.exists();
    if (!selectionExists) {
      return NextResponse.json({ error: `No selection found for order '${orderId}' -- submit-swatch-order needs to run first (e.g. click "Unlock full Set" once).` }, { status: 404 });
    }

    await bucket.file(`swatch-orders/${orderId}/paid.json`).save(
      JSON.stringify({ paidAt: new Date().toISOString(), markedPaidManually: true }, null, 2),
      { contentType: "application/json", resumable: false },
    );

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    console.error("mark-swatch-paid error:", e.message);
    return NextResponse.json({ error: e.message || "Failed to mark order paid" }, { status: 500 });
  }
}
