"use client";

// Mystery Coloring Page Decoder -- pre-generated PDFs matching each
// book's own numbered color-code legend to marker codes, one file per
// book per marker-set variant. Same delivery model as
// ReadyMadePacks.tsx: static files uploaded directly to each
// LemonSqueezy variant, LS handles delivery on payment, no webhook.
//
// v5 restructure (2026-08-09): selector is now a 3-STEP flow instead
// of a flat 2-column one -- (1) choose brand/family [Guangna/Languo],
// (2) choose book [filtered to that family only], (3) choose
// size/code + see the result card. Previously every book that existed
// in both families (e.g. Princess Vol1 Guangna AND Princess Vol1
// Languo) showed up as two separate, fully-spelled-out entries in one
// flat book list -- fine with 6 books, but gets cluttered as more
// books/families are added. Adding brand as step 1 means the book
// list at step 2 only ever shows books for the currently selected
// brand, so the list stays short no matter how many brand families
// exist. FAMILIES/FAMILY_LABEL below control which brand tabs show and
// in what order -- add a new family there (plus its own tilesFor
// logic) to add a third brand tab in the future.
//
// v4 addition (2026-08-09): books can belong to either the "guangna"
// family (6 shared Guangna set sizes: 168/240/288/360/408/366) or the
// "languo" family (6 Languo product codes across different Languo
// lines -- LGG-168/LGG-234 Gel Pens, LGP-144 Plus, LGP-192/240/288
// Paint -- NOT sizes of one product line, so they don't fit the old
// size-number model at all). Each BookGroup carries a `family` flag.
// VARIANT_DATA keys are strings so both a Guangna size ("168") and a
// Languo code ("LGG-168") can key the same lookup table. The
// size/code dropdown at step 3 is generated directly from the
// selected book's own tiles, so it automatically shows the right
// variant list for whichever book is selected, no separate lookup
// table to keep in sync.
//
// v2 layout: instead of one grid-of-tiles section per book (hard to
// scan, hard to extend), this became a selector -- pick a book, pick
// a variant, see one result card (free preview + buy button) below.
// Adding a new book is just adding an entry to VARIANT_DATA + BOOKS,
// no new JSX section.
//
// v3 addition: each book in BOOKS has a `published` flag. Only
// published: true books show up anywhere on the page (selector list,
// default selection). This lets you add a new book's full data --
// LemonSqueezy links, preview files, everything -- ahead of time and
// keep it completely hidden from customers until you're ready, by
// flipping its `published` value to true and pushing that one-line
// change. No other code needs to touch when you do this.
//
// NOTE: Navbar/Footer are NOT rendered inside this component -- per
// the site's existing pattern, they belong in the page.tsx that
// imports this component, as top-level siblings around <main>, so
// they always span the full page width regardless of what container
// this component's own content sits in. See the page.tsx snippet
// delivered alongside this file.
//
// GN408 reuses the GN360 LemonSqueezy variant/checkout link AND the
// same free preview file (same match data, same file) -- its result
// card shows a short note instead of implying a different color match.
// (Languo family has no equivalent -- each Languo code is its own
// distinct product line, nothing to alias.)
//
// Free previews live in the crea-bea-public-assets GCS bucket, under
// a mystery-decoder/ prefix (same pattern as the existing examples/
// and coloring-pages/ prefixes) -- upload each book's preview files
// there before that book goes live. GCS paths are case-sensitive --
// previewFile values below must match the uploaded filenames exactly,
// including case.
//
// NEW/CHANGED translation keys needed under the "mysteryDecoder"
// namespace -- add to en.json first, then nl/de/es/fr/it:
//   selectBrandLabel (new, step 1 label), selectBookLabel,
//   selectSetLabel, whatsIncludedTitle, featureA4Letter,
//   featureDualCoding, featureCompleteCoverage,
//   featureFreePreviewLabel, featureFreePreviewText, priceNote
// Also: the "intro" key's copy should be reworded to remove the
// "Guangna"-specific mention now that the page covers multiple brands
// -- that's a content edit in your locale files, no code change needed
// here.
//
// NOTE: princessVol2, greatClassicsVol3, princessLanguo, and
// greatClassicsVol1Languo all need matching entries under "books" in
// each locale's translation file -- princessVol2, princessLanguo, and
// greatClassicsVol1Languo are all published so this is needed now;
// greatClassicsVol3/Vol4 can wait until they're published. Since brand
// is now its own step, you can shorten these labels if you like (e.g.
// "Princess Vol 1" for both the Guangna and Languo entries) rather
// than needing a "(Languo)" suffix to disambiguate -- your call.

