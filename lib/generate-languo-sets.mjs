// generate-languo-sets.mjs
// ─────────────────────────────────────────────
// Regenerates the LANGUO_SETS object literal for lib/languoSets.ts from
// the canonical languo-sets.json -- companion to
// generate-guangna-sets.mjs, same reasoning.
//
// NOTE: this only outputs the raw {label: codes[]} data -- the pretty
// display labels in LANGUO_SET_OPTIONS ("Paint 288 Set (288 colors)"
// for key "Brush 288 Set", etc.) are UI copy, not data, so they stay
// hand-maintained in lib/languoSets.ts, same convention as Guangna's
// SET_OPTIONS in lib/guangna.ts never being generated either. If a set
// is added/removed here, LANGUO_SET_OPTIONS needs a matching manual
// edit -- this generator won't catch a mismatch between the two, so
// double check after regenerating (this is exactly the kind of gap
// that caused the "288 Set" vs "Brush 288 Set" key-mismatch bug found
// 2026-08-05 -- a mismatch there is silent, not a crash).
//
// Run this, then paste the printed output over the existing
// LANGUO_SETS block in lib/languoSets.ts, whenever languo-sets.json
// changes.
//
// Usage: node generate-languo-sets.mjs > languo-sets-output.txt

import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("./languo-sets.json", "utf8"));

let out = "export const LANGUO_SETS: Record<string,string[]> = {\n";
for (const [label, entry] of Object.entries(data)) {
  const codesStr = entry.codes.map((c) => `"${c}"`).join(",");
  out += `  "${label}":[${codesStr}],\n`;
}
out += "};\n";

console.log(out);
