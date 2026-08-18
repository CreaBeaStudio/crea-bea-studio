// Custom Mystery Decoder -- PDF rendering.
//
// v3 rebuild (2026-08-13): REPLACED the v2 mini-cell-grid layout with an
// exact port of her existing book_to_guangna_v2.py tool's write_pdf()
// layout, per her explicit request not to invent a new one. This is a
// different structure than v2, not a tweak:
//
//   v2 (previous): one small cell per code, original+matched swatch
//   STACKED inside that one cell, label above, code below.
//
//   v3 (this file): one BOOK ROW ("Line") = two full-width horizontal
//   BANDS -- a band of original-color swatches (label drawn INSIDE each
//   swatch, centered, contrast text color) directly above a band of
//   matched-marker swatches (matched code drawn BELOW each swatch). Row
//   number sits once in a left-margin gutter. Cell WIDTH shrinks to fit
//   however many codes are in that row (content_w / n_cells, clamped
//   7-26pt); cell HEIGHT is always a fixed 20pt, matching what the real
//   printed nuanciers do. Rows with more than 30 codes wrap onto AS MANY
//   stacked half-rows as needed to keep every line at 30 codes or fewer
//   (not just two halves -- fixed 2026-08-15 after finding real rows
//   with up to 77 codes in her data, which a fixed two-way split would
//   still have overflowed).
//
// PAGE ORIENTATION (corrected 2026-08-15): portrait, matching her real
// book_to_guangna_v2.py reference output -- an earlier guess at
// landscape (before she could confirm against the actual tool) was
// wrong and has been reverted.
//
// All geometry constants below (MARGIN, GAP, CELL_H, MIN_W, MAX_W,
// WRAP_THRESHOLD, page sizes) are copied 1:1 from book_to_guangna_v2.py's
// own constants, in the same unit (pt) -- this file uses jsPDF's "pt"
// unit specifically so no mm<->pt conversion can drift the two layouts
// apart. Do not "simplify" these back to mm without re-deriving the
// conversion against the Python values.
//
// FONT FIX (2026-08-13): the v2 known issue -- special symbol labels
// (Ø=Ü, Œ, ž, etc.) rendering as mojibake -- is fixed here the same way
// the Python tool solves it: a font-fallback chain (DejaVu -> FreeSans ->
// unifont) picks whichever font actually has the glyph for each label.
// See lib/mysteryDecoderFonts.ts for the (subset, ~62KB total) embedded
// fonts and the coverage-based selection logic. Because font embedding
// requires an async fetch, buildMysteryDecoderDoc() and its two
// convenience wrappers are now ASYNC (return Promise<jsPDF>) -- this is
// an API change from v2's synchronous versions; every call site needs an
// `await` added.
//
// SIMPLIFICATION vs. the Python version: book_to_guangna_v2.py also
// shrinks an oversized glyph based on its actual ascender/descender
// height (relevant only for a handful of visually-tall unifont/CJK
// glyphs). jsPDF doesn't expose per-glyph vertical metrics as directly as
// PyMuPDF's fitz.Font does, so this file only does the WIDTH-based
// shrink-to-fit (the change that's visible on the vast majority of
// cells). If a specific tall glyph is later found to visually overflow
// its cell in a real render test, that's the one piece worth revisiting.
//
// NOT YET PORTED from the Python script (out of scope for this pass --
// flag if any of these turn out to be wanted for the Custom feature):
//   - symbol_crops (real cropped artwork images from a source PDF instead
//     of a text glyph) -- N/A here since Custom mode's book data comes
//     from her corrected Numbers/xlsx match data, not a source PDF
//   - the EXT01/EXT02 placeholder-symbol system and its overrides
//     workflow -- that's an authoring-time concern for HER building the
//     book JSON, not a customer-facing generation-time concern
//
// Save as lib/mysteryDecoderPdf.ts (crea-bea-studio).

import jsPDF from "jspdf";
import type { DecoderMatch } from "./mysteryDecoderMatch";
import { registerDecoderFonts, pickFontForText } from "./mysteryDecoderFonts";

export type PaperSize = "a4" | "letter" | "safe";