import { useState } from "react";
import { useTranslations } from "next-intl";

type Family = "guangna" | "languo";

// Order here is the order the brand tabs are shown in at step 1.
const FAMILIES: Family[] = ["guangna", "languo"];
const FAMILY_LABEL: Record<Family, string> = {
  guangna: "Guangna",
  languo: "Languo",
};

interface DecoderTile {
  variantKey: string; // "168" for guangna sizes, "LGG-168" for languo codes
  label: string; // "Guangna 168" or "LGG-168 (Gel Pens)" -- shown in the dropdown + result card
  previewUrl: string | null; // static free page-1-preview PDF path
  price: string | null; // null = not priced yet, shows "comingSoon"
  checkoutUrl: string | null;
  metallicsNote?: boolean; // true for GN408 -- shows the "reuses 360 match" note (guangna family only)
}

interface BookGroup {
  id: string;
  titleKey: string; // translation key under mysteryDecoder.books
  family: Family;
  tiles: DecoderTile[];
  published: boolean; // false = fully hidden from the page, even though its data is here
}

const GUANGNA_SET_SIZES = [168, 240, 288, 360, 408, 366];

// Languo variants are PRODUCT CODES across different Languo lines, not
// sizes of one line -- order here is the step-3 dropdown order.
const LANGUO_VARIANTS: { key: string; label: string }[] = [
  { key: "LGG-168", label: "LGG-168 (Gel Pens)" },
  { key: "LGG-234", label: "LGG-234 (Gel Pens)" },
  { key: "LGP-144", label: "LGP-144 (Plus)" },
  { key: "LGP-192", label: "LGP-192 (Paint)" },
  { key: "LGP-240", label: "LGP-240 (Paint)" },
  { key: "LGP-288", label: "LGP-288 (Paint)" },
];

const PREVIEW_BASE = "https://storage.googleapis.com/crea-bea-public-assets/mystery-decoder";

// ---- Real LemonSqueezy variant data ----
// "360" and "408" intentionally share the same checkout link/price AND
// the same preview file (GN408 reuses the GN360 match, per her decision).
// Keys are strings so both Guangna sizes ("168") and Languo codes
// ("LGG-168") can key the same table -- numeric literal keys below
// (168, 240, ...) still work fine as object keys, JS/TS treat them as
// their string form automatically.
interface VariantEntry {
  price: string;
  checkoutUrl: string | null;
  previewFile: string; // filename only, resolved against PREVIEW_BASE below -- CASE SENSITIVE, must match the GCS object exactly
}

