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

const GUANGNA_SET_SIZES = [168, 240, 288, 360, 408, 366, "HG-168"];

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
  "HG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/95ff3bab-ee9d-4ab1-b61a-0c33caef90a6", previewFile: "Princess_Vol1_HG168_preview.pdf" },
  },
  greatClassicsVol1: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4611ab6b-ae98-4927-a099-fbd6c0a74058", previewFile: "great-classics-vol1-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/86cee6dc-0863-417e-9dbe-0bf2dcea667c", previewFile: "great-classics-vol1-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9bab1238-c909-4640-8406-aebb99964251", previewFile: "great-classics-vol1-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1591367b-67cb-4fee-8bf3-8ad27ebc7f31", previewFile: "great-classics-vol1-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1591367b-67cb-4fee-8bf3-8ad27ebc7f31", previewFile: "great-classics-vol1-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ef5abf47-8043-4cae-8686-d8ea0b0930f3", previewFile: "great-classics-vol1-gn366-preview.pdf" },
  "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/5049a9b9-03f0-45ff-8f3f-b9a8bd020d48",previewFile: "great_classics_vol1_HG168_preview.pdf" },
  },
  greatClassicsVol2: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c3976664-f946-420a-b6b1-691edb527048", previewFile: "great-classics-vol2-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d0521dab-3d26-49ac-802c-8684f9568cc7", previewFile: "great-classics-vol2-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f4592d23-d6f7-4ff9-91d5-2d2aac3e5300", previewFile: "great-classics-vol2-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5d045a18-28bd-456c-a432-80c5f32c0639", previewFile: "great-classics-vol2-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5d045a18-28bd-456c-a432-80c5f32c0639", previewFile: "great-classics-vol2-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8e3c80aa-9352-42c0-a19c-c19df65fc8f6", previewFile: "great-classics-vol2-gn366-preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/50334cc8-a528-4b9c-843b-1202c7ca6a3a",previewFile: "great_classics_vol2_HG168_preview.pdf" },
  },
  greatClassicsVol3: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a4ffa8cc-edd8-470a-a738-cb539bb356e5", previewFile: "great-classics-vol3-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c1b86983-16e3-4f70-b25f-3526373e2bd6", previewFile: "great-classics-vol3-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9689138d-a2d6-458d-bc08-e8a3b491b405", previewFile: "great-classics-vol3-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/09a8d742-26be-448b-90d3-f01b64a93590", previewFile: "great-classics-vol3-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/09a8d742-26be-448b-90d3-f01b64a93590", previewFile: "great-classics-vol3-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a126b924-c8a8-4e02-874a-bfcc41962e5b", previewFile: "great-classics-vol3-gn366-preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/14c982e3-6436-414f-8e65-6dc75bc7589b",previewFile: "great_classics_vol3_HG168_preview.pdf" },
  },
  greatClassicsVol4: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e7761efe-6c11-4bf5-ae6d-539f0724910d", previewFile: "Great_Classics_Vol4_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/58d531e4-23d0-4cc5-bfe3-5be0ce2cc1e2", previewFile: "Great_Classics_Vol4_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/697098bd-04bb-458e-9f95-875bfa93ed9f", previewFile: "Great_Classics_Vol4_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/50bde7b4-d50a-4a26-ae0a-95e5a123e94a", previewFile: "Great_Classics_Vol4_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/50bde7b4-d50a-4a26-ae0a-95e5a123e94a", previewFile: "Great_Classics_Vol4_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/fcbf9f91-f7b7-430d-b074-9b72b59a725c", previewFile: "Great_Classics_Vol4_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/aca53eee-f28e-4245-92d6-6053981da01c",previewFile: "Great_Classics_Vol4_HG168_preview.pdf" },
  },
  princessVol2: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/15bdfc0c-6166-4954-853b-f144bbc9b4bf", previewFile: "Princess_Vol2_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1c03f51e-1326-439b-b764-2174c78f79b7", previewFile: "Princess_Vol2_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9bddedba-de7d-422a-bdd3-6b078e507018", previewFile: "Princess_Vol2_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2536d85b-bb10-4e23-b22b-3585413cd7a4", previewFile: "Princess_Vol2_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2536d85b-bb10-4e23-b22b-3585413cd7a4", previewFile: "Princess_Vol2_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/05866ea0-bd22-48b0-b086-1aaf3c9a7fbb", previewFile: "Princess_Vol2_GN366_preview.pdf" },
    "HG-168": {price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d95829e9-04f1-4997-9e26-c9a00222269d", previewFile: "Princess_Vol2_HG168_preview.pdf"}
  },
  greatClassicsVol11: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/05e94d07-785a-4f59-947a-9ebe9ac134f4", previewFile: "Great_Classics_Vol11_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c9c17d4f-e3ef-45be-8c90-2887448f4450", previewFile: "Great_Classics_Vol11_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0f1e5b0e-0485-407a-8939-08c3dccbff3f", previewFile: "Great_Classics_Vol11_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0f12e095-ea31-4605-8291-3b4b2c9829b0", previewFile: "Great_Classics_Vol11_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0f12e095-ea31-4605-8291-3b4b2c9829b0", previewFile: "Great_Classics_Vol11_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/60fe4172-43cd-4b31-84ca-f34e63ad343e", previewFile: "Great_Classics_Vol11_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/2a0fc7b4-bdd8-4f36-94aa-786af15c7b54",previewFile: "Great_Classics_Vol11_HG168_preview.pdf" },
  },
  greatClassicsVol13: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f1469b3b-6323-411e-ae24-94aaea8c45db", previewFile: "Great_Classics_Vol13_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/dbb5a50a-9312-459e-85e2-02f04ce9d092", previewFile: "Great_Classics_Vol13_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/cd9faf40-90e7-413f-b0f5-b66844579b8a", previewFile: "Great_Classics_Vol13_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3f5a85e7-0748-4dc2-990f-868bdd05742e", previewFile: "Great_Classics_Vol13_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3f5a85e7-0748-4dc2-990f-868bdd05742e", previewFile: "Great_Classics_Vol13_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/03bbcdf2-56d7-46dd-8970-d93dbf50a225", previewFile: "Great_Classics_Vol13_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/ac88c888-86c6-4bf8-86d0-5fca52215c3c",previewFile: "Great_Classics_Vol13_HG168_preview.pdf" },
  },
  fantastiques: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ea84d4f1-40e5-4f67-a531-86cedba28505", previewFile: "Fantastiques_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ac63a34d-b034-4bc8-9d8c-5542cdcc868b", previewFile: "Fantastiques_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/dfc85ed5-5b4d-4518-959d-6b75bed5d451", previewFile: "Fantastiques_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8f13ca8d-c453-4302-a52a-950065bc91b7", previewFile: "Fantastiques_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8f13ca8d-c453-4302-a52a-950065bc91b7", previewFile: "Fantastiques_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2e1e90fa-b9ed-4608-b337-56020f59c5c2", previewFile: "Fantastiques_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/b9794ff7-f295-4e32-8c08-3700b2049504",previewFile: "Fantastiques_HG168_preview.pdf" },
  },
  tresgrandsclassiques: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/cd0eedf1-6b66-4c59-8cb0-a6b5c5d2780c", previewFile: "Tres_Grands_Classiques_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4535dbcb-972a-4eb9-9f73-c27197853796", previewFile: "Tres_Grands_Classiquess_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/598cfb67-0af5-4458-919b-845e51a9c697", previewFile: "Tres_Grands_Classiques_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7a76f04d-c342-4695-b68e-8ec1d4be1ae4", previewFile: "Tres_Grands_Classiques_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7a76f04d-c342-4695-b68e-8ec1d4be1ae4", previewFile: "Tres_Grands_Classiques_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/88d5c79a-3362-4f5e-b2ed-8f007f74eb1b", previewFile: "Tres_Grands_Classiques_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/91c20186-3ccf-4f95-a4b6-5f14c4a5a3e2",previewFile: "Tres_Grands_Classiques_HG168_preview.pdf" },
  },
  herosvillains: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f7edcbaa-2d54-415f-ae05-35c0e1746ed1", previewFile: "Heros_Villains_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/35a24205-b0e1-477e-a214-ba6faf2bbe7c", previewFile: "Heros_Villains_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5242f088-f067-48cd-ac1b-9a50da1578c5", previewFile: "Heros_Villains_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7b604fc3-37e9-4295-8ca0-b55686d7959c", previewFile: "Heros_Villains_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7b604fc3-37e9-4295-8ca0-b55686d7959c", previewFile: "Heros_Villains_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b3148f99-3917-41b2-b312-c85de71cc2ab", previewFile: "Heros_Villains_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/9f6c70c4-1fa3-4949-bab9-fb8369502b68",previewFile: "Heros_Villains_HG168_preview.pdf" },
  },
  mondesfantastiques: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5b6120de-6a18-41ff-81d6-a21621b2b614", previewFile: "Mondes_fantastiques_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f30a0571-47c1-42e4-8d5a-a25fb478df86", previewFile: "Mondes_fantastiques_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b70e8ca8-531d-4fdb-a65d-4101a7ddf43e", previewFile: "Mondes_fantastiques_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4d030234-b3c2-4f7f-90bc-c2a94206d0ee", previewFile: "Mondes_fantastiques_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4d030234-b3c2-4f7f-90bc-c2a94206d0ee", previewFile: "Mondes_fantastiques_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/18674d9a-c07d-44cc-a425-715384352148", previewFile: "Mondes_fantastiques_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/4d208ed5-50b8-4a26-ba26-0058d1187106",previewFile: "Mondes_fantastiques_HG168_preview.pdf" },
  },
  specialportraits: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/efd0e3a4-e3ed-48a9-823d-0a898899583e", previewFile: "Special-Portraits_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e7e26b7d-0c21-439b-8f60-db807dae4024", previewFile: "Special-Portraits_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1ed46908-cda4-42eb-86f1-5f99e703f00f", previewFile: "Special-Portraits_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8633037a-21b6-442d-bcc2-958a5d6143da", previewFile: "Special-Portraits_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8633037a-21b6-442d-bcc2-958a5d6143da", previewFile: "Special-Portraits_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d3dd8081-560e-49b9-b7c3-a9b235ff0ea3", previewFile: "Special-Portraits_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/33c65205-deb4-4eff-846d-13da0d1cf9f7",previewFile: "Special_Portraits_HG168_preview.pdf" },
  },
  pokemon: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e5ac92fd-b7f0-485c-b74f-c2a8348c3207", previewFile: "Pokemon_GN168_preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b27227b1-6923-4eee-add1-24285378d045", previewFile: "Pokemon_GN240_preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5cc50c83-1025-4772-a815-91046d7146b2", previewFile: "Pokemon_GN288_preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f78bcc7d-44b9-49ba-b5f7-05748cb53a01", previewFile: "Pokemon_GN360_preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f78bcc7d-44b9-49ba-b5f7-05748cb53a01", previewFile: "Pokemon_GN360_preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e09a3230-82ed-456e-b1aa-9cd7d10ba70a", previewFile: "Pokemon_GN366_preview.pdf" },
    "HG-168": { price: "7,50€", checkoutUrl:"https://creabeastudio.lemonsqueezy.com/checkout/buy/23f94cba-125a-4a5c-b126-c13facb03e7a",previewFile: "Pokemon_HG168_preview.pdf" },
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
  princessVol2Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/bc2eebae-6f7f-4513-9943-143809c6ec1b", previewFile: "Princess_Vol2_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/e2bd2cd4-fc1f-48b9-8918-366a267ee345", previewFile: "Princess_Vol2_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5ac3660c-30b3-43ed-9eb9-78734754ef7b", previewFile: "Princess_Vol2_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1fd1093c-498a-42d6-b5f3-aeb528f20e40", previewFile: "Princess_Vol2_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8de79352-d4fc-4ce6-91bd-7a8e470ca1f2", previewFile: "Princess_Vol2_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b3c95da8-7681-4fd0-80ec-191b3d4b19de", previewFile: "Princess_Vol2_LGP288_preview.pdf" },
  },
  greatClassicsVol1Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d5f4ff62-f6de-4afa-8432-f6778a1a0109", previewFile: "Great_Classics _Vol1_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/cb60b8a3-2d84-402b-8c38-86156a33e164", previewFile: "Great_Classics _Vol1_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/86a1879a-ca64-4d99-a66e-0becaa4b5208", previewFile: "Great_Classics _Vol1_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/10c4ef76-c939-4933-9dd7-dcd530f0e80f", previewFile: "Great_Classics _Vol1_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/62e01fb6-e403-43f3-b300-606fd48508f7", previewFile: "Great_Classics _Vol1_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0fb992dc-9bf9-4dbf-a6ad-3a1f67264d93", previewFile: "Great_Classics _Vol1_LGP288_preview.pdf" },
  },
  greatClassicsVol2Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/bd44afbf-23bc-47a0-8dec-3909a77d5156", previewFile: "Great_Classics_Vol2_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/936f7f25-c247-4773-a3ff-144033d66efd", previewFile: "Great_Classics_Vol2_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/18a6790e-f809-465b-bfc7-a38b5c945a2c", previewFile: "Great_Classics_Vol2_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/aff7cca2-bc4e-4fab-ad3b-1b1946663609", previewFile: "Great_Classics_Vol2_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/8d8ca237-4c5e-4f0b-b00d-5a99d8b37cb0", previewFile: "Great_Classics_Vol2_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/553e9a5d-41d5-4ff9-aa79-feb7a003528d", previewFile: "Great_Classics_Vol2_LGP288_preview.pdf" },
  },
  greatClassicsVol3Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/87df7cf7-16ab-4a3a-b9a8-bfe48b17164a", previewFile: "Great_Classics_Vol3_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b6541ea4-6756-4005-a3ae-958e774b8bc5", previewFile: "Great_Classics_Vol3_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/65b36d19-98f5-498b-8c86-d28be8e874e9", previewFile: "Great_Classics_Vol3_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/49d0d251-d360-45b6-9306-a2d8bed56868", previewFile: "Great_Classics_Vol3_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/333ec572-7243-45e8-af8a-4aafba78e90b", previewFile: "Great_Classics_Vol3_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f6a8bbb0-2261-4d0b-87e6-3c33b5986404", previewFile: "Great_Classics_Vol3_LGP288_preview.pdf" },
  },
  greatClassicsVol4Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/aa6c42ce-315b-40f6-8dc4-2662ce9341ba", previewFile: "Great_Classics_Vol4_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/abfa01d9-5bf8-4cc8-ae74-479dc18649fe", previewFile: "Great_Classics_Vol4_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/cc2a3081-985a-4915-8dbb-289f77d173c9", previewFile: "Great_Classics_Vol4_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4a23ec36-7c62-49a8-b81a-76ba18f378f4", previewFile: "Great_Classics_Vol4_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7941b360-256e-48b4-87dd-c0c14d15f3e4", previewFile: "Great_Classics_Vol4_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/639c857a-59f7-42cf-97d1-f9ff8eed463c", previewFile: "Great_Classics_Vol4_LGP288_preview.pdf" },
  },
  greatClassicsVol11Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/70ce63f1-af9b-45a0-8514-080f08b7a6bd", previewFile: "Great_Classics_Vol11_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/660f6890-2de5-4528-bd83-a6496a24e00f", previewFile: "Great_Classics_Vol11_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9cdbe77e-ba18-4ff0-84d9-36477fa59405", previewFile: "Great_Classics_Vol11_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9b54b93e-ddfb-49d6-bb39-73c3dd9fdc54", previewFile: "Great_Classics_Vol11_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/89653fce-48a0-4ff1-a67c-64c3f591a0d5", previewFile: "Great_Classics_Vol11_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9f98581d-1821-4270-ad85-28ad7104780f", previewFile: "Great_Classics_Vol11_LGP288_preview.pdf" },
  },
  greatClassicsVol13Languo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/15f89ab2-facd-4daf-b258-bec507f40e59", previewFile: "Great_Classics_Vol13_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3d06aabf-eed8-45b1-8bc5-9ff8db9f40a3", previewFile: "Great_Classics_Vol13_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b50d2ec5-6321-4076-a1b5-3183a0dc7796", previewFile: "Great_Classics_Vol13_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/9a974a66-ca68-448c-ab61-ce9390e54e1c", previewFile: "Great_Classics_Vol13_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/fa2bc260-c265-4531-963b-3f30fa105693", previewFile: "Great_Classics_Vol13_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/fbe8409f-bbd9-4892-9a77-a708e1362ec2", previewFile: "Great_Classics_Vol13_LGP288_preview.pdf" },
  },
  fantastiquesLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/79df15d4-8d6c-4f72-b260-5c0c4c903ffe", previewFile: "Fantastiques_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7a1f6f24-35d0-4922-a47e-78e38dd78e6e", previewFile: "Fantastiques_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/88246c26-a3a0-420e-af1e-37e0c162286a", previewFile: "Fantastiques_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d51a2074-cb89-4631-85e5-4f4621224db3", previewFile: "Fantastiques_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/5ba33d14-c3d2-4f84-bc86-29d8efa31e35", previewFile: "Fantastiques_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2b24a959-a2fd-4365-a2b2-100466c9d4da", previewFile: "Fantastiques_LGP288_preview.pdf" },
  },
  tresgrandsclassiquesLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3a703738-3b6a-4bfc-9eaa-e70045abd97f", previewFile: "Tres_Grands_Classiques_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d326798b-3102-45ec-b7ab-17fc64e006a2", previewFile: "Tres_Grands_Classiques_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f2683821-d40d-448c-a126-3cc02768da55", previewFile: "Tres_Grands_Classiques_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/b3ebaf7a-74a0-42d9-bd39-cc77e66c4c26", previewFile: "Tres_Grands_Classiques_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d621da78-3bd6-4614-ad2a-97a4b23f919a", previewFile: "Tres_Grands_Classiques_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/c59ec75d-be90-4b4f-a2e3-65a31b3c2869", previewFile: "Tres_Grands_Classiques_LGP288_preview.pdf" },
  },
  herosvillainsLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/d37cb91f-fc74-4baf-96cf-7dcfeb60ce88", previewFile: "Heros_Villains_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1556f6c7-1222-4ebf-b01a-91452ef4005c", previewFile: "Heros_Villains_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/7dfe435c-f73c-4eac-b68e-4e5fa4c68172", previewFile: "Heros_Villains_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/969b3356-b8d5-4504-9f12-3d0f1f5e65fc", previewFile: "Heros_Villains_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/85223f36-bfd3-4f4b-b3a1-835954305b14", previewFile: "Heros_Villains_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/98d991ee-4245-4ac0-8d8f-da1c1adfd57a", previewFile: "Heros_Villains_LGP288_preview.pdf" },
  },
  mondesfantastiquesLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/2b14e1b9-7c25-48c2-9316-d63c7d77329f", previewFile: "Mondes_fantastiques_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/73847102-bbe6-4a51-9e5d-1c98f200d8ff", previewFile: "Mondes_fantastiques_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ef5c6ee2-bec0-4585-a728-c963ab494fa9", previewFile: "Mondes_fantastiques_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/552ac698-8bd0-48c4-be5d-d2c544eb730a", previewFile: "Mondes_fantastiques_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/fd6654d0-65d0-4a97-bdb8-4ba5c5527008", previewFile: "Mondes_fantastiques_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/4dda4948-375a-4fb7-b603-34b98a304845", previewFile: "Mondes_fantastiques_LGP288_preview.pdf" },
  },
  specialportraitsLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/bb280a7c-e3a1-478a-9a82-9b5df94592ea", previewFile: "Special_Portraits_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/549eaf7f-e3f4-4e20-ade2-5b50149c6ebc", previewFile: "Special_Portraits_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/af398e46-05fe-4250-9000-57dca911fe13", previewFile: "Special_Portraits_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0866e7e7-818b-4752-a338-366935fe6313", previewFile: "Special_Portraits_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/ed694290-8e60-4512-a980-0ca4b7296ebb", previewFile: "Special_Portraits_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/6433a82a-da25-4f98-b1af-a21acc95aeda", previewFile: "Special_Portraits_LGP288_preview.pdf" },
  },
  pokemonLanguo: {
    "LGG-168": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/426338bc-abd8-4592-aa89-4f0c6a8b070d", previewFile: "Pokemon_LGG168_preview.pdf" },
    "LGG-234": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/46e9d479-f41f-4fa3-9c75-ff50fafb88fd", previewFile: "Pokemon_LGG234_preview.pdf" },
    "LGP-144": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/834f8dd9-9c63-45c0-9f39-dcbf35d79af9", previewFile: "Pokemon_LGP144_preview.pdf" },
    "LGP-192": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/0a48704f-1145-47b7-a5f1-c65bced82b53", previewFile: "Pokemon_LGP192_preview.pdf" },
    "LGP-240": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/86d25c7e-18b1-4f9b-adbf-75d3b7a4d61f", previewFile: "Pokemon_LGP240_preview.pdf" },
    "LGP-288": { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/38d4fbeb-f23a-4383-afee-5dc219a01830", previewFile: "Pokemon_LGP288_preview.pdf" },
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
  { id: "great-classics-vol3", titleKey: "greatClassicsVol3", family: "guangna", tiles: tilesFor("greatClassicsVol3", "guangna"), published: true },
  { id: "great-classics-vol4", titleKey: "greatClassicsVol4", family: "guangna", tiles: tilesFor("greatClassicsVol4", "guangna"), published: true },
  { id: "great-classics-vol11", titleKey: "greatClassicsVol11", family: "guangna", tiles: tilesFor("greatClassicsVol11", "guangna"), published: true },
  { id: "great-classics-vol13", titleKey: "greatClassicsVol13", family: "guangna", tiles: tilesFor("greatClassicsVol13", "guangna"), published: true },
  { id: "princess-languo", titleKey: "princess", family: "languo", tiles: tilesFor("princessLanguo", "languo"), published: true },
  { id: "princessVol2Languo", titleKey: "princessVol2", family: "languo", tiles: tilesFor("princessVol2Languo", "languo"), published: true },
  { id: "great-classics-vol1-languo", titleKey: "greatClassicsVol1", family: "languo", tiles: tilesFor("greatClassicsVol1Languo", "languo"), published: true },
  { id: "great-classics-vol2-languo", titleKey: "greatClassicsVol2", family: "languo", tiles: tilesFor("greatClassicsVol2Languo", "languo"), published: true },
  { id: "great-classics-vol3-languo", titleKey: "greatClassicsVol3", family: "languo", tiles: tilesFor("greatClassicsVol3Languo", "languo"), published: true },
  { id: "great-classics-vol4-languo", titleKey: "greatClassicsVol4", family: "languo", tiles: tilesFor("greatClassicsVol4Languo", "languo"), published: true },
  { id: "great-classics-vol11-languo", titleKey: "greatClassicsVol11", family: "languo", tiles: tilesFor("greatClassicsVol11Languo", "languo"), published: true },
  { id: "great-classics-vol13-languo", titleKey: "greatClassicsVol13", family: "languo", tiles: tilesFor("greatClassicsVol13Languo", "languo"), published: true },
  { id: "fantastiques", titleKey: "fantastiques", family: "guangna", tiles: tilesFor("fantastiques", "guangna"), published: true },
  { id: "fantastiqueslanguo", titleKey: "fantastiques", family: "languo", tiles: tilesFor("fantastiquesLanguo", "languo"), published: true },
  { id: "tresgrandsclassiques", titleKey: "tresgrandsclassiques", family: "guangna", tiles: tilesFor("tresgrandsclassiques", "guangna"), published: true },
  { id: "tresgrandsclassiqueslanguo", titleKey: "tresgrandsclassiques", family: "languo", tiles: tilesFor("tresgrandsclassiquesLanguo", "languo"), published: true },
  { id: "herosvillains", titleKey: "herosvillains", family: "guangna", tiles: tilesFor("herosvillains", "guangna"), published: true },
  { id: "herosvillainslanguo", titleKey: "herosvillains", family: "languo", tiles: tilesFor("herosvillainsLanguo", "languo"), published: true },
  { id: "mondesfantastiques", titleKey: "mondesfantastiques", family: "guangna", tiles: tilesFor("mondesfantastiques", "guangna"), published: true },
  { id: "mondesfantastiqueslanguo", titleKey: "mondesfantastiques", family: "languo", tiles: tilesFor("mondesfantastiquesLanguo", "languo"), published: true },
  { id: "specialportraits", titleKey: "specialportraits", family: "guangna", tiles: tilesFor("specialportraits", "guangna"), published: true },
  { id: "specialportraitslanguo", titleKey: "specialportraits", family: "languo", tiles: tilesFor("specialportraitsLanguo", "languo"), published: true },
  { id: "pokemon", titleKey: "pokemon", family: "guangna", tiles: tilesFor("pokemon", "guangna"), published: true },
  { id: "pokemonlanguo", titleKey: "pokemon", family: "languo", tiles: tilesFor("pokemonLanguo", "languo"), published: true },
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