"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SetAutocomplete from "../components/SetAutocomplete";
import { useState, useMemo, useRef, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  GN_366_IDS, GUANGNA_SETS, SET_OPTIONS,
  findClosestN, rgbToHex, normalizeExtraCode,
  type MatchResult,
} from "../../../lib/guangna";
import { LANGUO_COLORS, LANGUO_IDS } from "../../../lib/languo";
// This file must be saved as app/[locale]/languo-converter/page.tsx —
// Next.js only turns it into a route at that exact path/filename.
// lib/ lives at the project root, so that's 3 levels up from here, same
// convention as color-converter/page.tsx and legend-converter/page.tsx.

const MATCH_COUNT = 3;
const MAX_SUGGESTIONS = 8;

// Same noise-overlay technique as ColorConverter's ProtectedSwatch, so a
// browser eyedropper/color-picker samples noisy pixels instead of the
// exact marker color. Unlike ColorConverter (one swatch on screen at a
// time), this page can show up to 7 swatches at once (1 Languo color +
// 3+3 matches), so each instance gets its own unique filter id via
// useId() -- reusing a single id="noise" across multiple <svg> elements
// on the same page is invalid HTML and risks swatches referencing the
// wrong filter.
function Swatch({ rgb, size = 56 }: { rgb: [number, number, number]; size?: number }) {
  const filterId = useId();
  const hex = rgbToHex(rgb);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(0,0,0,0.1)" }}>
      <div style={{ position: "absolute", inset: 0, background: hex }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none", userSelect: "none" }} xmlns="http://www.w3.org/2000/svg">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 60%)", pointerEvents: "none" }} />
    </div>
  );
}

function MatchRow({ rank, m }: { rank: number; m: MatchResult }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 10, background: "var(--cream)" }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", minWidth: 18 }}>{rank}</span>
      <Swatch rgb={m.rgb} size={44} />
      <div>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{m.code}</div>
        <div style={{ color: "#555", fontSize: 12 }}>{m.name}</div>
      </div>
    </div>
  );
}

type Results = {
  languoCode: string;
  languoRgb: [number, number, number];
  fullMatches: MatchResult[];
  ownedMatches: MatchResult[] | null;
  ownedIds: string[];
};

