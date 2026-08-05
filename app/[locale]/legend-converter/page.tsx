"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useCallback, useRef, useEffect, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  GN_366_IDS, GN_ONLY_IDS, GUANGNA_SETS, SET_OPTIONS,
  findClosest, rgbToHex, normalizeExtraCode,
  rgbToLab, deltaE,
  type MatchResult,
} from "@/lib/guangna";
import {
  LANGUO_NON_GLITTER_IDS, findClosestLanguoN, normalizeLanguoExtraCode,
} from "@/lib/languo";
import { LANGUO_SETS, LANGUO_SET_OPTIONS } from "@/lib/languoSets";
// This file must be saved as app/[locale]/legend-converter/page.tsx —
// Next.js only turns it into a route at that exact path/filename.
// lib/ lives at the project root, so that's 3 levels up from here.
//
// 2026-08-04 (part 6): brings LegendConverter in line with
// ColorConverter's combined, tie-aware matching (same rule agreed
// there), AND extends the PDF to include Languo -- previously the PDF
// was Guangna-only.
//
//  - Per swatch, ONE combined match is computed instead of a separate
//    Guangna match and Languo match: if My Markers has ANY selections
//    (either brand), the search pool is your owned codes only, per
//    brand; if nothing is selected, the pool is the full Guangna 366 +
//    full Languo PAINT line (LANGUO_SETS["Brush 288 Set"] -- see the
//    key-mismatch note below). This is a single hasOwnedResult flag for
//    the whole match run (not per swatch), since My Markers doesn't
//    change per swatch.
//  - TIE RULE (same as ColorConverter): best Guangna candidate vs best
//    Languo candidate compared by actual Delta E to the swatch color.
//    If they differ by less than TIE_THRESHOLD (2.0), BOTH show for
//    that swatch, brand-tagged. Otherwise only the closer one shows.
//  - Results render as ONE grid (not two brand blocks) -- each card
//    shows 1 or 2 tagged matches per swatch. When nothing is owned, one
//    order banner appears above the grid (not per-card) linking to
//    whichever store(s) are actually relevant, since repeating the same
//    two links on every one of up to 72 cards would be noisy.
//  - PDF now includes Languo: each row draws 1 or 2 blocks (same
//    tie logic as on-page), brand-labeled inline next to the code.
//    Column headers become "Guangna"/"Languo" (only shown when at
//    least one row actually has a tie -- most rows will just be a
//    single full-width block otherwise). Filename changed to the
//    brand-neutral "marker-palette-guide.pdf".
//  - The Guangna HG -> Classic-GN fallback note is unchanged: applies
//    whenever a SHOWN match (on page or in the PDF) is a Guangna High
//    Gloss code, tie or not.
//
// PRE-EXISTING BUG (not introduced here, same note as ColorConverter):
// LANGUO_SET_OPTIONS advertises the full Paint set under key "288 Set",
// but LANGUO_SETS actually stores it as "Brush 288 Set". Using the real
// key directly here for the no-selection fallback pool.
//
// Removed: the old flat SwatchResult shape (full/fullGNFallback/owned),
// the two separate "Guangna block"/"Languo block" result sections, and
// renderBrandBlock(). Replaced by SwatchResult { matches: TaggedMatch[],
// fallback }, hasOwnedResult, and a single results grid + order banner.
//
// en.json changes needed (LegendConverter namespace unless noted):
//   - results.tieNotice (NEW, same wording as ColorConverter's)
//   - results.orderBannerText / .pdf.columnGuangna / .pdf.columnLanguo (NEW)
//   - results.notInSetHeading/.notInSetHeadingLanguo/.notInSetSubheading/
//     .notInSetSubheadingLanguo/.bestMatchOwned/.youHaveIt/.fromYourSet/
//     .noOwnedMatch/.pdfGuangnaOnlyNote/.pdf.columnInSet/.pdf.columnAvailable:
//     no longer used, safe to remove
//   - "common" namespace (brands.guangna/.languo, setsSelected):
//     unchanged, reused here

type Swatch = { x: number; y: number; rgb: [number, number, number] } | null;
type Brand = "guangna" | "languo";
type BrandCode = { brand: Brand; code: string };
type TaggedMatch = { brand: Brand; code: string; name?: string; rgb: [number, number, number] };
type SwatchResult = { originalIndex: number; matches: TaggedMatch[]; fallback: MatchResult | null };

