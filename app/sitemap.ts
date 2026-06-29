import type { MetadataRoute } from "next";
import { GUIDES_DATA } from "./[locale]/guides/guidesData";
import { MARKER_DATA } from "../lib/markerData";

const BASE_URL = "https://www.creabeastudio.com";
const LOCALES = ["en", "nl", "fr", "de", "it", "es"] as const;

// Static pages that exist the same way in every locale.
// ("confirm" is left out on purpose — it's a per-order page, not content.)
const STATIC_ROUTES = [
  "",
  "color-converter",
  "create",
  "examples",
  "faq",
  "guides",
  "privacy",
  "refund",
  "terms",
  "tips",
];

function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static pages
  for (const route of STATIC_ROUTES) {
    const path = route ? `/${route}` : "";
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.7,
        alternates: { languages: buildAlternates(path) },
      });
    }
  }

  // 2. Guide articles (slugs stay in English across all locales)
  for (const slug of Object.keys(GUIDES_DATA)) {
    const path = `/guides/${slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: buildAlternates(path) },
      });
    }
  }

  // 3. Marker pages — auto-updates if you add a new brand or set size
  // to lib/markerData.ts, no need to touch this file again.
  for (const [brand, data] of Object.entries(MARKER_DATA)) {
    for (const setSize of Object.keys(data.sets)) {
      const path = `/markers/${brand}/${setSize}`;
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
          alternates: { languages: buildAlternates(path) },
        });
      }
    }
  }

  return entries;
}