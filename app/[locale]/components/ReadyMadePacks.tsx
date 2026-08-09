"use client";

// Ready-made Swatch Card packs, shown as a full-width 3x3 grid, now
// ABOVE the DIY tool itself (moved 2026-07-24 -- SwatchCreator.tsx
// renders this first, before its own intro/builder).
//
// v4 change (2026-08-09): added a second, separate grid below the
// original single-brand one for the new "Guangna x Languo" combo
// packs (LemonSqueezy product 1277743). Combo packs mix two brands +
// two sizes into one pack (e.g. "Guangna 366 x Languo 288"), which
// doesn't fit the original Pack shape (one brand, one size) -- so
// they get their own ComboPack type, COMBO_PACKS array, and
// ComboPackTile component, rendered as their own heading+grid inside
// the same collapsible section. Reuses the same VariantInfo shape,
// the same a4Label/usLabel/linkNeeded/linkNotSetUp translation keys,
// and the same toUsdEstimate pricing helper as the original packs.
//
// v3 change (2026-07-25, i18n round 3 -- "go big" for FR): the last
// remaining hardcoded strings on this component are now translated --
// the "Checkout link not set up yet" tooltip, the "A4"/"US" label
// prefixes, and the "Link needed" fallback text, all under new keys
// in the "readyMadePacks" namespace (linkNotSetUp, a4Label, usLabel,
// linkNeeded). Brand names ("Guangna", "Languo") stay hardcoded --
// they're product names, not UI copy, so they don't get translated.
//
// v2 changes (2026-07-24):
//   1. Collapsible (default open) -- click the heading row to
//      collapse/expand, same pattern SwatchCreator.tsx now uses for its
//      own DIY section, so the page reads as two peer collapsible
//      sections rather than one fixed block + one collapsible one.
//   2. Tiles shrunk (less padding, smaller type) per Mirjam's "make the
//      boxes smaller" request -- paired with #1 above rather than
//      choosing one or the other.
//   3. The small "{count} colors" sub-line under each tile's title is
//      gone -- the count is now folded directly into the title itself
//      ("Guangna 168 colors") by reusing the SAME t("colorCount", {count})
//      translation key inline, so no new translation keys are needed.
//   4. US Letter price now shows a prominent USD estimate with the EUR
//      price small underneath, same convention as /create and /confirm
//      (A4 stays EUR-only). See the top-level note about this file's
//      leading-€ price format vs. those pages' trailing-€ format --
//      worth a visual check once deployed.
//
// RENAME NOTE: the section heading is entirely translation-driven
// (t("heading"), no hardcoded fallback here) -- update
// readyMadePacks.heading in your locale JSON files to change the
// displayed text (e.g. to "Presorted Color Swatch Cards"); no code
// change in this file makes that happen on its own.
//
// Each pack has separate A4 and US Letter variants in LemonSqueezy (two
// different files, two different prices), so each tile renders two buy
// buttons rather than one. These are static hosted checkout links --
// https://STORE.lemonsqueezy.com/checkout/buy/VARIANT_ID -- since the
// files are already uploaded directly to each LS variant and LS handles
// delivery on payment. No webhook/backend involvement for this product.
//
// Save this file as app/[locale]/components/ReadyMadePacks.tsx

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toUsdEstimate } from "@/lib/lemonSqueezyPricing";

// LemonSqueezy's real "Checkout Link" is a per-VARIANT URL with its own
// arbitrary UUID -- {store}/checkout/buy/{VARIANT_CHECKOUT_UUID}. There
// is NO way to derive this UUID from the numeric variant ID (1939508,
// etc.) -- confirmed 2026-07-24 when three copied checkout links turned
// out to have three completely different UUIDs for three different
// variants. (The earlier "one product UUID + ?enabled=" theory was
// based on a checkout OVERLAY EMBED snippet, a different LS feature
// entirely -- that opens an inline modal pre-configured with several
// enabled variants for one product, not a link to a single variant's
// own checkout page.) checkoutUrl below is null for variants whose real
// link hasn't been supplied yet -- those render as a disabled "Link
// needed" button rather than guessing at another URL shape.
const LS_STORE = "https://creabeastudio.lemonsqueezy.com/checkout/buy";

interface VariantInfo {
  price: string;
  variantId: string;
  checkoutUrl: string | null;
}

interface Pack {
  id: string;
  brand: "guangna" | "languo";
  size: number;
  a4: VariantInfo;
  us: VariantInfo;
}

// Combo packs mix two brands/sizes into one pack (e.g. "Guangna 366 x
// Languo 288") -- doesn't fit the single-brand Pack shape above, so it
// gets its own type. LemonSqueezy product 1277743 ("Guangna x Languo
// Swatch Card Sets"), separate from the single-brand product (1240793)
// the PACKS array above belongs to.
interface ComboPack {
  id: string;
  guangnaSize: number;
  languoSize: number;
  a4: VariantInfo;
  us: VariantInfo;
}

