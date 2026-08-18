// Custom Mystery Decoder -- combined Guangna+Languo matching.
//
// Given a book's own corrected color data (one row per printed code:
// its Line, its Label/symbol, and its true original color as hex --
// see xlsx_to_book_json.py for how that JSON is produced from her
// corrected Excel) and the customer's chosen marker sets (any mix of
// Guangna sets and Languo sets), this computes ONE best marker match
// per book row across BOTH brands combined -- not a separate top pick
// per brand. A customer who owns e.g. Guangna 168 + Languo Gel 234
// wants the single closest marker they actually own, whichever brand
// it happens to be, same philosophy as the live PBN owned-set
// matching (multi-brand-pbn-expansion.md).
//
// Save as lib/mysteryDecoderMatch.ts (crea-bea-studio).

import { rgbToLab, deltaE, GN_COLORS, hexToRgb, type MatchResult } from "./guangna";
import { LANGUO_COLORS, LANGUO_GLITTER_IDS, type LanguoMatchResult } from "./languo";

export type BrandSource = "guangna" | "languo";

export interface BookEntry {
  line: string | null;
  label: string;
  hex: string;
}

export interface BookData {
  book: string;
  count: number;
  entries: BookEntry[];
}

// One pool item: a single ownable marker code from either brand, with
// its RGB and precomputed Lab (computed once per pool build, not once
// per book row -- a book can have 1800+ rows, so this matters).
interface PoolItem {
  source: BrandSource;
  code: string;
  rgb: [number, number, number];
  lab: [number, number, number];
}

export interface DecoderMatch {
  line: string | null;
  label: string;
  originalHex: string;
  source: BrandSource;
  matchedCode: string;
  matchedRgb: [number, number, number];
  deltaE: number;
}

/**
 * Builds the combined candidate pool from the customer's selected sets.
 * guangnaSetKeys are keys into GUANGNA_SETS (lib/guangna.ts), languoSetKeys
 * are keys into LANGUO_SETS (lib/languoSets.ts). Both are optional --
 * passing only one brand's sets is a valid "Guangna only" or "Languo
 * only" selection; passing both is a combination.
 *
 * Deduplicates by code within each brand (a code appearing in two
 * selected sets of the same brand is only scored once).
 */
export function buildCombinedPool(
  guangnaSetKeys: string[],
  languoSetKeys: string[],
  guangnaSets: Record<string, string[]>,
  languoSets: Record<string, { line: string; codes: string[] }>
): PoolItem[] {
  const seen = new Set<string>(); // "guangna:GN-605" style dedupe key
  const pool: PoolItem[] = [];

  for (const setKey of guangnaSetKeys) {
    const codes = guangnaSets[setKey];
    if (!codes) continue;
    for (const code of codes) {
      const key = `guangna:${code}`;
      if (seen.has(key)) continue;
      const c = GN_COLORS[code];
      if (!c) continue;
      const rgb: [number, number, number] = [c[0], c[1], c[2]];
      seen.add(key);
      pool.push({ source: "guangna", code, rgb, lab: rgbToLab(rgb) });
    }
  }

  for (const setKey of languoSetKeys) {
    const set = languoSets[setKey];
    if (!set) continue;
    for (const code of set.codes) {
      if (LANGUO_GLITTER_IDS.includes(code)) continue; // never match against glitter finish
      const key = `languo:${code}`;
      if (seen.has(key)) continue;
      const rgb = LANGUO_COLORS[code];
      if (!rgb) continue;
      seen.add(key);
      pool.push({ source: "languo", code, rgb, lab: rgbToLab(rgb) });
    }
  }

  return pool;
}

/**
 * Matches every entry in a book's data against the combined pool,
 * returning one best match per entry (skips entries with no hex --
 * e.g. any stray non-data rows the xlsx converter already warned
 * about and excluded shouldn't reach here, but this is a defensive
 * second guard).
 */
export function matchBook(book: BookData, pool: PoolItem[]): DecoderMatch[] {
  if (pool.length === 0) return [];

  const results: DecoderMatch[] = [];
  for (const entry of book.entries) {
    const rgb = hexToRgb(entry.hex);
    if (!rgb) continue;
    const labT = rgbToLab(rgb);

    let best: PoolItem | null = null;
    let bestD = Infinity;
    for (const item of pool) {
      const d = deltaE(labT, item.lab);
      if (d < bestD) {
        bestD = d;
        best = item;
      }
    }
    if (!best) continue;

    results.push({
      line: entry.line,
      label: entry.label,
      originalHex: entry.hex,
      source: best.source,
      matchedCode: best.code,
      matchedRgb: best.rgb,
      deltaE: bestD,
    });
  }
  return results;
}

/**
 * Convenience one-shot: build the pool and match the whole book in
 * one call. Use buildCombinedPool + matchBook separately instead if
 * you need to reuse the same pool across multiple books (e.g. a
 * future "apply this marker combo to several books" flow) -- pool
 * construction is the only part that's brand-data-lookup-heavy.
 */
export function matchBookWithSets(
  book: BookData,
  guangnaSetKeys: string[],
  languoSetKeys: string[],
  guangnaSets: Record<string, string[]>,
  languoSets: Record<string, { line: string; codes: string[] }>
): DecoderMatch[] {
  const pool = buildCombinedPool(guangnaSetKeys, languoSetKeys, guangnaSets, languoSets);
  return matchBook(book, pool);
}