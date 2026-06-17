import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Google Drive setup ────────────────────────────────────────────────────────
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

// ── Upload a file buffer to Google Drive ─────────────────────────────────────
async function uploadToDrive(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
) {
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: "id, webViewLink",
  });
  return res.data;
}

// ── Send notification email via Resend ────────────────────────────────────────
async function sendNotificationEmail(orderDetails: {
  orderId: string;
  customerEmail: string;
  level: string;
  sets: string;
  indPens: string;
  fileName: string;
  driveLink: string;
  grandTotal?: number;
  allOrders?: { photoName: string; levelLabel: string; priceLabel: string }[];
}) {
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail) return;

  const multiOrderTable = orderDetails.allOrders && orderDetails.allOrders.length > 1
    ? `
      <h3 style="color:#e75480;margin-top:24px;">🛒 All Orders (${orderDetails.allOrders.length} total)</h3>
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
          ${orderDetails.allOrders.map((o, i) => `
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
        Grand Total: ${orderDetails.grandTotal}€
      </p>
    `
    : "";

  await resend.emails.send({
    from: "CreaBea Studio <orders@creabeastudio.com>",
    to: notifyEmail,
    replyTo: orderDetails.customerEmail,
    subject: `🎨 New Order #${orderDetails.orderId} from ${orderDetails.customerEmail}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">🎨 New Guangna by Number Order</h1>
        </div>
        <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr>
              <td style="padding:10px 0;color:#888;width:40%;">🔖 Order ID</td>
              <td style="padding:10px 0;font-weight:600;">${orderDetails.orderId}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">📷 Photo</td>
              <td style="padding:10px 0;font-weight:600;">${orderDetails.fileName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;">🎯 Level</td>
              <td style="padding:10px 0;font-weight:600;">${orderDetails.level}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">🖊️ Marker sets</td>
              <td style="padding:10px 0;font-weight:600;">${orderDetails.sets || "Default palette"}</td>
            </tr>
            ${orderDetails.indPens ? `
            <tr>
              <td style="padding:10px 0;color:#888;">➕ Extra markers</td>
              <td style="padding:10px 0;font-weight:600;">${orderDetails.indPens}</td>
            </tr>` : ""}
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">✉️ Customer email</td>
              <td style="padding:10px 0;font-weight:600;">
                <a href="mailto:${orderDetails.customerEmail}" style="color:#e75480;">${orderDetails.customerEmail}</a>
              </td>
            </tr>
          </table>

          ${multiOrderTable}

          <div style="margin-top:20px;">
            <a href="${orderDetails.driveLink}"
              style="display:inline-block;background:#e75480;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              📁 Open photo in Google Drive →
            </a>
          </div>

          <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
            💡 Reply to this email to send files directly to <strong>${orderDetails.customerEmail}</strong>
          </div>
        </div>
      </div>
    `,
  });
}

// ── Main route handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "Drive folder not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile   = formData.get("image") as File | null;
    const customerEmail = (formData.get("email") as string || "").trim();
    const level       = (formData.get("level") as string) || "24";
    const sets        = (formData.get("sets") as string) || "";
    const indPens     = (formData.get("indPens") as string) || "";
    const allOrdersRaw = (formData.get("allOrders") as string) || "[]";
    const grandTotal  = parseInt(formData.get("grandTotal") as string || "0", 10);

    if (!imageFile) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const orderId = `PBN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const ext = imageFile.name.split(".").pop() || "jpg";
    const safeEmail = customerEmail.replace(/[^a-zA-Z0-9@.]/g, "_");
    const fileName = `${orderId}_${safeEmail}_level${level}.${ext}`;

    // Upload image to Google Drive
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const drive = getDriveClient();
    const uploaded = await uploadToDrive(drive, folderId, fileName, buffer, imageFile.type || "image/jpeg");

    // Save order metadata as JSON alongside the image
    const levelLabel = level === "15" ? "Beginner (7€)" : level === "24" ? "Intermediate (9€)" : "Advanced (11€)";
    let allOrders = [];
    try { allOrders = JSON.parse(allOrdersRaw); } catch {}

    const meta = {
      orderId, customerEmail, level, levelLabel,
      sets: sets || "default", indPens,
      fileName, uploadedAt: new Date().toISOString(),
      driveFileId: uploaded.id, driveLink: uploaded.webViewLink,
      grandTotal, allOrders, status: "pending",
    };
    const metaBuffer = Buffer.from(JSON.stringify(meta, null, 2));
    await uploadToDrive(drive, folderId, `${orderId}_META.json`, metaBuffer, "application/json");

    // Send notification email via Resend
    await sendNotificationEmail({
      orderId, customerEmail,
      level: levelLabel,
      sets, indPens, fileName,
      driveLink: uploaded.webViewLink || "",
      grandTotal, allOrders,
    });

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    console.error("Order submission error:", e);
    return NextResponse.json({ error: e.message || "Submission failed" }, { status: 500 });
  }
}
