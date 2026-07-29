"use client";

// Mystery Coloring Page Decoder -- pre-generated PDFs matching each
// book's own numbered color-code legend to Guangna marker codes, one
// file per book per Guangna set size. Same delivery model as
// ReadyMadePacks.tsx: static files uploaded directly to each
// LemonSqueezy variant, LS handles delivery on payment, no webhook.
//
// v2 layout: instead of one grid-of-tiles section per book (hard to
// scan, hard to extend), this is a single two-panel selector --
// left column lists the books as vertical buttons, right side is a
// Guangna-set dropdown. Selecting a book + set shows one result card
// (free preview + buy button) below. Adding a 5th/6th book is now
// just adding an entry to VARIANT_DATA + BOOKS, no new JSX section.
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
//
// Free previews live in the crea-bea-public-assets GCS bucket, under
// a new mystery-decoder/ prefix (same pattern as the existing
// examples/ and coloring-pages/ prefixes) -- upload the 20 files from
// mystery-decoder-previews.zip there before this goes live.
//
// Save this file as app/[locale]/components/MysteryDecoderPacks.tsx
//
// NEW translation keys needed under the "mysteryDecoder" namespace
// (existing keys are unchanged; these are additions for the v2 layout
// and the new intro copy -- add to en.json first, then nl/de/es/fr/it):
//   selectBookLabel, selectSetLabel, whatsIncludedTitle,
//   featureA4Letter, featureDualCoding, featureCompleteCoverage,
//   featureFreePreviewLabel, featureFreePreviewText, priceNote

import { useState } from "react";
import { useTranslations } from "next-intl";

interface DecoderTile {
  size: number; // Guangna set size: 168 / 240 / 288 / 360 / 408 / 366
  previewUrl: string | null; // static free page-1-preview PDF path
  price: string | null; // null = not priced yet, shows "comingSoon"
  checkoutUrl: string | null;
  metallicsNote?: boolean; // true for GN408 -- shows the "reuses 360 match" note
}

interface BookGroup {
  id: string;
  titleKey: string; // translation key under mysteryDecoder.books
  tiles: DecoderTile[];
}

const SET_SIZES = [168, 240, 288, 360, 408, 366];

const PREVIEW_BASE = "https://storage.googleapis.com/crea-bea-public-assets/mystery-decoder";

// ---- Real LemonSqueezy variant data, from her 2026-07-28 export ----
// "360" and "408" intentionally share the same checkout link/price AND
// the same preview file (GN408 reuses the GN360 match, per her decision).
interface VariantEntry {
  price: string;
  checkoutUrl: string | null;
  previewFile: string; // filename only, resolved against PREVIEW_BASE below
}

const VARIANT_DATA: Record<string, Partial<Record<number, VariantEntry>>> = {
  princess: {
    168: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/1299349d-710e-4662-ba4e-3e371fcd31b7", previewFile: "princess-gn168-preview.pdf" },
    240: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/89d7b72d-4134-4946-a2ab-49850fe5ef37", previewFile: "princess-gn240-preview.pdf" },
    288: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/a0435873-b9ef-4651-a783-14f1b2a57f66", previewFile: "princess-gn288-preview.pdf" },
    360: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3ddef4d6-a458-4e01-8d24-e646f7d68d49", previewFile: "princess-gn360-preview.pdf" },
    408: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/3ddef4d6-a458-4e01-8d24-e646f7d68d49", previewFile: "princess-gn360-preview.pdf" },
    366: { price: "7,50€", checkoutUrl: "https://creabeastudio.lemonsqueezy.com/checkout/buy/f80f9c69-6b46-4915-9e17-e435316c7690", previewFile: "princess-gn366-preview.pdf" },
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
};

function tilesFor(bookId: string): DecoderTile[] {
  const data = VARIANT_DATA[bookId] ?? {};
  return SET_SIZES.map((size) => {
    const entry = data[size];
    return {
      size,
      previewUrl: entry ? `${PREVIEW_BASE}/${entry.previewFile}` : null,
      price: entry?.price ?? null,
      checkoutUrl: entry?.checkoutUrl ?? null,
      metallicsNote: size === 408,
    };
  });
}

// Starting scope: 4 books. To add a 5th: add its VARIANT_DATA entry
// above, then one line here -- no JSX changes needed.
const BOOKS: BookGroup[] = [
  { id: "princess", titleKey: "princess", tiles: tilesFor("princess") },
  { id: "great-classics-vol1", titleKey: "greatClassicsVol1", tiles: tilesFor("greatClassicsVol1") },
  { id: "great-classics-vol2", titleKey: "greatClassicsVol2", tiles: tilesFor("greatClassicsVol2") },
  { id: "great-classics-vol3", titleKey: "greatClassicsVol3", tiles: tilesFor("greatClassicsVol3") },
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
          Guangna {tile.size}
        </div>
      </div>

      {tile.metallicsNote && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
          {t("metallicsNote")}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {tile.previewUrl ? (
          <a
            href={tile.previewUrl}
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
          <a
            href={tile.checkoutUrl}
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

function DecoderSelector() {
  const t = useTranslations("mysteryDecoder");
  const [selectedBookId, setSelectedBookId] = useState<string>(BOOKS[0].id);
  const [selectedSize, setSelectedSize] = useState<number>(SET_SIZES[0]);

  const selectedBook = BOOKS.find((b) => b.id === selectedBookId) ?? BOOKS[0];
  const selectedTile = selectedBook.tiles.find((tile) => tile.size === selectedSize) ?? selectedBook.tiles[0];

  return (
    <div>
      <style>{`
        .decoder-selector-grid {
          display: grid;
          grid-template-columns: 270px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .decoder-selector-grid { grid-template-columns: 1fr; }
        }
        .decoder-book-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 14px 16px;
          margin-bottom: 8px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
          color: var(--ink);
          cursor: pointer;
        }
        .decoder-book-btn.active {
          border-color: var(--pink);
          background: var(--pink);
          color: white;
        }
        .decoder-size-select {
          width: 100%;
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

      <div className="decoder-selector-grid">
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>
            {t("selectBookLabel")}
          </div>
          {BOOKS.map((book) => (
            <button
              key={book.id}
              type="button"
              className={`decoder-book-btn${book.id === selectedBookId ? " active" : ""}`}
              onClick={() => setSelectedBookId(book.id)}
            >
              {t(`books.${book.titleKey}`)}
            </button>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>
            {t("selectSetLabel")}
          </div>
          <select
            className="decoder-size-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value))}
          >
            {SET_SIZES.map((size) => (
              <option key={size} value={size}>
                Guangna {size}
              </option>
            ))}
          </select>

          <ResultCard book={selectedBook} tile={selectedTile} />
        </div>
      </div>
    </div>
  );
}

export default function MysteryDecoderPacks() {
  const t = useTranslations("mysteryDecoder");

  return (
    <div>
      <IntroSection />
      <DecoderSelector />

      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 20, fontStyle: "italic" }}>
        {t("disclaimer")}
      </p>
    </div>
  );
}