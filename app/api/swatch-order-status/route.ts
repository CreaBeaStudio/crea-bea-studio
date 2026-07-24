import { NextRequest, NextResponse } from "next/server";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import type { SwatchSelectionJson } from "@/lib/swatchOrder";

// Save this file as app/api/swatch-order-status/route.ts
//
// Polled by /swatch-download?order=... after a customer returns from
// LemonSqueezy checkout. Payment confirmation itself happens
// asynchronously via the webhook (which writes paid.json) -- this route
// just reports whether that's landed yet, plus the saved selection once
// it has, so the download page can rebuild and trigger the PDF.

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId) {
    return NextResponse.json({ error: "Missing order" }, { status: 400 });
  }
  // Basic shape check -- these are only ever our own generated IDs.
  if (!/^SWATCH-\d+-[a-f0-9]{6}$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`swatch-orders/${orderId}/selection.json`);
    const [selectionExists] = await selectionFile.exists();
    if (!selectionExists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paidFile = bucket.file(`swatch-orders/${orderId}/paid.json`);
    const [paid] = await paidFile.exists();

    if (!paid) {
      return NextResponse.json({ paid: false });
    }

    const [raw] = await selectionFile.download();
    const selection = JSON.parse(raw.toString("utf-8")) as SwatchSelectionJson;

    return NextResponse.json({ paid: true, selection });
  } catch (e: any) {
    console.error("swatch-order-status error:", e.message);
    return NextResponse.json({ error: e.message || "Failed to check order status" }, { status: 500 });
  }
}
