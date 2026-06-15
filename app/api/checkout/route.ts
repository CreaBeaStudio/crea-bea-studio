import { NextRequest, NextResponse } from "next/server";

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || "";
const LS_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID || "";

export async function GET(req: NextRequest) {
  if (!LS_API_KEY || !LS_VARIANT_ID) {
    // Dev mode: redirect to a placeholder
    return NextResponse.redirect("https://creabeastudio.lemonsqueezy.com");
  }
  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${LS_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: { embed: false },
            product_options: {
              redirect_url: `${req.headers.get("origin") || ""}/create?ordered=1`,
            }
          },
          relationships: {
            store: { data: { type:"stores", id:LS_STORE_ID } },
            variant: { data: { type:"variants", id:LS_VARIANT_ID } },
          }
        }
      })
    });
    const json = await res.json();
    const url = json?.data?.attributes?.url;
    if (url) return NextResponse.redirect(url);
    throw new Error("No checkout URL");
  } catch(e) {
    return NextResponse.redirect(new URL("/create", req.url));
  }
}
