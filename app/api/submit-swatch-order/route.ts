import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import { FREE_COLOR_LIMIT } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";
import type { SwatchSelectionItem, SwatchSelectionJson } from "@/lib/swatchOrder";

// Save this file as app/api/submit-swatch-order/route.ts
//
// UPDATED (2026-07-27): returns error CODES ("NO_ITEMS",
// "INVALID_PAPER_SIZE", "COLOR_COUNT_MISMATCH", "WITHIN_FREE_TIER",
// "SAVE_FAILED") instead of hardcoded English sentences -- see
// lib/apiErrors.ts.
//
// Pre-payment step for the Custom Swatch Card Set flow: persists the
// customer's built selection (item codes + PDF options) to GCS under a
// fresh order ID, so it can be re-loaded on /swatch-download once
// LemonSqueezy confirms payment. Doesn't touch LemonSqueezy at all --
// see create-swatch-checkout for that.
//
// The saved-order shape (SwatchSelectionJson) lives in lib/swatchOrder.ts,
// not here -- importing a type from inside a route.ts file isn't
// reliably resolved by Next.js's build, even for type-only imports.

interface SubmitBody {
  items: SwatchSelectionItem[];
  excluded: string[]; // "itemId::family" membership keys hidden from one family -- see lib/swatchPdf.ts's membershipKey
  options: {
    swatchStyle: SwatchSelectionJson["options"]["swatchStyle"];
    headerHolePos: SwatchSelectionJson["options"]["headerHolePos"];
    cardPacking: SwatchSelectionJson["options"]["cardPacking"];
    paperSize: PaperSize;
  };
  colorCount: number;
}

function makeOrderId(): string {
  return `SWATCH-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "NO_ITEMS" }, { status: 400 });
    }
    if (!body.options || (body.options.paperSize !== "a4" && body.options.paperSize !== "letter")) {
      return NextResponse.json({ error: "INVALID_PAPER_SIZE" }, { status: 400 });
    }
    if (typeof body.colorCount !== "number" || body.colorCount !== body.items.length) {
      return NextResponse.json({ error: "COLOR_COUNT_MISMATCH" }, { status: 400 });
    }
    if (body.colorCount <= FREE_COLOR_LIMIT) {
      // Nothing to sell -- this selection is already free, no order needed.
      return NextResponse.json({ error: "WITHIN_FREE_TIER" }, { status: 400 });
    }

    const orderId = makeOrderId();
    const selection: SwatchSelectionJson = {
      items: body.items,
      excluded: Array.isArray(body.excluded) ? body.excluded : [],
      options: body.options,
      colorCount: body.colorCount,
      submittedAt: new Date().toISOString(),
    };

    const storage = getStorageClient();
    await storage.bucket(GCS_BUCKET_NAME).file(`swatch-orders/${orderId}/selection.json`).save(
      JSON.stringify(selection, null, 2),
      { contentType: "application/json", resumable: false },
    );

    return NextResponse.json({ orderId });
  } catch (e: any) {
    console.error("submit-swatch-order error:", e.message);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}