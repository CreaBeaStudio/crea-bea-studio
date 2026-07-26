// Shared list of error codes returned by our own Next.js API routes
// (submit-order, generate-preview, create-checkout, create-swatch-
// checkout, submit-swatch-order, swatch-order-status). Routes return
// { error: "SOME_CODE" } instead of a hardcoded English sentence, so
// the client can translate the code via the "apiErrors" namespace in
// each locale's message file, rather than displaying whatever raw
// English string the server happened to return.
//
// FIX (2026-07-27): the old client pattern was `data.error || t("...")`
// -- that translated fallback only ever fired when data.error was
// empty, but these routes always returned a truthy English string, so
// the fallback was dead code and every error showed up in English
// regardless of the customer's locale. Codes fix this: the client
// always translates, using "generic" only for a code it doesn't
// recognize (e.g. an older deploy of a route, or a future addition
// this list hasn't been updated for yet).
//
// EXTENDED (2026-07-27): added the swatch-flow codes (ORDER_ID_REQUIRED
// through STATUS_CHECK_FAILED) when create-swatch-checkout,
// submit-swatch-order, and swatch-order-status got the same treatment.
export const API_ERROR_CODES = [
  "NO_IMAGE",
  "EMAIL_REQUIRED",
  "SAVE_FAILED",
  "SUBMIT_FAILED",
  "SERVICE_UNAVAILABLE",
  "NO_MARKERS_SELECTED",
  "GENERATION_FAILED",
  "NO_MATCH_FOUND",
  "NO_LEVELS",
  "MULTI_ORDER_NOT_SUPPORTED",
  "INVALID_PAPER_SIZE",
  "CHECKOUT_UNAVAILABLE",
  "CHECKOUT_FAILED",
  "ORDER_ID_REQUIRED",
  "COLOR_COUNT_REQUIRED",
  "WITHIN_FREE_TIER",
  "SWATCH_VARIANT_UNAVAILABLE",
  "NO_ITEMS",
  "COLOR_COUNT_MISMATCH",
  "INVALID_ORDER_ID",
  "ORDER_NOT_FOUND",
  "STATUS_CHECK_FAILED",
] as const;

export type ApiErrorCode = typeof API_ERROR_CODES[number];

export function isApiErrorCode(code: unknown): code is ApiErrorCode {
  return typeof code === "string" && (API_ERROR_CODES as readonly string[]).includes(code);
}