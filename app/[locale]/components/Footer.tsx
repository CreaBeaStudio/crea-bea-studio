"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { reopenConsentBanner } from "@/lib/cookieConsent";

// Shared footer -- same pattern as Navbar. Import this into every page.tsx
// and render it as a SIBLING of <main>, not nested inside it:
//
//   <>
//     <Navbar />
//     <main>...</main>
//     <Footer />
//   </>
//
// Rendering it inside <main> was the cause of the "not full page width"
// issue -- if <main> (or something inside it) has a max-width/centered
// container style, anything nested inside main inherits that same
// constraint. Moving it outside main, plus the explicit width: "100%"
// below, makes it span the full viewport regardless of what main does.
//
// Adjust the `useTranslations` import if your Navbar uses a different
// i18n setup -- this assumes next-intl's `t("key")` pattern, matching
// how the original inline footer called t().
//
// FIX (2026-07-24): the Tips & Tricks link was pointing at
// "/Tips&Tricks", which doesn't match the actual route -- the page
// lives at app/[locale]/tips/page.tsx, same as every other footer link
// here matches its real folder name. Changed to "/tips".

export default function Footer() {
  const t = useTranslations("footer");
  const linkStyle = { color: "rgba(255,255,255,0.85)", textDecoration: "none" as const };
  const linkButtonStyle = {
    ...linkStyle,
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    cursor: "pointer",
  };

  return (
    <footer
      style={{
        background: "var(--pink)",
        color: "rgba(255,255,255,0.85)",
        padding: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        width: "100%",
      }}
    >
      <div>
        <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16, color: "white", marginBottom: 4 }}>
          CreaBeaStudio
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 }}>
          <a href="/create" style={linkStyle}>{t("footerCreate")}</a>
          <a href="/color-converter" style={linkStyle}>{t("footerConverter")}</a>
          <a href="/legend-converter" style={linkStyle}>{t("footerLegendConverter")}</a>
          <a href="/swatch-creator" style={linkStyle}>{t("footerSwatchCreator")}</a>
          <a href="/guangna-reference" style={linkStyle}>{t("footerGuangnaReference")}</a>
          <a href="/languo-converter" style={linkStyle}>{t("footerLanguoConverter")}</a>
          <a href="/examples" style={linkStyle}>{t("footerExamples")}</a>
          <a href="/tips" style={linkStyle}>{t("footerTips")}</a>
          <a href="/faq" style={linkStyle}>{t("footerFaq")}</a>
        </div>
        <a href="https://www.tiktok.com/@CreaBeaStudio" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {t("footerTiktok")}
        </a>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, marginTop: 8, alignItems: "center" }}>
          <a href="/privacy" style={linkStyle}>{t("footerPrivacy")}</a>
          <a href="/terms" style={linkStyle}>{t("footerTerms")}</a>
          <a href="/refund" style={linkStyle}>{t("footerRefund")}</a>
          <button onClick={reopenConsentBanner} style={linkButtonStyle}>
            {t("footerCookieSettings")}
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75, color: "white" }}>
          {t("footerRights", { year: new Date().getFullYear() })}
        </p>
      </div>
      <Image
        src="/marketing/logo-full.png"
        alt="CreaBeaStudio"
        width={0}
        height={0}
        sizes="20vw"
        style={{ height: "auto", width: "auto", maxHeight: 120, maxWidth: 160, objectFit: "contain" }}
      />
    </footer>
  );
}