"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SetAutocomplete from "../components/SetAutocomplete";
import { useState, useMemo, useRef, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  GN_COLORS, GN_366_IDS, GN_ALL_MATCHING_IDS, GN_MATCHING_IDS, GUANGNA_SETS, SET_OPTIONS,
  findClosest, findClosestN, rgbToHex, normalizeExtraCode,
  type MatchResult,
} from "@/lib/guangna";
import {
  LANGUO_COLORS, LANGUO_NON_GLITTER_IDS, findClosestLanguoN, normalizeLanguoExtraCode,
  type LanguoMatchResult,
} from "@/lib/languo";
import { LANGUO_SETS, LANGUO_SET_OPTIONS } from "@/lib/languoSets";

const MATCH_COUNT = 3;
const MAX_SUGGESTIONS = 8;

type Direction = "toGuangna" | "toLanguo";
type Mode = "single" | "set";

const LANGUO_NON_GLITTER_SET = new Set(LANGUO_NON_GLITTER_IDS);
const LANGUO_BRUSH_288_DEFAULT = (LANGUO_SETS["Brush 288 Set"]?.codes || []).filter(id => LANGUO_NON_GLITTER_SET.has(id));

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

function MatchRow({ rank, code, name, rgb }: { rank: number; code: string; name?: string; rgb: [number, number, number] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 10, background: "var(--cream)" }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", minWidth: 18 }}>{rank}</span>
      <Swatch rgb={rgb} size={44} />
      <div>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{code}</div>
        {name && <div style={{ color: "#555", fontSize: 12 }}>{name}</div>}
      </div>
    </div>
  );
}

type Results = {
  direction: Direction;
  inputCode: string;
  inputRgb: [number, number, number];
  fullMatches: { code: string; name?: string; rgb: [number, number, number] }[];
  fullGNFallback: MatchResult | null;
  ownedMatches: { code: string; name?: string; rgb: [number, number, number] }[] | null;
  ownedIds: string[];
};

type SetMatchRow = {
  sourceCode: string;
  sourceRgb: [number, number, number];
  matchCode: string;
  matchName?: string;
  matchRgb: [number, number, number];
};

type SetResults = {
  direction: Direction;
  yourSetLabel: string;
  matchToLabel: string;
  rows: SetMatchRow[];
};

