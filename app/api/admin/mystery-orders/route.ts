import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getStorageClient, GCS_BUCKET_NAME } from "@/lib/gcs";
import type { MysteryDecoderSelectionJson } from "@/lib/mysteryOrder";

// Save this file as app/api/admin/mystery-orders/route.ts
//
// [crea-bea-studio]
//
// Lets her retrieve a Custom Mystery Decoder order (GET) or resend the
// download-link email (POST) without touching GCS by hand -- her
// "retrieve customer orders / re-generate if anything goes wrong"
// requirement. Shared-secret auth via the x-admin-key header (set
// ADMIN_API_KEY in the environment).
//
// NOTE on "regenerate": Mystery Decoder PDF generation is entirely
// client-side (mysteryDecoderPdf.ts fetches fonts + builds via jsPDF in
// the browser) -- there's no server-side renderer to re-run here, unlike
// Swatch Creator's renderCardsBuffer(). "Regenerating" for this product
// just means getting the customer back to their working
// /mystery-decoder-download?order=... link, where the page rebuilds the
// exact same PDF fresh from the saved selection.json every time
// (deterministic, same as the free preview). This endpoint's POST simply
// resends that link by email, in the order's original checkout locale
// unless you pass a different one.

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

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return !!key && key === process.env.ADMIN_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId) {
    return NextResponse.json({ error: "ORDER_ID_REQUIRED" }, { status: 400 });
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    const selectionFile = bucket.file(`mystery-orders/${orderId}/selection.json`);
    const [selectionExists] = await selectionFile.exists();
    if (!selectionExists) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }
    const [raw] = await selectionFile.download();
    const selection = JSON.parse(raw.toString("utf-8")) as MysteryDecoderSelectionJson;

    const paidFile = bucket.file(`mystery-orders/${orderId}/paid.json`);
    const [paid] = await paidFile.exists();
    let paidAt: string | null = null;
    if (paid) {
      const [paidRaw] = await paidFile.download();
      paidAt = JSON.parse(paidRaw.toString("utf-8"))?.paidAt ?? null;
    }

    return NextResponse.json({ orderId, selection, paid, paidAt });
  } catch (e: any) {
    console.error("admin/mystery-orders GET error:", e.message);
    return NextResponse.json({ error: "LOOKUP_FAILED" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { orderId, email, locale } = (await req.json()) as {
      orderId: string;
      email: string;
      locale?: string;
    };
    if (!orderId || !email) {
      return NextResponse.json({ error: "ORDER_ID_AND_EMAIL_REQUIRED" }, { status: 400 });
    }

    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_BUCKET_NAME);
    const [paid] = await bucket.file(`mystery-orders/${orderId}/paid.json`).exists();
    if (!paid) {
      return NextResponse.json({ error: "ORDER_NOT_PAID" }, { status: 400 });
    }

    const resolvedLocale = locale === "fr" ? "fr" : "en";
    const downloadUrl = `${SITE_URL}/${resolvedLocale}/mystery-decoder-download?order=${encodeURIComponent(orderId)}`;

    await getResend().emails.send({
      from: "CreaBea Studio <orders@creabeastudio.com>",
      to: email,
      subject: resolvedLocale === "fr" ? "🔎 Votre décodeur mystère est prêt !" : "🔎 Your mystery decoder is ready to download!",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#6a4c93;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;">🔎 ${resolvedLocale === "fr" ? "Voici votre lien de téléchargement" : "Here's your download link"}</h1>
          </div>
          <div style="background:#F8F6FB;padding:24px;border:1px solid #ded0e8;border-top:none;border-radius:0 0 12px 12px;">
            <p style="text-align:center;margin:24px 0;">
              <a href="${downloadUrl}" style="background:#6a4c93;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;">
                ${resolvedLocale === "fr" ? "Télécharger mon décodeur" : "Download your decoder"}
              </a>
            </p>
            <div style="margin-top:24px;padding:16px;background:#F0EBF6;border-radius:10px;">
              <p style="margin:0;font-size:14px;color:#888;">🔖 ${resolvedLocale === "fr" ? "Référence de commande" : "Order reference"}: <strong style="color:#6a4c93;">${orderId}</strong></p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (e: any) {
    console.error("admin/mystery-orders POST error:", e.message);
    return NextResponse.json({ error: "RESEND_FAILED" }, { status: 500 });
  }
}