export interface BuildDecoderPdfOptions {
  bookTitle: string;
  setLabel?: string; // e.g. "Guangna GN.8101-168 Set" -- shown under the title, matches SET_META's pdf_title in the Python tool
  paperSize?: PaperSize; // default "safe" (fits both A4 and US Letter printers without cutoff), same default as book_to_guangna_v2.py
  previewFirstPageOnly?: boolean; // true = free preview (strips every page after the first, once real full pagination has happened); false/undefined = full (paid) output, every page
}

// --- Geometry constants, copied 1:1 from book_to_guangna_v2.py (in pt) ---
const PAGE_SIZES: Record<PaperSize, [number, number]> = {
  a4: [595, 842],
  letter: [612, 792],
  safe: [595, 792],
};
const MARGIN = 36;
const GAP = 3;
const ROW_GAP = 10;
const ROW_NUM_W = 18;
const CELL_H = 20;
const MIN_W = 7;
const MAX_W = 26;
const WRAP_THRESHOLD = 30;
const HEADER_H = 60;
const FOOTER_H = 70;
const LINE_H = CELL_H + GAP + CELL_H + 12; // one label+swatch line's total height
const LINE_STACK_GAP = 4; // gap between the two stacked half-lines of a wrapped row

const DEFAULT_DISCLAIMER_LINES = [
  "Created by CreaBeaStudio.com",
  "Independent fan-made color-matching reference. Not affiliated with, endorsed by, or licensed by any coloring book publisher, illustrator, or brand.",
  "Colors are approximate matches calculated by comparing the book's own printed shade codes to your marker colors; actual ink, screen, and paper colors may vary.",
  "This item is a digital download for personal use only. Resale, redistribution, or modification of this file for commercial or secondary sale is not permitted.",
  "The symbols were matched as closely as possible to the original; where exact reproduction was not possible, we mimicked them as best we could.",
];

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

// SUBSTITUTIONS for a small, known set of Unicode SUPPLEMENTARY-PLANE
// characters (codepoint > U+FFFF, requiring a UTF-16 surrogate pair --
// e.g. the Mathematical Alphanumeric Symbols block) that jsPDF's text
// rendering pipeline cannot display AT ALL, even when the embedded font
// genuinely contains the glyph (confirmed via a real render test
// 2026-08-16: these render as a totally blank cell, not even a
// missing-glyph box -- a jsPDF library limitation around surrogate
// pairs, not a font-coverage gap; corroborated by an identical
// documented issue in the react-pdf library for the same Unicode block:
// "mathematical italic characters... represented as surrogate pairs...
// rendering would break"). Rather than leave these cells blank, they're
// mapped here to their plain (non-styled) equivalent, which IS fully
// supported -- same spirit as the disclaimer already printed on every
// PDF ("where exact reproduction was not possible, we mimicked them as
// best we could"). If a NEW supplementary-plane character is found
// missing in the future, add its substitution here rather than trying
// to "fix" jsPDF itself.
const SUPPLEMENTARY_PLANE_SUBSTITUTIONS: Record<string, string> = {
  "\u{1D6BA}": "\u03A3", // MATHEMATICAL BOLD CAPITAL SIGMA -> Σ (plain Greek Sigma)
  "\u{1D6D7}": "\u03C6", // MATHEMATICAL BOLD SMALL PHI -> φ (plain Greek phi)
  "\u{1D54B}": "T",      // MATHEMATICAL DOUBLE-STRUCK CAPITAL T -> plain ASCII T
  "\u{1D767}": "\u03D1", // MATHEMATICAL SANS-SERIF BOLD CAPITAL THETA SYMBOL -> ϑ (plain Greek theta symbol)
  "\u{1D76D}": "\u03A8", // MATHEMATICAL SANS-SERIF BOLD CAPITAL PSI -> Ψ (plain Greek capital Psi)
};

function normalizeLabelForRender(text: string): string {
  let out = "";
  for (const ch of Array.from(text)) {
    out += SUPPLEMENTARY_PLANE_SUBSTITUTIONS[ch] ?? ch;
  }
  return out;
}