export default function BrandConverter() {
  const t = useTranslations("BrandConverter");
  const locale = useLocale();

  const [mode, setMode] = useState<Mode>("single");
  const [direction, setDirection] = useState<Direction>("toGuangna");

  const [codeInput, setCodeInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySet, setMySet] = useState("");
  const [extraCodes, setExtraCodes] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [matching, setMatching] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [yourSet, setYourSet] = useState("");
  const [matchToSet, setMatchToSet] = useState("");
  const [setModeResults, setSetResults] = useState<SetResults | null>(null);
  const [setModeMatching, setSetMatching] = useState(false);
  const [setModeError, setSetError] = useState<string | null>(null);
  const [pdfPaperSize, setPdfPaperSize] = useState<"a4" | "letter">("a4");

  const switchDirection = (d: Direction) => {
    if (d === direction) return;
    setDirection(d);
    setCodeInput("");
    setMySet("");
    setExtraCodes("");
    setResults(null);
    setError(null);
    setYourSet("");
    setMatchToSet("");
    setSetResults(null);
    setSetError(null);
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setError(null);
    setSetError(null);
  };

  const suggestions = useMemo(() => {
    const q = codeInput.trim().toUpperCase();
    if (!q) return [];
    const pool = direction === "toGuangna" ? LANGUO_NON_GLITTER_IDS : GN_366_IDS;
    return pool.filter(code => code.includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [codeInput, direction]);

  const getOwnedIds = (): string[] => {
    const ids: string[] = [];
    if (direction === "toGuangna") {
      if (mySet && GUANGNA_SETS[mySet]) {
        for (const id of GUANGNA_SETS[mySet]) { if (!ids.includes(id)) ids.push(id); }
      }
      for (const tok of extraCodes.split(/[\s,;]+/)) {
        const id = normalizeExtraCode(tok);
        if (id && !ids.includes(id)) ids.push(id);
      }
    } else {
      if (mySet && LANGUO_SETS[mySet]) {
        for (const id of LANGUO_SETS[mySet].codes) {
          if (LANGUO_COLORS[id] && !ids.includes(id)) ids.push(id);
        }
      }
      for (const tok of extraCodes.split(/[\s,;]+/)) {
        const id = normalizeLanguoExtraCode(tok);
        if (id && !ids.includes(id)) ids.push(id);
      }
    }
    return ids;
  };

  const handleMatch = () => {
    setError(null);
    setResults(null);
    const normalized = codeInput.trim().toUpperCase();
    const rgb = direction === "toGuangna" ? LANGUO_COLORS[normalized] : GN_COLORS[normalized]?.slice(0, 3) as [number, number, number] | undefined;
    if (!rgb) {
      setError(t("errors.codeNotFound", { code: codeInput }));
      return;
    }
    setMatching(true);
    try {
      const ownedIds = getOwnedIds();
      let fullMatches: { code: string; name?: string; rgb: [number, number, number] }[];
      let fullGNFallback: MatchResult | null = null;
      let ownedMatches: { code: string; name?: string; rgb: [number, number, number] }[] | null = null;

      if (direction === "toGuangna") {
        const gnMatches = findClosestN(rgb, GN_ALL_MATCHING_IDS, MATCH_COUNT);
        fullMatches = gnMatches;
        fullGNFallback = gnMatches[0]?.code.startsWith("HG-") ? findClosest(rgb, GN_MATCHING_IDS) : null;
        ownedMatches = ownedIds.length > 0 ? findClosestN(rgb, ownedIds, MATCH_COUNT) : null;
      } else {
        const languoMatches = findClosestLanguoN(rgb, LANGUO_NON_GLITTER_IDS, MATCH_COUNT);
        fullMatches = languoMatches;
        ownedMatches = ownedIds.length > 0 ? findClosestLanguoN(rgb, ownedIds, MATCH_COUNT) : null;
      }

      setResults({ direction, inputCode: normalized, inputRgb: rgb, fullMatches, fullGNFallback, ownedMatches, ownedIds });
    } finally {
      setMatching(false);
    }
  };

  const LOGO_PATH = "/marketing/logo-full.png";

  const loadLogoDataUrl = async (): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    try {
      const res = await fetch(LOGO_PATH);
      if (!res.ok) return null;
      const blob = await res.blob();
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const dims: { width: number; height: number } = await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      });
      return { dataUrl, ...dims };
    } catch {
      return null;
    }
  };

  const BRAND_PINK: [number, number, number] = [244, 96, 122];

  const handleDownloadPdf = async () => {
    if (!setModeResults) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: pdfPaperSize });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 36;
    const numColumns = 3;
    const columnGap = 16;
    const columnWidth = (pageWidth - margin * 2 - columnGap * (numColumns - 1)) / numColumns;
    const rowHeight = 15;
    const swatchSize = 8;
    const footerReserve = 46;

    const isToGuangna = setModeResults.direction === "toGuangna";
    const referenceBrand = isToGuangna ? "Languo" : "Guangna";
    const targetBrand = isToGuangna ? "Guangna" : "Languo";

    const logo = await loadLogoDataUrl();

    const drawHeader = (): number => {
      let y = margin + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(BRAND_PINK[0], BRAND_PINK[1], BRAND_PINK[2]);
      doc.text("CreaBeaStudio - Brand Converter", margin, y);
      y += 20;

      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(
        `${setModeResults.yourSetLabel} - ${referenceBrand}  vs  ${setModeResults.matchToLabel} - ${targetBrand}`,
        margin, y
      );
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`${setModeResults.rows.length} codes matched  ·  screen colors may differ from the actual marker`, margin, y);
      y += 14;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      for (let col = 0; col < numColumns; col++) {
        const x = margin + col * (columnWidth + columnGap);
        const matchX = x + columnWidth * 0.56;
        doc.text(referenceBrand, x, y);
        doc.text(targetBrand, matchX, y);
      }
      y += 12;

      return y;
    };

    const drawFooter = () => {
      if (!logo) return;
      const footerLogoHeight = 28;
      const footerLogoWidth = (logo.width / logo.height) * footerLogoHeight;
      doc.addImage(
        logo.dataUrl, "PNG",
        pageWidth - margin - footerLogoWidth, pageHeight - margin - footerLogoHeight + 10,
        footerLogoWidth, footerLogoHeight
      );
    };

    let headerBottomY = drawHeader();
    const availableHeight = pageHeight - footerReserve - headerBottomY;
    const rowsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));
    const rowsPerPage = rowsPerColumn * numColumns;

    doc.setFontSize(8);
    setModeResults.rows.forEach((row, i) => {
      const withinPage = i % rowsPerPage;
      if (i > 0 && withinPage === 0) {
        drawFooter();
        doc.addPage();
        headerBottomY = drawHeader();
        doc.setFontSize(8);
      }
      const col = Math.floor(withinPage / rowsPerColumn);
      const rowInCol = withinPage % rowsPerColumn;
      const x = margin + col * (columnWidth + columnGap);
      const y = headerBottomY + rowInCol * rowHeight + rowHeight - 4;

      doc.setFillColor(row.sourceRgb[0], row.sourceRgb[1], row.sourceRgb[2]);
      doc.rect(x, y - swatchSize + 2, swatchSize, swatchSize, "F");
      doc.setTextColor(20, 20, 20);
      doc.text(row.sourceCode, x + swatchSize + 4, y);

      doc.text("->", x + columnWidth * 0.48, y);

      const matchX = x + columnWidth * 0.56;
      doc.setFillColor(row.matchRgb[0], row.matchRgb[1], row.matchRgb[2]);
      doc.rect(matchX, y - swatchSize + 2, swatchSize, swatchSize, "F");
      doc.text(row.matchCode, matchX + swatchSize + 4, y);
    });
    drawFooter();

    doc.save(`brand-converter-${setModeResults.direction}-${pdfPaperSize}.pdf`);
  };

  const selectSuggestion = (code: string) => {
    setCodeInput(code);
    setShowSuggestions(false);
    setError(null);
  };

  const bestNotOwned = !!(results?.ownedMatches && results.fullMatches.length > 0
    && !results.ownedIds.includes(results.fullMatches[0].code));

  const setOptions = direction === "toGuangna" ? SET_OPTIONS : LANGUO_SET_OPTIONS;
  const glitterOrMetallicNote = direction === "toGuangna" ? t("myMarkers.metallicNote") : t("myMarkers.glitterNote");

  const yourSetOptions = direction === "toGuangna" ? LANGUO_SET_OPTIONS : SET_OPTIONS;
  const matchToOptions = setOptions;

  const labelForSetKey = (key: string, options: { label: string; key: string }[]): string =>
    options.find(o => o.key === key)?.label || key;

  const handleSetMatch = () => {
    setSetError(null);
    setSetResults(null);
    if (!yourSet) {
      setSetError(t("errors.noSetSelected"));
      return;
    }
    setSetMatching(true);
    try {
      const isToGuangna = direction === "toGuangna";

      const sourceIds = isToGuangna
      ? (LANGUO_SETS[yourSet]?.codes || []).filter(id => LANGUO_NON_GLITTER_SET.has(id))
        : (GUANGNA_SETS[yourSet] || []);

      const targetIds = isToGuangna
        ? (matchToSet ? (GUANGNA_SETS[matchToSet] || []) : GN_MATCHING_IDS)
        : (matchToSet
          ? (LANGUO_SETS[matchToSet]?.codes || []).filter(id => LANGUO_NON_GLITTER_SET.has(id))
          : LANGUO_BRUSH_288_DEFAULT);

      const rows: SetMatchRow[] = [];
      for (const id of sourceIds) {
        if (isToGuangna) {
          const rgb = LANGUO_COLORS[id];
          if (!rgb) continue;
          const [m] = findClosestN(rgb, targetIds, 1);
          if (m) rows.push({ sourceCode: id, sourceRgb: rgb, matchCode: m.code, matchName: m.name, matchRgb: m.rgb });
        } else {
          const c = GN_COLORS[id];
          if (!c) continue;
          const rgb: [number, number, number] = [c[0], c[1], c[2]];
          const [m] = findClosestLanguoN(rgb, targetIds, 1);
          if (m) rows.push({ sourceCode: id, sourceRgb: rgb, matchCode: m.code, matchRgb: m.rgb });
        }
      }

      setSetResults({
        direction,
        yourSetLabel: labelForSetKey(yourSet, yourSetOptions),
        matchToLabel: matchToSet
          ? labelForSetKey(matchToSet, matchToOptions)
          : (isToGuangna ? t("setMatch.defaultGuangna") : t("setMatch.defaultLanguo")),
        rows,
      });
    } finally {
      setSetMatching(false);
    }
  };

  return (
    <>
      <style>{`
        .languo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        @media (max-width: 768px) { .languo-grid { grid-template-columns: 1fr; } }
        .set-results-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .set-results-table td { padding: 8px 10px; }
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

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {(["single", "set"] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              padding: "8px 18px", borderRadius: 20, border: "2px solid var(--ink, #222)",
              background: mode === m ? "var(--ink, #222)" : "white",
              color: mode === m ? "white" : "var(--ink, #222)",
              fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["toGuangna", "toLanguo"] as Direction[]).map(d => (
            <button key={d} onClick={() => switchDirection(d)} style={{
              padding: "8px 18px", borderRadius: 20, border: "2px solid var(--pink)",
              background: direction === d ? "var(--pink)" : "white",
              color: direction === d ? "white" : "var(--pink)",
              fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>
              {t(`direction.${d}`)}
            </button>
          ))}
        </div>

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

        <div style={{
          background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "var(--muted)", marginBottom: 36, lineHeight: 1.5,
        }}>
          💡 {t("disclaimer")}
        </div>

        {mode === "single" && (
          <>
            <div className="languo-grid" style={{ marginBottom: 20 }}>
              <div className="card">
                <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t(`step1.heading${direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t(`step1.description${direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}</p>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={e => { setCodeInput(e.target.value); setShowSuggestions(true); setError(null); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => { blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120); }}
                    placeholder={t(`step1.placeholder${direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}
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
                  options={setOptions}
                  noneLabel={t("myMarkers.noneSelected")}
                  style={{ marginBottom: 4 }}
                />
                <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
                  {glitterOrMetallicNote}
                </p>
                <input type="text" value={extraCodes} onChange={e => { setExtraCodes(e.target.value); setResults(null); }}
                  placeholder={t("myMarkers.extraCodesPlaceholder")} style={{ width: "100%" }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <button className="btn-primary" onClick={handleMatch} disabled={!codeInput.trim() || matching}
                style={{ width: "100%", opacity: (!codeInput.trim() || matching) ? 0.6 : 1 }}>
                {matching ? t("matching") : t("step2.matchButton")}
              </button>
            </div>

            {results && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 14, borderRadius: 10, background: "var(--cream)" }}>
                  <Swatch rgb={results.inputRgb} size={56} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                      {t(`results.codeLabel${results.direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 20 }}>{results.inputCode}</div>
                  </div>
                </div>

                <div className="languo-grid">
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>{t("results.heading")}</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {results.fullMatches.map((m, i) => <MatchRow key={m.code} rank={i + 1} code={m.code} name={m.name} rgb={m.rgb} />)}
                    </div>

                    {results.fullGNFallback && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "var(--cream)" }}>
                        <Swatch rgb={results.fullGNFallback.rgb} size={36} />
                        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4, margin: 0 }}>
                          {t("results.gnFallbackNotice", { code: results.fullGNFallback.code, name: results.fullGNFallback.name })}
                        </p>
                      </div>
                    )}

                    {bestNotOwned && results.direction === "toGuangna" && (
                      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)", fontSize: 13, color: "var(--muted)" }}>
                        💡 {t("results.notInSetNotice")}{" "}
                        <a href="https://www.guangna.eu" target="_blank" rel="noopener noreferrer"
                          style={{ color: "var(--pink)", fontWeight: 700 }}>
                          {t("results.orderPrompt")}
                        </a>
                      </div>
                    )}

                    {bestNotOwned && results.direction === "toLanguo" && (
                      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)", fontSize: 13, color: "var(--muted)" }}>
                        <p style={{ margin: "0 0 8px 0" }}>💡 {t("results.betterMatchNoticeToLanguo")}</p>
                        <p style={{ fontSize: 11, fontStyle: "italic", margin: "0 0 4px 0" }}>{t("results.languoAffiliateDisclosure")}</p>
                        <a href="https://languoart.com/?ref=creabeastudio" target="_blank" rel="noopener noreferrer sponsored"
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
                          {results.ownedMatches.map((m, i) => <MatchRow key={m.code} rank={i + 1} code={m.code} name={m.name} rgb={m.rgb} />)}
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
              </div>
            )}
          </>
        )}

        {mode === "set" && (
          <>
            <div className="languo-grid" style={{ marginBottom: 20 }}>
              <div className="card">
                <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{t("setMatch.yourSetHeading")}</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  {t(`setMatch.yourSetDescription${direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}
                </p>
                <SetAutocomplete
                  value={yourSet}
                  onChange={key => { setYourSet(key); setSetResults(null); setSetError(null); }}
                  options={yourSetOptions}
                  noneLabel={t("myMarkers.noneSelected")}
                  style={{ marginBottom: 4 }}
                />
                {setModeError && (
                  <p style={{ fontSize: 12, color: "var(--pink)", marginTop: 8, fontWeight: 600 }}>{setModeError}</p>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                  {t("setMatch.matchToHeading")} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>{t("myMarkers.optional")}</span>
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("setMatch.matchToDescription")}</p>
                <SetAutocomplete
                  value={matchToSet}
                  onChange={key => { setMatchToSet(key); setSetResults(null); }}
                  options={matchToOptions}
                  noneLabel={direction === "toGuangna" ? t("setMatch.defaultGuangna") : t("setMatch.defaultLanguo")}
                  style={{ marginBottom: 4 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <button className="btn-primary" onClick={handleSetMatch} disabled={!yourSet || setModeMatching}
                style={{ width: "100%", opacity: (!yourSet || setModeMatching) ? 0.6 : 1 }}>
                {setModeMatching ? t("setMatch.matching") : t("setMatch.matchButton")}
              </button>
            </div>

            {setModeResults && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{t("setMatch.paperSize")}</span>
                  {(["a4", "letter"] as const).map(size => (
                    <button key={size} onClick={() => setPdfPaperSize(size)} style={{
                      padding: "6px 14px", borderRadius: 16, border: "2px solid var(--ink, #222)",
                      background: pdfPaperSize === size ? "var(--ink, #222)" : "white",
                      color: pdfPaperSize === size ? "white" : "var(--ink, #222)",
                      fontWeight: 700, cursor: "pointer", fontSize: 12,
                    }}>
                      {t(`setMatch.${size === "a4" ? "paperA4" : "paperLetter"}`)}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="btn-primary" onClick={handleDownloadPdf} style={{ width: "100%" }}>
                    {t("setMatch.downloadPdf")}
                  </button>
                </div>

                {setModeResults.direction === "toGuangna" ? (
                  <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)", fontSize: 13, color: "var(--muted)" }}>
                    💡 {t("setMatch.orderNoticeToGuangna")}{" "}
                    <a href="https://www.guangna.eu" target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--pink)", fontWeight: 700 }}>
                      {t("results.orderPrompt")}
                    </a>
                  </div>
                ) : (
                  <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)", fontSize: 13, color: "var(--muted)" }}>
                    <p style={{ margin: "0 0 8px 0" }}>💡 {t("setMatch.orderNoticeToLanguo")}</p>
                    <p style={{ fontSize: 11, fontStyle: "italic", margin: "0 0 4px 0" }}>{t("results.languoAffiliateDisclosure")}</p>
                    <a href="https://languoart.com/?ref=creabeastudio" target="_blank" rel="noopener noreferrer sponsored"
                      style={{ color: "var(--pink)", fontWeight: 700 }}>
                      {t("results.orderPrompt")}
                    </a>
                  </div>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center" }}>
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

            {setModeResults && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{t("setMatch.resultsHeading")}</h2>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                  {t("setMatch.rowCount", { count: setModeResults.rows.length })}
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="set-results-table">
                    <thead>
                      <tr style={{ fontSize: 11, color: "var(--muted)", textAlign: "left" }}>
                        <th>{t(`setMatch.sourceCodeLabel${setModeResults.direction === "toGuangna" ? "ToGuangna" : "ToLanguo"}`)}</th>
                        <th></th>
                        <th>{t("setMatch.matchedCodeLabel")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {setModeResults.rows.map(row => (
                        <tr key={row.sourceCode} style={{ background: "var(--cream)" }}>
                          <td style={{ borderRadius: "10px 0 0 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Swatch rgb={row.sourceRgb} size={36} />
                              <span style={{ fontWeight: 800 }}>{row.sourceCode}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--muted)", fontSize: 16 }}>→</td>
                          <td style={{ borderRadius: "0 10px 10px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Swatch rgb={row.matchRgb} size={36} />
                              <div>
                                <div style={{ fontWeight: 800 }}>{row.matchCode}</div>
                                {row.matchName && <div style={{ color: "#555", fontSize: 12 }}>{row.matchName}</div>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 20, lineHeight: 1.5 }}>
                  {t("results.screenDisclaimer")}
                </p>
              </div>
            )}
          </>
        )}

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