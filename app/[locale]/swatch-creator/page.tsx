// Location: app/[locale]/swatch-creator/page.tsx
//
// ICON: your Legend/Languo converter pages show a small pink "Guangna"
// marker icon above the heading. I don't have its actual source (an
// <Image> path, or inline SVG?), so it's left as a TODO comment below --
// paste me the icon markup from e.g. legend-converter/page.tsx and I'll
// drop it in exactly.
//
// Heading style below matches what's visible in your screenshots:
// Nunito, weight 900, var(--pink) -- same treatment as "Legend to
// Guangna Palette" / "Languo to Guangna Converter".
//
// Ready-made Swatch Card packs now live INSIDE SwatchCreator.tsx
// (rendered between the intro and the tool panels), not here -- no
// change needed to this page's own layout.
//
// UPDATED (2026-07-24):
//  - Title simplified to "Swatch Card Creator" (dropped "DIY").
//  - Subtitle rewritten to her wording.
//  - FIX: the subtitle paragraph had `maxWidth: 720` while the
//    Presorted/DIY boxes below it span the full `<main>` width (960 -
//    padding) -- that mismatch is what made the paragraph visibly
//    narrower than the boxes underneath it. Removed the maxWidth so the
//    paragraph now spans the same width as everything below it.

// UPDATED (2026-07-24, round 2):
//  - Subtitle now translated via the "swatchCreator" namespace
//    (pageSubtitle key) instead of hardcoded English -- per Mirjam,
//    this is the "subtext under Swatch Card Creator" she specifically
//    wanted translated, alongside the "How to Use This Tool?" block
//    inside SwatchCreator.tsx itself (see that file's t("howToUse.*")
//    calls). The H1 title itself stays hardcoded -- not requested.

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
          <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{ objectFit: "contain", height: "auto" }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 40, color: "var(--pink)", marginBottom: 10 }}>
          Swatch Card Creator
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