"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SetAutocomplete from "../components/SetAutocomplete";
import { useState, useMemo, useRef, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import { GN_COLORS, GUANGNA_SETS, SET_OPTIONS, rgbToHex } from "../../../lib/guangna";
// This file must be saved as app/[locale]/guangna-reference/page.tsx —
// Next.js only turns it into a route at that exact path/filename.
// lib/ lives at the project root, so that's 3 levels up from here, same
// convention as color-converter/page.tsx and languo-converter/page.tsx.

// ── METALLIC MARKERS (2026-07-21): kept local to this page rather than
// added to lib/guangna.ts's GN_COLORS -- these 48 codes aren't part of
// any GUANGNA_SETS array and aren't used by PBN generation or the
// converter tools' color matching, so they don't belong in the shared
// dataset those depend on. This page shows them purely for reference
// (code lookup + browse), per Mirjam. sRGB values are converted from
// indicative Adobe RGB swatch samples, not measured screen-color data
// like GN_COLORS -- close enough for browsing/reference, not intended
// for precise color matching.
const METALLIC_COLORS: Record<string,[number,number,number,string]> = {
  "330":[179,151,61,"Gold"],
  "331":[195,195,195,"Silver"],
  "332":[223,177,187,"Rose gold"],
  "333":[209,167,121,"Champagne gold"],
  "334":[218,191,174,"Flax gold"],
  "335":[174,121,82,"Coffee gold"],
  "336":[220,138,76,"Coppery"],
  "337":[223,84,95,"Metal red"],
  "338":[153,105,163,"Metal purple"],
  "339":[14,177,228,"Metal blue"],
  "340":[128,191,136,"Green mint"],
  "341":[63,63,63,"Metal black"],
  "342":[0,161,170,"Metal cyan"],
  "343":[237,172,197,"Metal pink"],
  "344":[236,216,214,"Pink white"],
  "345":[144,126,173,"Violet"],
  "346":[86,191,219,"Sky Blue"],
  "347":[209,232,233,"Lake blue"],
  "348":[8,169,146,"Turquoise"],
  "349":[194,218,154,"Sprout green"],
  "350":[208,184,128,"Milk tea gold"],
  "351":[193,204,92,"Yellow green"],
  "352":[187,146,152,"Pink brown"],
  "353":[190,177,182,"Lineseed ash"],
  "354":[233,186,142,"Light orange"],
  "355":[169,209,199,"Lake green"],
  "356":[217,231,210,"Light green"],
  "357":[187,201,225,"Light violet"],
  "358":[193,221,241,"Light blue"],
  "359":[207,186,212,"Light purple"],
  "360":[217,196,196,"Light pink"],
  "361":[228,181,189,"Light red"],
  "362":[238,191,207,"Linen pink"],
  "363":[210,215,187,"Linen green"],
  "364":[186,186,186,"Metal grey"],
  "365":[135,139,193,"Royal purple"],
  "366":[0,136,210,"Dark blue"],
  "367":[186,134,178,"Rose violet"],
  "368":[107,149,198,"Marine blue"],
  "369":[234,129,37,"Metal Orange"],
  "370":[216,95,132,"Rose red"],
  "371":[154,161,113,"Olive gold"],
  "372":[29,154,65,"Dark Green"],
  "373":[104,186,179,"Peacock blue"],
  "374":[116,187,83,"Metal Green"],
  "375":[208,57,101,"Carminum"],
  "376":[113,54,137,"Dark purple"],
  "377":[62,82,164,"Royal blue"],
};
const METALLIC_CODES: string[] = Object.keys(METALLIC_COLORS).sort((a, b) => Number(a) - Number(b));

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
  isMetallic?: boolean;
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

// The "408" set is the one place metallics genuinely belong: 360
// regular colors + all 48 metallics. lib/guangna.ts's own
// GUANGNA_SETS/SET_OPTIONS deliberately don't include the metallics in
// that key (they're not real GN_COLORS entries, so putting them there
// would risk color-matching code elsewhere silently treating them as
// real matches) -- so this page builds the "effective" 408 set locally,
// just for lookup/browse purposes.
const SET_408 = SET_OPTIONS.find(s => s.key.startsWith("GN.8101-408"))!;

export default function GuangnaReferenceGuide() {
  const t = useTranslations("GuangnaReference");
  const locale = useLocale();

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
  // preserves that order without any extra sort here. Metallic codes
  // are appended after regular matches, since they're a much smaller,
  // secondary list. Metallic codes are display-prefixed with "GN-"
  // here (they're stored bare in METALLIC_CODES/METALLIC_COLORS since
  // they're not real GN_COLORS keys) so the dropdown looks consistent
  // with the regular "GN-XXX" suggestions above them.
  const codeSuggestions = useMemo(() => {
    const q = codeInput.trim().toUpperCase();
    if (!q) return [];
    const regular = ALL_CODES.filter(code => code.includes(q));
    const metallic = METALLIC_CODES
      .filter(code => code.includes(q))
      .map(code => `GN-${code}`);
    return [...regular, ...metallic].slice(0, MAX_SUGGESTIONS);
  }, [codeInput]);

  const lookupCode = (raw?: string) => {
    const typed = (raw ?? codeInput).trim().toUpperCase();
    if (!typed) return;
    // Two code namespaces live in GN_COLORS: "GN-NNN" (classic-brush,
    // digits only) and "HG-<letter><NN>" (High Gloss, one letter + 2
    // digits). Accept the code with or without its prefix and detect
    // which namespace it actually belongs to, rather than assuming
    // everything is GN-numeric -- that assumption was the bug that
    // made HG codes unrecognizable here even though they could be
    // selected from the Set -> Codes browser.
    const withoutGN = typed.replace(/^GN-?/i, "");
    const withoutHG = typed.replace(/^HG-?/i, "");
    setCodeError(null);

    let normalized: string | null = null;
    if (/^\d+$/.test(withoutGN)) {
      normalized = `GN-${withoutGN}`;
    } else if (/^[A-Z]\d{2}$/.test(withoutHG)) {
      normalized = `HG-${withoutHG}`;
    }

    const entry = normalized ? GN_COLORS[normalized] : undefined;
    if (normalized && entry) {
      const sets = SET_OPTIONS
        .filter(s => GUANGNA_SETS[s.key]?.includes(normalized!))
        .map(setDisplayLabel);
      setCodeResult({ code: normalized, name: entry[3], rgb: [entry[0], entry[1], entry[2]], sets });
      return;
    }

    // Metallic codes (330-377) are always plain digits, never GN--
    // or HG--prefixed in storage, so they're checked separately using
    // the GN--stripped digits (matches the digits a metallic code
    // would actually be typed/clicked as).
    const metallicEntry = METALLIC_COLORS[withoutGN];
    if (metallicEntry) {
      // A metallic code genuinely belongs to the 408 set -- treat it
      // exactly like a regular code that's found in one set. Displayed
      // as a full "GN-3XX" code, same format as regular codes.
      setCodeResult({
        code: `GN-${withoutGN}`,
        name: metallicEntry[3],
        rgb: [metallicEntry[0], metallicEntry[1], metallicEntry[2]],
        sets: [setDisplayLabel(SET_408)],
        isMetallic: true,
      });
      return;
    }

    setCodeError(t("errors.codeNotFound", { code: typed }));
    setCodeResult(null);
  };

  const selectCodeSuggestion = (code: string) => {
    setCodeInput(code.replace(/^(GN|HG)-?/i, ""));
    setShowCodeSuggestions(false);
    lookupCode(code);
  };

  // ── Set -> Codes ──────────────────────────────────────────────────
  const [selectedSet, setSelectedSet] = useState("");
  const isSet408 = selectedSet === SET_408.key;
  // Regular codes only (sorted); metallics are appended as their own
  // trailing group when the 408 set is selected, kept in plain
  // ascending numeric order rather than the family-curated order used
  // elsewhere -- this page is a flat reference list, not the swatch
  // card builder.
  const setCodes = useMemo(() => {
    if (!selectedSet || !GUANGNA_SETS[selectedSet]) return [];
    const regular = [...GUANGNA_SETS[selectedSet]].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
    return isSet408 ? [...regular, ...METALLIC_CODES] : regular;
  }, [selectedSet, isSet408]);
  const regularSetCodes = isSet408 ? setCodes.slice(0, setCodes.length - METALLIC_CODES.length) : setCodes;

  // Set dropdown -> autocomplete: options need the same setDisplayLabel()
  // prefixing the old native <select> used, so the switch to
  // SetAutocomplete doesn't change what's shown, just how it's picked.
  const setOptionsForAutocomplete = useMemo(
    () => SET_OPTIONS.map(s => ({ key: s.key, label: setDisplayLabel(s) })),
    []
  );

  return (
    <>
      <style>{`
        .ref-grid { display: flex; flex-direction: column; gap: 24px; }
        .ref-swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 10px; margin-top: 14px; }
      `}</style>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{ objectFit: "contain", height: "auto" }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,40px)", marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: "#666", marginBottom: 12 }}>
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
                {codeResult.isMetallic && (
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>
                    {t("byCode.metallicNote")}
                  </p>
                )}
                {codeResult.code.startsWith("HG-") && (
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>
                    {t("byCode.hgNote")}
                  </p>
                )}
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
            <SetAutocomplete
              value={selectedSet}
              onChange={setSelectedSet}
              options={setOptionsForAutocomplete}
              noneLabel={t("bySet.noneSelected")}
            />

            {selectedSet && (
              <>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, marginBottom: 4, fontWeight: 600 }}>
                  {t("bySet.codeCount", { count: setCodes.length })}
                  {isSet408 && ` (${regularSetCodes.length} + ${METALLIC_CODES.length} metallic)`}
                </p>
                <div className="ref-swatch-grid">
                  {regularSetCodes.map(code => {
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

                {isSet408 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 18, marginBottom: 4 }}>
                      {t("bySet.metallicHeading", { count: METALLIC_CODES.length })}
                    </p>
                    <div className="ref-swatch-grid">
                      {METALLIC_CODES.map(code => {
                        const entry = METALLIC_COLORS[code];
                        return (
                          <div key={code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={entry[3]}>
                            <Swatch rgb={[entry[0], entry[1], entry[2]]} size={40} />
                            <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>GN-{code}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
    
        <p style={{ fontSize: 13, marginBottom: 36 }}>
          Want to organize or swatch your markers?{" "}
          <a href={`/${locale}/swatch-creator`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            Try the Swatch Card Creator
          </a>
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
        </main>
      <Footer />
    </>
  );
}