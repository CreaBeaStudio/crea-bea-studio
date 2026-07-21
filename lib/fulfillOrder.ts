import { Storage } from "@google-cloud/storage";
import { sendOrderConfirmationEmail, sendReminderEmail, type UpsellMarker } from "./email";

// ── ORCHESTRATION (2026-07-17): this is what a payment webhook calls
// once payment is confirmed -- it isn't called from anywhere yet, since
// that webhook itself is being wired up last (per Mirjam, 2026-07-17).
// Everything downstream of "payment succeeded" is ready to go: this
// function can be exercised manually (e.g. a temporary test route, or
// a one-off script calling fulfillOrder("PBN-...")) before the webhook
// exists, so the whole flow is provably working ahead of time.
//
// fulfillOrder() steps: call webservice's /generate-full -> persist a
// small fulfillment.json record to GCS (so results don't only live in
// this one function call) -> build 30-day signed GCS links -> send the
// confirmation email.
//
// resendOrderEmail() is the companion function for manual re-issue
// requests (e.g. "I never got my email" / "the link expired") -- it
// does NOT call /generate-full again (no regeneration cost), it just
// reads the already-persisted fulfillment.json + order.json, mints
// fresh signed links, and re-sends the same email. See
// app/api/admin/resend-links/route.ts for the admin-triggered entry
// point that calls this.

const GCS_BUCKET_NAME     = process.env.GCS_ORDERS_BUCKET || "crea-bea-pbn-orders";
const WEBSERVICE_URL      = process.env.PBN_SERVICE_URL!;      // e.g. https://pbn-generator-xxxxx-ez.a.run.app
const WEBSERVICE_API_KEY  = process.env.PBN_SERVICE_API_KEY!;  // matches an entry in webservice's API_KEYS

// Every delivery link (purchased files AND the free opt-in guide) gets
// 30 days -- extended 2026-07-17 from the guide's original 7-day
// window, per Mirjam, so both share one expiry and one mental model.
// Matches the GCS bucket's own ~30-day lifecycle deletion policy, so
// the link and the underlying object expire at roughly the same time
// either way. NOTE: if you want manual re-issue requests (see
// resendOrderEmail below) to reliably work right up until day 30, the
// bucket's lifecycle needs a few extra days of buffer beyond this --
// see the gsutil command in the accompanying chat message.
const SIGNED_URL_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function getStorageClient(): Storage {
  const b64 = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
  if (!b64) {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 is not configured");
  }
  let credentials: any;
  try {
    credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  } catch {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 could not be decoded/parsed -- check it was base64-encoded before pasting into Vercel");
  }
  return new Storage({ credentials, projectId: credentials.project_id });
}

async function getSignedUrl(storage: Storage, path: string): Promise<string> {
  const [url] = await storage.bucket(GCS_BUCKET_NAME).file(path).getSignedUrl({
    action: "read",
    expires: Date.now() + SIGNED_URL_EXPIRY_MS,
  });
  return url;
}

type GenerateFullResponse = {
  order_id: string;
  final_region_count: number;
  outline_pdf_path: string;
  preview_guide_pdf_path: string;
  full_guide_pdf_path: string | null;
  upsell: UpsellMarker[];
  generation_seconds: number;
};

type OrderJson = {
  orderId: string;
  photoExt: string;
  sets: string;
  indPens: string;
  difficulty: string;
  level: string;
  customerEmail: string;
  grandTotal: number;
  wantsFullGuide: boolean;
  submittedAt: string;
};

// Persisted alongside order.json once /generate-full completes -- this
// is what makes manual re-issue (resendOrderEmail) possible without
// re-running generation: everything the email needs (file paths +
// upsell list) is saved here instead of only existing transiently in
// the /generate-full response.
type FulfillmentJson = {
  outlinePdfPath: string;
  previewGuidePdfPath: string;
  fullGuidePdfPath: string | null;
  upsell: UpsellMarker[];
  finalRegionCount: number;
  fulfilledAt: string;
  // REMINDER (2026-07-17): null until the day-21 reminder has actually
  // been sent, then set to that send timestamp -- this is what stops
  // the same order from getting reminded twice on subsequent cron runs.
  reminderSentAt: string | null;
};

