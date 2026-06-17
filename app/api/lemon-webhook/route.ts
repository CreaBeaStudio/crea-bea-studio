import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Verify Lemon Squeezy webhook signature ────────────────────────────────────
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMON_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return hmac === signature;
}

// ── Get Google Drive client ───────────────────────────────────────────────────
function getDriveClient() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!encoded) throw new Error("GOOGLE_SERVICE_ACCOUNT_B64 not set");
  const creds = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

// ── Find metadata file in Drive by orderId ────────────────────────────────────
async function getOrderMeta(orderId: string) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) return null;

  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `name='${orderId}_META.json' and '${folderId}' in parents`,
    fields: "files(id, name)",
  });

  const file = res.data.files?.[0];
  if (!file?.id) return null;

  const content = await drive.files.get(
    { fileId: file.id, alt: "media" },
    { responseType: "text" }
  );

  return JSON.parse(content.data as string);
}

// ── Update metadata status in Drive ──────────────────────────────────────────
async function updateOrderStatus(orderId: string, status: string) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) return;

  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `name='${orderId}_META.json' and '${folderId}' in parents`,
    fields: "files(id)",
  });

  const fileId = res.data.files?.[0]?.id;
  if (!fileId) return;

  const content = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );
  const meta = JSON.parse(content.data as string);
  meta.status = status;
  meta.paidAt = new Date().toISOString();

  await drive.files.update({
    fileId,
    requestBody: {},
    media: {
      mimeType: "application/json",
      body: JSON.stringify(meta, null, 2),
    },
  });
}

// ── Send notification email via Resend ────────────────────────────────────────
async function sendNotificationEmail(meta: any) {
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail) return;

  const multiOrderTable = meta.allOrders?.length > 1
    ? `
      <h3 style="color:#e75480;margin-top:24px;">🛒 All Orders (${meta.allOrders.length} total)</h3>
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
          ${meta.allOrders.map((o: any, i: number) => `
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
        Grand Total: ${meta.grandTotal}€
      </p>
    `
    : "";

  await resend.emails.send({
    from: "CreaBea Studio <orders@creabeastudio.com>",
    to: notifyEmail,
    replyTo: meta.customerEmail,
    subject: `✅ PAID — Order #${meta.orderId} from ${meta.customerEmail}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">✅ New Paid Order!</h1>
        </div>
        <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr>
              <td style="padding:10px 0;color:#888;width:40%;">🔖 Order ID</td>
              <td style="padding:10px 0;font-weight:600;">${meta.orderId}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">📷 Photo</td>
              <td style="padding:10px 0;font-weight:600;">${meta.fileName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;">🎯 Level</td>
              <td style="padding:10px 0;font-weight:600;">${meta.levelLabel}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">🖊️ Marker sets</td>
              <td style="padding:10px 0;font-weight:600;">${meta.sets || "Default palette"}</td>
            </tr>
            ${meta.indPens ? `
            <tr>
              <td style="padding:10px 0;color:#888;">➕ Extra markers</td>
              <td style="padding:10px 0;font-weight:600;">${meta.indPens}</td>
            </tr>` : ""}
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">✉️ Customer email</td>
              <td style="padding:10px 0;font-weight:600;">
                <a href="mailto:${meta.customerEmail}" style="color:#e75480;">${meta.customerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;">💰 Total paid</td>
              <td style="padding:10px 0;font-weight:700;font-size:17px;color:#e75480;">${meta.grandTotal}€</td>
            </tr>
          </table>

          ${multiOrderTable}

          <div style="margin-top:20px;">
            <a href="${meta.driveLink}"
              style="display:inline-block;background:#e75480;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              📁 Open photo in Google Drive →
            </a>
          </div>

          <div style="margin-top:16px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
            💡 Reply to this email to send files directly to <strong>${meta.customerEmail}</strong>
          </div>
        </div>
      </div>
    `,
  });
}

// ── Webhook handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  // Verify the request is genuinely from Lemon Squeezy
  if (!verifySignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const eventName = event.meta?.event_name;

  // Only process successful payments
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true });
  }

  try {
    // Retrieve the orderId we passed through checkout custom data
    const orderId = event.meta?.custom_data?.order_id;
    if (!orderId) {
      console.error("No order_id in webhook custom data");
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Look up metadata from Google Drive
    const meta = await getOrderMeta(orderId);
    if (!meta) {
      console.error(`Metadata not found for order ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send notification email
    await sendNotificationEmail(meta);

    // Update order status to paid
    await updateOrderStatus(orderId, "paid");

    return NextResponse.json({ success: true });

  } catch (e: any) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
