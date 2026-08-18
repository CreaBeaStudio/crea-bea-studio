// Shared free-typed "extra codes" parsing for the Custom Mystery
// Decoder feature. Extracted out of MysteryDecoderCustom.tsx's
// handleGeneratePreview (where this logic previously lived inline) so
// the paid download page (app/[locale]/mystery-decoder-download/page.tsx)
// can re-run the EXACT same parsing against the raw text saved at order
// time, rather than risking the two drifting apart if one is edited
// later. No behavior change from the original inline version --
// comma/space/newline separated tokens, each normalized against BOTH
// brands (a token only resolves against the brand whose normalizer
// recognizes its shape; a token matching neither is silently dropped).
//
// Save as lib/mysteryDecoderExtraCodes.ts (crea-bea-studio).

import { normalizeExtraCode } from "./guangna";
import { normalizeLanguoExtraCode } from "./languo";

export interface ParsedExtraCodes {
  guangnaCodes: string[];
  languoCodes: string[];
}

export function parseExtraCodesText(text: string): ParsedExtraCodes {
  const tokens = text
    .split(/[,\s]+/)
    .map((tok) => tok.trim())
    .filter(Boolean);

  return {
    guangnaCodes: tokens.map(normalizeExtraCode).filter((c): c is string => !!c),
    languoCodes: tokens.map(normalizeLanguoExtraCode).filter((c): c is string => !!c),
  };
}
