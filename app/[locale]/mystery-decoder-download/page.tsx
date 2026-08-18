"use client";

// Save this file as app/[locale]/mystery-decoder-download/page.tsx
//
// [crea-bea-studio]
//
// Mirrors swatch-download/page.tsx's pattern exactly (poll ->
// reconstruct -> generate -> auto-download), now built against her real
// MysteryDecoderCustom.tsx / lib/mysteryDecoderMatch.ts /
// lib/mysteryDecoderPdf.ts rather than a guessed shape.
//
// Where a customer lands after LemonSqueezy checkout for a paid Custom
// Mystery Decoder order. Payment confirmation happens asynchronously via
// the webhook (which writes paid.json to GCS) -- this page polls for
// that, then reconstructs the SAME marker pool + book match the
// customer's free preview used (GUANGNA_SETS/LANGUO_SETS + the saved
// raw extraCodesText, re-parsed via lib/mysteryDecoderExtraCodes.ts --
// same helper the live component now uses, so the two can't drift) and
// runs it through buildFullDoc(), unlocked to every page instead of
// just the free first-page preview.
//
// All UI text goes through next-intl's t() under a new
// "mysteryDecoderDownload" namespace, EN+FR only per her requirement
// for this feature (not the site's full de/nl/es/it set) -- see
// mysteryDecoderDownload-en.json / -fr.json.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "../components/Navbar";
import { GUANGNA_SETS } from "@/lib/guangna";
import { LANGUO_SETS } from "@/lib/languoSets";
import { buildCombinedPool, matchBook, type BookData } from "@/lib/mysteryDecoderMatch";
import { buildFullDoc } from "@/lib/mysteryDecoderPdf";
import { parseExtraCodesText } from "@/lib/mysteryDecoderExtraCodes";
import type { MysteryDecoderSelectionJson } from "@/lib/mysteryOrder";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~60s, same generous window as swatch-download
const BOOK_DATA_BASE = "/mystery-decoder";
const EXTRA_GUANGNA_KEY = "__extra_guangna__";
const EXTRA_LANGUO_KEY = "__extra_languo__";

type Status = "checking" | "ready" | "timedOut" | "error";

async function fetchBook(slug: string): Promise<BookData> {
  const res = await fetch(`${BOOK_DATA_BASE}/${slug}.json`);
  if (!res.ok) throw new Error(`Failed to fetch book data for ${slug}: ${res.status}`);
  const raw: { line: string; label: string; hex: string }[] = await res.json();
  return { book: slug, count: raw.length, entries: raw };
}

function MysteryDecoderDownloadContent() {
  const t = useTranslations("mysteryDecoderDownload");
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";

  const [status, setStatus] = useState<Status>("checking");
  const [selection, setSelection] = useState<MysteryDecoderSelectionJson | null>(null);
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
        const res = await fetch(`/api/mystery-order-status?order=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }
        if (data.paid && data.selection) {
          setSelection(data.selection as MysteryDecoderSelectionJson);
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
      const { guangnaCodes: extraGuangnaCodes, languoCodes: extraLanguoCodes } = parseExtraCodesText(
        selection.extraCodesText || "",
      );

      const guangnaSetKeys = [...selection.guangnaSetKeys];
      const languoSetKeys = [...selection.languoSetKeys];
      const guangnaSetsForPool: Record<string, string[]> = { ...GUANGNA_SETS };
      const languoSetsForPool: Record<string, { line: string; codes: string[] }> = { ...LANGUO_SETS };

      if (extraGuangnaCodes.length) {
        guangnaSetsForPool[EXTRA_GUANGNA_KEY] = extraGuangnaCodes;
        guangnaSetKeys.push(EXTRA_GUANGNA_KEY);
      }
      if (extraLanguoCodes.length) {
        languoSetsForPool[EXTRA_LANGUO_KEY] = { line: "extra", codes: extraLanguoCodes };
        languoSetKeys.push(EXTRA_LANGUO_KEY);
      }

      const book = await fetchBook(selection.book);
      const pool = buildCombinedPool(guangnaSetKeys, languoSetKeys, guangnaSetsForPool, languoSetsForPool);
      const matches = matchBook(book, pool);

      if (matches.length === 0) {
        setDownloadError(t("noMatchError"));
        return;
      }

      const doc = await buildFullDoc(matches, selection.bookTitle, "safe", selection.setLabel);
      doc.save(`creabeastudio-mystery-decoder-${orderId}.pdf`);
    } catch (e: any) {
      console.error("mystery-decoder-download generation failed:", e.message);
      setDownloadError(t("pdfGenerationError"));
    } finally {
      setDownloading(false);
    }
  };

  // Auto-trigger the download once, the moment payment is confirmed --
  // same pattern as swatch-download.
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
        <div style={{ marginBottom: 12, fontSize: 40 }}>🔎</div>

        {status === "checking" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("checkingTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15 }}>{t("checkingBody")}</p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
              {t("readyTitle")}
            </h1>
            <p style={{ color: "#666", fontSize: 15, marginBottom: 20 }}>{t("readyBody")}</p>
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
            <p style={{ color: "#666", fontSize: 15, marginBottom: 8 }}>{t("timedOutBody")}</p>
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

export default function MysteryDecoderDownloadPage() {
  return <Suspense><MysteryDecoderDownloadContent /></Suspense>;
}