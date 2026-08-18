import { NextRequest, NextResponse } from "next/server";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import type { MysteryDecoderSelectionJson } from "@/lib/mysteryOrder";

// Save this file as app/api/mystery-order-status/route.ts
//
// [crea-bea-studio]
//
// Mirrors swatch-order-status/route.ts's pattern exactly. Polled by
// /mystery-decoder-download?order=... after a customer returns from
// LemonSqueezy checkout. Payment confirmation itself happens
// asynchronously via the webhook (which writes paid.json) -- this route
// just reports whether that's landed yet, plus the saved selection once
// it has, so the download page can rebuild and trigger the PDF.

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId) {
    return NextResponse.json({ error: "ORDER_ID_REQUIRED" }, { status: 400 });
  }
  // Basic shape check -- these are only ever our own generated IDs.
  if (!/^MYSTERY-\d+-[a-f0-9]{6}$/.test(orderId)) {
    return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`mystery-orders/${orderId}/selection.json`);
    const [selectionExists] = await selectionFile.exists();
    if (!selectionExists) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    const paidFile = bucket.file(`mystery-orders/${orderId}/paid.json`);
    const [paid] = await paidFile.exists();

    if (!paid) {
      return NextResponse.json({ paid: false });
    }

    const [raw] = await selectionFile.download();
    const selection = JSON.parse(raw.toString("utf-8")) as MysteryDecoderSelectionJson;

    return NextResponse.json({ paid: true, selection });
  } catch (e: any) {
    console.error("mystery-order-status error:", e.message);
    return NextResponse.json({ error: "STATUS_CHECK_FAILED" }, { status: 500 });
  }
}
