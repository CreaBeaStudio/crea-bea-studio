import { Resend } from "resend";
import { getEmailTranslator } from "./emailI18n";
import { LEVEL_LABEL_KEYS } from "./levelLabels";

// Lazy-initialized: constructing `new Resend(...)` at module scope meant
// Next.js would crash the whole build the moment it evaluated this file
// during "Collecting page data" -- even for routes that never actually
// send an email during that step -- if RESEND_API_KEY was empty/unset
// in whatever environment `next build` ran in. Deferring construction
// until the first real send means a missing key only breaks the one
// request that needed it, not the entire build.
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

// ── EMAIL ARCHITECTURE (2026-07-17): this is the NEW customer-facing
// delivery email -- sent once /generate-full has actually produced the
// files, not at submit time. LemonSqueezy/Payhip already handle the
// payment/receipt email; this one is purely "here are your files",
// including the full upsell marker list (with a Guangna.eu link) and,
// if the customer opted in on the create page, a link to their free
// full-palette guide. Called from lib/fulfillOrder.ts, which is what
// the (not-yet-wired) payment webhook will eventually call.
//
// REMOVED (2026-07-27): sendReminderEmail() and its ReminderEmailParams
// type -- the day-21 reminder email is discontinued (redundant enough,
// per Mirjam's call, now that the confirmation email already attaches
// the files directly in most cases). See lib/fulfillOrder.ts for the
// matching removal of sendPendingReminders()/REMINDER_AFTER_MS/
// daysRemainingFromFulfillment() -- you'll also need to delete
// app/api/cron/send-reminders/route.ts and its entry in vercel.json
// yourself, since Claude doesn't have those files.
//
// ASSUMPTION: the Guangna.eu link below points to https://guangna.eu --
// flag if that's the wrong URL or needs UTM/referral params.
const GUANGNA_EU_URL = "https://guangna.eu";

export type UpsellMarker = {
  marker_id: string;
  marker_name: string;
  marker_rgb: number[];
  region_count: number;
  // Which of the customer's currently-printed numbers this marker would
  // affect (2026-07-24) -- e.g. buying GN-611 would touch #4 and #9 on
  // the sheet they already have. Empty for "buy these to get started"
  // orders with no owned set to compare against. Optional so this type
  // still matches upsell data from before this field existed.
  affected_numbers?: number[];
};

// ── ATTACHMENTS (2026-07-24): in addition to the download links (which
// stay in the email body regardless -- some inboxes strip attachments,
// and links are what manual re-issue relies on), the files themselves
// can also ride along as real attachments. fulfillOrder.ts decides
// WHICH files make the cut (based on actual GCS file size, so the
// combined attachment payload stays under every major provider's real
// limit) -- this file just takes whatever it's given and hands it to
// Resend via the `path` attachment type, which fetches the file from
// the URL directly rather than needing the bytes buffered through this
// function first.
export type EmailAttachment = { url: string; filename: string };

export type OrderConfirmationEmailParams = {
  orderId: string;
  customerEmail: string;
  // UPDATED (2026-07-27): was `levelLabel: string` (pre-formatted by
  // the caller) -- now the raw level value ("15"/"24"/"36") plus
  // `locale`, so this function resolves the translated label itself
  // via the shared LEVEL_LABEL_KEYS mapping, the same source of truth
  // create/page.tsx and confirm/page.tsx use. Fixes a real bug where
  // fulfillOrder.ts's old LEVEL_TO_LABEL had stale pre-migration prices
  // baked into the label text (e.g. "🌱 Beginner (7€)").
  level: string;
  locale: string;
  sets: string;
  indPens: string;
  outlineUrl: string;
  previewGuideUrl: string;
  // null when the customer didn't opt in (or the order was a gift order,
  // where the opt-in doesn't apply -- see webservice/main.py).
  fullGuideUrl: string | null;
  upsellMarkers: UpsellMarker[];
  // Files to attach directly, on top of the links above. Empty/omitted
  // is fine -- the email is still fully functional via links alone.
  attachments?: EmailAttachment[];
};

