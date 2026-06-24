import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log("=== SUBMIT ORDER CALLED ===");
  console.log("Resend key:", process.env.RESEND_API_KEY ? "SET" : "MISSING");

  try {
    const formData      = await req.formData();
    const imageFile     = formData.get("image") as File | null;
    const customerEmail = (formData.get("email") as string || "").trim();
    const level         = (formData.get("level") as string) || "24";
    const sets          = (formData.get("sets") as string) || "";
    const indPens       = (formData.get("indPens") as string) || "";
    const allOrdersRaw  = (formData.get("allOrders") as string) || "[]";
    const grandTotal    = parseInt(formData.get("grandTotal") as string || "0", 10);

    if (!imageFile)     return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const orderId    = `PBN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const levelLabel = level === "15" ? "Beginner (7€)" : level === "24" ? "Intermediate (9€)" : "Advanced (11€)";

    let allOrders = [];
    try { allOrders = JSON.parse(allOrdersRaw); } catch {}

    // Convert image to base64 for email attachment
    const bytes  = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const notifyEmail = process.env.NOTIFY_EMAIL!;

    const multiOrderTable = allOrders.length > 1
      ? `
        <h3 style="color:#e75480;margin-top:24px;">🛒 All Orders (${allOrders.length} total)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#FFF0F3;">
              <th style="padding:8px;text-align:left;border:1px solid #f0d0d8;">#</th>
              <th style="padding:8px;text-align:left;border:1px solid #f0d0d8;">Photo</th>
              <th style="padding:8px;text-align:left;border:1px solid #f0d0d8;">Level</th>
              <th style="padding:8px;text-align:left;border:1px solid #f0d0d8;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${(allOrders as any[]).map((o, i) => `
              <tr>
                <td style="padding:8px;border:1px solid #f0d0d8;">${i + 1}</td>
                <td style="padding:8px;border:1px solid #f0d0d8;">${o.photoName}</td>
                <td style="padding:8px;border:1px solid #f0d0d8;">${o.levelLabel}</td>
                <td style="padding:8px;border:1px solid #f0d0d8;">${o.priceLabel}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="font-size:16px;font-weight:bold;color:#e75480;margin-top:12px;">
          Grand Total: ${grandTotal}€
        </p>
      `
      : "";

    const { data, error } = await resend.emails.send({
      from:       "CreaBeaStudio <orders@creabeastudio.com>",
      to:         notifyEmail,
      replyTo:    customerEmail,
      subject:    `🎨 New Order #${orderId} from ${customerEmail} (awaiting payment)`,
      attachments: [
        {
          filename:    imageFile.name,
          content:     base64,
          contentType: imageFile.type || "image/jpeg",
        },
      ],
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">🎨 New Guangna by Number Order (Awaiting Payment)</h1>
          </div>
          <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr>
                <td style="padding:10px 0;color:#888;width:40%;">🔖 Order ID</td>
                <td style="padding:10px 0;font-weight:600;">${orderId}</td>
              </tr>
              <tr style="background:#FFF0F3;">
                <td style="padding:10px 0;color:#888;">📷 Photo</td>
                <td style="padding:10px 0;font-weight:600;">${imageFile.name} (attached)</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#888;">🎯 Level</td>
                <td style="padding:10px 0;font-weight:600;">${levelLabel}</td>
              </tr>
              <tr style="background:#FFF0F3;">
                <td style="padding:10px 0;color:#888;">🖊️ Marker sets</td>
                <td style="padding:10px 0;font-weight:600;">${sets || "Default palette"}</td>
              </tr>
              ${indPens ? `
              <tr>
                <td style="padding:10px 0;color:#888;">➕ Extra markers</td>
                <td style="padding:10px 0;font-weight:600;">${indPens}</td>
              </tr>` : ""}
              <tr style="background:#FFF0F3;">
                <td style="padding:10px 0;color:#888;">✉️ Customer email</td>
                <td style="padding:10px 0;font-weight:600;">
                  <a href="mailto:${customerEmail}" style="color:#e75480;">${customerEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#888;">💰 Total</td>
                <td style="padding:10px 0;font-weight:700;font-size:17px;color:#e75480;">${grandTotal}€</td>
              </tr>
            </table>

            ${multiOrderTable}

            <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
              💡 This is a pre-payment notification. The customer will receive their confirmation email once they pay via LemonSqueezy.
            </div>
          </div>
        </div>
      `,
    });

    console.log("Resend response:", JSON.stringify({ data, error }));
    if (error) throw new Error(JSON.stringify(error));

    console.log("Email sent successfully, orderId:", orderId);
    return NextResponse.json({ success: true, orderId });

  } catch (e: any) {
    console.error("Order submission error:", e.message);
    return NextResponse.json({ error: e.message || "Submission failed" }, { status: 500 });
  }
}
