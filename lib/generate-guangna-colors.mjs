// generate-guangna-colors.mjs
// ─────────────────────────────────────────────
// Regenerates the GN_COLORS object literal for lib/guangna.ts from the
// canonical guangna-colors.json -- this is the single source of truth
// for Guangna color data (name, sRGB, Adobe RGB), shared between the
// TypeScript frontend (crea-bea-studio) and the Python backend
// (pbn-webservice).
//
// Run this, then paste the printed output over the existing GN_COLORS
// block in lib/guangna.ts, whenever guangna-colors.json changes.
//
// Usage: node generate-guangna-colors.mjs > guangna-colors-output.txt

import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("./guangna-colors.json", "utf8"));

let out = 'export const GN_COLORS: Record<string,[number,number,number,string]> = {\n';
const entries = Object.entries(data);
for (let i = 0; i < entries.length; i += 3) {
  const chunk = entries.slice(i, i + 3).map(([code, e]) => {
    const [r, g, b] = e.srgb;
    const name = e.name.replace(/"/g, '\\"');
    return `"${code}":[${r},${g},${b},"${name}"]`;
  });
  out += "  " + chunk.join(",") + ",\n";
}
out += "};\n";

console.log(out);
