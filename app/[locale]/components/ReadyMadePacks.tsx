"use client";

// Ready-made Swatch Card packs, shown as a full-width grid, ABOVE the DIY
// tool itself (moved 2026-07-24 -- SwatchCreator.tsx renders this first,
// before its own intro/builder).
//
// v6 change: combo packs are now generic. Each combo has a `first` and a
// `second` part, and each part has its own brand, size and optional
// variant (HG / GP). So a combo can be Guangna+Languo, Languo+Languo or
// Guangna+Guangna. The title is built from the two parts, e.g.
// "Languo 384 x Languo 168 Gel Pens". Also: the A4 / US Letter buy
// buttons are now one shared BuyButtons component used by both tile types.
//
// v5 change: the two Guangna High Gloss (HG) packs (168 and 288) were
// already in PACKS but showed the exact same title as the standard 168
// and 288 tiles. Pack has an optional `variant` field; when set, the tile
// title gets a " · High Gloss" / " · Gel Pens" suffix. These are product
// names, so they are hardcoded (like "Guangna"/"Languo"), not translated.
//
// v4 change (2026-08-09): added a second, separate grid below the
// original single-brand one for combo packs (LemonSqueezy product
// 1277743). Combo packs mix two sets into one pack, so they have their
// own ComboPack type, COMBO_PACKS array, and ComboPackTile component.
//
// v3 change (2026-07-25): last hardcoded strings translated (linkNotSetUp,
// a4Label, usLabel, linkNeeded) under the "readyMadePacks" namespace.
// Brand names stay hardcoded -- they're product names, not UI copy.
//
// v2 changes (2026-07-24):
//   1. Collapsible (default open) -- click the heading row to collapse.
//   2. Tiles shrunk (less padding, smaller type).
//   3. Color count folded into the title via t("colorCount", {count}).
//   4. US Letter price shows a USD estimate with the EUR price small
//      underneath (A4 stays EUR-only).
//
// RENAME NOTE: the section heading is entirely translation-driven
// (t("heading")) -- change readyMadePacks.heading in your locale JSON
// files to change the displayed text.
//
// Each pack has separate A4 and US Letter variants in LemonSqueezy (two
// files, two prices), so each tile renders two buy buttons. These are
// static hosted checkout links -- no webhook/backend involvement.
//
// Save this file as app/[locale]/components/ReadyMadePacks.tsx

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toUsdEstimate } from "@/lib/lemonSqueezyPricing";

// LemonSqueezy's real "Checkout Link" is a per-VARIANT URL with its own
// arbitrary UUID -- {store}/checkout/buy/{VARIANT_CHECKOUT_UUID}. There is
// NO way to derive this UUID from the numeric variant ID (confirmed
// 2026-07-24). checkoutUrl is null for variants whose real link hasn't
// been supplied yet -- those render as a disabled "Link needed" button.
const LS_STORE = "https://creabeastudio.lemonsqueezy.com/checkout/buy";

type Brand = "guangna" | "languo";
type PackVariant = "HG" | "GP";

interface VariantInfo {
  price: string;
  variantId: string;
  checkoutUrl: string | null;
}

interface Pack {
  id: string;
  brand: Brand;
  size: number;
  // Optional product variant. "HG" = Guangna High Gloss, "GP" = Languo
  // Gel Pens. Leave out for the standard sets.
  variant?: PackVariant;
  a4: VariantInfo;
  us: VariantInfo;
}

// One half of a combo pack, e.g. { brand: "languo", size: 384 } or
// { brand: "languo", size: 168, variant: "GP" }.
interface ComboPart {
  brand: Brand;
  size: number;
  variant?: PackVariant;
}

// Combo packs mix two sets into one pack -- LemonSqueezy product 1277743
// ("Guangna x Languo Swatch Card Sets"), separate from the single-brand
// product (1240793) the PACKS array belongs to.
interface ComboPack {
  id: string;
  first: ComboPart;
  second: ComboPart;
  a4: VariantInfo;
  us: VariantInfo;
}

