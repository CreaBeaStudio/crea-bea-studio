// Font-fallback registration for the Custom Mystery Decoder PDF.
//
// Mirrors book_to_guangna_v2.py's FALLBACK_FONT_CANDIDATES / _font_for_text
// approach: DejaVu Sans first, then FreeSans, then unifont -- whichever is
// the FIRST font (in that order) that has a real glyph for every character
// in a given label gets used for that label, so rare symbols never render
// as a blank/missing box if a later font in the chain covers them.
//
// UNLIKE the Python version, these are NOT the full DejaVu/FreeSans/unifont
// font files (760KB/1.8MB/5.1MB -- ~7.6MB combined, too heavy to ship to a
// browser). They're subset down to only the glyphs that actually appear
// across her real book label data (digits, letters, and ~170 special
// symbols/dingbats/Cyrillic/Greek/math characters found across ALL 14 real
// Mystery book JSONs) -- ~51KB + 6.5KB + 2KB = ~60KB combined.
//
// REBUILT 2026-08-16 (v2 of this subset): the original subset (2026-08-13)
// was built from only the 9 books that existed at the time. 5 more books
// were added afterward (princess-vol1, great-classics-vol1/3/11, pokemon),
// each introducing NEW special characters the original subset never
// covered -- confirmed via her real bug report (a specific list of
// mojibake'd symbols) cross-checked against an exhaustive scan of all 14
// books' actual label/line characters, which found 26 codepoints missing
// from the old subset, matching her report almost exactly. If more books
// are added in the future, this subsetting step needs to be redone again
// from the full FULL-SIZE source fonts (still kept, not just the subsets)
// against the then-current full book set -- there's no way around
// re-subsetting when new source data introduces new characters, since the
// whole point of subsetting is not shipping glyphs nothing uses yet.
//
// Two characters (U+1D767, U+1D76D -- Mathematical Alphanumeric block)
// are STILL not covered by any of the 3 fonts she supplied, in either
// the old or new subset -- this is a genuine gap in the source fonts
// themselves, not a subsetting mistake; would need a 4th donor font with
// broader Math Alphanumeric coverage to fix, if it ever matters in
// practice (these render as jsPDF's default missing-glyph box, same
// honest fallback behavior as the Python script has for these same 2
// characters). Also note: the unifont subset is CONVERTED from its
// original CFF/PostScript-outline OTF flavor to a real TrueType (glyf)
// font via the `otf2ttf` tool -- confirmed necessary via a real render
// test (2026-08-15), since jsPDF's font embedder crashes outright on a
// CFF-flavored OTF. If a future book introduces a character outside
// this set, it'll render as a missing-glyph box -- regenerate the
// subsets from mystery-books/*.json + the 3 full source fonts if that
// happens (ask Claude to redo the subsetting step).
//
// Fonts are currently served locally from public/fonts/ (see FONT_BASE
// below) -- she saved them directly there rather than uploading to GCS:
//   public/fonts/DejaVuSans-subset.ttf
//   public/fonts/FreeSans-subset.ttf
//   public/fonts/unifont-subset.ttf
//
// Save this file as lib/mysteryDecoderFonts.ts (crea-bea-studio).

import type jsPDF from "jspdf";

// LOCAL DEV / SELF-HOSTED (2026-08-15): pointed at the site's own
// public/fonts/ folder (served as /fonts/... by Next.js) instead of
// GCS -- she saved the 3 subset font files there rather than
// uploading to the crea-bea-public-assets bucket. If you later move
// these to GCS instead, change this back to the bucket URL.
const FONT_BASE = "/fonts";

export type FontAlias = "MDDejaVu" | "MDFreeSans" | "MDUnifont";

interface FontDef {
  alias: FontAlias;
  file: string; // filename on GCS, under FONT_BASE
  vfsName: string; // internal jsPDF VFS filename
  // Coverage as [start, end] codepoint ranges (inclusive), compressed from
  // the subset font's actual cmap -- regenerate alongside the font files
  // if the subset ever changes.
  ranges: [number, number][];
}

