// Shared swatch-card PDF building logic. Extracted from SwatchCreator.tsx
// (v7) so the exact same renderer can be reused on the post-payment
// /swatch-download page for the Custom Swatch Card Set -- there must be
// only one place this layout code lives, or the free preview and the
// paid full download will silently drift apart over time.
//
// UPDATED (2026-07-24): the actual drawing logic (everything that used
// to live inside renderCards) is now buildPdfDoc(), which returns the
// finished jsPDF document WITHOUT saving/outputting it. renderCards()
// (client-side, triggers a browser download via doc.save()) and the new
// renderCardsBuffer() (server-side, returns raw PDF bytes via
// doc.output("arraybuffer")) are now both thin wrappers around that one
// shared builder -- confirmed nothing in the drawing code touches the
// DOM/browser APIs, it's pure jsPDF calls, so this split needed no
// actual logic changes, just moving the save/output line out to two
// separate callers.
//
// Save this file as lib/swatchPdf.ts

import { GN_COLORS } from "@/lib/guangna";
import { LANGUO_COLORS } from "@/lib/languo";
import { COLOR_FAMILY_LABELS, ColorFamily, getFamilyMemberships } from "@/lib/colorFamilies";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";

const FAMILY_ORDER = Object.keys(COLOR_FAMILY_LABELS) as ColorFamily[];

export type Source = "guangna" | "languo";

export interface SwatchItem {
  id: string;
  source: Source;
  code: string;
  name: string;
  rgb: [number, number, number];
  origin: string;
}

export type SwatchStyle = "filled" | "blank";
export type HeaderHolePos = "left" | "center" | "right" | "none";
export type CardPacking = "per-family" | "packed";

export interface SwatchPdfOptions {
  swatchStyle: SwatchStyle;
  headerHolePos: HeaderHolePos;
  cardPacking: CardPacking;
  paperSize: PaperSize;
}

// Landscape page size in mm for each paper choice, plus the jsPDF format
// string that matches it.
export function getPageDims(paperSize: PaperSize) {
  return paperSize === "letter"
    ? { pageW: 279.4, pageH: 215.9, format: "letter" as const }
    : { pageW: 297, pageH: 210, format: "a4" as const };
}

// See the long explanation in the original SwatchCreator.tsx history:
// jsPDF's setLineWidth() does NOT scale the same way rect()/circle()
// coordinate calls do in a mm-unit document. These values are
// 0.9pt/0.7pt/0.9pt worth of actual line weight, pre-divided by 72/25.4
// so they render at the intended thin, "premium" weight.
const CARD_LINE_GRAY = 70;
const CARD_LINE_WIDTH = 0.3175; // renders as ~0.9pt on the page
const SWATCH_LINE_WIDTH = 0.246944; // renders as ~0.7pt on the page
const HOLE_LINE_WIDTH = 0.3175; // renders as ~0.9pt on the page