const VARIANT_DATA: Record<string, Partial<Record<string, VariantEntry>>> = {
  princess: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1299349d-710e-4662-ba4e-3e371fcd31b7", previewFile: "Princess_Vol1_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/89d7b72d-4134-4946-a2ab-49850fe5ef37", previewFile: "Princess_Vol1_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a0435873-b9ef-4651-a783-14f1b2a57f66", previewFile: "Princess_Vol1_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3ddef4d6-a458-4e01-8d24-e646f7d68d49", previewFile: "Princess_Vol1_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3ddef4d6-a458-4e01-8d24-e646f7d68d49", previewFile: "Princess_Vol1_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f80f9c69-6b46-4915-9e17-e435316c7690", previewFile: "Princess_Vol1_GN366_preview.pdf" },
  },
  greatClassicsVol1: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4611ab6b-ae98-4927-a099-fbd6c0a74058", previewFile: "great-classics-vol1-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/86cee6dc-0863-417e-9dbe-0bf2dcea667c", previewFile: "great-classics-vol1-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9bab1238-c909-4640-8406-aebb99964251", previewFile: "great-classics-vol1-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1591367b-67cb-4fee-8bf3-8ad27ebc7f31", previewFile: "great-classics-vol1-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1591367b-67cb-4fee-8bf3-8ad27ebc7f31", previewFile: "great-classics-vol1-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ef5abf47-8043-4cae-8686-d8ea0b0930f3", previewFile: "great-classics-vol1-gn366-preview.pdf" },
  },
  greatClassicsVol2: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c3976664-f946-420a-b6b1-691edb527048", previewFile: "great-classics-vol2-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d0521dab-3d26-49ac-802c-8684f9568cc7", previewFile: "great-classics-vol2-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f4592d23-d6f7-4ff9-91d5-2d2aac3e5300", previewFile: "great-classics-vol2-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5d045a18-28bd-456c-a432-80c5f32c0639", previewFile: "great-classics-vol2-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5d045a18-28bd-456c-a432-80c5f32c0639", previewFile: "great-classics-vol2-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8e3c80aa-9352-42c0-a19c-c19df65fc8f6", previewFile: "great-classics-vol2-gn366-preview.pdf" },
  },
  greatClassicsVol3: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a4ffa8cc-edd8-470a-a738-cb539bb356e5", previewFile: "great-classics-vol3-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c1b86983-16e3-4f70-b25f-3526373e2bd6", previewFile: "great-classics-vol3-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9689138d-a2d6-458d-bc08-e8a3b491b405", previewFile: "great-classics-vol3-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/09a8d742-26be-448b-90d3-f01b64a93590", previewFile: "great-classics-vol3-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/09a8d742-26be-448b-90d3-f01b64a93590", previewFile: "great-classics-vol3-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a126b924-c8a8-4e02-874a-bfcc41962e5b", previewFile: "great-classics-vol3-gn366-preview.pdf" },
  },
  greatClassicsVol4: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e7761efe-6c11-4bf5-ae6d-539f0724910d", previewFile: "great-classics-vol4-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/58d531e4-23d0-4cc5-bfe3-5be0ce2cc1e2", previewFile: "great-classics-vol4-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/697098bd-04bb-458e-9f95-875bfa93ed9f", previewFile: "great-classics-vol-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/50bde7b4-d50a-4a26-ae0a-95e5a123e94a", previewFile: "great-classics-vol4-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/50bde7b4-d50a-4a26-ae0a-95e5a123e94a", previewFile: "great-classics-vol4-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/fcbf9f91-f7b7-430d-b074-9b72b59a725c", previewFile: "great-classics-vol4-gn366-preview.pdf" },
  },
  princessVol2: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/15bdfc0c-6166-4954-853b-f144bbc9b4bf", previewFile: "Princess_Vol2_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1c03f51e-1326-439b-b764-2174c78f79b7", previewFile: "Princess_Vol2_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9bddedba-de7d-422a-bdd3-6b078e507018", previewFile: "Princess_Vol2_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2536d85b-bb10-4e23-b22b-3585413cd7a4", previewFile: "Princess_Vol2_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2536d85b-bb10-4e23-b22b-3585413cd7a4", previewFile: "Princess_Vol2_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/05866ea0-bd22-48b0-b086-1aaf3c9a7fbb", previewFile: "Princess_Vol2_GN366_preview.pdf" },
  },

  // --- Languo-family books (2026-08-09) ---
  princessLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/205c3da8-c753-4314-8e37-b48610a3d336", previewFile: "Princess_Vol1_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ecffd7cc-0d72-4e1c-9ba3-9a17027aa5b7", previewFile: "Princess_Vol1_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/452f5a87-bcfd-4a74-b434-83988f68e6ff", previewFile: "Princess_Vol1_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/492acf19-bea0-4c83-918c-a4d0e6c92ec2", previewFile: "Princess_Vol1_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/94c3ac67-b18b-468d-b8ad-a91e9c7c51e8", previewFile: "Princess_Vol1_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ec41297a-00b6-40f9-9c94-ab266d6159f8", previewFile: "Princess_Vol1_LGP288_preview.pdf" },
  },
  greatClassicsVol1Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d5f4ff62-f6de-4afa-8432-f6778a1a0109", previewFile: "Great_Classics _Vol1_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/cb60b8a3-2d84-402b-8c38-86156a33e164", previewFile: "Great_Classics _Vol1_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/86a1879a-ca64-4d99-a66e-0becaa4b5208", previewFile: "Great_Classics _Vol1_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/10c4ef76-c939-4933-9dd7-dcd530f0e80f", previewFile: "Great_Classics _Vol1_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/62e01fb6-e403-43f3-b300-606fd48508f7", previewFile: "Great_Classics _Vol1_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0fb992dc-9bf9-4dbf-a6ad-3a1f67264d93", previewFile: "Great_Classics _Vol1_LGP288_preview.pdf" },
  },

  // --- Example of how to stage a future book ahead of time ---
  // Fill in its real VARIANT_DATA here whenever it's ready, add a
  // matching entry to BOOKS below with `published: false`, and it will
  // sit fully wired-up but invisible until you flip that to `true`.
  // heroesVsVillains: {
  //   168: { price: "7,50€", checkoutUrl: "...", previewFile: "heroes-vs-villains-gn168-preview.pdf" },
  //   ...
  // },
};