const LEVEL_TO_LABEL: Record<string, string> = {
  "15": "🌱 Beginner (7€)",
  "24": "🌿 Intermediate (9€)",
  "36": "🌲 Advanced (11€)",
};

async function readOrderJson(storage: Storage, orderId: string): Promise<OrderJson> {
  const [raw] = await storage.bucket(GCS_BUCKET_NAME).file(`orders/${orderId}/order.json`).download();
  return JSON.parse(raw.toString("utf-8")) as OrderJson;
}

async function buildAndSendEmail(
  storage: Storage,
  orderId: string,
  orderData: OrderJson,
  fulfillment: FulfillmentJson,
): Promise<void> {
  const outlineUrl = await getSignedUrl(storage, fulfillment.outlinePdfPath);
  const previewGuideUrl = await getSignedUrl(storage, fulfillment.previewGuidePdfPath);
  const fullGuideUrl = fulfillment.fullGuidePdfPath
    ? await getSignedUrl(storage, fulfillment.fullGuidePdfPath)
    : null;

  await sendOrderConfirmationEmail({
    orderId,
    customerEmail: orderData.customerEmail,
    levelLabel: LEVEL_TO_LABEL[orderData.level] || orderData.level,
    sets: orderData.sets || "",
    indPens: orderData.indPens || "",
    outlineUrl,
    previewGuideUrl,
    fullGuideUrl,
    upsellMarkers: fulfillment.upsell || [],
  });
}

/**
 * Full post-purchase fulfillment: triggers generation, persists the
 * result, and sends the delivery email. This is what the (not-yet-
 * wired) payment webhook will call once per paid order.
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  if (!WEBSERVICE_URL || !WEBSERVICE_API_KEY) {
    throw new Error("PBN_SERVICE_URL / PBN_SERVICE_API_KEY are not configured");
  }

  // 1. Trigger full-resolution generation on the webservice.
  const genRes = await fetch(`${WEBSERVICE_URL}/generate-full`, {
    method: "POST",
    headers: {
      "X-API-Key": WEBSERVICE_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ order_id: orderId }),
  });
  if (!genRes.ok) {
    const detail = await genRes.text().catch(() => "");
    throw new Error(`/generate-full failed for order ${orderId}: ${genRes.status} ${detail}`);
  }
  const genResult = (await genRes.json()) as GenerateFullResponse;

  const storage = getStorageClient();

  // 2. Persist a fulfillment record -- this is what lets a future
  // manual re-issue (resendOrderEmail) skip regeneration entirely.
  const fulfillment: FulfillmentJson = {
    outlinePdfPath: genResult.outline_pdf_path,
    previewGuidePdfPath: genResult.preview_guide_pdf_path,
    fullGuidePdfPath: genResult.full_guide_pdf_path,
    upsell: genResult.upsell || [],
    finalRegionCount: genResult.final_region_count,
    fulfilledAt: new Date().toISOString(),
    reminderSentAt: null,
  };
  await storage.bucket(GCS_BUCKET_NAME).file(`orders/${orderId}/fulfillment.json`).save(
    JSON.stringify(fulfillment, null, 2),
    { contentType: "application/json", resumable: false },
  );

  // 3. Read order.json for the customer/order details the email needs,
  // then build fresh signed links and send.
  const orderData = await readOrderJson(storage, orderId);
  await buildAndSendEmail(storage, orderId, orderData, fulfillment);
}

/**
 * Manual re-issue: re-sends the delivery email with freshly-signed
 * links, WITHOUT calling /generate-full again. Requires the order to
 * have already been fulfilled once (fulfillment.json must exist) --
 * throws a clear error otherwise, since there's nothing to re-send yet.
 * Called from app/api/admin/resend-links/route.ts.
 */