function textColorForBg(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 140 ? [255, 255, 255] : [0, 0, 0];
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function cellWidthForRow(nCells: number, pageW: number): number {
  if (nCells === 0) return MAX_W;
  const contentW = pageW - 2 * MARGIN - ROW_NUM_W;
  const raw = contentW / nCells - GAP;
  return clamp(MIN_W, MAX_W, raw);
}

/** Centers `text` in a cell, auto-shrinking to fit the cell width, using
 * whichever embedded font (DejaVu/FreeSans/unifont) actually covers every
 * character -- mirrors book_to_guangna_v2.py's _center_text + _font_for_text. */
function drawCenteredText(
  doc: jsPDF,
  text: string,
  cellX: number,
  cellW: number,
  baselineY: number,
  fontSize: number,
  color: [number, number, number]
) {
  const alias = pickFontForText(text);
  doc.setFont(alias, "normal");
  let size = fontSize;
  let w = doc.getTextWidth(text) * size; // jsPDF getTextWidth is in doc units at current font size=1... see note below
  // jsPDF's getTextWidth() uses the CURRENTLY SET font size, not a
  // per-unit multiplier -- set size first, then measure, then rescale if
  // needed (single-shot, same as the Python version's one-shot rescale).
  doc.setFontSize(size);
  w = doc.getTextWidth(text);
  const maxW = cellW - 1;
  if (w > maxW && maxW > 0) {
    size = size * (maxW / w);
    doc.setFontSize(size);
    w = doc.getTextWidth(text);
  }
  const x = cellX + (cellW - w) / 2;
  doc.setTextColor(...color);
  doc.text(text, x, baselineY);
}

interface RowCell {
  label: string;
  originalRgb: [number, number, number];
  matchedCode: string;
  matchedRgb: [number, number, number];
}

interface BookRow {
  rowNum: string;
  cells: RowCell[];
}

function groupByLine(matches: DecoderMatch[]): BookRow[] {
  const rows: BookRow[] = [];
  const indexByLine = new Map<string, number>();
  for (const m of matches) {
    const lineKey = m.line ?? "";
    if (!indexByLine.has(lineKey)) {
      indexByLine.set(lineKey, rows.length);
      rows.push({ rowNum: lineKey, cells: [] });
    }
    rows[indexByLine.get(lineKey)!].cells.push({
      label: m.label,
      originalRgb: hexToRgbTuple(m.originalHex),
      matchedCode: m.matchedCode,
      matchedRgb: m.matchedRgb,
    });
  }
  return rows;
}

export async function buildMysteryDecoderDoc(
  matches: DecoderMatch[],
  opts: BuildDecoderPdfOptions
): Promise<jsPDF> {
  const paperSize = opts.paperSize ?? "safe";
  const [configW, configH] = PAGE_SIZES[paperSize];

  const doc = new jsPDF({ unit: "pt", format: [configW, configH], orientation: "portrait" });
  // CORRECTED 2026-08-15 (she confirmed against her real reference tool's
  // actual output): book_to_guangna_v2.py's pages are PORTRAIT, not
  // landscape -- the earlier v3 guess (landscape) was wrong. Page
  // dimensions are used as given, no swap. Still reading the real
  // post-construction size back from the doc itself (not trusting
  // PAGE_SIZES' own order) as defensive practice -- costs nothing and
  // protects against jsPDF's swap behavior on any future orientation
  // change.
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  await registerDecoderFonts(doc);

  let y = MARGIN;

  const drawHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(`Color Codes ${opts.bookTitle}`, MARGIN, MARGIN + 12);
    if (opts.setLabel) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.text(opts.setLabel, MARGIN, MARGIN + 28);
    }
  };

  const newPage = (isFirst: boolean) => {
    if (!isFirst) doc.addPage([pageW, pageH], "portrait");
    drawHeader();
    y = MARGIN + HEADER_H;
  };
  newPage(true);

  const ensureSpace = (neededH: number) => {
    if (y + neededH > pageH - FOOTER_H) {
      newPage(false);
    }
  };

  const rows = groupByLine(matches);

  const drawLine = (cells: RowCell[], topY: number, cellW: number) => {
    const labelFontSize = clamp(7, 11, cellW * 0.46);
    const codeFontSize = clamp(7, 10, cellW * 0.44) + 1.5;

    let x = MARGIN + ROW_NUM_W;
    for (const c of cells) {
      doc.setFillColor(...c.originalRgb);
      doc.rect(x, topY, cellW, CELL_H, "F");
      const textColor = textColorForBg(c.originalRgb);
      drawCenteredText(doc, normalizeLabelForRender(c.label), x, cellW, topY + CELL_H - 6, labelFontSize, textColor);
      x += cellW + GAP;
    }

    x = MARGIN + ROW_NUM_W;
    const sy = topY + CELL_H + GAP;
    for (const c of cells) {
      const shortCode = c.matchedCode.replace(/^GN-/, "").replace(/^HG-/, "");
      doc.setFillColor(...c.matchedRgb);
      doc.setDrawColor(204, 204, 204);
      doc.setLineWidth(0.5);
      doc.rect(x, sy, cellW, CELL_H, "FD");
      drawCenteredText(doc, shortCode, x, cellW, sy + CELL_H + 9, codeFontSize, [76, 76, 76]);
      x += cellW + GAP;
    }
  };

  for (const row of rows) {
    const nCells = row.cells.length;
    // FIXED 2026-08-15: was splitting an oversized row into exactly TWO
    // halves regardless of size -- fine up to 60 cells (30/30), but a
    // real row with e.g. 77 cells (confirmed present in her
    // tres-grands-classiques data) would still put 39 cells on each
    // half-line, well over the intended 30-per-line cap. Generalized to
    // chunk into as many lines as needed, each capped at WRAP_THRESHOLD.
    let lines: RowCell[][];
    if (nCells > WRAP_THRESHOLD) {
      const numLines = Math.ceil(nCells / WRAP_THRESHOLD);
      const perLine = Math.ceil(nCells / numLines); // even distribution, still each <= WRAP_THRESHOLD
      lines = [];
      for (let i = 0; i < nCells; i += perLine) {
        lines.push(row.cells.slice(i, i + perLine));
      }
    } else {
      lines = [row.cells];
    }
    const widestLine = Math.max(...lines.map((l) => l.length));
    const cellW = cellWidthForRow(widestLine, pageW);

    const neededH = LINE_H * lines.length + LINE_STACK_GAP * (lines.length - 1);
    ensureSpace(neededH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(26, 140, 191);
    doc.text(String(row.rowNum), MARGIN, y + CELL_H - 6);

    let lineY = y;
    for (const lineCells of lines) {
      drawLine(lineCells, lineY, cellW);
      lineY += LINE_H + LINE_STACK_GAP;
    }
    y += neededH + ROW_GAP;
  }

  if (opts.previewFirstPageOnly) {
    // Free preview = the ENTIRE first page (however many rows actually
    // fit, following the real pagination that already happened above),
    // not an arbitrary line count -- per her explicit correction
    // 2026-08-15 (the earlier "first N lines" approach didn't reflect
    // what "free preview" was supposed to mean). Delete every page
    // after the first, from the end backwards (deleting from the front
    // would shift remaining page indices under you).
    const totalBuiltPages = doc.getNumberOfPages();
    for (let p = totalBuiltPages; p > 1; p--) {
      doc.deletePage(p);
    }
    doc.setPage(1);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Free preview -- unlock the full decoder to see every page.", MARGIN, MARGIN + 42);
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    let fy = pageH - FOOTER_H + 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(128, 128, 128);
    for (const line of DEFAULT_DISCLAIMER_LINES) {
      const w = doc.getTextWidth(line);
      doc.text(line, (pageW - w) / 2, fy);
      fy += 8;
    }
  }

  return doc;
}

export async function buildFreePreviewDoc(
  matches: DecoderMatch[],
  bookTitle: string,
  paperSize: PaperSize = "safe",
  setLabel?: string
): Promise<jsPDF> {
  return buildMysteryDecoderDoc(matches, { bookTitle, paperSize, previewFirstPageOnly: true, setLabel });
}

export async function buildFullDoc(
  matches: DecoderMatch[],
  bookTitle: string,
  paperSize: PaperSize = "safe",
  setLabel?: string
): Promise<jsPDF> {
  return buildMysteryDecoderDoc(matches, { bookTitle, paperSize, previewFirstPageOnly: false, setLabel });
}