export function compareCodes(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
export function guangnaItem(code: string, origin: string): SwatchItem | null {
  const c = GN_COLORS[code];
  if (!c) return null;
  return { id: `guangna:${code}`, source: "guangna", code, name: c[3], rgb: [c[0], c[1], c[2]], origin };
}
export function languoItem(code: string, origin: string): SwatchItem | null {
  const rgb = LANGUO_COLORS[code];
  if (!rgb) return null;
  return { id: `languo:${code}`, source: "languo", code, name: code, rgb, origin };
}
export function resolveItem(code: string, origin: string): SwatchItem | null {
  const item = GN_COLORS[code] ? guangnaItem(code, origin) : languoItem(code, origin);
  if (!item) {
    console.warn(
      `[swatchPdf] "${code}" has no matching entry in GN_COLORS or LANGUO_COLORS -- check lib/guangna.ts and lib/languo.ts for a typo or casing mismatch.`
    );
  }
  return item;
}
export function printLabel(item: SwatchItem): string {
  return item.source === "guangna" ? `GN.${item.code.replace(/^GN-/, "")}` : item.code;
}

export function membershipKey(itemId: string, family: ColorFamily): string {
  return `${itemId}::${family}`;
}

export type RowContent =
  | { kind: "label"; family: ColorFamily }
  | { kind: "swatches"; family: ColorFamily; left: SwatchItem | null; right: SwatchItem | null }
  | { kind: "blank" };

export interface Card {
  headerFamily: ColorFamily | null;
  rows: RowContent[];
}

function familyOrderFor(code: string, family: ColorFamily): number {
  const m = getFamilyMemberships(code).find((mm) => mm.family === family);
  return m ? m.order : 9999;
}

export function buildRows(sequence: { item: SwatchItem; family: ColorFamily }[]): RowContent[] {
  const rows: RowContent[] = [];
  let pendingLeft: SwatchItem | null = null;
  let activeFamily: ColorFamily | null = null;

  for (const { item, family } of sequence) {
    if (family !== activeFamily) {
      if (pendingLeft) {
        rows.push({ kind: "swatches", family: activeFamily as ColorFamily, left: pendingLeft, right: null });
        pendingLeft = null;
      }
      rows.push({ kind: "label", family });
      activeFamily = family;
    }
    if (pendingLeft === null) {
      pendingLeft = item;
    } else {
      rows.push({ kind: "swatches", family, left: pendingLeft, right: item });
      pendingLeft = null;
    }
  }
  if (pendingLeft) rows.push({ kind: "swatches", family: activeFamily as ColorFamily, left: pendingLeft, right: null });
  return rows;
}

export function buildCards(items: SwatchItem[], packing: CardPacking, excluded: Set<string>): Card[] {
  const map = new Map<ColorFamily, SwatchItem[]>();
  for (const item of items) {
    const memberships = getFamilyMemberships(item.code);
    for (const m of memberships) {
      if (excluded.has(membershipKey(item.id, m.family))) continue;
      if (!map.has(m.family)) map.set(m.family, []);
      map.get(m.family)!.push(item);
    }
  }
  const familyGroups: { family: ColorFamily; items: SwatchItem[] }[] = [];
  for (const fam of FAMILY_ORDER) {
    const arr = map.get(fam);
    if (arr && arr.length) {
      arr.sort((a, b) => familyOrderFor(a.code, fam) - familyOrderFor(b.code, fam));
      familyGroups.push({ family: fam, items: arr });
    }
  }

  if (packing === "per-family") {
    return familyGroups.flatMap((g) => {
      const rows = buildRows(g.items.map((item) => ({ item, family: g.family })));
      return packRowsIntoCards(rows);
    });
  }

  const sequence = familyGroups.flatMap((g) => g.items.map((item) => ({ item, family: g.family })));
  const rows = buildRows(sequence);
  return packRowsIntoCards(rows);
}

export function packRowsIntoCards(rows: RowContent[]): Card[] {
  const cards: Card[] = [];
  let current: RowContent[] = [];
  let headerFamily: ColorFamily | null = null;

  const flush = () => {
    if (current.length === 0) return;
    cards.push({ headerFamily: headerFamily as ColorFamily, rows: current });
    current = [];
    headerFamily = null;
  };

  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    if (row.kind === "label") {
      if (current.length === 0) {
        headerFamily = row.family;
        i++;
        continue;
      }
      if (current.length === 6 - 1) {
        current.push({ kind: "blank" });
        flush();
        continue;
      }
      current.push(row);
      i++;
      continue;
    }
    if (current.length === 0 && headerFamily === null && row.kind === "swatches") {
      headerFamily = row.family;
    }
    current.push(row);
    i++;
    if (current.length === 6) flush();
  }
  flush();
  return cards;
}

// Free preview = the first full page (4 cards, up to 48 swatches) of
// whatever the full build would be -- see FREE_COLOR_LIMIT in
// lib/lemonSqueezyPricing.ts. Kept here since it's purely a slice of
// the same card list, not a separate build.
export function sliceFreePreviewCards(cards: Card[]): Card[] {
  return cards.slice(0, 4);
}