const DISPLAY_MAX_W = 640;
const TIE_THRESHOLD = 2.0;
// The original Languo Acrylic 288 ("Paint") line only -- NOT the newer
// Gel Pens / PLUS / LanguoxQimiart product lines. Real key is
// "Brush 288 Set" (LANGUO_SET_OPTIONS advertises it as "288 Set", which
// doesn't exist in LANGUO_SETS -- pre-existing mismatch, using the real
// key directly).
const LANGUO_PAINT_IDS: string[] = LANGUO_SETS["Brush 288 Set"] ?? LANGUO_NON_GLITTER_IDS;

// Tries Guangna's code format first, then Languo's -- the two formats
// don't overlap (Guangna: digits-only or "GN-"/"HG-" prefixed; Languo:
// always a 2-letter prefix + hyphen + digits).
function normalizeCombinedCode(token: string): BrandCode | null {
  const g = normalizeExtraCode(token);
  if (g) return { brand: "guangna", code: g };
  const l = normalizeLanguoExtraCode(token);
  if (l) return { brand: "languo", code: l };
  return null;
}

function sampleAt(ctx: CanvasRenderingContext2D, x: number, y: number): [number, number, number] {
  const half = 2; // sample a small 5x5 box to smooth out noise/anti-aliasing
  const sx = Math.max(0, x - half);
  const sy = Math.max(0, y - half);
  const sw = Math.min(ctx.canvas.width - sx, half * 2 + 1);
  const sh = Math.min(ctx.canvas.height - sy, half * 2 + 1);
  const data = ctx.getImageData(sx, sy, sw, sh).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
  }
  count = count || 1;
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

