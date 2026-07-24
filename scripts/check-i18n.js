#!/usr/bin/env node
// Save this file as scripts/check-i18n.js (or wherever your other
// scripts live) and run it with: node scripts/check-i18n.js
//
// Compares every other locale file in your messages folder against
// en.json (treated as the source of truth for which keys should
// exist) and reports:
//   - MISSING keys: present in en.json, absent from the other locale
//     (falls back to English or shows a raw key at runtime, depending
//     on your next-intl config -- either way, worth knowing about)
//   - ORPHANED keys: present in the other locale, absent from en.json
//     (dead weight from an old English structure that's since changed
//     -- safe to delete, nothing references them anymore)
//   - IDENTICAL keys: same string value in both files, which is
//     usually fine (brand names, "FAQ", "PDF", proper nouns) but
//     worth a quick human glance since it can also mean "never
//     actually translated, just copy-pasted"
//
// Adjust MESSAGES_DIR and LOCALES below to match your actual project
// layout -- these are guesses based on standard next-intl conventions
// (messages/<locale>.json), not confirmed against your repo structure.

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "./messages/en.json", "messages");
const SOURCE_LOCALE = "en";
const LOCALES = ["de", "nl", "es", "fr", "it"]; // adjust to your actual locale list

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function loadFlat(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return flatten(JSON.parse(raw));
}

const enFlat = loadFlat(SOURCE_LOCALE);
const enKeys = new Set(Object.keys(enFlat));

let anyIssues = false;

for (const locale of LOCALES) {
  let localeFlat;
  try {
    localeFlat = loadFlat(locale);
  } catch (e) {
    console.log(`\n=== ${locale}.json ===`);
    console.log(`  Could not read file: ${e.message}`);
    anyIssues = true;
    continue;
  }
  const localeKeys = new Set(Object.keys(localeFlat));

  const missing = [...enKeys].filter((k) => !localeKeys.has(k)).sort();
  const orphaned = [...localeKeys].filter((k) => !enKeys.has(k)).sort();
  const identical = [...enKeys]
    .filter((k) => localeKeys.has(k))
    .filter((k) => enFlat[k] === localeFlat[k] && typeof enFlat[k] === "string" && enFlat[k].length > 3)
    .sort();

  console.log(`\n=== ${locale}.json ===`);
  console.log(`  Missing: ${missing.length}, Orphaned: ${orphaned.length}, Identical-to-EN: ${identical.length}`);

  if (missing.length) {
    anyIssues = true;
    console.log(`  --- MISSING (need translation) ---`);
    missing.forEach((k) => console.log(`    ${k}: ${JSON.stringify(enFlat[k]).slice(0, 80)}`));
  }
  if (orphaned.length) {
    anyIssues = true;
    console.log(`  --- ORPHANED (no longer used, safe to delete) ---`);
    orphaned.forEach((k) => console.log(`    ${k}`));
  }
  if (identical.length) {
    console.log(`  --- IDENTICAL TO EN (double-check these were meant to be the same) ---`);
    identical.forEach((k) => console.log(`    ${k}: ${JSON.stringify(enFlat[k]).slice(0, 80)}`));
  }
}

if (anyIssues) {
  console.log("\n⚠️  Found missing or orphaned keys in one or more locale files.");
  process.exitCode = 1;
} else {
  console.log("\n✅ All locale files have matching keys.");
}