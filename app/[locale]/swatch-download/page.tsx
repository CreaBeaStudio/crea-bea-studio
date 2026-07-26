"use client";

// Save this file as app/[locale]/swatch-download/page.tsx
//
// UPDATED (2026-07-27): full i18n pass -- this page previously had NO
// next-intl integration at all. Every visible string now routes
// through t() under a new "swatchDownload" namespace. The client-side
// PDF generation failure (in triggerDownload's catch block) now uses
// t("pdfGenerationError") instead of a hardcoded English string -- this
// one isn't a route error code (lib/apiErrors.ts), since it's a local
// jsPDF/rendering failure that never reaches an API route, so it stays
// as its own key in this namespace rather than joining that shared
// list.
//
// Where a customer lands after LemonSqueezy checkout for a paid Custom
// Swatch Card Set order. Payment confirmation itself happens
// asynchronously via the webhook (which writes paid.json to GCS,
// usually within a couple seconds) -- this page polls for that, then
// reconstructs the exact same SwatchItem list + options the customer
// built and runs it through the SAME renderCards() used everywhere
// else (lib/swatchPdf.ts), unlocked to the full selection instead of
// just the free 48-color preview.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "../components/Navbar";
import { guangnaItem, languoItem, buildCards, renderCards, type SwatchItem } from "@/lib/swatchPdf";
import type { SwatchSelectionJson } from "@/lib/swatchOrder";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~60s -- generous, since the webhook is usually near-instant

type Status = "checking" | "ready" | "timedOut" | "error";

function SwatchDownloadContent() {
  const t = useTranslations("swatchDownload");
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";

  const [status, setStatus] = useState<Status>("checking");
  const [selection, setSelection] = useState<SwatchSelectionJson | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const pollCount = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/swatch-order-status?order=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }
        if (data.paid && data.selection) {
          setSelection(data.selection as SwatchSelectionJson);
          setStatus("ready");
          return;
        }

        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setStatus("timedOut");
          return;
        }
        pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [orderId]);

  const triggerDownload = async () => {
    if (!selection) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const items: SwatchItem[] = selection.items
        .map((i) => (i.source === "guangna" ? guangnaItem(i.code, i.origin) : languoItem(i.code, i.origin)))
        .filter((x): x is SwatchItem => x !== null);
      const excluded = new Set(selection.excluded || []);
      const cards = buildCards(items, selection.options.cardPacking, excluded);
      await renderCards(cards, selection.options, "creabeastudio-swatch-cards-full.pdf");
    } catch {
      setDownloadError(t("pdfGenerationError"));
    } finally {
      setDownloading(false);
    }
  };

  // Auto-trigger the download once, the moment payment is confirmed.
  useEffect(() => {
    if (status === "ready" && selection && !downloading) {
      triggerDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <>
      <Navbar />
      <main style={{ padding: "60px 24px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginBottom: 12, fontSize: 40 }}>🎨</div>

        {status === "checking" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("checkingTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15 }}>
              {t("checkingBody")}
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("readyTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 20 }}>
              {t("readyBody")}
            </p>
            {downloadError && (
              <div style={{ background: "#FFF0F0", border: "1.5px solid var(--pink)", borderRadius: 12, padding: 14, color: "#c62828", fontSize: 14, marginBottom: 16 }}>
                ⚠️ {downloadError}
              </div>
            )}
            <button className="btn-primary" onClick={triggerDownload} disabled={downloading} style={{ padding: "14px 28px", fontSize: 15 }}>
              {downloading ? t("generating") : t("downloadButton")}
            </button>
            <p style={{ marginTop: 20, fontSize: 12.5, color: "var(--muted)" }}>
              {t("orderReferenceNote", { orderId })}
            </p>
          </>
        )}

        {status === "timedOut" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("timedOutTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 8 }}>
              {t("timedOutBody")}
            </p>
            <p style={{ color: "#666", fontSize: 14 }}>
              {t("timedOutEmailPrefix")} <a href="mailto:hello@creabeastudio.com" style={{ color: "var(--pink)" }}>hello@creabeastudio.com</a> {t("timedOutRefSuffix")} <strong>{orderId}</strong>
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("errorTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15 }}>
              {t("errorEmailPrefix")} <a href="mailto:hello@creabeastudio.com" style={{ color: "var(--pink)" }}>hello@creabeastudio.com</a>
              {orderId ? <> {t("errorRefSuffix")} <strong>{orderId}</strong></> : ` ${t("errorNoRefSuffix")}`}
            </p>
          </>
        )}
      </main>
    </>
  );
}

export default function SwatchDownloadPage() {
  return <Suspense><SwatchDownloadContent /></Suspense>;
}