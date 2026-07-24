"use client";

// Cookie consent banner. Shown on first visit (nothing in localStorage
// yet) and whenever CONSENT_VERSION is bumped in lib/cookieConsent.ts.
// Also reopens if reopenConsentBanner() fires -- wire a "Cookie settings"
// link to that from the Footer so visitors can change their mind later.
//
// Compliance notes baked into this component, don't remove without
// checking the reasoning:
//   - The analytics checkbox in the expanded panel starts UNCHECKED.
//     Pre-ticked non-essential boxes are treated as invalid consent
//     under GDPR (this was litigated directly -- CJEU Planet49).
//   - "Accept all" and "Essential only" are the same size/style weight
//     and equally reachable in one click -- regulators flag designs
//     where "reject" is smaller, greyed out, or buried in a submenu.
//   - Nothing in Analytics.tsx loads until this component calls
//     setConsent(true) -- there's no "fire first, ask forgiveness"
//     tracking happening before a real choice is made.
//   - If a visitor had previously accepted analytics and now revokes
//     it, we reload the page -- once GA4/Clarity's scripts have
//     actually executed in the browser, unmounting the <Script> tags
//     removes them from the DOM but doesn't undo whatever they already
//     set up (cookies, listeners). A reload is the clean way to
//     guarantee nothing keeps running after a revoke.
//
// Save this file as app/[locale]/components/CookieConsentBanner.tsx

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getConsent, setConsent } from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  useEffect(() => {
    setVisible(!getConsent());

    const onReopen = () => {
      setExpanded(true);
      setAnalyticsChecked(getConsent()?.analytics ?? false);
      setVisible(true);
    };
    window.addEventListener("creabea-consent-reopen", onReopen);
    return () => window.removeEventListener("creabea-consent-reopen", onReopen);
  }, []);

  if (!visible) return null;

  const finish = (analytics: boolean) => {
    const prev = getConsent();
    setConsent(analytics);
    setVisible(false);
    setExpanded(false);
    // clean revoke: if analytics was on and is now off, reload so any
    // already-loaded GA4/Clarity script fully stops rather than just
    // being unmounted from the React tree
    if (prev?.analytics && !analytics) window.location.reload();
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("heading")}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: "white",
        borderTop: "2px solid var(--border)",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.10)",
        padding: "18px 20px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 800,
            color: "var(--pink)",
            fontSize: 15,
            marginBottom: 6,
          }}
        >
          {t("heading")}
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.55, marginBottom: expanded ? 12 : 16 }}>
          {t("body")}
        </p>

        {expanded && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--muted)" }}>
              <input type="checkbox" checked disabled style={{ marginTop: 3 }} />
              <span>
                <strong style={{ color: "var(--ink)" }}>{t("essentialLabel")}</strong> — {t("essentialDesc")}
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13,
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={analyticsChecked}
                onChange={(e) => setAnalyticsChecked(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                <strong style={{ color: "var(--ink)" }}>{t("analyticsLabel")}</strong> — {t("analyticsDesc")}
              </span>
            </label>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => finish(true)} style={{ padding: "9px 20px", fontSize: 13.5 }}>
            {t("acceptAll")}
          </button>
          <button className="btn-outline" onClick={() => finish(false)} style={{ padding: "9px 20px", fontSize: 13.5 }}>
            {t("essentialOnly")}
          </button>
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              style={{
                border: "none",
                background: "none",
                color: "var(--pink)",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                padding: "9px 6px",
              }}
            >
              {t("managePreferences")}
            </button>
          ) : (
            <button
              onClick={() => finish(analyticsChecked)}
              className="btn-outline"
              style={{ padding: "9px 20px", fontSize: 13.5 }}
            >
              {t("savePreferences")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