// Order matters here -- this is exactly the 3x3 grid order (row by row).
// All 18 checkoutUrl values confirmed 2026-07-24 via her full LemonSqueezy
// export table -- checked for duplicate UUIDs across variants, none found.
const PACKS: Pack[] = [
  { id: "guangna-168", brand: "guangna", size: 168,
    a4: { price: "3,75€", variantId: "1939508", checkoutUrl: `${LS_STORE}/72b8c027-e18e-40f4-8b5c-d81789411f31` },
    us: { price: "4,25€", variantId: "1939510", checkoutUrl: `${LS_STORE}/34b7b17f-920d-4869-bde2-1d063f6c2926` } },
  { id: "guangna-240", brand: "guangna", size: 240,
    a4: { price: "4,00€", variantId: "1939520", checkoutUrl: `${LS_STORE}/85d5e0ec-3800-4749-a087-a2b2c5b6f527` },
    us: { price: "4,50€", variantId: "1939521", checkoutUrl: `${LS_STORE}/f2445a5a-d574-4faa-a7f0-3cff906bc5cb` } },
  { id: "guangna-288", brand: "guangna", size: 288,
    a4: { price: "4,25€", variantId: "1939522", checkoutUrl: `${LS_STORE}/33d71a68-4aad-4293-bbf2-3dd7f5c3dc78` },
    us: { price: "4,75€", variantId: "1939524", checkoutUrl: `${LS_STORE}/f8a6cc2c-a9f6-4f87-9c9d-aa1137a91912` } },
  { id: "guangna-360", brand: "guangna", size: 360,
    a4: { price: "4,50€", variantId: "1939530", checkoutUrl: `${LS_STORE}/6de39f85-66be-435e-9bc1-adbba40de808` },
    us: { price: "5,00€", variantId: "1939531", checkoutUrl: `${LS_STORE}/a3e220fb-43f9-48d3-8dc0-085902f64abc` } },
  { id: "guangna-366", brand: "guangna", size: 366,
    a4: { price: "4,75€", variantId: "1939536", checkoutUrl: `${LS_STORE}/507a3c67-4d73-4bea-94ed-1948a7a7eba3` },
    us: { price: "5,50€", variantId: "1939545", checkoutUrl: `${LS_STORE}/812cb493-439f-47f3-97a1-758d32c76d96` } },
  { id: "guangna-408", brand: "guangna", size: 408,
    a4: { price: "5,50€", variantId: "1939551", checkoutUrl: `${LS_STORE}/7c3c3c14-75cb-4fca-ae80-e798bd6e3af3` },
    us: { price: "6,25€", variantId: "1939553", checkoutUrl: `${LS_STORE}/c2cded40-5442-4970-a1e4-3746d6730c16` } },
  { id: "languo-192", brand: "languo", size: 192,
    a4: { price: "3,75€", variantId: "1939556", checkoutUrl: `${LS_STORE}/2fa0a10a-a9f9-498b-a56c-c10835b93f89` },
    us: { price: "4,25€", variantId: "1939558", checkoutUrl: `${LS_STORE}/c14817c3-180d-45fa-a561-ac4b8faa3191` } },
  { id: "languo-240", brand: "languo", size: 240,
    a4: { price: "4,00€", variantId: "1939561", checkoutUrl: `${LS_STORE}/45d1c9be-44e9-4107-8c1a-2d0f5f13c27e` },
    us: { price: "4,50€", variantId: "1939576", checkoutUrl: `${LS_STORE}/94f6ea33-43ec-4b10-b9f7-cc97cf42e4d0` } },
  { id: "languo-288", brand: "languo", size: 288,
    a4: { price: "4,25€", variantId: "1939578", checkoutUrl: `${LS_STORE}/7e8f1b95-d925-407c-8899-9a37497d9604` },
    us: { price: "4,75€", variantId: "1939581", checkoutUrl: `${LS_STORE}/2d49e4ec-c6f9-47c6-a20f-c644b1203980` } },
];

// New "Guangna x Languo" combo packs (LemonSqueezy product 1277743),
// added 2026-08-09. All 4 checkoutUrls confirmed unique (no collision
// with each other or with the PACKS array above).
const COMBO_PACKS: ComboPack[] = [
  { id: "guangna366-languo288", guangnaSize: 366, languoSize: 288,
    a4: { price: "8,00€", variantId: "1997612", checkoutUrl: `${LS_STORE}/46793ab0-be98-4658-8d6e-f68fa3ffcc55` },
    us: { price: "9,00€", variantId: "1997631", checkoutUrl: `${LS_STORE}/1968a94d-dc6e-4196-8d5b-34793c02ad12` } },
  { id: "guangna360-languo288", guangnaSize: 360, languoSize: 288,
    a4: { price: "8,00€", variantId: "1997632", checkoutUrl: `${LS_STORE}/c1858019-593f-4319-ae2f-5bc28c240be6` },
    us: { price: "9,00€", variantId: "1997633", checkoutUrl: `${LS_STORE}/ccc244a0-650e-455a-b827-f139fec93a17` } },
];

