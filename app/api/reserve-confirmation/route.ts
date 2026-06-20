import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, orderId, summary, grandTotal } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const notifyEmail = process.env.NOTIFY_EMAIL!;

    // 1) Customer confirmation
    const customerSend = resend.emails.send({
      from: "CreaBeaStudio <orders@creabeastudio.com>",
      to: email,
      subject: "Your Order is Reserved 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#e75480;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">Your Order is Reserved 🎉</h1>
          </div>
          <div style="background:#FFF8F9;padding:28px 24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
            <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
              Thanks for waiting! Your order has been successfully reserved.
              We are currently finalizing our payment setup. As soon as everything
              is ready, you will be the first to know so you can complete your purchase.
            </p>
            <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
              No action needed for now — we will notify you by email as soon as checkout goes live.
            </p>
            <p style="font-size:15px;color:#444;line-height:1.7;margin:0;">
              We cannot wait for you to start coloring your memories ✨
            </p>
            ${orderId ? `
              <div style="margin-top:24px;padding:12px 16px;background:#FFF0F3;border-radius:8px;font-size:13px;color:#888;">
                🔖 Order ref: <strong style="color:#444;">${orderId}</strong>
              </div>` : ""}
          </div>
        </div>
      `,
    });

    // 2) Admin "confirmed" notice (lightweight — no attachment)
    const adminSend = resend.emails.send({
      from: "CreaBeaStudio <orders@creabeastudio.com>",
      to: notifyEmail,
      replyTo: email,
      subject: `✅ CONFIRMED — Order #${orderId} reserved by ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#4CAF50;padding:16px 20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;font-size:18px;">✅ Customer confirmed their reservation</h2>
          </div>
          <div style="background:#F8FFF8;padding:20px;border:1px solid #d8f0d8;border-top:none;border-radius:0 0 10px 10px;font-size:14px;color:#444;">
            <p style="margin:0 0 10px;">🔖 <strong>Order ID:</strong> ${orderId}</p>
            <p style="margin:0 0 10px;">✉️ <strong>Customer:</strong> <a href="mailto:${email}">${email}</a></p>
            ${summary ? `<p style="margin:0 0 10px;">📦 <strong>Order:</strong> ${summary}</p>` : ""}
            ${grandTotal ? `<p style="margin:0;">💰 <strong>Total:</strong> ${grandTotal}€</p>` : ""}
          </div>
        </div>
      `,
    });

    const [customerResult, adminResult] = await Promise.all([customerSend, adminSend]);

    if (customerResult.error) console.error("Customer confirmation error:", JSON.stringify(customerResult.error));
    if (adminResult.error) console.error("Admin confirmation error:", JSON.stringify(adminResult.error));

    if (customerResult.error && adminResult.error) {
      return NextResponse.json({ error: "Failed to send confirmation emails" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (e: any) {
    console.error("reserve-confirmation error:", e.message);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}