// generate-guangna-sets.mjs
// ─────────────────────────────────────────────
// Regenerates the GUANGNA_SETS object literal for lib/guangna.ts from
// the canonical guangna-sets.json -- companion to
// generate-guangna-colors.mjs, same reasoning.
//
// Run this, then paste the printed output over the existing
// GUANGNA_SETS block in lib/guangna.ts, whenever guangna-sets.json
// changes. Note: the "GN.8101-366 (366 colors)" entry is written out
// as an explicit array here (not "Object.keys(GN_COLORS)" like the
// original hand-written file did) -- functionally identical, since the
// canonical JSON's 366 set is already exactly GN_COLORS' key order,
// but this avoids the generator needing to know about GN_COLORS at all.
//
// Usage: node generate-guangna-sets.mjs > guangna-sets-output.txt

import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("./guangna-sets.json", "utf8"));

let out = "export const GUANGNA_SETS: Record<string,string[]> = {\n";
for (const [label, codes] of Object.entries(data)) {
  const codesStr = codes.map((c) => `"${c}"`).join(",");
  out += `  "${label}":[${codesStr}],\n`;
}
out += "};\n";

console.log(out);