function tilesFor(bookId: string, family: Family): DecoderTile[] {
  const data = VARIANT_DATA[bookId] ?? {};

  if (family === "guangna") {
    return GUANGNA_SET_SIZES.map((size) => {
      const key = String(size);
      const entry = data[key];
      return {
        variantKey: key,
        label: `Guangna ${size}`,
        previewUrl: entry ? `${PREVIEW_BASE}/${entry.previewFile}` : null,
        price: entry?.price ?? null,
        checkoutUrl: entry?.checkoutUrl ?? null,
        metallicsNote: size === 408,
      };
    });
  }

  return LANGUO_VARIANTS.map(({ key, label }) => {
    const entry = data[key];
    return {
      variantKey: key,
      label,
      previewUrl: entry ? `${PREVIEW_BASE}/${entry.previewFile}` : null,
      price: entry?.price ?? null,
      checkoutUrl: entry?.checkoutUrl ?? null,
    };
  });
}

// To stage a new book without publishing it yet: add its VARIANT_DATA
// above, then one entry here with `published: false`. To go live,
// flip that single value to true.
const BOOKS: BookGroup[] = [
  { id: "princess", titleKey: "princess", family: "guangna", tiles: tilesFor("princess", "guangna"), published: true },
  { id: "princessVol2", titleKey: "princessVol2", family: "guangna", tiles: tilesFor("princessVol2", "guangna"), published: true },
  { id: "great-classics-vol1", titleKey: "greatClassicsVol1", family: "guangna", tiles: tilesFor("greatClassicsVol1", "guangna"), published: true },
  { id: "great-classics-vol2", titleKey: "greatClassicsVol2", family: "guangna", tiles: tilesFor("greatClassicsVol2", "guangna"), published: true },
  { id: "great-classics-vol3", titleKey: "greatClassicsVol3", family: "guangna", tiles: tilesFor("greatClassicsVol3", "guangna"), published: false },
  { id: "great-classics-vol4", titleKey: "greatClassicsVol3", family: "guangna", tiles: tilesFor("greatClassicsVol3", "guangna"), published: false },
  { id: "princess-languo", titleKey: "princess", family: "languo", tiles: tilesFor("princessLanguo", "languo"), published: true },
  { id: "great-classics-vol1-languo", titleKey: "greatClassicsVol1", family: "languo", tiles: tilesFor("greatClassicsVol1Languo", "languo"), published: true },
  // { id: "heroes-vs-villains", titleKey: "heroesVsVillains", family: "guangna", tiles: tilesFor("heroesVsVillains", "guangna"), published: false },
];

function IntroSection() {
  const t = useTranslations("mysteryDecoder");

  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--pink)", marginBottom: 10 }}>
        {t("pageTitle")}
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--ink)", marginBottom: 18 }}>
        {t("intro")}
      </p>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--cream)",
          padding: "18px 22px",
        }}
      >
        <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--pink)", marginBottom: 10 }}>
          {t("whatsIncludedTitle")}
        </h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: "var(--ink)" }}>
          <li style={{ display: "list-item", listStyleType: "disc" }}>{t("featureA4Letter")}</li>
          <li style={{ display: "list-item", listStyleType: "disc" }}>{t("featureDualCoding")}</li>
          <li style={{ display: "list-item", listStyleType: "disc" }}>{t("featureCompleteCoverage")}</li>
          <li style={{ display: "list-item", listStyleType: "disc" }}>
            <span style={{ fontWeight: 800, color: "var(--pink)" }}>{t("featureFreePreviewLabel")}</span>{" "}
            {t("featureFreePreviewText")}
          </li>
        </ul>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12, marginBottom: 0 }}>
          {t("priceNote")}
        </p>
      </div>
    </div>
  );
}

function ResultCard({ book, tile }: { book: BookGroup; tile: DecoderTile }) {
  const t = useTranslations("mysteryDecoder");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "20px 24px",
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "white",
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 2 }}>
          {t(`books.${book.titleKey}`)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
          {tile.label}
        </div>
      </div>

      {tile.metallicsNote && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
          {t("metallicsNote")}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {tile.previewUrl ? (
          
            <a href={tile.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13, color: "var(--pink)", fontWeight: 700, textDecoration: "none",
              border: "1px solid var(--pink)", borderRadius: 8, padding: "8px 14px",
            }}
          >
            {t("freePreview")}
          </a>
        ) : (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{t("freePreview")}</span>
        )}

        {tile.checkoutUrl ? (
          
            <a href={tile.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: 13, textAlign: "center" }}
          >
            {t("buy")} · {tile.price ?? t("comingSoon")}
          </a>
        ) : (
          <span
            title={t("linkNotSetUp")}
            style={{
              padding: "8px 16px", fontSize: 13, textAlign: "center",
              borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed",
            }}
          >
            {t("buy")} · {t("linkNeeded")}
          </span>
        )}
      </div>
    </div>
  );
}

