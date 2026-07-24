import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { fulfillOrder } from "@/lib/fulfillOrder";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import { buildCards, renderCardsBuffer, guangnaItem, languoItem, type SwatchItem } from "@/lib/swatchPdf";
import type { SwatchSelectionJson } from "@/lib/swatchOrder";
 
// UPDATED (2026-07-23): now branches on custom_data.product.
//
// "guangna-by-number" -- this was the missing piece: the webhook
// previously only sent a lightweight "we got your order" ack email and
// never actually called fulfillOrder(), so generation+delivery never
// ran. Now it calls fulfillOrder(orderId) directly, which generates
// the files, persists fulfillment.json, and sends the real delivery
// email with signed download links (see lib/fulfillOrder.ts) -- the
// webhook's own ack email is dropped since it would just be redundant
// noise ahead of that.
//
// "custom-swatch" -- generation for this product happens client-side,
// pre-payment (see SwatchCreator.tsx / lib/swatchPdf.ts) for the
// customer's own free-preview/download experience. This branch writes
// a paid.json flag to GCS so /swatch-download's polling picks it up,
// AND (2026-07-24) also regenerates the same PDF server-side from the
// saved selection.json, so it can ride along as a real attachment on
// the backup email -- see the ATTACHMENT block in handleCustomSwatch
// below. Best-effort: a failed regeneration here still sends the
// email, just link-only, since the customer's own browser can always
// build it fresh via /swatch-download regardless.
 
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
 
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creabeastudio.com";
 
// Same 18MB real-file cap as the PBN delivery email (see
// fulfillOrder.ts's MAX_TOTAL_ATTACHMENT_BYTES) -- a single swatch PDF
// should be far smaller than this in normal use, but skip attaching
// (link-only stays fine) rather than risk the email bouncing on an
// unusually large custom selection.
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024;
 
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (digest.length !== received.length) return false;
  return crypto.timingSafeEqual(digest, received);
}
 
async function handleGuangnaByNumber(orderId: string) {
  if (!orderId) {
    console.error("Webhook: guangna-by-number order missing order_id in custom_data, cannot fulfill.");
    return;
  }
  try {
    await fulfillOrder(orderId);
    console.log("Webhook processed, fulfillOrder completed for order:", orderId);
  } catch (e: any) {
    // Don't rethrow -- we still want to return 200 to LemonSqueezy so it
    // doesn't retry-storm. A failed generation here is recoverable via
    // the existing admin resend-links endpoint / manual re-run once the
    // underlying issue is fixed; logging it is what makes that possible.
    console.error(`Webhook: fulfillOrder failed for order ${orderId}:`, e.message);
  }
}
 
// ── ATTACHMENT (2026-07-24): rebuilds the exact same card list the
// customer built (reads items/excluded/options straight from the saved
// selection.json) and renders it with the SAME shared renderer
// /swatch-download uses client-side (lib/swatchPdf.ts's buildPdfDoc()),
// so the attachment is byte-for-byte what they'd get from the download
// page. Returns null on any failure -- caller falls back to link-only.
async function regenerateSwatchPdf(
  bucket: ReturnType<ReturnType<typeof getStorageClient>["bucket"]>,
  orderId: string,
): Promise<Buffer | null> {
  try {
    const [raw] = await bucket.file(`swatch-orders/${orderId}/selection.json`).download();
    const selection = JSON.parse(raw.toString("utf-8")) as SwatchSelectionJson;
    const items = selection.items
      .map((i) => (i.source === "guangna" ? guangnaItem(i.code, i.origin) : languoItem(i.code, i.origin)))
      .filter((x): x is SwatchItem => x !== null);
    const excluded = new Set(selection.excluded || []);
    const cards = buildCards(items, selection.options.cardPacking, excluded);
    const buffer = await renderCardsBuffer(cards, selection.options);
 
    if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
      console.warn(`Webhook: swatch PDF for ${orderId} is ${buffer.byteLength} bytes, over the attachment cap -- sending link-only.`);
      return null;
    }
    return buffer;
  } catch (e: any) {
    console.error(`Webhook: could not regenerate PDF for swatch order ${orderId}, sending link-only email:`, e.message);
    return null;
  }
}
 
async function handleCustomSwatch(orderId: string, customerEmail: string | undefined) {
  if (!orderId) {
    console.error("Webhook: custom-swatch order missing order_id in custom_data, cannot mark paid.");
    return;
  }
 
  const storage = getStorageClient();
  const bucket = storage.bucket(GCS_BUCKET_NAME);
 
  try {
    await bucket.file(`swatch-orders/${orderId}/paid.json`).save(
      JSON.stringify({ paidAt: new Date().toISOString() }, null, 2),
      { contentType: "application/json", resumable: false },
    );
    console.log("Webhook processed, custom-swatch order marked paid:", orderId);
  } catch (e: any) {
    console.error(`Webhook: failed to write paid.json for swatch order ${orderId}:`, e.message);
    return; // don't send a "here's your link" email if we couldn't even mark it paid
  }
 
  const attachmentBuffer = await regenerateSwatchPdf(bucket, orderId);
 
  if (!customerEmail) return;
  const downloadUrl = `${SITE_URL}/swatch-download?order=${encodeURIComponent(orderId)}`;
  try {
    await getResend().emails.send({
      from: "CreaBea Studio <orders@creabeastudio.com>",
      to: customerEmail,
      subject: "💖 Your swatch cards are ready to download!",
      attachments: attachmentBuffer
        ? [{ filename: `creabeastudio-swatch-cards-${orderId}.pdf`, content: attachmentBuffer }]
        : undefined,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">💖 Thank you for your order!</h1>
          </div>
          <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
            <p style="font-size:16px;color:#444;line-height:1.7;">
              Your complete Custom Swatch Card Set is ready${attachmentBuffer ? " and attached to this email" : ""}.
              ${attachmentBuffer ? "You can also use the link below" : "If the download didn't start automatically after checkout, use the link below"}.
            </p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${downloadUrl}" style="background:#e75480;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;">Download your swatch cards</a>
            </p>
            <div style="margin-top:24px;padding:16px;background:#FFF0F3;border-radius:10px;">
              <p style="margin:0;font-size:14px;color:#888;">🔖 Order reference: <strong style="color:#e75480;">${orderId}</strong></p>
            </div>
            <p style="margin-top:24px;font-size:13px;color:#aaa;text-align:center;">
              Questions? Reply to this email or contact us at
              <a href="mailto:hello@creabeastudio.com" style="color:#e75480;">hello@creabeastudio.com</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (e: any) {
    console.error("Failed to send custom-swatch backup email:", e.message);
  }
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
 
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true });
  }
 
  const attributes = payload?.data?.attributes;
  const customData = payload?.meta?.custom_data ?? {};
 
  const customerEmail = attributes?.user_email as string | undefined;
  const orderId        = customData?.order_id ?? "";
  const product         = customData?.product ?? "guangna-by-number"; // pre-migration checkouts had no `product` field
 
  if (product === "custom-swatch") {
    await handleCustomSwatch(orderId, customerEmail);
  } else {
    await handleGuangnaByNumber(orderId);
  }
 
  return NextResponse.json({ received: true });
}
 