const BRAND_LABEL: Record<Pack["brand"], string> = {
  guangna: "Guangna",
  languo: "Languo",
};

function PackTile({ pack }: { pack: Pack }) {
  const t = useTranslations("readyMadePacks");
  // Title now carries the color count itself ("Guangna 168 colors")
  // instead of a separate smaller sub-line -- reuses the existing
  // colorCount translation key (already handles pluralization per
  // locale) rather than needing a new key.
  const title = `${BRAND_LABEL[pack.brand]} ${t("colorCount", { count: pack.size })}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "white",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{title}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {pack.a4.checkoutUrl ? (
          <a
            href={pack.a4.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center" }}
          >
            {t("a4Label")} · {pack.a4.price}
          </a>
        ) : (
          <span
            title={t("linkNotSetUp")}
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center", borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed" }}
          >
            {t("a4Label")} · {t("linkNeeded")}
          </span>
        )}
        {/* US Letter: USD prominent, EUR small underneath -- same
            convention as /create and /confirm's paper-size pricing. */}
        {pack.us.checkoutUrl ? (
          <a
            href={pack.us.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            }}
          >
            <span style={{ fontWeight: 800 }}>{t("usLabel")} · {toUsdEstimate(pack.us.price)}</span>
            <span style={{ fontSize: 9.5, opacity: 0.85 }}>≈ {pack.us.price}</span>
          </a>
        ) : (
          <span
            title={t("linkNotSetUp")}
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center", borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed" }}
          >
            {t("usLabel")} · {t("linkNeeded")}
          </span>
        )}
      </div>
    </div>
  );
}

// Same tile layout as PackTile, but the title combines both brands/sizes
// ("Guangna 366 x Languo 288") instead of one brand's colorCount string.
function ComboPackTile({ pack }: { pack: ComboPack }) {
  const t = useTranslations("readyMadePacks");
  const title = `Guangna ${pack.guangnaSize} x Languo ${pack.languoSize}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "white",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{title}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {pack.a4.checkoutUrl ? (
          <a
            href={pack.a4.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center" }}
          >
            {t("a4Label")} · {pack.a4.price}
          </a>
        ) : (
          <span
            title={t("linkNotSetUp")}
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center", borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed" }}
          >
            {t("a4Label")} · {t("linkNeeded")}
          </span>
        )}
        {pack.us.checkoutUrl ? (
          <a
            href={pack.us.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            }}
          >
            <span style={{ fontWeight: 800 }}>{t("usLabel")} · {toUsdEstimate(pack.us.price)}</span>
            <span style={{ fontSize: 9.5, opacity: 0.85 }}>≈ {pack.us.price}</span>
          </a>
        ) : (
          <span
            title={t("linkNotSetUp")}
            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center", borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed" }}
          >
            {t("usLabel")} · {t("linkNeeded")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReadyMadePacks() {
  const t = useTranslations("readyMadePacks");
  // Collapsible, default open (2026-07-24) -- same pattern
  // SwatchCreator.tsx uses for its own DIY section below, so the page
  // reads as two peer collapsible sections.
  const [open, setOpen] = useState(true);

  return (
    <div style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
      <style>{`
        .ready-packs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 700px) { .ready-packs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .ready-packs-grid { grid-template-columns: 1fr; } }
      `}</style>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          textAlign: "left", marginBottom: open ? 6 : 0,
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: 15, color: "var(--pink)", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }}>
          ▾
        </span>
        <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 17, color: "var(--pink)", margin: 0 }}>
          {t("heading")}
        </h3>
      </button>
      {open && (
        <>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
            {t("description")}
          </p>
          <div className="ready-packs-grid">
            {PACKS.map((p) => <PackTile key={p.id} pack={p} />)}
          </div>

          {/* Combo packs -- separate sub-heading + grid, same collapsible
              section. Sub-heading text is a new translation key
              (readyMadePacks.comboHeading); no separate description line,
              reuses the same disclaimer below for both grids. */}
          <h4 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 14, color: "var(--pink)", margin: "18px 0 10px" }}>
            {t("comboHeading")}
          </h4>
          <div className="ready-packs-grid">
            {COMBO_PACKS.map((p) => <ComboPackTile key={p.id} pack={p} />)}
          </div>

          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 14, fontStyle: "italic" }}>
            {t("disclaimer")}
          </p>
        </>
      )}
    </div>
  );
}