export default function LanguoConverter() {
  const t = useTranslations("LanguoConverter");
  const locale = useLocale();

  const [codeInput, setCodeInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySet, setMySet] = useState("");
  const [extraCodes, setExtraCodes] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [matching, setMatching] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom autocomplete instead of a native <datalist> — a <datalist>
  // renders every one of the 288 codes in a native scrollable list,
  // which is exactly what we're avoiding here. This only ever shows a
  // short filtered slice, and only once the person has actually typed
  // something. LANGUO_IDS is already sorted ascending in lib/languo.ts,
  // so filter() preserves that order here without any extra sort.
  const suggestions = useMemo(() => {
    const q = codeInput.trim().toUpperCase();
    if (!q) return [];
    return LANGUO_IDS.filter(code => code.includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [codeInput]);

  const getOwnedIds = (): string[] => {
    const ids: string[] = [];
    if (mySet && GUANGNA_SETS[mySet]) {
      for (const id of GUANGNA_SETS[mySet]) { if (!ids.includes(id)) ids.push(id); }
    }
    for (const tok of extraCodes.split(/[\s,;]+/)) {
      const id = normalizeExtraCode(tok);
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  };

  const handleMatch = () => {
    setError(null);
    setResults(null);
    // Normalize: trim, uppercase — matches how the codes are stored
    // (e.g. "BR-702"), so "br-702" or " BR-702 " both resolve.
    const normalized = codeInput.trim().toUpperCase();
    const rgb = LANGUO_COLORS[normalized];
    if (!rgb) {
      setError(t("errors.codeNotFound", { code: codeInput }));
      return;
    }
    setMatching(true);
    try {
      const fullMatches = findClosestN(rgb, GN_366_IDS, MATCH_COUNT);
      const ownedIds = getOwnedIds();
      const ownedMatches = ownedIds.length > 0 ? findClosestN(rgb, ownedIds, MATCH_COUNT) : null;
      setResults({ languoCode: normalized, languoRgb: rgb, fullMatches, ownedMatches, ownedIds });
    } finally {
      setMatching(false);
    }
  };

  const selectSuggestion = (code: string) => {
    setCodeInput(code);
    setShowSuggestions(false);
    setError(null);
  };

  // Best overall match isn't in the person's own set -> worth pointing
  // them at guangna.eu, same pattern as LegendConverter's "not in set"
  // notice.
  const bestNotOwned = !!(results?.ownedMatches && results.fullMatches.length > 0
    && !results.ownedIds.includes(results.fullMatches[0].code));

  return (
    <>
      <style>{`
        .languo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        @media (max-width: 768px) { .languo-grid { grid-template-columns: 1fr; } }
      `}</style>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{ objectFit: "contain", height: "auto" }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,40px)", marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: "#666", marginBottom: 12 }}>
          {t("subtitle")}
        </p>
        <p style={{ fontSize: 13, marginBottom: 8 }}>
          {t("crossLink.text")}{" "}
          <a href={`/${locale}/color-converter`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            {t("crossLink.linkText")}
          </a>
        </p>
        <p style={{ fontSize: 13, marginBottom: 16 }}>
          {t("crossLinkLegend.text")}{" "}
          <a href={`/${locale}/legend-converter`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            {t("crossLinkLegend.linkText")}
          </a>
        </p>

        {/* How-it-works / accuracy disclaimer, shown up front rather than
            only after results — this is about setting expectations for
            the whole tool, not just one match. */}
        <div style={{
          background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "var(--muted)", marginBottom: 36, lineHeight: 1.5,
        }}>
          💡 {t("disclaimer")}
        </div>

        {/* Languo code + My Markers, side by side */}
        <div className="languo-grid" style={{ marginBottom: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t("step1.heading")}</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("step1.description")}</p>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value); setShowSuggestions(true); setError(null); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => { blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120); }}
                placeholder={t("step1.placeholder")}
                style={{ width: "100%" }}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
                  background: "white", border: "2px solid var(--border)", borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden",
                }}>
                  {suggestions.map(code => (
                    <button
                      key={code}
                      // onMouseDown fires before the input's onBlur, so the
                      // click registers before the suggestion list closes.
                      onMouseDown={() => { if (blurTimeout.current) clearTimeout(blurTimeout.current); selectSuggestion(code); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                        border: "none", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--cream)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "white")}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {error && (
              <p style={{ fontSize: 12, color: "var(--pink)", marginTop: 8, fontWeight: 600 }}>{error}</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
              {t("myMarkers.heading")} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>{t("myMarkers.optional")}</span>
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("myMarkers.description")}</p>
            <SetAutocomplete
              value={mySet}
              onChange={key => { setMySet(key); setResults(null); }}
              options={SET_OPTIONS}
              noneLabel={t("myMarkers.noneSelected")}
              style={{ marginBottom: 4 }}
            />
          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
  {t("myMarkers.metallicNote")}
</p>
            <input type="text" value={extraCodes} onChange={e => { setExtraCodes(e.target.value); setResults(null); }}
              placeholder={t("myMarkers.extraCodesPlaceholder")} style={{ width: "100%" }} />
          </div>
        </div>

        {/* Match button */}
        <div style={{ marginBottom: 20 }}>
          <button className="btn-primary" onClick={handleMatch} disabled={!codeInput.trim() || matching}
            style={{ width: "100%", opacity: (!codeInput.trim() || matching) ? 0.6 : 1 }}>
            {matching ? t("matching") : t("step2.matchButton")}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 14, borderRadius: 10, background: "var(--cream)" }}>
              <Swatch rgb={results.languoRgb} size={56} />
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{t("results.languoCodeLabel")}</div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{results.languoCode}</div>
              </div>
            </div>

            <div className="languo-grid">
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>{t("results.heading")}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {results.fullMatches.map((m, i) => <MatchRow key={m.code} rank={i + 1} m={m} />)}
                </div>

                {bestNotOwned && (
                  <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)", fontSize: 13, color: "var(--muted)" }}>
                    💡 {t("results.notInSetNotice")}{" "}
                    <a href="https://www.guangna.eu" target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--pink)", fontWeight: 700 }}>
                      {t("results.orderPrompt")}
                    </a>
                  </div>
                )}
              </div>

              {results.ownedMatches && (
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>{t("results.ownedHeading")}</h2>
                  {results.ownedMatches.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {results.ownedMatches.map((m, i) => <MatchRow key={m.code} rank={i + 1} m={m} />)}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.6, textAlign: "center", padding: 24 }}>
                      <p style={{ fontSize: 13 }}>{t("results.noOwnedMatch")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 20, lineHeight: 1.5 }}>
              {t("results.screenDisclaimer")}
            </p>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{t("donate.text")}</p>
              <a href="https://ko-fi.com/creabeastudio" target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-block", padding: "10px 22px", borderRadius: 20,
                  background: "var(--pink)", color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none",
                }}>
                {t("donate.button")}
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}