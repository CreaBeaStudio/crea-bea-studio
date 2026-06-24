import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (digest.length !== received.length) return false;
  return crypto.timingSafeEqual(digest, received);
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload?.meta?.event_name;

  // Only act on successful orders
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true });
  }

  const attributes = payload?.data?.attributes;
  const customData = payload?.meta?.custom_data ?? {};

  const customerEmail = attributes?.user_email;
  const orderId        = customData?.order_id ?? "";
  const levelLabel     = customData?.level_label ?? "";

  if (!customerEmail) {
    console.error("Webhook missing customer email, skipping confirmation email.");
    return NextResponse.json({ received: true });
  }

  try {
    // Confirmation email to customer — sent only now, after payment succeeded.
    // (Your own order notification was already sent on submit, with the photo attached.)
    await resend.emails.send({
      from:    "CreaBea Studio <orders@creabeastudio.com>",
      to:      customerEmail,
      subject: `💖 Thank you for your order #${orderId}!`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">💖 Thank you for your order!</h1>
          </div>
          <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
            <p style="font-size:16px;color:#444;line-height:1.7;">
              We've received your payment and we'll get started on your Guangna by Number right away!
            </p>
            <p style="font-size:16px;color:#444;line-height:1.7;">
              Talk soon ✨
            </p>
            <div style="margin-top:24px;padding:16px;background:#FFF0F3;border-radius:10px;">
              <p style="margin:0;font-size:14px;color:#888;">🔖 Order ID: <strong style="color:#e75480;">${orderId}</strong></p>
              <p style="margin:8px 0 0;font-size:14px;color:#888;">🎯 Level: <strong>${levelLabel}</strong></p>
            </div>
            <p style="margin-top:24px;font-size:13px;color:#aaa;text-align:center;">
              Questions? Reply to this email or contact us at
              <a href="mailto:hello@creabeastudio.com" style="color:#e75480;">hello@creabeastudio.com</a>
            </p>
            <p style="text-align:center;font-size:20px;margin-top:8px;">🐾</p>
          </div>
        </div>
      `,
    });

    console.log("Webhook processed, customer confirmation sent for order:", orderId);
  } catch (e: any) {
    console.error("Failed to send confirmation email from webhook:", e.message);
  }

  return NextResponse.json({ received: true });
}
