import { NextRequest, NextResponse } from "next/server";
import { getSwatchBand } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";

// Save this file as app/api/create-swatch-checkout/route.ts
//
// UPDATED (2026-07-27):
//  - Returns error CODES ("ORDER_ID_REQUIRED", "INVALID_PAPER_SIZE",
//    "COLOR_COUNT_REQUIRED", "WITHIN_FREE_TIER",
//    "SWATCH_VARIANT_UNAVAILABLE", "CHECKOUT_UNAVAILABLE",
//    "CHECKOUT_FAILED") instead of hardcoded English sentences -- see
//    lib/apiErrors.ts.
//  - redirectUrl now includes the customer's locale
//    (/{locale}/swatch-download?order=...) instead of an unprefixed
//    path -- previously this always sent the customer back to
//    /swatch-download in whatever the app's default locale resolves
//    to, regardless of what language they were actually using.
//    Requires the caller (SwatchCreator.tsx's unlockFullSet()) to send
//    a `locale` field in the request body -- same pattern create/
//    page.tsx already uses via useParams(). Falls back to "en" if
//    missing so older client code doesn't hard-fail, just loses the
//    locale-correct redirect.
//
// FIX (2026-07-24): this previously imported and called a
// `getSwatchVariant(colorCount, paperSize)` function that doesn't exist
// anywhere else in the codebase -- swatch-creator.tsx (and everything
// else touching swatch pricing) only ever uses `getSwatchBand`, picking
// `.variants.a4` or `.variants.us` off the returned band itself based on
// paperSize. That mismatched import very likely crashed this route on
// every call, which lines up with the "Unlock full Set" error. Rewritten
// to use getSwatchBand the same way swatch-creator.tsx already does, so
// there's one single source of truth for the pricing bands.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creabeastudio.com";

export async function POST(req: NextRequest) {
  try {
    const { orderId, colorCount, paperSize, email, locale } = (await req.json()) as {
      orderId: string;
      colorCount: number;
      paperSize: PaperSize;
      email?: string;
      locale?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "ORDER_ID_REQUIRED" }, { status: 400 });
    }
    if (paperSize !== "a4" && paperSize !== "letter") {
      return NextResponse.json({ error: "INVALID_PAPER_SIZE" }, { status: 400 });
    }
    if (typeof colorCount !== "number") {
      return NextResponse.json({ error: "COLOR_COUNT_REQUIRED" }, { status: 400 });
    }

    const band = getSwatchBand(colorCount);
    if (!band) {
      return NextResponse.json({ error: "WITHIN_FREE_TIER" }, { status: 400 });
    }
    const variant = paperSize === "letter" ? band.variants.us : band.variants.a4;
    if (!variant?.variantId) {
      console.error(`No LemonSqueezy variant configured for ${colorCount} colors / ${paperSize}`);
      return NextResponse.json({ error: "SWATCH_VARIANT_UNAVAILABLE" }, { status: 500 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!apiKey || !storeId) {
      console.error("Missing LemonSqueezy credentials (LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_STORE_ID)");
      return NextResponse.json({ error: "CHECKOUT_UNAVAILABLE" }, { status: 500 });
    }

    const resolvedLocale = locale || "en";
    const redirectUrl = `${SITE_URL}/${resolvedLocale}/swatch-download?order=${encodeURIComponent(orderId)}`;

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email || undefined,
              custom: {
                order_id: orderId,
                product: "custom-swatch",
              },
            },
            product_options: {
              enabled_variants: [parseInt(variant.variantId, 10)],
              redirect_url: redirectUrl,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId.toString() },
            },
            variant: {
              data: { type: "variants", id: variant.variantId.toString() },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("LemonSqueezy swatch checkout error:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      console.error("LemonSqueezy swatch checkout response had no URL:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (e: any) {
    console.error("create-swatch-checkout error:", e.message);
    return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
  }
}