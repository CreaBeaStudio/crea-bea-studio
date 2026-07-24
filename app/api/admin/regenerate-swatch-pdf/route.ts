import { NextRequest, NextResponse } from "next/server";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import { buildCards, renderCardsBuffer, guangnaItem, languoItem, type SwatchItem } from "@/lib/swatchPdf";
import type { SwatchSelectionJson } from "@/lib/swatchOrder";

// Save this file as app/api/admin/regenerate-swatch-pdf/route.ts
//
// Regenerates a swatch order's full PDF on demand -- for support
// requests ("can you resend my file"), or just to check what a test
// order actually produced. Works from selection.json alone, so it
// doesn't require the order to be marked paid -- useful for verifying
// a build BEFORE going through mark-swatch-paid/checkout at all.
//
// GET (not POST like the other admin routes) specifically so you can
// paste the URL straight into a browser tab and get the PDF back
// immediately, rather than needing curl -o. TRADEOFF: that means the
// admin key travels in the URL query string (readable in browser
// history / server access logs) rather than a header -- acceptable for
// a one-person internal tool, but worth knowing if that ever changes.
//
// Usage: paste this into a browser address bar (fill in your real
// ADMIN_SECRET and a real orderId):
//   http://localhost:3000/api/admin/regenerate-swatch-pdf?order=SWATCH-....&key=YOUR_KEY
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order") ?? "";
  const adminKey = req.nextUrl.searchParams.get("key") ?? "";
  const expectedKey = process.env.ADMIN_SECRET;

  if (!expectedKey) {
    return NextResponse.json({ error: "ADMIN_SECRET is not configured" }, { status: 500 });
  }
  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!orderId) {
    return NextResponse.json({ error: "order is required" }, { status: 400 });
  }
  if (!/^SWATCH-\d+-[a-f0-9]{6}$/.test(orderId)) {
    return NextResponse.json({ error: "That doesn't look like a swatch order id (expected SWATCH-<timestamp>-<hex>)" }, { status: 400 });
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`swatch-orders/${orderId}/selection.json`);
    const [exists] = await selectionFile.exists();
    if (!exists) {
      return NextResponse.json({ error: `No selection found for order '${orderId}'.` }, { status: 404 });
    }

    const [raw] = await selectionFile.download();
    const selection = JSON.parse(raw.toString("utf-8")) as SwatchSelectionJson;
    const items = selection.items
      .map((i) => (i.source === "guangna" ? guangnaItem(i.code, i.origin) : languoItem(i.code, i.origin)))
      .filter((x): x is SwatchItem => x !== null);
    const excluded = new Set(selection.excluded || []);
    const cards = buildCards(items, selection.options.cardPacking, excluded);
    const buffer = await renderCardsBuffer(cards, selection.options);

    // Node's Buffer doesn't structurally satisfy the DOM BodyInit type
    // NextResponse expects, even though a Buffer IS a Uint8Array at
    // runtime -- TypeScript's lib.dom types just don't see it that way.
    // Wrapping it in a plain Uint8Array (zero-copy, same underlying
    // bytes) satisfies the type checker without changing the actual
    // response content at all.
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="creabeastudio-swatch-cards-${orderId}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("regenerate-swatch-pdf error:", e.message);
    return NextResponse.json({ error: e.message || "Failed to regenerate PDF" }, { status: 500 });
  }
}