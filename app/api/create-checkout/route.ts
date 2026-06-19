import { NextRequest, NextResponse } from "next/server";

// Single-item variants
const LEVEL_TO_VARIANT_ID: Record<string, string> = {
  "15": "1797148", // Beginner
  "24": "1797163", // Intermediate
  "36": "1797167", // Advanced
};

// Combo variants — key is the sorted, comma-joined list of levels in the cart.
// e.g. two Beginners = "15,15", one of each = "15,24,36"
const COMBO_TO_VARIANT_ID: Record<string, string> = {
  "15,15":       "1797168", // 2x Beginner (€14)
  "15,24":       "1811339", // Beginner + Intermediate (€16)
  "15,36":       "1811729", // Beginner + Advanced (€18)
  "24,24":       "1811734", // 2x Intermediate (€18)
  "24,36":       "1811819", // Intermediate + Advanced (€20)
  "36,36":       "1811825", // 2x Advanced (€22)
  "15,15,15":    "1811829", // 3x Beginner (€21)
  "15,15,36":    "1811832", // 2x Beginner + 1x Advanced (€25)
  "15,24,36":    "1811287", // Beginner + Intermediate + Advanced (€27)
  "15,36,36":    "1811835", // 1x Beginner + 2x Advanced (€29)
  "24,24,24":    "1811837", // 3x Intermediate (€27)
  "24,24,36":    "1811838", // 2x Intermediate + 1x Advanced (€29)
  "24,36,36":    "1811840", // 1x Intermediate + 2x Advanced (€31)
  "36,36,36":    "1811842", // 3x Advanced (€33)
};

function comboKey(levels: string[]): string {
  return [...levels].sort().join(",");
}

export async function POST(req: NextRequest) {
  try {
    const { levels, email, orderId, levelLabel } = await req.json();

    if (!Array.isArray(levels) || levels.length === 0) {
      return NextResponse.json({ error: "No levels provided" }, { status: 400 });
    }

    let variantId: string | undefined;

    if (levels.length === 1) {
      variantId = LEVEL_TO_VARIANT_ID[levels[0]];
    } else {
      const key = comboKey(levels);
      variantId = COMBO_TO_VARIANT_ID[key];
      if (!variantId) {
        return NextResponse.json({
          error: `No combo variant set up yet for this cart (${key}). Please contact hello@creabeastudio.com to complete your order, or remove an item to use a single checkout.`,
        }, { status: 400 });
      }
    }

    if (!variantId) {
      return NextResponse.json({ error: "Unknown level/combo" }, { status: 400 });
    }

    const apiKey  = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      return NextResponse.json({ error: "Missing LemonSqueezy credentials" }, { status: 500 });
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
              },
            },
            product_options: {
              enabled_variants: [parseInt(variantId, 10)],
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId.toString() },
            },
            variant: {
              data: { type: "variants", id: variantId.toString() },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("LemonSqueezy checkout error:", JSON.stringify(data));
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (e: any) {
    console.error("create-checkout error:", e.message);
    return NextResponse.json({ error: e.message || "Failed to create checkout" }, { status: 500 });
  }
}