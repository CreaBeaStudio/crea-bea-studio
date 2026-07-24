// Shared pricing/variant-ID lookup for the two "custom generated" LS
// products (Custom Swatch Card Set, Guangna-by-Number). Both the client
// (for displaying prices / deciding what's free) and the API routes
// (for picking the right LS variant to check out) import from here, so
// the numbers only live in one place.
//
// Save this file as lib/lemonSqueezyPricing.ts

export type PaperSize = "a4" | "letter";

interface VariantInfo {
  price: string; // display string, e.g. "5,75€"
  variantId: string;
}

interface PaperVariants {
  a4: VariantInfo;
  us: VariantInfo; // "us" key matches the "letter" PaperSize value's meaning
}

function forPaper(v: PaperVariants, paperSize: PaperSize): VariantInfo {
  return paperSize === "letter" ? v.us : v.a4;
}

// ---- Custom Swatch Card Set (LS product 1240836) ----
// First 48 colors (one full page: 4 cards x 12 swatches) are free --
// see FREE_COLOR_LIMIT. Everything above that falls into one of these
// four paid bands, priced by final color count.
export const FREE_COLOR_LIMIT = 48;

interface SwatchBand {
  min: number;
  max: number; // Infinity for the top band
  label: string;
  variants: PaperVariants;
}

export const SWATCH_BANDS: SwatchBand[] = [
  {
    min: 49,
    max: 192,
    label: "49–192 colors",
    variants: {
      a4: { price: "5,75€", variantId: "1939594" },
      us: { price: "6,50€", variantId: "1939615" },
    },
  },
  {
    min: 193,
    max: 288,
    label: "193–288 colors",
    variants: {
      a4: { price: "6,25€", variantId: "1939616" },
      us: { price: "7,00€", variantId: "1939618" },
    },
  },
  {
    min: 289,
    max: 432,
    label: "289–432 colors",
    variants: {
      a4: { price: "8,50€", variantId: "1939628" },
      us: { price: "9,50€", variantId: "1939631" },
    },
  },
  {
    min: 433,
    max: Infinity,
    label: "More than 432 colors",
    variants: {
      a4: { price: "9,00€", variantId: "1939635" },
      us: { price: "10,00€", variantId: "1939642" },
    },
  },
];

/** Returns null if colorCount is within the free tier (<= FREE_COLOR_LIMIT). */
export function getSwatchBand(colorCount: number): SwatchBand | null {
  if (colorCount <= FREE_COLOR_LIMIT) return null;
  return SWATCH_BANDS.find((b) => colorCount >= b.min && colorCount <= b.max) ?? SWATCH_BANDS[SWATCH_BANDS.length - 1];
}

/** Convenience: variant/price for a given color count + paper size. Null if free. */
export function getSwatchVariant(colorCount: number, paperSize: PaperSize): VariantInfo | null {
  const band = getSwatchBand(colorCount);
  return band ? forPaper(band.variants, paperSize) : null;
}

// ---- Guangna-by-Number (LS product 1240861) ----
// Flat price by paper size only -- difficulty (Beginner/Intermediate/
// Advanced) is still selected by the customer and still affects
// generation, but no longer affects price.
export const GUANGNA_BY_NUMBER: PaperVariants = {
  a4: { price: "8,00€", variantId: "1939647" },
  us: { price: "9,00€", variantId: "1939648" },
};

export function getGuangnaByNumberVariant(paperSize: PaperSize): VariantInfo {
  return forPaper(GUANGNA_BY_NUMBER, paperSize);
}

// ---- USD display estimate (confirm page only -- LemonSqueezy itself
// handles real currency conversion at checkout; this is purely so the
// confirm page can show an approximate USD figure alongside the real
// EUR price). Static rate, same approach as the old USD_PRICES table
// that used to live in confirm/page.tsx -- update this number
// periodically rather than wiring a live FX API for what's just an
// estimate disclaimer.
//
// Rate as of 2026-07-23 (EUR/USD mid-market, via Xe): ~1.14
export const EUR_TO_USD_RATE = 1.14;

/** Parses a "X,XX€" display price into a number, e.g. "8,00€" -> 8. */
export function parseEuroPrice(price: string): number {
  return parseFloat(price.replace("€", "").replace(",", "."));
}

/** Formats a EUR price string as an approximate USD display string, e.g. "8,00€" -> "$9.12". */
export function toUsdEstimate(eurPrice: string): string {
  const usd = parseEuroPrice(eurPrice) * EUR_TO_USD_RATE;
  return `$${usd.toFixed(2)}`;
}
