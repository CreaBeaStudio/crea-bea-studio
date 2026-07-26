import { NextRequest, NextResponse } from "next/server";
import { getGuangnaByNumberVariant } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";

// Save this file as app/api/create-checkout/route.ts
//
// UPDATED (2026-07-27): returns error CODES ("NO_LEVELS",
// "MULTI_ORDER_NOT_SUPPORTED", "INVALID_PAPER_SIZE",
// "CHECKOUT_UNAVAILABLE", "CHECKOUT_FAILED") instead of hardcoded
// English sentences -- see lib/apiErrors.ts. The missing-credentials
// case in particular used to say "Missing LemonSqueezy credentials",
// which is internal/technical wording that was never appropriate to
// show a customer in any language; it's now CHECKOUT_UNAVAILABLE with
// the real reason logged server-side instead.
//
// UPDATED (2026-07-23): pricing is now flat by paper size (A4/US
// Letter) instead of by difficulty tier -- difficulty is still picked
// by the customer and still affects generation, but no longer changes
// price, so the old LEVEL_TO_VARIANT_ID / COMBO_TO_VARIANT_ID tables
// are gone. Cart bundling (multiple photos in one checkout) is dropped
// for now per Mirjam's call -- one checkout = one order. If `levels`
// has more than one entry, this returns MULTI_ORDER_NOT_SUPPORTED
// rather than silently picking one.

export async function POST(req: NextRequest) {
  try {
    const { levels, paperSize, email, orderId, levelLabel } = await req.json();

    if (!Array.isArray(levels) || levels.length === 0) {
      return NextResponse.json({ error: "NO_LEVELS" }, { status: 400 });
    }
    if (levels.length > 1) {
      return NextResponse.json({ error: "MULTI_ORDER_NOT_SUPPORTED" }, { status: 400 });
    }
    if (paperSize !== "a4" && paperSize !== "letter") {
      return NextResponse.json({ error: "INVALID_PAPER_SIZE" }, { status: 400 });
    }

    const variant = getGuangnaByNumberVariant(paperSize as PaperSize);

    const apiKey  = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      console.error("Missing LemonSqueezy credentials (LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_STORE_ID)");
      return NextResponse.json({ error: "CHECKOUT_UNAVAILABLE" }, { status: 500 });
    }

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
                order_id: orderId || "",
                level_label: levelLabel || "",
                product: "guangna-by-number",
              },
            },
            product_options: {
              enabled_variants: [parseInt(variant.variantId, 10)],
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
      console.error("LemonSqueezy checkout error:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      console.error("LemonSqueezy checkout response had no URL:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error("create-checkout error:", e.message);
    return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
  }
}