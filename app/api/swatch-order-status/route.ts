import { NextRequest, NextResponse } from "next/server";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import type { SwatchSelectionJson } from "@/lib/swatchOrder";

// Save this file as app/api/swatch-order-status/route.ts
//
// UPDATED (2026-07-27): returns error CODES ("ORDER_ID_REQUIRED",
// "INVALID_ORDER_ID", "ORDER_NOT_FOUND", "STATUS_CHECK_FAILED")
// instead of hardcoded English sentences -- see lib/apiErrors.ts.
//
// Polled by /swatch-download?order=... after a customer returns from
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
  if (!/^SWATCH-\d+-[a-f0-9]{6}$/.test(orderId)) {
    return NextResponse.json({ error: "INVALID_ORDER_ID" }, { status: 400 });
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`swatch-orders/${orderId}/selection.json`);
    const [selectionExists] = await selectionFile.exists();
    if (!selectionExists) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
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
    return NextResponse.json({ error: "STATUS_CHECK_FAILED" }, { status: 500 });
  }
}