// Priority order matters: first font in this array that covers EVERY
// character in a label wins, same as the Python fallback chain.
const FONT_DEFS: FontDef[] = [
  {
    alias: "MDDejaVu",
    file: "DejaVuSans-subset.ttf",
    vfsName: "MDDejaVu.ttf",
    ranges: [
      [32, 126], [163, 163], [165, 165], [167, 167], [171, 171], [182, 182],
      [187, 187], [216, 216], [294, 294], [338, 339], [442, 442], [446, 446],
      [449, 449], [568, 568], [580, 580], [590, 590], [622, 622], [629, 631],
      [649, 649], [677, 677], [916, 916], [931, 931], [934, 934], [936, 937],
      [966, 966], [977, 977], [982, 982], [991, 991], [1002, 1002], [1034, 1034],
      [1046, 1046], [1060, 1060], [1076, 1076], [1091, 1091], [1126, 1126],
      [1130, 1130], [1137, 1137], [1193, 1193], [1411, 1411], [1513, 1513],
      [7466, 7466], [7838, 7838], [8362, 8362], [8364, 8364], [8471, 8471],
      [8486, 8486], [8710, 8710], [8776, 8776], [8800, 8800], [8810, 8811],
      [8911, 8911], [8960, 8960], [9633, 9634], [9647, 9647], [9674, 9674],
      [9786, 9786], [9788, 9788], [9792, 9792], [9794, 9794], [9824, 9825],
      [9827, 9827], [9829, 9830], [9834, 9835], [9889, 9889], [42793, 42793],
      [65038, 65039], [120139, 120139],
    ],
  },
  {
    alias: "MDFreeSans",
    file: "FreeSans-subset.ttf",
    vfsName: "MDFreeSans.ttf",
    ranges: [
      [8380, 8380], [10160, 10160], [10625, 10625], [11046, 11046],
      [120506, 120506], [120535, 120535],
    ],
  },
  {
    alias: "MDUnifont",
    file: "unifont-subset.ttf",
    vfsName: "MDUnifont.ttf",
    ranges: [
      [7461, 7461], [7545, 7545], [10727, 10727], [12385, 12385],
    ],
  },
];

function codepointInRanges(cp: number, ranges: [number, number][]): boolean {
  for (const [lo, hi] of ranges) {
    if (cp >= lo && cp <= hi) return true;
  }
  return false;
}

function fontCoversText(text: string, ranges: [number, number][]): boolean {
  for (const ch of Array.from(text)) {
    if (!codepointInRanges(ch.codePointAt(0)!, ranges)) return false;
  }
  return true;
}

/** Picks the first (highest-priority) registered font alias that has a
 * glyph for every character in `text`. Falls back to the primary font
 * (MDDejaVu) if nothing covers it fully -- matches Python's behavior of
 * rendering a visible missing-glyph box rather than silently dropping
 * the character. */
export function pickFontForText(text: string): FontAlias {
  for (const def of FONT_DEFS) {
    if (fontCoversText(text, def.ranges)) return def.alias;
  }
  return FONT_DEFS[0].alias;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Keyed per jsPDF doc INSTANCE, not a module-level singleton -- each new
// buildMysteryDecoderDoc() call creates a fresh jsPDF doc, and fonts must
// be embedded into that specific doc's own VFS, not just "the first doc
// ever built" (a module-level flag would silently skip registration on
// every doc after the first, producing font-less/blank-glyph PDFs).
const registeredByDoc = new WeakMap<jsPDF, Promise<void>>();

// The 3 subset font files are tiny (~62KB combined) but this still avoids
// re-fetching them from GCS on every call within the same page session --
// the browser's HTTP cache mostly handles this already, but caching the
// parsed base64+VFS-registration work per-doc-instance is free to add here.
const base64Cache = new Map<string, string>();

async function fetchFontBase64(file: string): Promise<string> {
  const cached = base64Cache.get(file);
  if (cached) return cached;
  const res = await fetch(`${FONT_BASE}/${file}`);
  if (!res.ok) throw new Error(`Failed to fetch font ${file}: ${res.status}`);
  const buf = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);
  base64Cache.set(file, base64);
  return base64;
}

/** Fetches and embeds the 3 subset fonts into a jsPDF doc, once per doc
 * instance. Call this before drawing any label/code text, and await it --
 * font registration is inherently async (fetch), which is why
 * buildMysteryDecoderDoc() is now an async function. Safe to call multiple
 * times on the same doc instance (only registers once per instance). */
export async function registerDecoderFonts(doc: jsPDF): Promise<void> {
  const existing = registeredByDoc.get(doc);
  if (existing) return existing;
  const p = (async () => {
    for (const def of FONT_DEFS) {
      const base64 = await fetchFontBase64(def.file);
      doc.addFileToVFS(def.vfsName, base64);
      doc.addFont(def.vfsName, def.alias, "normal");
    }
  })();
  registeredByDoc.set(doc, p);
  return p;
}
