import { NextRequest, NextResponse } from "next/server";
import { getMysteryDecoderVariant } from "@/lib/mysteryDecoderPricing";

// Save this file as app/api/create-mystery-checkout/route.ts
//
// [crea-bea-studio]
//
// Mirrors create-swatch-checkout/route.ts's pattern, simplified for a
// flat-price single-variant product -- no band/variant lookup by
// colorCount or paperSize, just the one Mystery Decoder variant every
// time.
//
// redirectUrl is locale-aware (/{locale}/mystery-decoder-download?...),
// same fix as the swatch route's 2026-07-27 update -- caller sends a
// `locale` field ("en" or "fr"), falls back to "en" if missing or
// unrecognized. `locale` is also written into the LemonSqueezy
// checkout's custom_data so the webhook can send the backup email in
// the right language.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creabeastudio.com";
const SUPPORTED_LOCALES = new Set(["en", "fr"]);

export async function POST(req: NextRequest) {
  try {
    const { orderId, email, locale } = (await req.json()) as {
      orderId: string;
      email?: string;
      locale?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "ORDER_ID_REQUIRED" }, { status: 400 });
    }

    const variant = getMysteryDecoderVariant();
    if (!variant?.variantId) {
      console.error("No LemonSqueezy variant configured for Custom Mystery Decoder");
      return NextResponse.json({ error: "MYSTERY_VARIANT_UNAVAILABLE" }, { status: 500 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!apiKey || !storeId) {
      console.error("Missing LemonSqueezy credentials (LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_STORE_ID)");
      return NextResponse.json({ error: "CHECKOUT_UNAVAILABLE" }, { status: 500 });
    }

    const resolvedLocale = SUPPORTED_LOCALES.has(locale || "") ? (locale as string) : "en";
    const redirectUrl = `${SITE_URL}/${resolvedLocale}/mystery-decoder-download?order=${encodeURIComponent(orderId)}`;

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
                product: "custom-mystery-decoder",
                locale: resolvedLocale,
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
      console.error("LemonSqueezy mystery-decoder checkout error:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      console.error("LemonSqueezy mystery-decoder checkout response had no URL:", JSON.stringify(data));
      return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (e: any) {
    console.error("create-mystery-checkout error:", e.message);
    return NextResponse.json({ error: "CHECKOUT_FAILED" }, { status: 500 });
  }
}