// Order matters here -- this is the grid order (row by row).
// All checkoutUrl values were checked for duplicate UUIDs across variants.
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
  { id: "guangna-488", brand: "guangna", size: 488,
    a4: { price: "6,25€", variantId: "1939519", checkoutUrl: `${LS_STORE}/97f82c22-48db-44e9-9a75-464945f53fb7` },
    us: { price: "7,00€", variantId: "2232729", checkoutUrl: `${LS_STORE}/b89bd2c4-62a7-4bf3-91c7-0a6e96d4972a` } },
  { id: "guangna-168HG", brand: "guangna", size: 168, variant: "HG",
    a4: { price: "3,75€", variantId: "2232735", checkoutUrl: `${LS_STORE}/2c6611ec-f725-40aa-8266-75db452d0c32` },
    us: { price: "4,25€", variantId: "2232738", checkoutUrl: `${LS_STORE}/f59c6640-1ae5-4f3a-a0d6-1257e4e35a5c` } },
  { id: "guangna-288HG", brand: "guangna", size: 288, variant: "HG",
    a4: { price: "4,25€", variantId: "2232745", checkoutUrl: `${LS_STORE}/61508445-3b9d-4213-9c74-d9be76f23751` },
    us: { price: "4,75€", variantId: "2232751", checkoutUrl: `${LS_STORE}/22a612b6-5c44-4b46-9e9e-3577582f1baa` } },
  { id: "languo-192", brand: "languo", size: 192,
    a4: { price: "3,75€", variantId: "2289391", checkoutUrl: `${LS_STORE}/c2ce71cd-0504-45d0-93d3-1d9279ff1db7` },
    us: { price: "4,25€", variantId: "2289392", checkoutUrl: `${LS_STORE}/41d6cd17-8db6-49a9-a8ca-162229a33e8e` } },
  { id: "languo-240", brand: "languo", size: 240,
    a4: { price: "4,00€", variantId: "2289393", checkoutUrl: `${LS_STORE}/18530628-d639-482d-ae4e-3e848aa5367b` },
    us: { price: "4,50€", variantId: "2289394", checkoutUrl: `${LS_STORE}/93ddffec-a6bd-4111-8b1f-710685a2a393` } },
  { id: "languo-288", brand: "languo", size: 288,
    a4: { price: "4,25€", variantId: "2289395", checkoutUrl: `${LS_STORE}/8699e4e4-e8b7-4281-91b7-f41de250c615` },
    us: { price: "4,75€", variantId: "2289396", checkoutUrl: `${LS_STORE}/2a238e16-9f9c-4ebd-a221-64f7f9360cda` } },
  { id: "languo-384", brand: "languo", size: 384,
    a4: { price: "5,50€", variantId: "2289448", checkoutUrl: `${LS_STORE}/c4dc3826-1533-4449-9d54-a8f80350dfba` },
    us: { price: "6,25€", variantId: "2289444", checkoutUrl: `${LS_STORE}/02127054-0279-495e-b5b8-13ba72366506` } },
  { id: "languo-432", brand: "languo", size: 432,
    a4: { price: "6,25€", variantId: "2289451", checkoutUrl: `${LS_STORE}/67707a1a-b34d-43cf-a11b-f142a2fd934d` },
    us: { price: "7,00€", variantId: "2289452", checkoutUrl: `${LS_STORE}/b986cc31-6239-4f9d-9026-623f045229e9` } },
  { id: "languo-168GP", brand: "languo", size: 168, variant: "GP",
    a4: { price: "3,75€", variantId: "2289458", checkoutUrl: `${LS_STORE}/4875a152-372b-4a82-9928-16a4dd27105d` },
    us: { price: "4,25€", variantId: "2289460", checkoutUrl: `${LS_STORE}/59659a7f-1f72-4acc-91b0-3d47b878e794` } },
  { id: "languo-234GP", brand: "languo", size: 234, variant: "GP",
    a4: { price: "4,25€", variantId: "2289472", checkoutUrl: `${LS_STORE}/e093a44d-a44f-432e-bbf9-bc3b97f27719` },
    us: { price: "4,50€", variantId: "2289474", checkoutUrl: `${LS_STORE}/89743a78-fb01-48de-9ff0-615ff3678215` } },
];

