// generate-languo-colors.mjs
// ─────────────────────────────────────────────
// Regenerates the LANGUO_COLORS object literal + LANGUO_GLITTER_IDS
// array for lib/languo.ts from the canonical languo-colors.json -- the
// single source of truth for Languo color data, shared between the
// TypeScript frontend (crea-bea-studio) and the Python backend
// (pbn-webservice). Companion to generate-guangna-colors.mjs, same
// reasoning.
//
// Run this, then paste the printed output over the existing
// LANGUO_COLORS / LANGUO_GLITTER_IDS blocks in lib/languo.ts, whenever
// languo-colors.json changes.
//
// Usage: node generate-languo-colors.mjs > languo-colors-output.txt

import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("./languo-colors.json", "utf8"));

let out = 'export const LANGUO_COLORS: Record<string,[number,number,number]> = {\n';
const entries = Object.entries(data);
for (let i = 0; i < entries.length; i += 3) {
  const chunk = entries.slice(i, i + 3).map(([code, e]) => {
    const [r, g, b] = e.rgb;
    return `"${code}":[${r},${g},${b}]`;
  });
  out += "  " + chunk.join(",") + ",\n";
}
out += "};\n\n";

const glitterIds = entries.filter(([, e]) => e.glitter).map(([code]) => code);
out += `export const LANGUO_GLITTER_IDS: string[] = [${glitterIds.map(c => `"${c}"`).join(", ")}];\n`;

console.log(out);