export async function resendOrderEmail(orderId: string): Promise<void> {
  const storage = getStorageClient();
  const fulfillmentFile = storage.bucket(GCS_BUCKET_NAME).file(`orders/${orderId}/fulfillment.json`);
  const [exists] = await fulfillmentFile.exists();
  if (!exists) {
    throw new Error(`Order ${orderId} hasn't been fulfilled yet (no fulfillment.json) -- nothing to re-send.`);
  }
  const [fulfillmentRaw] = await fulfillmentFile.download();
  const fulfillment = JSON.parse(fulfillmentRaw.toString("utf-8")) as FulfillmentJson;

  const orderData = await readOrderJson(storage, orderId);
  await buildAndSendEmail(storage, orderId, orderData, fulfillment);
}

// ── REMINDER (2026-07-17): a time-based (not click-tracked) nudge sent
// once per order, roughly 21 days after fulfillment, for orders that
// haven't necessarily downloaded their files yet. Called daily by
// app/api/cron/send-reminders/route.ts (Vercel Cron).
//
// Scans every fulfillment.json under orders/ -- fine at current order
// volume. If this ever becomes slow at higher volume, the fix is a
// small index file (e.g. orders/_pending-reminders.json) maintained by
// fulfillOrder() instead of a full bucket scan, but that's premature
// for now.
const REMINDER_AFTER_MS = 21 * 24 * 60 * 60 * 1000;

// How much longer the (30-day) delivery links are still valid, shown in
// the reminder email so the customer knows their actual deadline.
function daysRemainingFromFulfillment(fulfilledAt: string): number {
  const expiresAt = new Date(fulfilledAt).getTime() + SIGNED_URL_EXPIRY_MS;
  const msLeft = expiresAt - Date.now();
  return Math.max(0, Math.round(msLeft / (24 * 60 * 60 * 1000)));
}

export async function sendPendingReminders(): Promise<{ checked: number; sent: number; errors: string[] }> {
  const storage = getStorageClient();
  const bucket = storage.bucket(GCS_BUCKET_NAME);
  const [files] = await bucket.getFiles({ prefix: "orders/" });

  const fulfillmentFiles = files.filter(f => f.name.endsWith("/fulfillment.json"));
  const errors: string[] = [];
  let sent = 0;

  for (const file of fulfillmentFiles) {
    // orders/{orderId}/fulfillment.json -> {orderId}
    const orderId = file.name.split("/")[1];
    try {
      const [raw] = await file.download();
      const fulfillment = JSON.parse(raw.toString("utf-8")) as FulfillmentJson;

      if (fulfillment.reminderSentAt) continue; // already reminded once

      const fulfilledAtMs = new Date(fulfillment.fulfilledAt).getTime();
      const dueForReminder = Date.now() - fulfilledAtMs >= REMINDER_AFTER_MS;
      if (!dueForReminder) continue;

      const orderData = await readOrderJson(storage, orderId);
      const outlineUrl = await getSignedUrl(storage, fulfillment.outlinePdfPath);
      const previewGuideUrl = await getSignedUrl(storage, fulfillment.previewGuidePdfPath);
      const fullGuideUrl = fulfillment.fullGuidePdfPath
        ? await getSignedUrl(storage, fulfillment.fullGuidePdfPath)
        : null;

      await sendReminderEmail({
        orderId,
        customerEmail: orderData.customerEmail,
        outlineUrl,
        previewGuideUrl,
        fullGuideUrl,
        daysRemaining: daysRemainingFromFulfillment(fulfillment.fulfilledAt),
      });

      const updated: FulfillmentJson = { ...fulfillment, reminderSentAt: new Date().toISOString() };
      await file.save(JSON.stringify(updated, null, 2), { contentType: "application/json", resumable: false });
      sent++;
    } catch (e: any) {
      errors.push(`${orderId}: ${e.message}`);
    }
  }

  return { checked: fulfillmentFiles.length, sent, errors };
}
