import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// ── Google Drive setup ────────────────────────────────────────────────────────
// Uses a Service Account JSON stored as an env var (base64-encoded)
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

// ── Upload a file buffer to Google Drive ──────────────────────────────────────
async function uploadToDrive(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
) {
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: { mimeType, body: stream },
    fields: "id, webViewLink",
  });
  return res.data;
}

// ── Send notification email via Gmail API ─────────────────────────────────────
async function sendNotificationEmail(orderDetails: {
  orderId: string;
  customerEmail: string;
  level: string;
  pens: string;
  fileName: string;
  driveLink: string;
}) {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!encoded) return;
  const creds = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

  const notifyEmail = process.env.NOTIFY_EMAIL; // your email address
  if (!notifyEmail) return;

  // Use nodemailer with Gmail OAuth2 if configured, otherwise skip
  // For simplicity we use a webhook/fetch to a simple email service
  const emailServiceUrl = process.env.EMAIL_WEBHOOK_URL;
  if (!emailServiceUrl) return;

  await fetch(emailServiceUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: notifyEmail,
      subject: `🎨 New PBN Order #${orderDetails.orderId}`,
      html: `
        <h2>New CreaBea Studio Order</h2>
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Customer Email:</strong> ${orderDetails.customerEmail}</p>
        <p><strong>Level:</strong> ${orderDetails.level}</p>
        <p><strong>Pens selected:</strong> ${orderDetails.pens || "Default palette"}</p>
        <p><strong>File:</strong> ${orderDetails.fileName}</p>
        <p><a href="${orderDetails.driveLink}" style="background:#F4607A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:bold;">
          Open in Google Drive →
        </a></p>
        <hr/>
        <p style="color:#888;font-size:12px;">Process & send download link to: <strong>${orderDetails.customerEmail}</strong></p>
      `,
    }),
  }).catch(() => {}); // non-fatal
}

// ── Main route handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "Drive folder not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const customerEmail = (formData.get("email") as string || "").trim();
    const level = (formData.get("level") as string) || "24";
    const pens = (formData.get("pens") as string) || "";
    const notes = (formData.get("notes") as string) || "";

    if (!imageFile) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (!customerEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const orderId = `PBN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const ext = imageFile.name.split(".").pop() || "jpg";
    const safeEmail = customerEmail.replace(/[^a-zA-Z0-9@.]/g, "_");
    const fileName = `${orderId}_${safeEmail}_level${level}.${ext}`;

    // Upload image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const drive = getDriveClient();
    const uploaded = await uploadToDrive(drive, folderId, fileName, buffer, imageFile.type || "image/jpeg");

    // Save order metadata as a small JSON file alongside the image
    const meta = {
      orderId, customerEmail, level,
      pens: pens || "default",
      notes,
      fileName,
      uploadedAt: new Date().toISOString(),
      driveFileId: uploaded.id,
      driveLink: uploaded.webViewLink,
      status: "pending",
    };
    const metaBuffer = Buffer.from(JSON.stringify(meta, null, 2));
    await uploadToDrive(drive, folderId, `${orderId}_META.json`, metaBuffer, "application/json");

    // Notify you
    await sendNotificationEmail({
      orderId,
      customerEmail,
      level: level === "15" ? "Beginner (15 colours)" : level === "24" ? "Intermediate (24 colours)" : "Advanced (36 colours)",
      pens,
      fileName,
      driveLink: uploaded.webViewLink || "",
    });

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    console.error("Order submission error:", e);
    return NextResponse.json({ error: e.message || "Submission failed" }, { status: 500 });
  }
}