function DecoderSelector({ books }: { books: BookGroup[] }) {
  const t = useTranslations("mysteryDecoder");

  const availableFamilies = FAMILIES.filter((f) => books.some((b) => b.family === f));

  const [selectedFamily, setSelectedFamily] = useState<Family>(availableFamilies[0] ?? "guangna");
  const booksInFamily = books.filter((b) => b.family === selectedFamily);

  const [selectedBookId, setSelectedBookId] = useState<string>(booksInFamily[0]?.id ?? "");
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>(booksInFamily[0]?.tiles[0]?.variantKey ?? "");

  const selectedBook = booksInFamily.find((b) => b.id === selectedBookId) ?? booksInFamily[0];
  const selectedTile =
    selectedBook?.tiles.find((tile) => tile.variantKey === selectedVariantKey) ?? selectedBook?.tiles[0];

  // Switching brand resets book + variant to that brand's first book --
  // a book id from the old brand won't exist in the new brand's list.
  function handleFamilyChange(family: Family) {
    setSelectedFamily(family);
    const firstBook = books.filter((b) => b.family === family)[0];
    setSelectedBookId(firstBook?.id ?? "");
    setSelectedVariantKey(firstBook?.tiles[0]?.variantKey ?? "");
  }

  // Switching books resets the selected variant to that book's first
  // tile -- a Guangna size like "360" has no matching tile on a
  // Languo-family book and vice versa.
  function handleBookChange(book: BookGroup) {
    setSelectedBookId(book.id);
    setSelectedVariantKey(book.tiles[0]?.variantKey ?? "");
  }

  if (!selectedBook || !selectedTile) {
    // Only happens if BOOKS has zero published entries -- shouldn't occur in practice.
    return null;
  }

  return (
    <div>
      <style>{`
        .decoder-step-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .decoder-family-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .decoder-family-btn {
          padding: 10px 22px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
          cursor: pointer;
        }
        .decoder-family-btn.active {
          border-color: var(--pink);
          background: var(--pink);
          color: white;
        }
        .decoder-size-select {
          width: 100%;
          max-width: 360px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 16px;
        }
      `}</style>

      {/* Step 1 -- brand/family */}
      <div className="decoder-step-label">{t("selectBrandLabel")}</div>
      <div className="decoder-family-row">
        {availableFamilies.map((family) => (
          <button
            key={family}
            type="button"
            className={`decoder-family-btn${family === selectedFamily ? " active" : ""}`}
            onClick={() => handleFamilyChange(family)}
          >
            {FAMILY_LABEL[family]}
          </button>
        ))}
      </div>

      {/* Step 2 -- book, filtered to the selected brand only. A
          dropdown rather than buttons: scales cleanly to any number of
          books with no label-wrapping/sizing to worry about as you
          add more. */}
      <div className="decoder-step-label">{t("selectBookLabel")}</div>
      <select
        className="decoder-size-select"
        value={selectedBookId}
        onChange={(e) => {
          const book = booksInFamily.find((b) => b.id === e.target.value);
          if (book) handleBookChange(book);
        }}
      >
        {booksInFamily.map((book) => (
          <option key={book.id} value={book.id}>
            {t(`books.${book.titleKey}`)}
          </option>
        ))}
      </select>

      {/* Step 3 -- size/code + result */}
      <div className="decoder-step-label">{t("selectSetLabel")}</div>
      <select
        className="decoder-size-select"
        value={selectedVariantKey}
        onChange={(e) => setSelectedVariantKey(e.target.value)}
      >
        {selectedBook.tiles.map((tile) => (
          <option key={tile.variantKey} value={tile.variantKey}>
            {tile.label}
          </option>
        ))}
      </select>

      <ResultCard book={selectedBook} tile={selectedTile} />
    </div>
  );
}

export default function MysteryDecoderPacks() {
  const t = useTranslations("mysteryDecoder");
  const publishedBooks = BOOKS.filter((book) => book.published);

  return (
    <div>
      <IntroSection />
      <DecoderSelector books={publishedBooks} />

      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 20, fontStyle: "italic" }}>
        {t("disclaimer")}
      </p>
    </div>
  );
}