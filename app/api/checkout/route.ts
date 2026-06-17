import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

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

// ── Main route handler ────────────────────────────────────────────────────────
// Only uploads photo + saves metadata to Drive.
// Email notification is sent AFTER payment via the lemon-webhook route.
export async function POST(req: NextRequest) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "Drive folder not configured" }, { status: 500 });
  }

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

    const orderId   = `PBN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const ext       = imageFile.name.split(".").pop() || "jpg";
    const safeEmail = customerEmail.replace(/[^a-zA-Z0-9@.]/g, "_");
    const fileName  = `${orderId}_${safeEmail}_level${level}.${ext}`;

    // Upload photo to Google Drive
    const bytes  = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const drive  = getDriveClient();
    const uploaded = await uploadToDrive(drive, folderId, fileName, buffer, imageFile.type || "image/jpeg");

    const levelLabel = level === "15" ? "Beginner (7€)" : level === "24" ? "Intermediate (9€)" : "Advanced (11€)";
    let allOrders = [];
    try { allOrders = JSON.parse(allOrdersRaw); } catch {}

    // Save order metadata as JSON — webhook will read this after payment
    const meta = {
      orderId, customerEmail, level, levelLabel,
      sets: sets || "default", indPens,
      fileName, uploadedAt: new Date().toISOString(),
      driveFileId: uploaded.id,
      driveLink:   uploaded.webViewLink,
      grandTotal,  allOrders,
      status: "pending_payment",
    };
    const metaBuffer = Buffer.from(JSON.stringify(meta, null, 2));
    await uploadToDrive(drive, folderId, `${orderId}_META.json`, metaBuffer, "application/json");

    // Return orderId so the frontend can pass it to Lemon Squeezy checkout
    return NextResponse.json({ success: true, orderId });

  } catch (e: any) {
    console.error("Order submission error:", e);
    return NextResponse.json({ error: e.message || "Submission failed" }, { status: 500 });
  }
}