// ── SHARED BUILDER (2026-07-24) ──────────────────────────────────────
// Everything that used to live directly inside renderCards() -- all the
// actual page/card/swatch drawing -- now lives here, returning the
// finished jsPDF document without saving or outputting it anywhere.
// Both renderCards() (client, browser download) and renderCardsBuffer()
// (server, raw bytes for email attachments / on-demand regeneration)
// are now thin wrappers around this one function, so the free preview,
// the paid client-side download, AND any server-side regeneration all
// produce byte-identical output from the same code path.
async function buildPdfDoc(cards: Card[], options: SwatchPdfOptions) {
  const { jsPDF } = await import("jspdf");
  const { pageW, pageH, format } = getPageDims(options.paperSize);
  const doc = new jsPDF({ unit: "mm", format, orientation: "landscape" });

  const margin = 10;
  const gapX = 6;
  const cardsPerRow = 4;
  const cardW = (pageW - margin * 2 - gapX * (cardsPerRow - 1)) / cardsPerRow;
  const cardH = pageH - margin * 2;

  const exportItems = cards.flatMap((c) => c.rows.flatMap((r) => (r.kind === "swatches" ? [r.left, r.right] : []))).filter((x): x is SwatchItem => x !== null);
  const exportOrigins = Array.from(new Set(exportItems.map((i) => i.origin))).filter(Boolean);
  const originLine =
    exportOrigins.length === 0 ? "" :
    exportOrigins.length <= 2 ? exportOrigins.join(" + ") :
    `${exportOrigins.slice(0, 2).join(" + ")} +${exportOrigins.length - 2} more`;

  const rowsPerCard = 6;
  const paddedCards: Card[] = cards.map((card) =>
    card.rows.length >= rowsPerCard
      ? card
      : { ...card, rows: [...card.rows, ...Array.from({ length: rowsPerCard - card.rows.length }, (): RowContent => ({ kind: "blank" }))] }
  );
  const remainder = paddedCards.length % cardsPerRow;
  const blankCardsNeeded = paddedCards.length === 0 || remainder === 0 ? 0 : cardsPerRow - remainder;
  const finalCards: Card[] = [
    ...paddedCards,
    ...Array.from({ length: blankCardsNeeded }, (): Card => ({
      headerFamily: null,
      rows: Array.from({ length: rowsPerCard }, (): RowContent => ({ kind: "blank" })),
    })),
  ];

  const { swatchStyle, headerHolePos } = options;

  finalCards.forEach((card, cardIndex) => {
    const { headerFamily, rows } = card;
    const posOnPage = cardIndex % cardsPerRow;
    if (cardIndex > 0 && posOnPage === 0) doc.addPage();

    const x0 = margin + posOnPage * (cardW + gapX);
    const y0 = margin;

    doc.setDrawColor(CARD_LINE_GRAY);
    doc.setLineWidth(CARD_LINE_WIDTH);
    doc.rect(x0, y0, cardW, cardH);

    const familyLine = headerFamily ? COLOR_FAMILY_LABELS[headerFamily] : "";

    let headerH: number;
    let headerY: number;

    if (headerHolePos === "left" || headerHolePos === "right") {
      const holeR = 2.25;
      const holeCX = headerHolePos === "left" ? x0 + cardW * 0.15 : x0 + cardW * 0.85;
      const holeCY = y0 + 8;
      doc.setDrawColor(160);
      doc.setFillColor(255, 255, 255);
      doc.circle(holeCX, holeCY, holeR, "FD");

      const textAlign = headerHolePos === "left" ? "right" : "left";
      const textX = headerHolePos === "left" ? x0 + cardW - 4 : x0 + 4;
      const textMaxW = cardW - 4 - 10;
      if (headerFamily) {
        doc.setFontSize(9.5);
        doc.setTextColor(50);
        doc.text(familyLine, textX, y0 + 7, { align: textAlign, maxWidth: textMaxW });
        if (originLine) {
          doc.setFontSize(7);
          doc.setTextColor(120);
          doc.text(originLine, textX, y0 + 11.5, { align: textAlign, maxWidth: textMaxW });
        }
      }
      headerH = 16;
      headerY = y0 + headerH;
    } else {
      if (headerHolePos === "center") {
        const holeR = 2.25;
        doc.setDrawColor(160);
        doc.setFillColor(255, 255, 255);
        doc.circle(x0 + cardW / 2, y0 + 6, holeR, "FD");
        headerH = 12;
      } else {
        headerH = 4;
      }
      headerY = y0 + headerH + 2;
      if (headerFamily) {
        if (originLine) {
          doc.setFontSize(7.5);
          doc.setTextColor(120);
          doc.text(originLine, x0 + 4, headerY, { maxWidth: cardW - 8 });
          headerY += 5;
        }
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(familyLine, x0 + 4, headerY, { maxWidth: cardW - 8 });
      } else if (originLine) {
        headerY += 5;
      }
    }

    const gridTop = headerY + 4;
    const gridH = cardH - (headerY - y0) - 8;
    const cols = 2, gridRows = 6;
    const cellW = cardW / cols;
    const cellH = gridH / gridRows;

    const drawSwatchCell = (item: SwatchItem | null, col: number, rowIdx: number) => {
      const cx = x0 + col * cellW + 3;
      const cy = gridTop + rowIdx * cellH + 2;
      const swW = cellW - 6;
      const swH = cellH - 8;

      if (item && swatchStyle === "filled") {
        doc.setFillColor(item.rgb[0], item.rgb[1], item.rgb[2]);
        doc.rect(cx, cy, swW, swH, "F");
      }

      doc.setDrawColor(CARD_LINE_GRAY);
      doc.setLineWidth(SWATCH_LINE_WIDTH);
      doc.rect(cx, cy, swW, swH);

      const holeR = 3;
      doc.setDrawColor(CARD_LINE_GRAY);
      doc.setLineWidth(HOLE_LINE_WIDTH);
      doc.circle(cx + swW / 2, cy + swH / 2, holeR);

      if (item) {
        doc.setFontSize(8);
        doc.setTextColor(30);
        doc.text(printLabel(item), cx + swW / 2, cy + swH + 4, { align: "center" });
      }
    };

    rows.forEach((row, rowIdx) => {
      if (row.kind === "label") {
        const ly = gridTop + rowIdx * cellH + cellH / 2 + 1.5;
        doc.setFontSize(10);
        doc.setTextColor(70);
        doc.text(COLOR_FAMILY_LABELS[row.family], x0 + 4, ly, { maxWidth: cardW - 8 });
      } else if (row.kind === "swatches") {
        drawSwatchCell(row.left, 0, rowIdx);
        drawSwatchCell(row.right, 1, rowIdx);
      } else {
        drawSwatchCell(null, 0, rowIdx);
        drawSwatchCell(null, 1, rowIdx);
      }
    });
  });

  return doc;
}

// Client-side: triggers a browser download. Unchanged behavior from
// before the buildPdfDoc split -- same signature, same effect.
export async function renderCards(cards: Card[], options: SwatchPdfOptions, filename: string): Promise<void> {
  const doc = await buildPdfDoc(cards, options);
  doc.save(filename);
}

// Server-side (2026-07-24): returns the raw PDF bytes instead of
// triggering a browser download -- for email attachments and the
// admin regenerate-on-demand endpoint. jsPDF's dynamic import and all
// its drawing calls work identically under Node; only the very last
// step differs from the client version (output() instead of save()).
export async function renderCardsBuffer(cards: Card[], options: SwatchPdfOptions): Promise<Buffer> {
  const doc = await buildPdfDoc(cards, options);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