// Noise-overlay protection, same technique as ColorConverter's
// ProtectedSwatch and LanguoConverter's Swatch. Each instance gets its
// own filter id via useId() -- reusing a static id="noise" across
// multiple <svg> elements on the same page is invalid HTML.
function ResultSwatch({ rgb, size = 40 }: { rgb: [number, number, number]; size?: number }) {
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

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function LegendConverter() {
  const t = useTranslations("LegendConverter");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const [colorCountInput, setColorCountInput] = useState("24");
  const colorCount = Math.max(1, Math.min(72, parseInt(colorCountInput) || 0));

  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // "My Markers": multi-select set lists per brand + ONE combined
  // extra-codes field. Optional -- matching works with none selected.
  const [mySetsGuangna, setMySetsGuangna] = useState<string[]>([]);
  const [mySetsLanguo, setMySetsLanguo] = useState<string[]>([]);
  const [myExtraCodes, setMyExtraCodes] = useState("");

  const [results, setResults] = useState<SwatchResult[] | null>(null);
  const [hasOwnedResult, setHasOwnedResult] = useState(false);
  const [matching, setMatching] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleGuangnaSet = (value: string) => {
    setMySetsGuangna(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    setResults(null);
  };
  const toggleLanguoSet = (value: string) => {
    setMySetsLanguo(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    setResults(null);
  };

  const handlePhotoFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      setPhotoDataUrl(dataUrl);
      setResults(null);
      setSwatches(Array.from({ length: colorCount }, () => null));
      setActiveIndex(0);
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, DISPLAY_MAX_W / img.width);
        setCanvasSize({ w: Math.round(img.width * scale), h: Math.round(img.height * scale) });
        setImgEl(img);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [colorCount]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handlePhotoFile(f);
  }, [handlePhotoFile]);

  const applyColorCount = (n: number) => {
    setSwatches(prev => {
      const next = Array.from({ length: n }, (_, i) => prev[i] ?? null);
      return next;
    });
    setActiveIndex(0);
    setResults(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl || !canvasSize.w) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgEl, 0, 0, canvasSize.w, canvasSize.h);
    swatches.forEach((s, i) => {
      if (!s) return;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(224,80,128,0.92)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), s.x, s.y + 0.5);
    });
  }, [imgEl, canvasSize, swatches]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const rgb = sampleAt(ctx, x, y);
    setSwatches(prev => {
      const next = [...prev];
      next[activeIndex] = { x, y, rgb };
      return next;
    });
    setResults(null);
    setActiveIndex(prev => {
      for (let i = prev + 1; i < swatches.length; i++) {
        if (!swatches[i]) return i;
      }
      for (let i = 0; i < swatches.length; i++) {
        if (!swatches[i]) return i;
      }
      return prev;
    });
  };

  const filledCount = swatches.filter(Boolean).length;
  const allFilled = swatches.length > 0 && filledCount === swatches.length;

  const getOwnedGuangnaIds = (): string[] => {
    const ids: string[] = [];
    for (const setKey of mySetsGuangna) {
      const setIds = GUANGNA_SETS[setKey];
      if (setIds) for (const id of setIds) if (!ids.includes(id)) ids.push(id);
    }
    for (const tok of myExtraCodes.split(/[\s,;]+/)) {
      const bc = normalizeCombinedCode(tok);
      if (bc && bc.brand === "guangna" && !ids.includes(bc.code)) ids.push(bc.code);
    }
    return ids;
  };
  const getOwnedLanguoIds = (): string[] => {
    const ids: string[] = [];
    for (const setKey of mySetsLanguo) {
      const setIds = LANGUO_SETS[setKey];
      if (setIds) for (const id of setIds) if (!ids.includes(id)) ids.push(id);
    }
    for (const tok of myExtraCodes.split(/[\s,;]+/)) {
      const bc = normalizeCombinedCode(tok);
      if (bc && bc.brand === "languo" && !ids.includes(bc.code)) ids.push(bc.code);
    }
    return ids;
  };

  const handleMatch = () => {
    setMatching(true);
    try {
      const ownedGIds = getOwnedGuangnaIds();
      const ownedLIds = getOwnedLanguoIds();
      const hasAnyOwned = ownedGIds.length > 0 || ownedLIds.length > 0;
      setHasOwnedResult(hasAnyOwned);

      const guangnaPoolIds = hasAnyOwned ? ownedGIds : GN_366_IDS;
      const languoPoolIds  = hasAnyOwned ? ownedLIds : LANGUO_PAINT_IDS;

      const filled = swatches
        .map((s, idx) => (s ? { s, idx } : null))
        .filter((x): x is { s: NonNullable<Swatch>; idx: number } => x !== null);

      const matched: SwatchResult[] = filled.map(({ s, idx }) => {
        const candG: MatchResult | null = guangnaPoolIds.length > 0 ? findClosest(s.rgb, guangnaPoolIds) : null;
        const candL = languoPoolIds.length > 0 ? (findClosestLanguoN(s.rgb, languoPoolIds, 1)[0] ?? null) : null;

        const labT = rgbToLab(s.rgb);
        const dG = candG ? deltaE(labT, rgbToLab(candG.rgb)) : Infinity;
        const dL = candL ? deltaE(labT, rgbToLab(candL.rgb)) : Infinity;

        let matches: TaggedMatch[] = [];
        if (candG && candL) {
          if (Math.abs(dG - dL) < TIE_THRESHOLD) {
            matches = [
              { brand: "guangna", code: candG.code, name: candG.name, rgb: candG.rgb },
              { brand: "languo", code: candL.code, rgb: candL.rgb },
            ];
          } else if (dG < dL) {
            matches = [{ brand: "guangna", code: candG.code, name: candG.name, rgb: candG.rgb }];
          } else {
            matches = [{ brand: "languo", code: candL.code, rgb: candL.rgb }];
          }
        } else if (candG) {
          matches = [{ brand: "guangna", code: candG.code, name: candG.name, rgb: candG.rgb }];
        } else if (candL) {
          matches = [{ brand: "languo", code: candL.code, rgb: candL.rgb }];
        }

        // Overall best Guangna match (whichever slot it landed in) is a
        // High Gloss code -- also surface the best regular GN match,
        // since HG markers are newer and less commonly owned.
        const hgResult = matches.find(m => m.brand === "guangna" && m.code.startsWith("HG-"));
        const fallback = hgResult ? findClosest(s.rgb, GN_ONLY_IDS) : null;

        return { originalIndex: idx, matches, fallback };
      });
      setResults(matched);
    } finally {
      setMatching(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!results) return;
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      const PINK: [number, number, number] = [224, 80, 128];
      const DARK: [number, number, number] = [34, 34, 34];
      const MID: [number, number, number] = [85, 85, 85];

      const ML = 14, MR = 14;
      const ROW_H = 9;
      const ROW_H_TALL = 13; // extra room for the "regular GN alternative" note line
      const LOGO_RESERVED_H = 32; // bottom space kept clear for the logo on every page
      const HEADER_TOP = 14;
      const TABLE_TOP = 50;
      const PAGE_BOTTOM = pageH - LOGO_RESERVED_H;

      const logoDataUrl = await loadImageAsDataUrl("/marketing/logo-full.png");
      let logoW = 0, logoH = 0;
      if (logoDataUrl) {
        try {
          const props = doc.getImageProperties(logoDataUrl);
          logoW = 26;
          logoH = (props.height / props.width) * logoW;
        } catch { /* if dimensions can't be read, logo is simply skipped */ }
      }

      const drawHeart = (cx: number, cy: number, size: number) => {
        doc.setFillColor(...PINK);
        const r = size / 4;
        doc.circle(cx - r, cy - r / 2, r, "F");
        doc.circle(cx + r, cy - r / 2, r, "F");
        doc.triangle(cx - 2 * r, cy - r / 3, cx + 2 * r, cy - r / 3, cx, cy + 1.6 * r, "F");
      };

      const drawLogo = () => {
        if (!logoDataUrl || !logoW) return;
        try { doc.addImage(logoDataUrl, "PNG", pageW - MR - logoW, pageH - LOGO_RESERVED_H + 6, logoW, logoH); } catch {}
      };

      const drawPageHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...DARK);
        const titleText = t("pdf.titleText");
        const titleW = doc.getTextWidth(titleText);
        doc.text(titleText, pageW / 2, HEADER_TOP, { align: "center" });
        drawHeart(pageW / 2 - titleW / 2 - 6, HEADER_TOP - 1.5, 4.5);
        drawHeart(pageW / 2 + titleW / 2 + 6, HEADER_TOP - 1.5, 4.5);

        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(t("pdf.subtitle", { count: results.length }), pageW / 2, HEADER_TOP + 8, { align: "center" });
        doc.setFontSize(7);
        doc.setTextColor(...MID);
        doc.text(hasOwnedResult ? t("pdf.scopeOwned") : t("pdf.scopeFull"), pageW / 2, HEADER_TOP + 13, { align: "center" });
      };

      drawPageHeader();

      const usableW = pageW - ML - MR;
      const half = (usableW - 8) / 2;
      const idxW = 8;
      const leftX = ML;
      const leftBlockX = ML + idxW;
      const rightBlockX = ML + idxW + half + 8;

      const drawBlock = (x: number, y: number, w: number, rowH: number, m: TaggedMatch, shaded: boolean, fallback?: MatchResult | null) => {
        if (shaded) {
          doc.setFillColor(245, 245, 245);
          doc.rect(x, y, w, rowH, "F");
        }
        doc.setFillColor(...m.rgb);
        doc.roundedRect(x + 1, y + 1, 9, ROW_H - 2, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        const brandLabel = m.brand === "guangna" ? tc("brands.guangna") : tc("brands.languo");
        doc.text(`${m.code.replace("GN-", "")} (${brandLabel})`, x + 13, y + 4.2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...MID);
        doc.text(m.name ?? "", x + 13, y + 7.5);
        if (fallback) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(6);
          doc.setTextColor(...MID);
          doc.text(`${t("pdf.gnFallbackLabel")} ${fallback.code} ${fallback.name}`, x + 13, y + 11.3);
        }
      };

      let y = TABLE_TOP;
      results.forEach((item) => {
        const rowH = item.fallback ? ROW_H_TALL : ROW_H;
        if (y + rowH > PAGE_BOTTOM) {
          drawLogo();
          doc.addPage();
          drawPageHeader();
          y = TABLE_TOP;
        }
        const shaded = item.originalIndex % 2 === 1;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(String(item.originalIndex + 1), leftX, y + ROW_H / 2 + 1, { baseline: "middle" });

        if (item.matches.length === 2) {
          // matches[0] is always Guangna, matches[1] always Languo (see
          // handleMatch's tie construction) -- fallback (HG-only) pairs
          // with the Guangna slot.
          drawBlock(leftBlockX, y, half, rowH, item.matches[0], shaded, item.fallback);
          drawBlock(rightBlockX, y, half, rowH, item.matches[1], shaded);
        } else if (item.matches.length === 1) {
          drawBlock(leftBlockX, y, usableW - idxW, rowH, item.matches[0], shaded, item.fallback);
        }

        y += rowH;
      });

      drawLogo();
      doc.save("marker-palette-guide.pdf");
    } finally {
      setPdfLoading(false);
    }
  };

  const anyGuangnaShown = results?.some(r => r.matches.some(m => m.brand === "guangna")) ?? false;
  const anyLanguoShown = results?.some(r => r.matches.some(m => m.brand === "languo")) ?? false;

  return (
    <>
      <style>{`
        .marker-set-list {
          max-height: 180px;
          overflow-y: auto;
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 6px;
        }
        .marker-set-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }
        .marker-set-row:hover {
          background: #FFF0F3;
        }
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

        <p style={{ fontSize: 13, marginBottom: 16 }}>
          {t("crossLink.text")}{" "}
          <a href={`/${locale}/color-converter`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            {t("crossLink.linkText")}
          </a>
        </p>

        <div style={{
          background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "var(--muted)", marginBottom: 36, lineHeight: 1.5,
        }}>
          💡 {t("disclaimer")}
        </div>

        {/* Step 1 — upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t("step1.heading")}</h3>
          {!photoDataUrl ? (
            <>
              <div style={{
                background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
                fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5,
              }}>
                💡 {t("step1.lightingTip")}
              </div>
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                onClick={() => document.getElementById("legendPhotoInput")?.click()}
                style={{
                  border: "2.5px dashed var(--border)", borderRadius: 14, minHeight: 150,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", background: "var(--cream)",
                }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{t("step1.dropHint")}</p>
                <p style={{ color: "var(--muted)", fontSize: 12 }}>{t("step1.fileTypes")}</p>
              </div>
            </>
          ) : (
            <button onClick={() => document.getElementById("legendPhotoInput")?.click()}
              style={{ fontSize: 13, color: "var(--pink)", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {t("step1.replacePhoto")}
            </button>
          )}
          <input id="legendPhotoInput" type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }} />
        </div>

        {photoDataUrl && (
          <>
            {/* Step 2 — color count */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{t("step2.heading")}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" min={1} max={72} value={colorCountInput}
                  onChange={e => setColorCountInput(e.target.value)}
                  onBlur={() => applyColorCount(colorCount)}
                  style={{ width: 90 }} />
                <button className="btn-primary" onClick={() => applyColorCount(colorCount)} style={{ padding: "8px 16px" }}>
                  {t("step2.apply")}
                </button>
              </div>
            </div>

            {/* Step 3 — click to sample */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{t("step3.heading")}</h3>
              <div style={{
                background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
                fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5,
              }}>
                💡 {t("step3.howToTip")}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                {allFilled ? t("step3.allDone") : t("step3.prompt", { num: activeIndex + 1, total: swatches.length })}
              </p>
              <canvas ref={canvasRef} onClick={handleCanvasClick}
                style={{ width: "100%", maxWidth: DISPLAY_MAX_W, height: "auto", borderRadius: 10, cursor: "crosshair", border: "2px solid var(--border)" }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {swatches.map((s, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)}
                    title={t("step3.editSwatch", { num: i + 1 })}
                    style={{
                      width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                      border: i === activeIndex ? "2px solid var(--pink)" : "2px solid var(--border)",
                      background: s ? rgbToHex(s.rgb) : "var(--cream)",
                      fontSize: 10, fontWeight: 700, color: s ? "rgba(0,0,0,0.5)" : "var(--muted)",
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* My Markers -- both brands shown together, true multi-select
                per brand + ONE combined extra-codes field. Optional. */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                {t("myMarkers.heading")} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>{t("myMarkers.optional")}</span>
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("myMarkers.description")}</p>

              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{tc("brands.guangna")}</div>
              <div className="marker-set-list">
                {SET_OPTIONS.map(s => (
                  <label key={s.key} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={mySetsGuangna.includes(s.key)}
                      onChange={() => toggleGuangnaSet(s.key)}
                      style={{ accentColor: "var(--pink)" }}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
              {mySetsGuangna.length > 0 && (
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{tc("setsSelected", { count: mySetsGuangna.length })}</p>
              )}
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 14px" }}>{t("myMarkers.metallicNote")}</p>

              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>{tc("brands.languo")}</div>
              <div className="marker-set-list">
                {LANGUO_SET_OPTIONS.map(s => (
                  <label key={s.key} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={mySetsLanguo.includes(s.key)}
                      onChange={() => toggleLanguoSet(s.key)}
                      style={{ accentColor: "var(--pink)" }}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
              {mySetsLanguo.length > 0 && (
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{tc("setsSelected", { count: mySetsLanguo.length })}</p>
              )}
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 14px" }}>{t("myMarkers.glitterNote")}</p>

              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                {t("myMarkers.extraCodesLabel")} <span style={{ fontWeight: 400, color: "var(--muted)" }}>{t("myMarkers.extraCodesHint")}</span>
              </label>
              <input type="text" value={myExtraCodes} onChange={e => { setMyExtraCodes(e.target.value); setResults(null); }}
                placeholder={t("myMarkers.extraCodesPlaceholder")} style={{ width: "100%" }} />
            </div>

            {/* Step 4 — match */}
            <div style={{ marginBottom: 20 }}>
              <button className="btn-primary" onClick={handleMatch} disabled={filledCount === 0 || matching}
                style={{ width: "100%", opacity: (filledCount === 0 || matching) ? 0.6 : 1 }}>
                {matching ? t("matching") : t("step4.matchButton")}
              </button>
              {filledCount > 0 && !allFilled && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
                  {t("step3.remaining", { count: swatches.length - filledCount })}
                </p>
              )}
            </div>

            {/* Step 5 — palette guide results, ONE combined grid */}
            {results && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <h2 style={{ fontWeight: 800, fontSize: 17 }}>{t("results.heading")}</h2>
                  <button className="btn-primary" onClick={handleDownloadPdf} disabled={pdfLoading} style={{ padding: "8px 18px", opacity: pdfLoading ? 0.6 : 1 }}>
                    {pdfLoading ? t("matching") : t("results.downloadPdf")}
                  </button>
                </div>

                {!hasOwnedResult && (anyGuangnaShown || anyLanguoShown) && (
                  <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)" }}>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{t("results.orderBannerText")}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      {anyGuangnaShown && (
                        <a href="https://www.guangna.eu" target="_blank" rel="noopener noreferrer"
                          style={{ padding: "6px 14px", borderRadius: 16, background: "var(--pink)", color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                          {tc("brands.guangna")} →
                        </a>
                      )}
                      {anyLanguoShown && (
                        <a href="https://languoart.com/?ref=creabeastudio" target="_blank" rel="noopener noreferrer sponsored"
                          style={{ padding: "6px 14px", borderRadius: 16, background: "var(--pink)", color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                          {tc("brands.languo")} →
                        </a>
                      )}
                    </div>
                    {anyLanguoShown && (
                      <p style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", marginTop: 8, marginBottom: 0 }}>
                        {t("results.languoAffiliateDisclosure")}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {results.map((item) => (
                    <div key={item.originalIndex} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--cream)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{item.originalIndex + 1}</span>
                        {item.matches.length > 1 && (
                          <span style={{ fontSize: 10, color: "var(--muted)", fontStyle: "italic" }}>{t("results.tieNotice")}</span>
                        )}
                      </div>
                      {item.matches.map((m) => (
                        <div key={m.brand} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ResultSwatch rgb={m.rgb} size={32} />
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 14 }}>
                              {m.code} <span style={{ fontWeight: 600, fontSize: 10, color: "var(--muted)" }}>({m.brand === "guangna" ? tc("brands.guangna") : tc("brands.languo")})</span>
                            </div>
                            {m.name && <div style={{ color: "#555", fontSize: 11 }}>{m.name}</div>}
                          </div>
                        </div>
                      ))}
                      {item.fallback && (
                        <p style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", margin: 0, paddingLeft: 42 }}>
                          {t("results.gnFallbackNotice", { code: item.fallback.code, name: item.fallback.name })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 14, lineHeight: 1.5 }}>
                  {t("results.screenDisclaimer")}
                </p>

                {/* Step 6 — donate */}
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
          </>
        )}
      </main>
      <Footer />
    </>
  );
}