// Combo packs (LemonSqueezy product 1277743). Each combo = two parts.
// To add e.g. a Guangna + Guangna combo:
//   first: { brand: "guangna", size: 366 },
//   second: { brand: "guangna", size: 168, variant: "HG" },
const COMBO_PACKS: ComboPack[] = [
  { id: "guangna366-languo288",
    first: { brand: "guangna", size: 366 },
    second: { brand: "languo", size: 288 },
    a4: { price: "8,00€", variantId: "1997612", checkoutUrl: `${LS_STORE}/46793ab0-be98-4658-8d6e-f68fa3ffcc55` },
    us: { price: "9,00€", variantId: "1997631", checkoutUrl: `${LS_STORE}/1968a94d-dc6e-4196-8d5b-34793c02ad12` } },
  { id: "guangna360-languo288",
    first: { brand: "guangna", size: 360 },
    second: { brand: "languo", size: 288 },
    a4: { price: "8,00€", variantId: "1997632", checkoutUrl: `${LS_STORE}/c1858019-593f-4319-ae2f-5bc28c240be6` },
    us: { price: "9,00€", variantId: "1997633", checkoutUrl: `${LS_STORE}/ccc244a0-650e-455a-b827-f139fec93a17` } },
  { id: "guangna360-guangna168HG",
      first: { brand: "guangna", size: 360 },
      second: { brand: "guangna", size: 168, variant: "HG" },
      a4: { price: "8,00€", variantId: "2289964", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/e68d7a35-cb9e-4352-bbfe-5eb153085661` },
      us: { price: "9,00€", variantId: "2289967", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/b8b53b94-ae8b-48c3-a618-d664daaf5096` } },
  { id: "guangna360-guangna288HG",
      first: { brand: "guangna", size: 360 },
      second: { brand: "guangna", size: 288, variant: "HG" },
      a4: { price: "8,00€", variantId: "2289987", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/955da28f-98e5-4735-8144-69e4934a724e` },
      us: { price: "9,00€", variantId: "2289990", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/6eac7e9c-e4b4-4cf7-9f75-fbb4d0719429` } },
  { id: "guangna366-guangna168HG",
      first: { brand: "guangna", size: 366 },
      second: { brand: "guangna", size: 168, variant: "HG" },
      a4: { price: "8,00€", variantId: "2289994", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/7011267e-4f4f-453d-81a4-379a4636a18c` },
      us: { price: "9,00€", variantId: "2289999", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/d8a11cac-1027-4c29-a68a-716741577c6a` } },
  { id: "guangna366-guangna288HG",
      first: { brand: "guangna", size: 366 },
      second: { brand: "guangna", size: 288, variant: "HG" },
      a4: { price: "8,00€", variantId: "2290007", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/3cb5f97e-cfe9-4820-8a57-459c64ad27fc` },
      us: { price: "9,00€", variantId: "2290013", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/256a6c50-3b58-44aa-8686-cc319f7de00d` } },      
  { id: "guangna488-guangna168HG",
      first: { brand: "guangna", size: 488 },
      second: { brand: "guangna", size: 168, variant: "HG" },
      a4: { price: "8,00€", variantId: "2290016", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/11daf9f7-ceb4-4b25-815a-71c87d277b9b` },
      us: { price: "9,00€", variantId: "2290024", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/192410a0-f0c6-4024-ab51-dfc85d50e598` } },     
  { id: "guangna488-guangna288HG",
      first: { brand: "guangna", size: 488 },
      second: { brand: "guangna", size: 288, variant: "HG" },
      a4: { price: "8,00€", variantId: "2290029", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/b797dd5f-e56f-43d5-857d-ef64f9d2459f` },
      us: { price: "9,00€", variantId: "2290036", checkoutUrl: `https://creabeastudio.lemonsqueezy.com/checkout/buy/e5cf4261-a68a-42ac-b2d1-13544de4f0c4` } },     
  { id: "languo384-languo168GP",
    first: { brand: "languo", size: 384 },
    second: { brand: "languo", size: 168, variant: "GP" },
    a4: { price: "8,00€", variantId: "2289496", checkoutUrl: `${LS_STORE}/1a7485da-88a0-46c5-8780-d96892e82581` },
    us: { price: "9,00€", variantId: "2289499", checkoutUrl: `${LS_STORE}/929d6266-085a-488b-9497-e2e7f39c4bf4` } },
  { id: "languo384-languo234GP",
    first: { brand: "languo", size: 384 },
    second: { brand: "languo", size: 234, variant: "GP" },
    a4: { price: "8,00€", variantId: "2289502", checkoutUrl: `${LS_STORE}/22865d2f-f3e1-40ef-b237-571c653b5d58` },
    us: { price: "9,00€", variantId: "2289505", checkoutUrl: `${LS_STORE}/8d0cae9f-c518-4cb2-9d5c-becd6f999bab` } },
  { id: "languo432-languo168GP",
    first: { brand: "languo", size: 432 },
    second: { brand: "languo", size: 168, variant: "GP" },
    a4: { price: "8,00€", variantId: "2289507", checkoutUrl: `${LS_STORE}/44aad93f-a233-4221-8055-218494947a18` },
    us: { price: "9,00€", variantId: "2289511", checkoutUrl: `${LS_STORE}/4f33d227-10d5-4348-bb60-46e6ce06e282` } },
  { id: "languo432-languo234GP",
    first: { brand: "languo", size: 432 },
    second: { brand: "languo", size: 234, variant: "GP" },
    a4: { price: "8,00€", variantId: "2289516", checkoutUrl: `${LS_STORE}/8c6fb03a-1d15-4c86-8c98-a7ac56d6f2d1` },
    us: { price: "9,00€", variantId: "2289519", checkoutUrl: `${LS_STORE}/de538d1b-eb8d-47ae-ba25-cba7df3c5a53` } },
];

const BRAND_LABEL: Record<Brand, string> = {
  guangna: "Guangna",
  languo: "Languo",
};

// Display names for the optional pack variants. Product names, so they are
// hardcoded rather than translated (same reasoning as BRAND_LABEL).
const VARIANT_LABEL: Record<PackVariant, string> = {
  HG: "High Gloss",
  GP: "Gel Pens",
};

// "Languo 168 Gel Pens", "Guangna 366", etc. Used for combo titles.
function partLabel(part: ComboPart): string {
  const base = `${BRAND_LABEL[part.brand]} ${part.size}`;
  return part.variant ? `${base} ${VARIANT_LABEL[part.variant]}` : base;
}

const tileStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "white",
};

// The two buy buttons (A4 + US Letter) shared by both tile types.
// US Letter: USD prominent, EUR small underneath -- same convention as
// /create and /confirm's paper-size pricing.
function BuyButtons({ a4, us }: { a4: VariantInfo; us: VariantInfo }) {
  const t = useTranslations("readyMadePacks");

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {a4.checkoutUrl ? (
        <a
          href={a4.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center" }}
        >
          {t("a4Label")} · {a4.price}
        </a>
      ) : (
        <span
          title={t("linkNotSetUp")}
          style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center", borderRadius: 8, background: "var(--border)", color: "var(--muted)", cursor: "not-allowed" }}
        >
          {t("a4Label")} · {t("linkNeeded")}
        </span>
      )}
      {us.checkoutUrl ? (
        <a
          href={us.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            flex: 1, padding: "6px 8px", fontSize: 11.5, textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          }}
        >
          <span style={{ fontWeight: 800 }}>{t("usLabel")} · {toUsdEstimate(us.price)}</span>
          <span style={{ fontSize: 9.5, opacity: 0.85 }}>≈ {us.price}</span>
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
  );
}

function PackTile({ pack }: { pack: Pack }) {
  const t = useTranslations("readyMadePacks");
  // Title carries the color count ("Guangna 168 colors"), plus the variant
  // name for special sets ("Guangna 168 colors · High Gloss").
  const baseTitle = `${BRAND_LABEL[pack.brand]} ${t("colorCount", { count: pack.size })}`;
  const title = pack.variant ? `${baseTitle} · ${VARIANT_LABEL[pack.variant]}` : baseTitle;

  return (
    <div style={tileStyle}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{title}</div>
      <BuyButtons a4={pack.a4} us={pack.us} />
    </div>
  );
}

// Same tile layout as PackTile, but the title combines two sets, e.g.
// "Guangna 366 x Languo 288" or "Languo 384 x Languo 168 Gel Pens".
function ComboPackTile({ pack }: { pack: ComboPack }) {
  const title = `${partLabel(pack.first)} x ${partLabel(pack.second)}`;

  return (
    <div style={tileStyle}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{title}</div>
      <BuyButtons a4={pack.a4} us={pack.us} />
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
              section. Sub-heading text is the translation key
              readyMadePacks.comboHeading; reuses the same disclaimer
              below for both grids. */}
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