"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  GN_366_IDS, GUANGNA_SETS, SET_OPTIONS,
  findClosest, rgbToHex,
  type MatchResult,
} from "../../../lib/guangna";
// This file must be saved as app/[locale]/legend-converter/page.tsx —
// Next.js only turns it into a route at that exact path/filename.
// lib/ lives at the project root, so that's 3 levels up from here.

type Swatch = { x: number; y: number; rgb: [number, number, number] } | null;
type SwatchResult = { full: MatchResult; owned: MatchResult | null; originalIndex: number };

const DISPLAY_MAX_W = 640;

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

function ResultSwatch({ rgb, size = 40 }: { rgb: [number, number, number]; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: rgbToHex(rgb), border: "2px solid rgba(0,0,0,0.1)",
    }} />
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
  const locale = useLocale();

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const [colorCountInput, setColorCountInput] = useState("24");
  const colorCount = Math.max(1, Math.min(72, parseInt(colorCountInput) || 0));

  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [mySet, setMySet] = useState("");
  const [extraCodes, setExtraCodes] = useState("");

  const [results, setResults] = useState<SwatchResult[] | null>(null);
  const [matching, setMatching] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const getOwnedIds = (): string[] => {
    const ids: string[] = [];
    if (mySet && GUANGNA_SETS[mySet]) {
      for (const id of GUANGNA_SETS[mySet]) { if (!ids.includes(id)) ids.push(id); }
    }
    for (const tok of extraCodes.split(/[\s,;]+/)) {
      const tt = tok.trim();
      if (/^\d{3}$/.test(tt)) {
        const id = `GN-${tt}`;
        if (!ids.includes(id)) ids.push(id);
      }
    }
    return ids;
  };

  const handleMatch = () => {
    setMatching(true);
    try {
      const ownedIds = getOwnedIds();
      const matched: SwatchResult[] = swatches
        .map((s, idx) => (s ? { s, idx } : null))
        .filter((x): x is { s: NonNullable<Swatch>; idx: number } => x !== null)
        .map(({ s, idx }) => {
          const full = findClosest(s.rgb, GN_366_IDS);
          const owned = ownedIds.length > 0 ? findClosest(s.rgb, ownedIds) : null;
          return { full, owned, originalIndex: idx };
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
      const LOGO_RESERVED_H = 32; // bottom space kept clear for the logo on every page
      const HEADER_TOP = 14;
      const TABLE_TOP = 50;
      const PAGE_BOTTOM = pageH - LOGO_RESERVED_H;

      const anyOwned = results.some(r => r.owned !== null);

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

      const drawPageHeader = (showColumnLabels: boolean) => {
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
        doc.text(t("pdf.instructions"), pageW / 2, HEADER_TOP + 13, { align: "center" });

        if (showColumnLabels && anyOwned) {
          const usableW = pageW - ML - MR;
          const half = (usableW - 8) / 2;
          const leftCenter = ML + 8 + half / 2;
          const rightCenter = ML + 8 + half + 8 + half / 2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...PINK);
          doc.text(t("pdf.columnInSet"), leftCenter, TABLE_TOP - 5, { align: "center" });
          doc.text(t("pdf.columnAvailable"), rightCenter, TABLE_TOP - 5, { align: "center" });
          doc.setDrawColor(230, 230, 230);
          doc.line(pageW / 2, TABLE_TOP - 3, pageW / 2, PAGE_BOTTOM);
        }
      };

      drawPageHeader(true);

      const usableW = pageW - ML - MR;
      const half = (usableW - 8) / 2;
      const idxW = 8;
      const leftX = ML;
      const leftBlockX = ML + idxW;
      const rightBlockX = ML + idxW + half + 8;

      const drawBlock = (x: number, y: number, w: number, m: MatchResult, shaded: boolean) => {
        if (shaded) {
          doc.setFillColor(245, 245, 245);
          doc.rect(x, y, w, ROW_H, "F");
        }
        doc.setFillColor(...m.rgb);
        doc.roundedRect(x + 1, y + 1, 9, ROW_H - 2, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(m.code.replace("GN-", ""), x + 13, y + 4.2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...MID);
        doc.text(m.name, x + 13, y + 7.5);
      };

      let y = TABLE_TOP;
      results.forEach((item) => {
        if (y + ROW_H > PAGE_BOTTOM) {
          drawLogo();
          doc.addPage();
          drawPageHeader(true);
          y = TABLE_TOP;
        }
        const shaded = item.originalIndex % 2 === 1;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(String(item.originalIndex + 1), leftX, y + ROW_H / 2 + 1, { baseline: "middle" });

        if (anyOwned) {
          const inSet = item.owned ?? item.full; // fallback if nothing owned matched at all
          drawBlock(leftBlockX, y, half, inSet, shaded);
          drawBlock(rightBlockX, y, half, item.full, shaded);
        } else {
          drawBlock(leftBlockX, y, usableW - idxW, item.full, shaded);
        }

        y += ROW_H;
      });

      drawLogo();
      doc.save("guangna-palette-guide.pdf");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
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
        <p style={{ fontSize: 13, marginBottom: 36 }}>
          {t("crossLink.text")}{" "}
          <a href={`/${locale}/color-converter`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            {t("crossLink.linkText")}
          </a>
        </p>

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

            {/* My Markers (optional) */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                {t("myMarkers.heading")} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>{t("myMarkers.optional")}</span>
              </h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{t("myMarkers.description")}</p>
              <select value={mySet} onChange={e => { setMySet(e.target.value); setResults(null); }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "2px solid var(--border)", fontSize: 13, background: "white", marginBottom: 12 }}>
                <option value="">{t("myMarkers.noneSelected")}</option>
                {SET_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <input type="text" value={extraCodes} onChange={e => { setExtraCodes(e.target.value); setResults(null); }}
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

            {/* Step 5 — palette guide results */}
            {results && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <h2 style={{ fontWeight: 800, fontSize: 17 }}>{t("results.heading")}</h2>
                  <button className="btn-primary" onClick={handleDownloadPdf} disabled={pdfLoading} style={{ padding: "8px 18px", opacity: pdfLoading ? 0.6 : 1 }}>
                    {pdfLoading ? t("matching") : t("results.downloadPdf")}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {results.map((item) => {
                    const primary = item.owned ?? item.full;
                    return (
                      <div key={item.originalIndex} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--cream)" }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{item.originalIndex + 1}</span>
                        <ResultSwatch rgb={primary.rgb} />
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 15 }}>{primary.code}</div>
                          <div style={{ color: "#555", fontSize: 12 }}>{primary.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const notInSet = results.filter(item => item.owned && item.owned.code !== item.full.code);
                  if (notInSet.length === 0) return null;
                  return (
                    <div style={{ marginTop: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                        <h3 style={{ fontWeight: 800, fontSize: 15 }}>{t("results.notInSetHeading")}</h3>
                        <a href="https://www.guangna.eu" target="_blank" rel="noopener noreferrer"
                          style={{
                            padding: "6px 14px", borderRadius: 16, background: "var(--pink)",
                            color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap",
                          }}>
                          {t("results.orderPrompt")}
                        </a>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>{t("results.notInSetSubheading")}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                        {notInSet.map(item => (
                          <div key={item.originalIndex} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#fff7f9", border: "1px solid var(--pink)" }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{item.originalIndex + 1}</span>
                            <ResultSwatch rgb={item.full.rgb} />
                            <div>
                              <div style={{ fontWeight: 900, fontSize: 15 }}>{item.full.code}</div>
                              <div style={{ color: "#555", fontSize: 12 }}>{item.full.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
    </>
  );
}