// ── UPSELL TABLE (2026-07-24): "Improves" column now shows the actual
// printed number(s) a marker would replace (e.g. "#4, #9") instead of a
// region count that was previously always "1" regardless of the photo
// (it was counting legend rows post-merge, where each marker can only
// ever appear once -- see compute_upsell_diff()'s docstring in
// pbn_guangna_generate.py for the fix). Falls back to a translated
// "New area" when affected_numbers is empty -- either an older upsell
// payload without this field, or a "buy these to get started" list
// with no owned sheet to reference yet.
//
// UPDATED (2026-07-27): every static string here now comes from `t`
// (the "emails.orderConfirmation" translator passed in by the caller)
// instead of hardcoded English.
function upsellMarkersTable(markers: UpsellMarker[], t: ReturnType<typeof getEmailTranslator>): string {
  if (markers.length === 0) return "";
  const rows = markers.map(m => {
    const improves = m.affected_numbers && m.affected_numbers.length
      ? m.affected_numbers.map(n => `#${n}`).join(", ")
      : t("upsell.newArea");
    return `
    <tr>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">
        <span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:rgb(${m.marker_rgb[0]},${m.marker_rgb[1]},${m.marker_rgb[2]});border:1px solid rgba(0,0,0,0.15);vertical-align:middle;margin-right:6px;"></span>
        ${m.marker_id}
      </td>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">${m.marker_name}</td>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">${improves}</td>
    </tr>
  `;
  }).join("");
  return `
    <h3 style="color:#e75480;margin-top:24px;">${t("upsell.title")}</h3>
    <p style="font-size:14px;color:#555;">
      ${t("upsell.intro")}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#FFF0F3;">
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">${t("upsell.columnMarker")}</th>
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">${t("upsell.columnName")}</th>
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">${t("upsell.columnImproves")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:14px;margin-top:10px;">
      <a href="${GUANGNA_EU_URL}" style="color:#e75480;font-weight:700;">${t("upsell.shopLink")}</a>
    </p>
  `;
}

// UPDATED (2026-07-27): fixed stale copy -- this said "stays active
// for 7 days" from before the 2026-07-17 change that extended every
// delivery link (including this one) to the same 30-day expiry as
// everything else. Text now says 30 days, matching reality (and
// matching lib/fulfillOrder.ts's SIGNED_URL_EXPIRY_MS).
function fullGuideSection(fullGuideUrl: string | null, t: ReturnType<typeof getEmailTranslator>): string {
  if (!fullGuideUrl) return "";
  return `
    <div style="margin-top:20px;padding:16px 18px;background:#FFF8ED;border:1.5px solid #F0DFC0;border-radius:10px;">
      <p style="font-size:14px;font-weight:700;color:#8a6d1f;margin:0 0 6px;">${t("fullGuide.title")}</p>
      <p style="font-size:13px;color:#8a6d1f;margin:0 0 10px;">
        ${t("fullGuide.body")}
      </p>
      <a href="${fullGuideUrl}" style="color:#e75480;font-weight:700;">${t("fullGuide.link")}</a>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  const {
    orderId, customerEmail, level, locale, sets, indPens,
    outlineUrl, previewGuideUrl, fullGuideUrl, upsellMarkers,
    attachments = [],
  } = params;

  const t = getEmailTranslator(locale, "emails.orderConfirmation");
  // Level label resolved from the same "create" namespace levels.*
  // keys create/page.tsx and confirm/page.tsx use -- see
  // lib/levelLabels.ts.
  const tCreate = getEmailTranslator(locale, "create");
  const levelLabel = tCreate(LEVEL_LABEL_KEYS[level] || "levels.intermediate");

  const { data, error } = await getResend().emails.send({
    from:    "CreaBeaStudio <orders@creabeastudio.com>",
    to:      customerEmail,
    subject: t("subject", { orderId }),
    // path fetches each file from its (signed) URL directly, rather
    // than requiring the bytes to be downloaded/buffered through this
    // function first -- fulfillOrder.ts already decided which files
    // are safe to include based on real GCS file size.
    attachments: attachments.map(a => ({ path: a.url, filename: a.filename })),
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">${t("heading")}</h1>
        </div>
        <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr>
              <td style="padding:10px 0;color:#888;width:40%;">${t("orderIdLabel")}</td>
              <td style="padding:10px 0;font-weight:600;">${orderId}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">${t("levelLabel")}</td>
              <td style="padding:10px 0;font-weight:600;">${levelLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;">${t("markerSetsLabel")}</td>
              <td style="padding:10px 0;font-weight:600;">${sets || t("defaultPalette")}</td>
            </tr>
            ${indPens ? `
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">${t("extraMarkersLabel")}</td>
              <td style="padding:10px 0;font-weight:600;">${indPens}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">
            <p style="margin:0;">
              <a href="${outlineUrl}" style="color:#e75480;font-weight:700;">${t("downloadOutline")}</a>
            </p>
            <p style="margin:0;">
              <a href="${previewGuideUrl}" style="color:#e75480;font-weight:700;">${t("downloadPreviewGuide")}</a>
            </p>
          </div>

          ${fullGuideSection(fullGuideUrl, t)}
          ${upsellMarkersTable(upsellMarkers, t)}

          <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
            ${t("footerNote")}
          </div>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(JSON.stringify(error));
  return data;
}