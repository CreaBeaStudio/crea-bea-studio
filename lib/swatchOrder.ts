import type { PaperSize } from "@/lib/lemonSqueezyPricing";
import type { Source, SwatchStyle, HeaderHolePos, CardPacking } from "@/lib/swatchPdf";

// Save this file as lib/swatchOrder.ts
//
// The saved shape of a pre-payment Custom Swatch Card Set selection,
// persisted to GCS by /api/submit-swatch-order and read back by both
// /api/swatch-order-status and /swatch-download. Pulled out into its
// own lib file (rather than living in the route.ts that first defined
// it) because importing a type from inside app/api/.../route.ts isn't
// reliably resolved by Next.js's build -- route files are special-cased
// and aren't guaranteed to work as plain importable modules, even for
// type-only imports that get erased at compile time.

export interface SwatchSelectionItem {
  source: Source;
  code: string;
  origin: string;
}

export interface SwatchSelectionJson {
  items: SwatchSelectionItem[];
  excluded: string[]; // "itemId::family" membership keys hidden from one family -- see membershipKey in lib/swatchPdf.ts
  options: {
    swatchStyle: SwatchStyle;
    headerHolePos: HeaderHolePos;
    cardPacking: CardPacking;
    paperSize: PaperSize;
  };
  colorCount: number;
  submittedAt: string;
}
