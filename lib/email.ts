import { Resend } from "resend";

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
// ASSUMPTION: the Guangna.eu link below points to https://guangna.eu --
// flag if that's the wrong URL or needs UTM/referral params.
const GUANGNA_EU_URL = "https://guangna.eu";

export type UpsellMarker = {
  marker_id: string;
  marker_name: string;
  marker_rgb: number[];
  region_count: number;
};

export type OrderConfirmationEmailParams = {
  orderId: string;
  customerEmail: string;
  levelLabel: string;
  sets: string;
  indPens: string;
  outlineUrl: string;
  previewGuideUrl: string;
  // null when the customer didn't opt in (or the order was a gift order,
  // where the opt-in doesn't apply -- see webservice/main.py).
  fullGuideUrl: string | null;
  upsellMarkers: UpsellMarker[];
};

function upsellMarkersTable(markers: UpsellMarker[]): string {
  if (markers.length === 0) return "";
  const rows = markers.map(m => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">
        <span style="display:inline-block;width:16px;height:16px;border-radius:4px;background:rgb(${m.marker_rgb[0]},${m.marker_rgb[1]},${m.marker_rgb[2]});border:1px solid rgba(0,0,0,0.15);vertical-align:middle;margin-right:6px;"></span>
        ${m.marker_id}
      </td>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">${m.marker_name}</td>
      <td style="padding:6px 8px;border:1px solid #f0d0d8;">${m.region_count}</td>
    </tr>
  `).join("");
  return `
    <h3 style="color:#e75480;margin-top:24px;">✨ Want to add more markers?</h3>
    <p style="font-size:14px;color:#555;">
      These are the markers that would improve your design the most, with how many
      areas each one would cover:
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#FFF0F3;">
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">Marker</th>
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">Name</th>
          <th style="padding:6px 8px;text-align:left;border:1px solid #f0d0d8;">Areas</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:14px;margin-top:10px;">
      <a href="${GUANGNA_EU_URL}" style="color:#e75480;font-weight:700;">Shop Guangna markers →</a>
    </p>
  `;
}

function fullGuideSection(fullGuideUrl: string | null): string {
  if (!fullGuideUrl) return "";
  return `
    <div style="margin-top:20px;padding:16px 18px;background:#FFF8ED;border:1.5px solid #F0DFC0;border-radius:10px;">
      <p style="font-size:14px;font-weight:700;color:#8a6d1f;margin:0 0 6px;">🎁 Your free complete palette guide</p>
      <p style="font-size:13px;color:#8a6d1f;margin:0 0 10px;">
        Handy if you end up ordering more markers later -- this link stays active for 7 days.
      </p>
      <a href="${fullGuideUrl}" style="color:#e75480;font-weight:700;">Download your free guide →</a>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  const {
    orderId, customerEmail, levelLabel, sets, indPens,
    outlineUrl, previewGuideUrl, fullGuideUrl, upsellMarkers,
  } = params;

  const { data, error } = await getResend().emails.send({
    from:    "CreaBeaStudio <orders@creabeastudio.com>",
    to:      customerEmail,
    subject: `🎨 Your Guangna by Number is ready! (Order #${orderId})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">🎨 Your Guangna by Number is ready!</h1>
        </div>
        <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr>
              <td style="padding:10px 0;color:#888;width:40%;">🔖 Order ID</td>
              <td style="padding:10px 0;font-weight:600;">${orderId}</td>
            </tr>
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">🎯 Level</td>
              <td style="padding:10px 0;font-weight:600;">${levelLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;">🖊️ Marker sets</td>
              <td style="padding:10px 0;font-weight:600;">${sets || "Default palette"}</td>
            </tr>
            ${indPens ? `
            <tr style="background:#FFF0F3;">
              <td style="padding:10px 0;color:#888;">➕ Extra markers</td>
              <td style="padding:10px 0;font-weight:600;">${indPens}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">
            <p style="margin:0;">
              📄 <a href="${outlineUrl}" style="color:#e75480;font-weight:700;">Download your numbered outline (print-ready)</a>
            </p>
            <p style="margin:0;">
              🖼️ <a href="${previewGuideUrl}" style="color:#e75480;font-weight:700;">Download your color preview & marker guide</a>
            </p>
          </div>

          ${fullGuideSection(fullGuideUrl)}
          ${upsellMarkersTable(upsellMarkers)}

          <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
            💡 Questions about your order? Just reply to this email or reach us at hello@creabeastudio.com.
          </div>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(JSON.stringify(error));
  return data;
}

// ── REMINDER EMAIL (2026-07-17): sent once, ~21 days after fulfillment,
// for orders whose delivery links haven't necessarily been used yet.
// Deliberately NOT click-tracked (no way to know if they actually
// downloaded) -- this is a simple time-based nudge, not a "you still
// haven't downloaded" message, since we can't honestly claim to know
// that. Reuses the same signed links already built for the original
// delivery email (fresh-signed by the caller, same as that email).
// Called from lib/fulfillOrder.ts's sendPendingReminders(), which is
// what the Vercel Cron job (app/api/cron/send-reminders/route.ts)
// triggers daily.
export type ReminderEmailParams = {
  orderId: string;
  customerEmail: string;
  outlineUrl: string;
  previewGuideUrl: string;
  fullGuideUrl: string | null;
  daysRemaining: number;
};

export async function sendReminderEmail(params: ReminderEmailParams) {
  const { orderId, customerEmail, outlineUrl, previewGuideUrl, fullGuideUrl, daysRemaining } = params;

  const { data, error } = await getResend().emails.send({
    from:    "CreaBeaStudio <orders@creabeastudio.com>",
    to:      customerEmail,
    subject: `🎨 Just checking in — your Guangna by Number files are waiting (Order #${orderId})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#e75480;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">🎨 Don't forget your files!</h1>
        </div>
        <div style="background:#FFF8F9;padding:24px;border:1px solid #f0d0d8;border-top:none;border-radius:0 0 12px 12px;">
          <p style="font-size:15px;color:#444;margin-top:0;">
            Just a friendly reminder that your Guangna by Number files from order <strong>${orderId}</strong>
            are ready and waiting -- with about <strong>${daysRemaining} days</strong> left before this
            download link expires.
          </p>

          <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;">
            <p style="margin:0;">
              📄 <a href="${outlineUrl}" style="color:#e75480;font-weight:700;">Download your numbered outline (print-ready)</a>
            </p>
            <p style="margin:0;">
              🖼️ <a href="${previewGuideUrl}" style="color:#e75480;font-weight:700;">Download your color preview & marker guide</a>
            </p>
            ${fullGuideUrl ? `
            <p style="margin:0;">
              🎁 <a href="${fullGuideUrl}" style="color:#e75480;font-weight:700;">Download your free complete palette guide</a>
            </p>` : ""}
          </div>

          <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#666;">
            💡 Missed this window entirely? Just reply to this email or reach us at hello@creabeastudio.com and we'll send you a fresh link.
          </div>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(JSON.stringify(error));
  return data;
}
