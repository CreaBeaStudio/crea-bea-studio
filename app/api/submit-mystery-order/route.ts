import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import type { MysteryDecoderSelectionJson } from "@/lib/mysteryOrder";

// Save this file as app/api/submit-mystery-order/route.ts
//
// [crea-bea-studio]
//
// Pre-payment step for the Custom Mystery Decoder flow -- mirrors
// submit-swatch-order/route.ts's pattern. Persists the customer's built
// selection (book + chosen marker set keys + raw extra-codes text +
// display labels) to GCS under a fresh order ID, so it can be re-loaded
// on /mystery-decoder-download once LemonSqueezy confirms payment.
// Doesn't touch LemonSqueezy at all -- see create-mystery-checkout for
// that.
//
// No free-tier/color-count check -- the full decoder is always a flat
// €9,00 regardless of how many marker sets the customer picked, so
// every submission becomes an order.
//
// guangnaSetKeys/languoSetKeys must be the real GUANGNA_SETS/
// LANGUO_SETS keys (never the component's internal synthetic
// "__extra_guangna__"/"__extra_languo__" pool keys) -- the download
// page reconstructs the full pool itself from these plus
// extraCodesText, the same way MysteryDecoderCustom.tsx's
// handleGeneratePreview does.

interface SubmitBody {
  book: string;
  bookTitle: string;
  guangnaSetKeys: string[];
  languoSetKeys: string[];
  extraCodesText: string;
  setLabel: string;
}

function makeOrderId(): string {
  return `MYSTERY-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitBody;

    if (!body.book || typeof body.book !== "string") {
      return NextResponse.json({ error: "BOOK_REQUIRED" }, { status: 400 });
    }

    const guangnaSetKeys = Array.isArray(body.guangnaSetKeys) ? body.guangnaSetKeys : [];
    const languoSetKeys = Array.isArray(body.languoSetKeys) ? body.languoSetKeys : [];
    const extraCodesText = typeof body.extraCodesText === "string" ? body.extraCodesText : "";

    if (guangnaSetKeys.length === 0 && languoSetKeys.length === 0 && extraCodesText.trim() === "") {
      return NextResponse.json({ error: "NO_MARKERS_SELECTED" }, { status: 400 });
    }

    const orderId = makeOrderId();
    const selection: MysteryDecoderSelectionJson = {
      book: body.book,
      bookTitle: body.bookTitle || body.book,
      guangnaSetKeys,
      languoSetKeys,
      extraCodesText,
      setLabel: body.setLabel || "",
      submittedAt: new Date().toISOString(),
    };

    const storage = getStorageClient();
    await storage.bucket(GCS_BUCKET_NAME).file(`mystery-orders/${orderId}/selection.json`).save(
      JSON.stringify(selection, null, 2),
      { contentType: "application/json", resumable: false },
    );

    return NextResponse.json({ orderId });
  } catch (e: any) {
    console.error("submit-mystery-order error:", e.message);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
