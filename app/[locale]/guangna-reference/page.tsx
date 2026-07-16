"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { useState, useMemo, useRef, useId } from "react";
import { useTranslations } from "next-intl";
import { GN_COLORS, GUANGNA_SETS, SET_OPTIONS, rgbToHex } from "../../../lib/guangna";
// This file must be saved as app/[locale]/guangna-reference/page.tsx —
// Next.js only turns it into a route at that exact path/filename.
// lib/ lives at the project root, so that's 3 levels up from here, same
// convention as color-converter/page.tsx and languo-converter/page.tsx.

const ALL_CODES: string[] = Object.keys(GN_COLORS).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
);
const MAX_SUGGESTIONS = 8;

// Noise-overlay protection, same technique as Color/Legend/Languo
// converters, so a browser eyedropper/color-picker samples noisy
// pixels instead of the exact marker color. This page can show many
// swatches at once (a whole set's worth), so each instance gets its
// own filter id via useId() -- reusing a static id="noise" across
// multiple <svg> elements on the same page is invalid HTML and risks
// swatches referencing the wrong filter.
function Swatch({ rgb, size = 40 }: { rgb: [number, number, number]; size?: number }) {
  const filterId = useId();
  const hex = rgbToHex(rgb);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(0,0,0,0.1)" }}>
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

type CodeResult = {
  code: string;
  name: string;
  rgb: [number, number, number];
  sets: string[];
};

// Prefixes a set's label with its base key -- e.g. "GN.8101-288 (288
// colors)" + "Classic brush-288" becomes "GN.8101 - Classic brush-288".
// Strips the "(NNN colors)" parenthetical first, then any trailing
// "-NNN" count suffix, but keeps letter suffixes intact (so
// "GN.8109A-12 (12 colors)" becomes "GN.8109A", not "GN.8109").
function setDisplayLabel(s: { label: string; key: string }): string {
  const basePrefix = s.key.split(" (")[0].replace(/-\d+$/, "");
  return `${basePrefix} - ${s.label}`;
}

export default function GuangnaReferenceGuide() {
  const t = useTranslations("GuangnaReference");

  // ── Code -> Sets ──────────────────────────────────────────────────
  const [codeInput, setCodeInput] = useState("");
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeResult, setCodeResult] = useState<CodeResult | null>(null);
  const codeBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom autocomplete instead of a native <datalist> -- a <datalist>
  // renders every one of the 366 codes in a native scrollable list,
  // which is exactly what we're avoiding here. Only shows a short
  // filtered slice, and only once the person has actually typed
  // something. ALL_CODES is pre-sorted ascending, so filter()
  // preserves that order without any extra sort here.
  const codeSuggestions = useMemo(() => {
    const q = codeInput.trim().toUpperCase();
    if (!q) return [];
    return ALL_CODES.filter(code => code.includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [codeInput]);

  const lookupCode = (raw?: string) => {
    const typed = (raw ?? codeInput).trim().toUpperCase();
    if (!typed) return;
    // Accepts "605", "GN-605", or "gn605" -- normalizes to "GN-605",
    // matching how codes are stored in GN_COLORS/GUANGNA_SETS.
    const normalized = `GN-${typed.replace(/^GN-?/i, "")}`;
    setCodeError(null);
    const entry = GN_COLORS[normalized];
    if (!entry) {
      setCodeError(t("errors.codeNotFound", { code: typed }));
      setCodeResult(null);
      return;
    }
    const sets = SET_OPTIONS
      .filter(s => GUANGNA_SETS[s.key]?.includes(normalized))
      .map(setDisplayLabel);
    setCodeResult({ code: normalized, name: entry[3], rgb: [entry[0], entry[1], entry[2]], sets });
  };

  const selectCodeSuggestion = (code: string) => {
    setCodeInput(code.replace(/^GN-?/i, ""));
    setShowCodeSuggestions(false);
    lookupCode(code);
  };

  // ── Set -> Codes ──────────────────────────────────────────────────
  const [selectedSet, setSelectedSet] = useState("");
  const setCodes = useMemo(() => {
    if (!selectedSet || !GUANGNA_SETS[selectedSet]) return [];
    return [...GUANGNA_SETS[selectedSet]].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [selectedSet]);

  return (
    <>
      <style>{`
        .ref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 768px) { .ref-grid { grid-template-columns: 1fr; } }
        .ref-swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; margin-top: 14px; }
      `}</style>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{ objectFit: "contain", height: "auto" }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,40px)", marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: "#666", marginBottom: 36 }}>
          {t("subtitle")}
        </p>

        <div className="ref-grid">
          {/* Code -> Sets */}
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t("byCode.heading")}</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("byCode.description")}</p>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value); setShowCodeSuggestions(true); setCodeError(null); }}
                onFocus={() => setShowCodeSuggestions(true)}
                onBlur={() => { codeBlurTimeout.current = setTimeout(() => setShowCodeSuggestions(false), 120); }}
                onKeyDown={e => { if (e.key === "Enter") lookupCode(); }}
                placeholder={t("byCode.placeholder")}
                style={{ width: "100%" }}
                autoComplete="off"
              />
              {showCodeSuggestions && codeSuggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
                  background: "white", border: "2px solid var(--border)", borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", maxHeight: 260, overflowY: "auto",
                }}>
                  {codeSuggestions.map(code => (
                    <button
                      key={code}
                      // onMouseDown fires before the input's onBlur, so the
                      // click registers before the suggestion list closes.
                      onMouseDown={() => { if (codeBlurTimeout.current) clearTimeout(codeBlurTimeout.current); selectCodeSuggestion(code); }}
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
            <button className="btn-primary" onClick={() => lookupCode()} disabled={!codeInput.trim()}
              style={{ width: "100%", marginTop: 10, opacity: !codeInput.trim() ? 0.6 : 1 }}>
              {t("byCode.button")}
            </button>
            {codeError && <p style={{ fontSize: 12, color: "var(--pink)", marginTop: 8, fontWeight: 600 }}>{codeError}</p>}

            {codeResult && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 10, background: "var(--cream)", marginBottom: 14 }}>
                  <Swatch rgb={codeResult.rgb} size={44} />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{codeResult.code}</div>
                    <div style={{ color: "#555", fontSize: 12 }}>{codeResult.name}</div>
                  </div>
                </div>
                {codeResult.sets.length > 0 ? (
                  <>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600 }}>
                      {t("byCode.foundIn", { count: codeResult.sets.length })}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#444", lineHeight: 1.8 }}>
                      {codeResult.sets.map(label => <li key={label}>{label}</li>)}
                    </ul>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>{t("byCode.notInAnySet")}</p>
                )}
              </div>
            )}
          </div>

          {/* Set -> Codes */}
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t("bySet.heading")}</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("bySet.description")}</p>
            <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid var(--border)", fontSize: 13, background: "white" }}>
              <option value="">{t("bySet.noneSelected")}</option>
              {SET_OPTIONS.map(s => <option key={s.key} value={s.key}>{setDisplayLabel(s)}</option>)}
            </select>

            {selectedSet && (
              <>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, marginBottom: 4, fontWeight: 600 }}>
                  {t("bySet.codeCount", { count: setCodes.length })}
                </p>
                <div className="ref-swatch-grid">
                  {setCodes.map(code => {
                    const entry = GN_COLORS[code];
                    if (!entry) return null;
                    return (
                      <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={entry[3]}>
                        <Swatch rgb={[entry[0], entry[1], entry[2]]} size={40} />
                        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{code.replace(/^GN-?/i, "")}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

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
      </main>
    </>
  );
}
