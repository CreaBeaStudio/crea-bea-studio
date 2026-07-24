import { NextRequest, NextResponse } from "next/server";
import { getSwatchBand } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";

// Save this file as app/api/create-swatch-checkout/route.ts
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
//
// NOTE: SITE_URL below feeds the post-payment redirect_url
// (…/swatch-download?order=…). Set NEXT_PUBLIC_SITE_URL in Vercel to
// your real domain -- double check whether /swatch-download needs a
// locale prefix (e.g. /en/swatch-download) to match how your other
// [locale] routes resolve; adjust the redirectUrl line below if so.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creabeastudio.com";

export async function POST(req: NextRequest) {
  try {
    const { orderId, colorCount, paperSize, email } = (await req.json()) as {
      orderId: string;
      colorCount: number;
      paperSize: PaperSize;
      email?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }
    if (paperSize !== "a4" && paperSize !== "letter") {
      return NextResponse.json({ error: "Missing or invalid paperSize" }, { status: 400 });
    }
    if (typeof colorCount !== "number") {
      return NextResponse.json({ error: "Missing colorCount" }, { status: 400 });
    }

    const band = getSwatchBand(colorCount);
    if (!band) {
      return NextResponse.json({ error: `${colorCount} colors is within the free tier -- no checkout needed.` }, { status: 400 });
    }
    const variant = paperSize === "letter" ? band.variants.us : band.variants.a4;
    if (!variant?.variantId) {
      return NextResponse.json({ error: `No LemonSqueezy variant configured for ${colorCount} colors / ${paperSize}.` }, { status: 500 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!apiKey || !storeId) {
      return NextResponse.json({ error: "Missing LemonSqueezy credentials" }, { status: 500 });
    }

    const redirectUrl = `${SITE_URL}/swatch-download?order=${encodeURIComponent(orderId)}`;

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
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (e: any) {
    console.error("create-swatch-checkout error:", e.message);
    return NextResponse.json({ error: e.message || "Failed to create checkout" }, { status: 500 });
  }
}
