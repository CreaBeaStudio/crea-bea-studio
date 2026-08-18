// Save this file as lib/mysteryDecoderPricing.ts
//
// [crea-bea-studio]
//
// Pricing/variant-ID lookup for the Custom Mystery Decoder LemonSqueezy
// product. Single flat-price product -- the full decoder for one book
// is one price. No paper-size branching: unlike Guangna-by-Number,
// there's no separate A4/Letter choice for this product -- the real
// PDF renderer (lib/mysteryDecoderPdf.ts) always builds at its "safe"
// page size (595x792pt), which is explicitly sized to print cleanly on
// both A4 and US Letter without cutoff. So "suitable for A4 and US
// Letter printing" is already satisfied by the one PDF, not by
// generating two variants.
//
// Product/variant IDs confirmed from her LemonSqueezy dashboard
// (product 1295441, variant 2026837, €9,00).

export const MYSTERY_DECODER_PRODUCT_ID = "1295441";

export const MYSTERY_DECODER_VARIANT = {
  price: "9,00€",
  variantId: "2026837",
};

export function getMysteryDecoderVariant() {
  return MYSTERY_DECODER_VARIANT;
}
