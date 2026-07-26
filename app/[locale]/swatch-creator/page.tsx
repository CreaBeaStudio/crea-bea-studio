// Location: app/[locale]/swatch-creator/page.tsx
//
// UPDATED (2026-07-25, i18n round 3 -- "go big for FR"):
//  - H1 title now translated via t("pageTitle") instead of hardcoded
//    "Swatch Card Creator". Per Mirjam: for French specifically, she
//    wants NOTHING left in English, including page titles and section
//    headers, since French is a large market that's less
//    English-tolerant than NL/DE (and Guangna is less popular in
//    IT/ES, so those staying less complete is fine).
//  - Image alt text now translated via t("brushAlt") instead of
//    hardcoded "Guangna brush" (screen-reader-only text, but still
//    English before this change).
//
// Everything else unchanged from the previous version.

import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SwatchCreator from "../components/SwatchCreator";

export default async function SwatchCreatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Footer copy is shared site-wide under the "home" namespace (same
  // keys your other pages' inline footers already use).
  const tFooter = await getTranslations({ locale, namespace: "home" });
  const t = await getTranslations({ locale, namespace: "swatchCreator" });

  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/marketing/Guangna_brush.png" alt={t("brushAlt")} width={120} height={84} style={{ objectFit: "contain", height: "auto" }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 40, color: "var(--pink)", marginBottom: 10 }}>
          {t("pageTitle")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 24 }}>
          {t("pageSubtitle")}
        </p>

        <SwatchCreator />
      </main>
      <Footer />
    </>
  );
}