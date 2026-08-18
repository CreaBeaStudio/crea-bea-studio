// Save this file as lib/mysteryOrder.ts
//
// [crea-bea-studio]
//
// Shape of a saved Custom Mystery Decoder order (mirrors
// lib/swatchOrder.ts's SwatchSelectionJson). REWRITTEN against the real
// MysteryDecoderCustom.tsx (previous version guessed field names before
// that component was available) -- guangnaSetKeys/languoSetKeys are the
// real GUANGNA_SETS/LANGUO_SETS keys the customer selected (never the
// component's internal synthetic "__extra_guangna__"/"__extra_languo__"
// pool keys); extraCodesText is the raw free-typed field, re-parsed
// identically at generation time via lib/mysteryDecoderExtraCodes.ts so
// the paid PDF matches the free preview's logic exactly. bookTitle and
// setLabel are stored as computed at submit time (rather than
// recomputed on the download page) so that page doesn't need its own
// copy of the BOOKS list or the set-label-joining logic kept in sync.
//
// No paperSize field -- see lib/mysteryDecoderPricing.ts's header
// comment for why (the PDF always renders at its one "safe" A4/Letter
// page size).

export interface MysteryDecoderSelectionJson {
  book: string; // book slug, e.g. "mondes-fantastiques"
  bookTitle: string; // display title for the PDF header, e.g. "Mondes Fantastiques"
  guangnaSetKeys: string[]; // selected GUANGNA_SETS keys (real keys only)
  languoSetKeys: string[]; // selected LANGUO_SETS keys (real keys only)
  extraCodesText: string; // raw free-text field as typed
  setLabel: string; // display label for the PDF, e.g. "GN.8101-168 + Languo Gel 234"
  submittedAt: string;
}
