"use client";

// DIY Swatch Creator (v11)
// -------------------
// v11 change (2026-07-27): unlockFullSet() now sends a `locale` field
// to /api/create-swatch-checkout, read via useParams() the same way
// create/page.tsx does -- this is what lets that route's redirect_url
// send the customer back to /swatch-download in their own language
// instead of always the app's default locale.
//
// v10 change: full i18n pass for French ("go big" per Mirjam -- every
// visible string on this component now routes through t(), including
// tab labels, placeholders, hints, tooltips/title attributes,
// aria-labels, toasts, undo-stack labels, option dropdowns, paywall/
// checkout copy, page H1, section heading, image alt) moved into new
// swatchCreator/readyMadePacks JSON keys. Nothing on this component is
// hardcoded English anymore except pure icon glyphs (⬇ 🗑 × ⇱ ↺ used
// as decorative icons only) and brand/product names ("Guangna",
// "Languo" -- not translated, they're product names). The
// "🎨 Custom Swatch Cards" section toggle heading, previously left
// hardcoded on purpose, is now translated too (t("diyToggleTitle")) --
// same reasoning.
//
// Plural-sensitive strings (color/colors, family/families, card/cards,
// swatch/swatches) now use next-intl's ICU plural syntax in the locale
// JSON (`{count, plural, one {...} other {...}}`) instead of a
// hardcoded English-shaped ternary, so French pluralization is
// grammatically correct rather than just reusing the English pattern.
//
// v9 changes (2026-07-24):
//   1. Ready-made packs section moved above the DIY intro/builder --
//      per Mirjam, it should be the first thing visitors see.
//   2. Selected-panel ordering: family groups used to sort strictly by
//      code (.localeCompare), which threw away the light-to-dark
//      ordering getCodesInFamily() already encodes. Now uses that
//      canonical order by default.
//   3. Manual drag-to-reorder within the Selected panel (see
//      manualOrder state + onMiniDragStart/onMiniDragOver/onMiniDrop
//      below) -- dragging one swatch onto another within the same
//      family reorders it there. A family only switches to manual
//      order once you've actually dragged something in it; anything
//      still untouched stays in the light-to-dark default, and any
//      NEW color added to an already-manually-ordered family slots in
//      among the untouched ones at its natural light-to-dark position
//      rather than just tacking onto the end.
//   4. USD pricing for the unlock-the-full-set paywall, same treatment
//      as /create and /confirm: shown only for US Letter (prominent,
//      with EUR as the small actual-charge reference), A4 stays EUR-only.
//
// v8 change: PDF-building logic (types, buildRows/buildCards/
// packRowsIntoCards, renderCards, item resolution) moved out to
// lib/swatchPdf.ts so the exact same renderer can be reused on the
// post-payment /swatch-download page for the paid Custom Swatch Card
// Set flow -- see that file for the layout code itself.
//
// Also new in v8: free/paid gating. The first 48 colors (one full page:
// 4 cards x 12 swatches) are free, same as before. Above that, building
// stays free and unlimited, but downloading requires unlocking via
// LemonSqueezy first -- see FREE_COLOR_LIMIT / getSwatchBand in
// lib/lemonSqueezyPricing.ts for the pricing bands. Per-family download
// (previously always free) is now gated the same way once the total
// selection is over the free limit, since it was otherwise a loophole
// around the paywall (download every family separately, one at a time,
// for free).
//
// Changes from v5 (still in effect):
//   1. UNDO -- every delete (single swatch, whole family, or "Clear all")
//      now pushes onto a small in-memory undo stack (last 10 actions).
//      A "↺ Undo" button appears next to "Clear all" whenever there's
//      something to undo, and restores exactly what was removed.
//   2. SELECTED PANEL REDESIGN -- the right-hand box is now wide
//      (the browse panel on the left is a fixed 340px, the Selected
//      panel takes the rest) and no longer has an expand/collapse
//      toggle -- every family's swatches are always shown. Any code
//      that's tagged into more than one color family now shows a
//      small "also: <other family>" label under it. Per-family
//      download + delete stay next to the family name.
//   3. PDF BUG FIX -- the little "origin" line (which set/search a
//      card's colors came from) used to go blank whenever a card's
//      items came from more than one origin. It now lists the origins
//      instead of hiding them.

import { useMemo, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { GN_COLORS, SET_OPTIONS, GUANGNA_SETS } from "@/lib/guangna";
import { LANGUO_COLORS, LANGUO_IDS } from "@/lib/languo";
import { LANGUO_SETS, LANGUO_SET_OPTIONS } from "@/lib/languoSets";
import {
  COLOR_FAMILIES,
  COLOR_FAMILY_LABELS,
  ColorFamily,
  getFamilyMemberships,
  getCodesInFamily,
} from "@/lib/colorFamilies";
import {
  SwatchItem,
  SwatchStyle,
  HeaderHolePos,
  CardPacking,
  compareCodes,
  guangnaItem,
  languoItem,
  resolveItem,
  printLabel,
  membershipKey,
  buildRows,
  buildCards,
  packRowsIntoCards,
  sliceFreePreviewCards,
  renderCards,
} from "@/lib/swatchPdf";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";
// toUsdEstimate is the same generic EUR-string -> USD-estimate helper
// used on /create and /confirm -- reused here so the swatch paywall
// follows the exact same USD-display convention (prominent for US
// Letter, EUR-only for A4) rather than inventing a second one.
import { FREE_COLOR_LIMIT, getSwatchBand, toUsdEstimate } from "@/lib/lemonSqueezyPricing";
import ReadyMadePacks from "./ReadyMadePacks";

const FAMILY_ORDER = Object.keys(COLOR_FAMILY_LABELS) as ColorFamily[];

// -- noise protection: a subtle turbulence overlay blended over every
// swatch color so a screen color-picker samples a slightly perturbed
// pixel rather than the exact underlying RGB value. --
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>`
  );

function Swatch({ rgb, height }: { rgb: [number, number, number]; height: number }) {
  return (
    <div style={{ position: "relative", height, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundSize: "48px 48px",
          mixBlendMode: "overlay",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Not part of `styles` below since it's a function that returns
// CSSProperties based on active state, not a plain style object --
// keeping it separate lets `styles` stay a clean Record<string, CSSProperties>.
function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "9px 18px",
    borderRadius: 50,
    border: active ? "2px solid var(--pink)" : "2px solid var(--border)",
    background: active ? "var(--pink)" : "white",
    color: active ? "white" : "var(--ink)",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 600,
    transition: "all 0.15s",
  };
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", gap: 24 },
  tabRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  input: { marginBottom: 12 },
  swatchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 12, maxHeight: 360, overflowY: "auto", paddingRight: 4 },
  swatchCard: { border: "1px solid var(--border)", borderRadius: 16, cursor: "grab", overflow: "hidden", userSelect: "none", background: "white" },
  swatchLabel: { fontSize: 10.5, padding: "5px 7px", lineHeight: 1.3, color: "var(--ink)" },
  emptyHint: { color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "36px 12px" },
  familyRow: { border: "1px solid var(--border)", borderRadius: 16, marginBottom: 10, overflow: "hidden", background: "white" },
  familyHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" },
  familyHeaderLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  familyCount: { background: "var(--cream-dark)", color: "var(--pink-dark)", fontWeight: 700, fontSize: 12, borderRadius: 50, padding: "3px 10px" },
  familyActionBtn: { border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "var(--muted)", padding: 4 },
  familyBody: { padding: "0 14px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 },
  miniSwatch: { position: "relative", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", cursor: "grab" },
  miniRemove: { position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", fontSize: 11, lineHeight: "16px", color: "var(--ink)" },
  miniLabel: { fontSize: 9, padding: "3px 4px 0", color: "var(--ink)", background: "white" },
  crossFamilyLabel: { fontSize: 8, padding: "0 4px 4px", color: "var(--muted)", background: "white", lineHeight: 1.25, fontStyle: "italic" },
  selectedDrop: { minHeight: 100, border: "2px dashed var(--border)", borderRadius: 16, padding: 10, background: "var(--cream)" },
  optionsRow: { display: "flex", gap: 20, flexWrap: "wrap", margin: "20px 0" },
  optionLabel: { fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "flex", flexDirection: "column", gap: 6 },
  intro: { background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 24 },
  introH1: { fontSize: 19, fontWeight: 700, color: "var(--pink)", marginBottom: 8 },
  introH2: { fontSize: 17, fontWeight: 700, color: "var(--pink)", margin: "18px 0 8px" },
  introP: { fontSize: 15, lineHeight: 1.65, color: "var(--ink)", marginBottom: 6 },
  introList: { listStyle: "none", padding: 0, marginBottom: 6 },
  introListItem: { display: "flex", gap: 10, fontSize: 15, lineHeight: 1.65, color: "var(--ink)", marginBottom: 5 },
  introBullet: { color: "var(--pink)", fontWeight: 700, flexShrink: 0 },
  introNote: { fontSize: 13.5, color: "var(--muted)", marginTop: 14, fontStyle: "italic" },
  pricingBanner: { background: "var(--pink)", color: "white", borderRadius: 12, padding: "12px 18px", fontSize: 15, lineHeight: 1.55, marginTop: 14 },
  autocompleteWrap: { position: "relative", marginBottom: 10 },
  autocompleteList: {
    position: "absolute", top: "100%", left: 0, right: 0, background: "white",
    border: "1px solid var(--border)", borderRadius: 12, maxHeight: 240, overflowY: "auto",
    zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", marginTop: 4,
  },
  autocompleteItem: { padding: "9px 14px", fontSize: 13, cursor: "pointer" },
  toast: {
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
    background: "var(--ink)", color: "white", padding: "10px 20px", borderRadius: 50,
    fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 50,
  },
  checkoutError: { background: "#FFF0F0", border: "1.5px solid var(--pink)", borderRadius: 12, padding: 14, color: "#c62828", fontSize: 14, marginBottom: 12 },
};

function SetAutocomplete({
  options,
  value,
  onChange,
  placeholder,
  clearLabel,
  noMatchesLabel,
}: {
  options: { label: string; key: string }[];
  value: string;
  onChange: (key: string) => void;
  placeholder: string;
  clearLabel: string;
  noMatchesLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.key === value)?.label ?? "";
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div style={styles.autocompleteWrap} ref={wrapRef}>
      <input
        type="text"
        style={styles.input}
        placeholder={placeholder}
        value={open ? query : selectedLabel}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <div style={styles.autocompleteList}>
          {value && (
            <div style={{ ...styles.autocompleteItem, color: "var(--pink)", fontWeight: 600 }} onClick={() => { onChange(""); setOpen(false); }}>
              {clearLabel}
            </div>
          )}
          {filtered.length === 0 && <div style={{ ...styles.autocompleteItem, color: "var(--muted)" }}>{noMatchesLabel}</div>}
          {filtered.map((o) => (
            <div key={o.key} style={styles.autocompleteItem} onClick={() => { onChange(o.key); setOpen(false); }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// One entry per delete action (single swatch -- either fully removed or
// just hidden from one family, a whole family, or "Clear all"), most
// recent last. Undo pops the last entry, re-adds any fully-removed items,
// and un-hides any per-family exclusions. `label` is now the fully
// resolved, already-translated string (built at push-time using t()),
// not a raw English template -- see pushUndo() call sites below.
interface UndoAction {
  label: string;
  items: SwatchItem[];
  excludeKeys: string[];
}
const UNDO_STACK_LIMIT = 10;

export default function SwatchCreator() {
  const t = useTranslations("swatchCreator");
  // Route-segment locale ([locale] in app/[locale]/swatch-creator/
  // page.tsx) -- sent along with the unlock-full-set checkout request
  // so create-swatch-checkout/route.ts can build a locale-correct
  // redirect_url back to /swatch-download (2026-07-27).
  const routeParams = useParams();
  const locale = (Array.isArray(routeParams?.locale) ? routeParams.locale[0] : routeParams?.locale) as string || "en";
  const [selected, setSelected] = useState<SwatchItem[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [tab, setTab] = useState<"guangna-set" | "single" | "languo-set" | "languo-single" | "family">("guangna-set");
  const [guangnaSetKey, setGuangnaSetKey] = useState("");
  const [languoSetKey, setLanguoSetKey] = useState("");
  const [singleSearch, setSingleSearch] = useState("");
  const [familyKey, setFamilyKey] = useState<ColorFamily | "">("");
  const [languoSearch, setLanguoSearch] = useState("");
  const [swatchStyle, setSwatchStyle] = useState<SwatchStyle>("filled");
  const [headerHolePos, setHeaderHolePos] = useState<HeaderHolePos>("none");
  const [cardPacking, setCardPacking] = useState<CardPacking>("per-family");
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [generating, setGenerating] = useState<string | null>(null); // null | "all" | "preview" | "unlock" | "blank" | family key
  const [unlockError, setUnlockError] = useState("");
  // Set once the unlock-full-set checkout window has been opened
  // (2026-07-24) -- mirrors /confirm's own checkoutOpened note, so it's
  // clear something happened while the customer stays on this page.
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  // Surfaced in the checkoutOpened note below (2026-07-24) -- both a
  // support-reference convenience for real customers and, more
  // immediately, an easy way to grab the orderId for manual testing via
  // /api/admin/mark-swatch-paid without needing DevTools' Network tab.
  const [swatchOrderId, setSwatchOrderId] = useState("");

  // ── REORDER (2026-07-24): explicit manual ordering per family, keyed
  // by family, value = ordered list of item ids. A family only appears
  // here once you've actually dragged something within it -- see
  // orderFamilyItems() below for how it merges with the light-to-dark
  // default for colors you haven't touched. ────────────────────────────
  const [manualOrder, setManualOrder] = useState<Partial<Record<ColorFamily, string[]>>>({});
  const [draggingReorderId, setDraggingReorderId] = useState<string | null>(null);

  // ── COLLAPSIBLE (2026-07-24): the DIY section as a whole (intro +
  // builder + options + download buttons) can be collapsed, mirroring
  // ReadyMadePacks' own collapsible toggle above it -- default open.
  const [diyOpen, setDiyOpen] = useState(true);

  const resetFilters = () => {
    setGuangnaSetKey("");
    setLanguoSetKey("");
    setSingleSearch("");
    setLanguoSearch("");
    setFamilyKey("");
  };

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const addItem = (item: SwatchItem) => {
    setSelected((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]));
    showToast(t("toast.added"));
  };
  const addMany = (items: SwatchItem[], opts?: { silent?: boolean }) => {
    setSelected((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      return [...prev, ...items.filter((i) => !existing.has(i.id))];
    });
    if (!opts?.silent && items.length > 0) {
      showToast(t("toast.addedMany", { count: items.length }));
    }
  };

  const pushUndo = (label: string, items: SwatchItem[], excludeKeys: string[]) => {
    if (items.length === 0 && excludeKeys.length === 0) return;
    setUndoStack((prev) => [...prev.slice(-(UNDO_STACK_LIMIT - 1)), { label, items, excludeKeys }]);
  };

  const removeItem = (id: string, family: ColorFamily) => {
    const item = selected.find((p) => p.id === id);
    if (!item) return;
    const activeFamilies = getFamilyMemberships(item.code)
      .map((m) => m.family)
      .filter((f) => !excluded.has(membershipKey(id, f)));
    if (activeFamilies.length <= 1) {
      pushUndo(t("undoLabels.removedItem", { label: printLabel(item) }), [item], []);
      setSelected((prev) => prev.filter((p) => p.id !== id));
    } else {
      const key = membershipKey(id, family);
      pushUndo(t("undoLabels.removedItemFromFamily", { label: printLabel(item), family: COLOR_FAMILY_LABELS[family] }), [], [key]);
      setExcluded((prev) => new Set(prev).add(key));
    }
  };
  const removeFamily = (family: ColorFamily) => {
    const itemsInFamily = selected.filter((item) =>
      getFamilyMemberships(item.code).some((m) => m.family === family) &&
      !excluded.has(membershipKey(item.id, family))
    );
    if (itemsInFamily.length === 0) return;
    const toFullyRemove: SwatchItem[] = [];
    const toExcludeKeys: string[] = [];
    for (const item of itemsInFamily) {
      const activeFamilies = getFamilyMemberships(item.code)
        .map((m) => m.family)
        .filter((f) => !excluded.has(membershipKey(item.id, f)));
      if (activeFamilies.length <= 1) {
        toFullyRemove.push(item);
      } else {
        toExcludeKeys.push(membershipKey(item.id, family));
      }
    }
    pushUndo(t("undoLabels.removedFamily", { family: COLOR_FAMILY_LABELS[family], count: itemsInFamily.length }), toFullyRemove, toExcludeKeys);
    if (toFullyRemove.length) {
      const removeIds = new Set(toFullyRemove.map((i) => i.id));
      setSelected((prev) => prev.filter((item) => !removeIds.has(item.id)));
    }
    if (toExcludeKeys.length) {
      setExcluded((prev) => {
        const next = new Set(prev);
        toExcludeKeys.forEach((k) => next.add(k));
        return next;
      });
    }
  };
  const clearAll = () => {
    if (selected.length === 0) return;
    pushUndo(t("undoLabels.clearedAll", { count: selected.length }), selected, []);
    setSelected([]);
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    if (last.items.length) addMany(last.items, { silent: true });
    if (last.excludeKeys.length) {
      setExcluded((prev) => {
        const next = new Set(prev);
        last.excludeKeys.forEach((k) => next.delete(k));
        return next;
      });
    }
  };

  const onSourceDragStart = (e: React.DragEvent, item: SwatchItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ kind: "add", item }));
  };
  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.kind === "add") addItem(data.item);
    } catch {}
  };

  // ── REORDER (2026-07-24): dragging a swatch within the Selected panel
  // onto another swatch in the SAME family moves it there. Cross-family
  // drops are ignored (reordering only makes sense within one family's
  // own card/print order) -- dragging a swatch onto a different family
  // does nothing, same as dropping it nowhere.
  const onMiniDragStart = (e: React.DragEvent, item: SwatchItem, family: ColorFamily) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ kind: "reorder", id: item.id, family }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingReorderId(item.id);
  };
  const onMiniDragEnd = () => setDraggingReorderId(null);
  const onMiniDragOver = (e: React.DragEvent) => {
    if (draggingReorderId) e.preventDefault(); // only allow reorder drops, not stray "add" drags landing mid-swatch
  };
  const onMiniDrop = (e: React.DragEvent, targetItem: SwatchItem, family: ColorFamily, orderedIds: string[]) => {
    e.preventDefault();
    e.stopPropagation(); // don't let this bubble to the outer selectedDrop's onDrop, which only handles "add"
    setDraggingReorderId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.kind !== "reorder" || data.family !== family || data.id === targetItem.id) return;
      setManualOrder((prev) => {
        const current = prev[family] ?? orderedIds;
        const withoutDragged = current.filter((id) => id !== data.id);
        const targetIndex = withoutDragged.indexOf(targetItem.id);
        if (targetIndex === -1) return prev;
        const next = [...withoutDragged.slice(0, targetIndex), data.id, ...withoutDragged.slice(targetIndex)];
        return { ...prev, [family]: next };
      });
    } catch {}
  };

  // ── "Move back to original position" (2026-07-24): drops one item's
  // id out of a family's manual order, letting it re-merge back into
  // its canonical light-to-dark rank next render (see orderFamilyItems'
  // "untouched" handling below) -- without disturbing anyone else's
  // manually-set position in that family.
  const resetItemPosition = (id: string, family: ColorFamily) => {
    setManualOrder((prev) => {
      const current = prev[family];
      if (!current || !current.includes(id)) return prev;
      return { ...prev, [family]: current.filter((x) => x !== id) };
    });
  };

  // ── REORDER (2026-07-24): resolves the display order for one family's
  // items. Colors not yet manually touched default to the canonical
  // light-to-dark order from getCodesInFamily(). Once manualOrder has an
  // entry for this family, that ordering is used for every id it knows
  // about; any id in `items` that ISN'T in the stored order yet (a color
  // added to this family after the last drag) is inserted among the
  // stored order at the position its light-to-dark rank would put it,
  // rather than just appended at the end -- so newly-added colors still
  // land somewhere sensible instead of always landing last.
  const orderFamilyItems = (family: ColorFamily, items: SwatchItem[]): SwatchItem[] => {
    const codeRank = new Map(getCodesInFamily(family).map((c, i) => [c, i]));
    const byId = new Map(items.map((i) => [i.id, i]));
    const stored = manualOrder[family];

    if (!stored) {
      return [...items].sort((a, b) => (codeRank.get(a.code) ?? 0) - (codeRank.get(b.code) ?? 0));
    }

    const idSet = new Set(items.map((i) => i.id));
    const known = stored.filter((id) => idSet.has(id));
    const knownSet = new Set(known);
    const untouched = items
      .filter((i) => !knownSet.has(i.id))
      .sort((a, b) => (codeRank.get(a.code) ?? 0) - (codeRank.get(b.code) ?? 0));

    // Merge untouched (light-to-dark) colors into the known manual order
    // by their code rank, rather than only ever appending at the very
    // end -- walks the manual order once, inserting each untouched color
    // right before the first known color that ranks darker than it.
    const merged: string[] = [];
    let ui = 0;
    for (const knownId of known) {
      const knownRank = codeRank.get(byId.get(knownId)!.code) ?? 0;
      while (ui < untouched.length && (codeRank.get(untouched[ui].code) ?? 0) < knownRank) {
        merged.push(untouched[ui].id);
        ui++;
      }
      merged.push(knownId);
    }
    while (ui < untouched.length) {
      merged.push(untouched[ui].id);
      ui++;
    }

    return merged.map((id) => byId.get(id)).filter((x): x is SwatchItem => Boolean(x));
  };

  const guangnaSetLabel = SET_OPTIONS.find((o) => o.key === guangnaSetKey)?.label ?? guangnaSetKey;
  const guangnaSetOrigin = `Guangna ${guangnaSetLabel}`;
  const languoSetOrigin = `Languo ${languoSetKey}`;
  const guangnaSetPreview = useMemo(
    () => (guangnaSetKey ? (GUANGNA_SETS[guangnaSetKey] ?? []).map((c) => guangnaItem(c, guangnaSetOrigin)).filter((x): x is SwatchItem => x !== null) : []),
    [guangnaSetKey]
  );
  const languoSetPreview = useMemo(
    () => (languoSetKey ? (LANGUO_SETS[languoSetKey] ?? []).map((c) => resolveItem(c, languoSetOrigin)).filter((x): x is SwatchItem => x !== null) : []),
    [languoSetKey]
  );
  const guangnaResults = useMemo(() => {
    const q = singleSearch.trim().toLowerCase();
    if (!q) return [];
    const base = Object.keys(GN_COLORS).sort(compareCodes);
    return base.filter((c) => c.toLowerCase().includes(q) || GN_COLORS[c][3].toLowerCase().includes(q))
      .map((c) => guangnaItem(c, "Guangna codes")).filter((x): x is SwatchItem => x !== null);
  }, [singleSearch]);
  const familyPreview = useMemo(
    () => (familyKey ? getCodesInFamily(familyKey).map((c) => resolveItem(c, "Color Family")).filter((x): x is SwatchItem => x !== null) : []),
    [familyKey]
  );
  const languoResults = useMemo(() => {
    const q = languoSearch.trim().toLowerCase();
    if (!q) return [];
    return LANGUO_IDS.filter((c) => c.toLowerCase().includes(q)).map((c) => languoItem(c, "Languo codes")).filter((x): x is SwatchItem => x !== null);
  }, [languoSearch]);

  const grouped = useMemo(() => {
    const map = new Map<ColorFamily, SwatchItem[]>();
    for (const item of selected) {
      const memberships = getFamilyMemberships(item.code);
      for (const m of memberships) {
        if (excluded.has(membershipKey(item.id, m.family))) continue;
        if (!map.has(m.family)) map.set(m.family, []);
        map.get(m.family)!.push(item);
      }
    }
    const result: { family: ColorFamily; items: SwatchItem[] }[] = [];
    for (const fam of FAMILY_ORDER) {
      const items = map.get(fam);
      if (items && items.length) {
        result.push({ family: fam, items: orderFamilyItems(fam, items) });
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, excluded, manualOrder]);

  const allCards = useMemo(() => buildCards(selected, cardPacking, excluded), [selected, cardPacking, excluded]);
  const totalColors = selected.length;
  const totalFamilies = grouped.length;

  // Pricing/paywall gating -- null when the selection is within the
  // free tier (<= FREE_COLOR_LIMIT).
  const band = useMemo(() => getSwatchBand(totalColors), [totalColors]);
  const bandPrice = band ? (paperSize === "letter" ? band.variants.us.price : band.variants.a4.price) : null;
  const overFreeLimit = band !== null;

  // ── USD PRICING (2026-07-24): same convention as /create and
  // /confirm -- USD shown (and made the visually prominent figure) only
  // for US Letter, since that's the currency an eventually-US-paying
  // customer is thinking in; A4 stays EUR-only to avoid the "two prices
  // next to each other" confusion for a EUR-paying customer.
  const showUsd = paperSize === "letter";
  const bandPriceDisplay = bandPrice
    ? (showUsd ? `${toUsdEstimate(bandPrice)} (≈ ${bandPrice})` : bandPrice)
    : null;

  const pdfOptions = { swatchStyle, headerHolePos, cardPacking, paperSize };

  const downloadAll = async () => {
    if (allCards.length === 0 || overFreeLimit) return;
    setGenerating("all");
    try {
      await renderCards(allCards, pdfOptions, "creabeastudio-swatch-cards.pdf");
    } finally {
      setGenerating(null);
    }
  };
  const downloadFreePreview = async () => {
    if (allCards.length === 0) return;
    setGenerating("preview");
    try {
      const previewCards = sliceFreePreviewCards(allCards);
      await renderCards(previewCards, pdfOptions, "creabeastudio-swatch-cards-preview.pdf");
    } finally {
      setGenerating(null);
    }
  };
  const unlockFullSet = async () => {
    if (!band) return;
    setGenerating("unlock");
    setUnlockError("");
    setCheckoutOpened(false);
    // Opened synchronously, before any await below -- same popup-blocker
    // workaround as /confirm's goToCheckout: browsers only reliably allow
    // window.open() when it's called directly inside a click handler, not
    // after an awaited async gap. Deliberately no "noopener" -- that flag
    // makes window.open() return null in every modern browser, which is
    // exactly what broke this same pattern on /confirm before that fix.
    const checkoutWindow = window.open("", "_blank");
    try {
      const items = selected.map((i) => ({ source: i.source, code: i.code, origin: i.origin }));
      const submitRes = await fetch("/api/submit-swatch-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, excluded: Array.from(excluded), options: pdfOptions, colorCount: totalColors }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.orderId) {
        setUnlockError(t("errors.saveSelection"));
        setGenerating(null);
        checkoutWindow?.close();
        return;
      }
      setSwatchOrderId(submitData.orderId);
      const checkoutRes = await fetch("/api/create-swatch-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: submitData.orderId, colorCount: totalColors, paperSize, locale }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.url) {
        setUnlockError(t("errors.startCheckout"));
        setGenerating(null);
        checkoutWindow?.close();
        return;
      }
      if (checkoutWindow) {
        checkoutWindow.location.href = checkoutData.url;
        setCheckoutOpened(true);
        setGenerating(null);
      } else {
        // Popup blocked despite the synchronous open attempt -- fall
        // back to redirecting this tab so checkout still works.
        window.location.href = checkoutData.url;
      }
    } catch {
      setUnlockError(t("errors.generic"));
      setGenerating(null);
      checkoutWindow?.close();
    }
  };
  // Per-family download stays free below the paywall threshold (a small
  // bonus convenience), but once the total selection is over the free
  // limit it's disabled -- otherwise it's a loophole that lets someone
  // download every family separately, one at a time, for free.
  const downloadFamily = async (family: ColorFamily, items: SwatchItem[]) => {
    if (overFreeLimit) return;
    setGenerating(family);
    try {
      const rows = buildRows(items.map((item) => ({ item, family })));
      const cards = packRowsIntoCards(rows);
      await renderCards(cards, pdfOptions, `creabeastudio-swatch-cards-${family}.pdf`);
    } finally {
      setGenerating(null);
    }
  };

  // A blank page of 4 empty cards -- no color data involved, so this
  // stays free regardless of selection size.
  const downloadBlankTemplate = async () => {
    setGenerating("blank");
    try {
      const { jsPDF } = await import("jspdf");
      const { getPageDims } = await import("@/lib/swatchPdf");
      const { pageW, pageH, format } = getPageDims(paperSize);
      const doc = new jsPDF({ unit: "mm", format, orientation: "landscape" });
      const margin = 10, gapX = 6, cardsPerRow = 4;
      const cardW = (pageW - margin * 2 - gapX * (cardsPerRow - 1)) / cardsPerRow;
      const cardH = pageH - margin * 2;
      const CARD_LINE_GRAY = 70, CARD_LINE_WIDTH = 0.3175, SWATCH_LINE_WIDTH = 0.246944, HOLE_LINE_WIDTH = 0.3175;

      for (let c = 0; c < cardsPerRow; c++) {
        const x0 = margin + c * (cardW + gapX);
        const y0 = margin;
        doc.setDrawColor(CARD_LINE_GRAY);
        doc.setLineWidth(CARD_LINE_WIDTH);
        doc.rect(x0, y0, cardW, cardH);

        let headerH = 4;
        if (headerHolePos === "center") {
          const holeR = 2.25;
          doc.setDrawColor(160);
          doc.setFillColor(255, 255, 255);
          doc.circle(x0 + cardW / 2, y0 + 6, holeR, "FD");
          headerH = 12;
        } else if (headerHolePos === "left" || headerHolePos === "right") {
          const holeR = 2.25;
          const holeCX = headerHolePos === "left" ? x0 + cardW * 0.15 : x0 + cardW * 0.85;
          doc.setDrawColor(160);
          doc.setFillColor(255, 255, 255);
          doc.circle(holeCX, y0 + 8, holeR, "FD");
          headerH = 16;
        }

        const gridTop = y0 + headerH + 4;
        const gridH = cardH - headerH - 8;
        const cellW = cardW / 2, cellH = gridH / 6;

        for (let i = 0; i < 12; i++) {
          const col = i % 2, row = Math.floor(i / 2);
          const cx = x0 + col * cellW + 3, cy = gridTop + row * cellH + 2;
          const swW = cellW - 6, swH = cellH - 8;

          doc.setDrawColor(CARD_LINE_GRAY);
          doc.setLineWidth(SWATCH_LINE_WIDTH);
          doc.rect(cx, cy, swW, swH);

          const holeR = 3;
          doc.setDrawColor(CARD_LINE_GRAY);
          doc.setLineWidth(HOLE_LINE_WIDTH);
          doc.circle(cx + swW / 2, cy + swH / 2, holeR);

          doc.setDrawColor(CARD_LINE_GRAY);
          doc.setLineWidth(SWATCH_LINE_WIDTH);
          doc.line(cx, cy + swH + 4, cx + swW, cy + swH + 4);
        }
      }
      doc.save("creabeastudio-blank-swatch-template.pdf");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div>
      {toast && (
        <div style={styles.toast} role="status">
          {toast}
        </div>
      )}

      {/* ── Ready-made packs now lead the page (2026-07-24), above the
          DIY builder -- per Mirjam, most visitors should see these
          first. Renaming ("Presorted Color Swatch Cards"), box sizing,
          and collapsibility for this section live inside
          ReadyMadePacks.tsx itself, not here. ── */}
      <ReadyMadePacks />

      <div style={styles.intro}>
        {/* ── DIY / Custom section header + collapse toggle (2026-07-24),
            now living INSIDE the same bordered box as "How to Use This
            Tool?" instead of as a bare heading above it -- this box
            (and its toggle) always renders; only its own content and
            the builder below it collapse together. Arrow leads on the
            left (moved from the right, 2026-07-24). Heading now
            translated (2026-07-25) -- see t("diyToggleTitle"). ── */}
        <button
          onClick={() => setDiyOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            background: "none", border: "none", cursor: "pointer", padding: 0,
            textAlign: "left", marginBottom: diyOpen ? 14 : 0,
          }}
          aria-expanded={diyOpen}
        >
          <span style={{ fontSize: 17, color: "var(--pink)", transform: diyOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }}>
            ▾
          </span>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 19, color: "var(--pink)", margin: 0 }}>
            {t("diyToggleTitle")}
          </h2>
        </button>

        {diyOpen && (
        <>
        <p style={styles.introH1}>{t("howToUse.title")}</p>
        <p style={styles.introP}>{t("howToUse.intro")}</p>
        <ul style={styles.introList}>
          {(t.raw("howToUse.steps") as { text: string; subSteps?: string[] }[]).map((s, i) => (
            <li key={i} style={styles.introListItem}>
              <span style={styles.introBullet}>•</span>
              <span>
                {s.text}
                {s.subSteps && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0 0" }}>
                    {s.subSteps.map((sub, j) => (
                      <li key={j} style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", marginBottom: 4, marginLeft: 4 }}>
                        <span style={{ color: "var(--pink)" }}>–</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div style={styles.pricingBanner}>{t("pricingNote", { freeLimit: FREE_COLOR_LIMIT })}</div>

        <p style={styles.introH2}>{t("colorFamilyMethod.title")}</p>
        <p style={styles.introP}>{t("colorFamilyMethod.intro")}</p>
        <ul style={styles.introList}>
          {(t.raw("colorFamilyMethod.steps") as string[]).map((s, i) => (
            <li key={i} style={styles.introListItem}>
              <span style={styles.introBullet}>•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p style={styles.introP}>{t("colorFamilyMethod.closing")}</p>
        <p style={styles.introP}><em>{t("colorFamilyMethod.tip")}</em></p>
        <p style={styles.introNote}>{t("colorFamilyMethod.note")}</p>
        </>
        )}
      </div>

      {diyOpen && (
      <>
      <div style={styles.wrap}>
        {/* -- left: sources -- */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={styles.tabRow}>
              <button style={tabStyle(tab === "guangna-set")} onClick={() => setTab("guangna-set")}>{t("tabs.guangnaSet")}</button>
              <button style={tabStyle(tab === "single")} onClick={() => setTab("single")}>{t("tabs.guangnaCodes")}</button>
              <button style={tabStyle(tab === "languo-set")} onClick={() => setTab("languo-set")}>{t("tabs.languoSet")}</button>
              <button style={tabStyle(tab === "languo-single")} onClick={() => setTab("languo-single")}>{t("tabs.languoCodes")}</button>
              <button style={tabStyle(tab === "family")} onClick={() => setTab("family")}>{t("tabs.colorFamily")}</button>
            </div>
          </div>
          <button
            onClick={resetFilters}
            style={{ border: "1px solid var(--border)", background: "white", color: "var(--muted)", borderRadius: 50, padding: "6px 14px", fontSize: 12.5, cursor: "pointer", marginBottom: 14 }}
          >
            {t("resetFilters")}
          </button>

          {tab === "guangna-set" && (
            <>
              <SetAutocomplete
                options={SET_OPTIONS}
                value={guangnaSetKey}
                onChange={setGuangnaSetKey}
                placeholder={t("placeholders.guangnaSetSearch")}
                clearLabel={t("autocomplete.clearSelection")}
                noMatchesLabel={t("autocomplete.noMatches")}
              />
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: -6, marginBottom: 14 }}>
                {t("metallicNote")}
              </p>
              {!guangnaSetKey && <p style={styles.emptyHint}>{t("hints.pickSet")}</p>}
              {guangnaSetKey && (
                <>
                  <button className="btn-outline" style={{ marginBottom: 14, padding: "8px 20px", fontSize: 13 }} onClick={() => { addMany(guangnaSetPreview); setGuangnaSetKey(""); }}>
                    {t("addAll", { count: guangnaSetPreview.length })}
                  </button>
                  <div style={styles.swatchGrid}>
                    {guangnaSetPreview.map((item) => (
                      <div key={item.id} style={styles.swatchCard} draggable onDragStart={(e) => onSourceDragStart(e, item)} onClick={() => addItem(item)}>
                        <Swatch rgb={item.rgb} height={48} />
                        <div style={styles.swatchLabel}>{item.code}<br />{item.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "single" && (
            <>
              <input type="text" style={styles.input} placeholder={t("placeholders.guangnaCodeSearch")} value={singleSearch} onChange={(e) => setSingleSearch(e.target.value)} />
              {!singleSearch && <p style={styles.emptyHint}>{t("hints.typeGuangnaCode")}</p>}
              <div style={styles.swatchGrid}>
                {guangnaResults.map((item) => (
                  <div key={item.id} style={styles.swatchCard} draggable onDragStart={(e) => onSourceDragStart(e, item)} onClick={() => addItem(item)}>
                    <Swatch rgb={item.rgb} height={48} />
                    <div style={styles.swatchLabel}>{item.code}<br />{item.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "languo-set" && (
            <>
              <SetAutocomplete
                options={LANGUO_SET_OPTIONS}
                value={languoSetKey}
                onChange={setLanguoSetKey}
                placeholder={t("placeholders.languoSetSearch")}
                clearLabel={t("autocomplete.clearSelection")}
                noMatchesLabel={t("autocomplete.noMatches")}
              />
              {!languoSetKey && <p style={styles.emptyHint}>{t("hints.pickSet")}</p>}
              {languoSetKey && (
                <>
                  <button className="btn-outline" style={{ marginBottom: 14, padding: "8px 20px", fontSize: 13 }} onClick={() => { addMany(languoSetPreview); setLanguoSetKey(""); }}>
                    {t("addAll", { count: languoSetPreview.length })}
                  </button>
                  <div style={styles.swatchGrid}>
                    {languoSetPreview.map((item) => (
                      <div key={item.id} style={styles.swatchCard} draggable onDragStart={(e) => onSourceDragStart(e, item)} onClick={() => addItem(item)}>
                        <Swatch rgb={item.rgb} height={48} />
                        <div style={styles.swatchLabel}>{item.code}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "languo-single" && (
            <>
              <input type="text" style={styles.input} placeholder={t("placeholders.languoCodeSearch")} value={languoSearch} onChange={(e) => setLanguoSearch(e.target.value)} />
              {!languoSearch && <p style={styles.emptyHint}>{t("hints.typeLanguoCode")}</p>}
              <div style={styles.swatchGrid}>
                {languoResults.map((item) => (
                  <div key={item.id} style={styles.swatchCard} draggable onDragStart={(e) => onSourceDragStart(e, item)} onClick={() => addItem(item)}>
                    <Swatch rgb={item.rgb} height={48} />
                    <div style={styles.swatchLabel}>{item.code}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "family" && (
            <>
              <select style={{ marginBottom: 10 }} value={familyKey} onChange={(e) => setFamilyKey(e.target.value as ColorFamily | "")}>
                <option value="">{t("selectFamilyPlaceholder")}</option>
                {FAMILY_ORDER.map((f) => (
                  <option key={f} value={f}>{COLOR_FAMILY_LABELS[f]} ({getCodesInFamily(f).length})</option>
                ))}
              </select>
              {!familyKey && <p style={styles.emptyHint}>{t("hints.pickFamily")}</p>}
              {familyKey && (
                <>
                  <button className="btn-outline" style={{ marginBottom: 14, padding: "8px 20px", fontSize: 13 }} onClick={() => { addMany(familyPreview); setFamilyKey(""); }}>
                    {t("addAll", { count: familyPreview.length })}
                  </button>
                  <div style={styles.swatchGrid}>
                    {familyPreview.map((item) => (
                      <div key={item.id} style={styles.swatchCard} draggable onDragStart={(e) => onSourceDragStart(e, item)} onClick={() => addItem(item)}>
                        <Swatch rgb={item.rgb} height={48} />
                        <div style={styles.swatchLabel}>{item.code}{item.source === "guangna" ? <><br />{item.name}</> : null}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* -- right: selection, grouped by family, always expanded -- */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong>
              {totalFamilies > 0
                ? t("selectedColorsWithFamilies", { count: totalColors, familyCount: totalFamilies })
                : t("selectedColors", { count: totalColors })}
            </strong>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {undoStack.length > 0 && (
                <button
                  onClick={undo}
                  title={undoStack[undoStack.length - 1].label}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "var(--pink)", fontSize: 13, fontWeight: 600 }}
                >
                  {t("undo")}
                </button>
              )}
              {selected.length > 0 && (
                <button onClick={clearAll} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--pink)", fontSize: 13, fontWeight: 600 }}>
                  {t("clearAll")}
                </button>
              )}
            </div>
          </div>

          {selected.length > 0 && (
            <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: -6, marginBottom: 12 }}>
              {t("dragHint")}
            </p>
          )}

          <div style={styles.selectedDrop} onDragOver={(e) => e.preventDefault()} onDrop={onDropZoneDrop}>
            {selected.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 30, marginBottom: 30 }}>
                {t("emptySelection")}
              </p>
            )}
            {grouped.map(({ family, items }) => {
              const orderedIds = items.map((i) => i.id);
              return (
                <div key={family} style={styles.familyRow}>
                  <div style={styles.familyHeader}>
                    <div style={styles.familyHeaderLeft}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{COLOR_FAMILY_LABELS[family]}</span>
                      <span style={styles.familyCount}>{items.length}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {undoStack.length > 0 && (
                        <button
                          style={styles.familyActionBtn}
                          title={undoStack[undoStack.length - 1].label}
                          onClick={undo}
                        >
                          ↺
                        </button>
                      )}
                      <button
                        style={styles.familyActionBtn}
                        title={overFreeLimit ? t("familyActions.downloadFamilyLocked") : t("familyActions.downloadFamily")}
                        onClick={() => downloadFamily(family, items)}
                        disabled={generating !== null || overFreeLimit}
                      >
                        {generating === family ? "…" : "⬇"}
                      </button>
                      <button style={styles.familyActionBtn} title={t("familyActions.removeFamily")} onClick={() => removeFamily(family)}>
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={styles.familyBody}>
                    {items.map((item) => {
                      const others = getFamilyMemberships(item.code)
                        .filter((m) => m.family !== family && !excluded.has(membershipKey(item.id, m.family)))
                        .map((m) => COLOR_FAMILY_LABELS[m.family]);
                      const wasManuallyMoved = (manualOrder[family] ?? []).includes(item.id);
                      return (
                        <div
                          key={item.id}
                          style={{
                            ...styles.miniSwatch,
                            opacity: draggingReorderId === item.id ? 0.4 : 1,
                          }}
                          draggable
                          onDragStart={(e) => onMiniDragStart(e, item, family)}
                          onDragEnd={onMiniDragEnd}
                          onDragOver={onMiniDragOver}
                          onDrop={(e) => onMiniDrop(e, item, family, orderedIds)}
                        >
                          <Swatch rgb={item.rgb} height={40} />
                          <button style={styles.miniRemove} onClick={() => removeItem(item.id, family)} aria-label={t("a11y.removeFromFamily", { code: item.code, family: COLOR_FAMILY_LABELS[family] })}>×</button>
                          {wasManuallyMoved && (
                            <button
                              style={{ ...styles.miniRemove, left: 2, right: "auto" }}
                              onClick={() => resetItemPosition(item.id, family)}
                              aria-label={t("a11y.moveBack", { code: item.code })}
                              title={t("a11y.moveBack", { code: item.code })}
                            >
                              ⇱
                            </button>
                          )}
                          <div style={styles.miniLabel}>{item.code}</div>
                          {others.length > 0 && <div style={styles.crossFamilyLabel}>{t("alsoIn", { families: others.join(", ") })}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -- options + generate -- */}
      <div style={styles.optionsRow}>
        <label style={styles.optionLabel}>
          {t("options.swatchStyle")}
          <select value={swatchStyle} onChange={(e) => setSwatchStyle(e.target.value as SwatchStyle)}>
            <option value="filled">{t("options.swatchStyleFilled")}</option>
            <option value="blank">{t("options.swatchStyleBlank")}</option>
          </select>
        </label>
        <label style={styles.optionLabel}>
          {t("options.bundleHole")}
          <select value={headerHolePos} onChange={(e) => setHeaderHolePos(e.target.value as HeaderHolePos)}>
            <option value="none">{t("options.holeNone")}</option>
            <option value="left">{t("options.holeLeft")}</option>
            <option value="center">{t("options.holeCenter")}</option>
            <option value="right">{t("options.holeRight")}</option>
          </select>
        </label>
        <label style={styles.optionLabel}>
          {t("options.cardLayout")}
          <select value={cardPacking} onChange={(e) => setCardPacking(e.target.value as CardPacking)}>
            <option value="per-family">{t("options.layoutPerFamily")}</option>
            <option value="packed">{t("options.layoutPacked")}</option>
          </select>
        </label>
        <label style={styles.optionLabel}>
          {t("options.paperSize")}
          <select value={paperSize} onChange={(e) => setPaperSize(e.target.value as PaperSize)}>
            <option value="a4">{t("options.paperA4")}</option>
            <option value="letter">{t("options.paperLetter")}</option>
          </select>
        </label>
      </div>

      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
        {t("cardCountSummary", { cardCount: allCards.length, colorCount: totalColors })}
      </p>

      {unlockError && <div style={styles.checkoutError}>⚠️ {unlockError}</div>}

      {checkoutOpened && (
        <div style={{ background: "#F0F7FF", border: "1.5px solid #B8D4F0", borderRadius: 12, padding: 14, color: "#2c5a8c", fontSize: 14, marginBottom: 12 }}>
          <p style={{ margin: 0 }}>
            {t("checkoutOpened.line1")}
          </p>
          <p style={{ margin: "10px 0 0" }}>
            {t("checkoutOpened.line2")}
          </p>
          {swatchOrderId && (
            <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.85 }}>
              {t("checkoutOpened.orderReference", { id: swatchOrderId })}
            </div>
          )}
        </div>
      )}

      {overFreeLimit ? (
        <>
          <p style={{ fontSize: 13.5, color: "var(--ink)", marginBottom: 12 }}>
            {t("paywallStatus", { count: totalColors, limit: FREE_COLOR_LIMIT, price: bandPriceDisplay ?? "" })}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={downloadFreePreview} disabled={generating !== null}>
              {generating === "preview" ? t("actions.generating") : t("actions.downloadFreePreview", { limit: FREE_COLOR_LIMIT })}
            </button>
            <button className="btn-primary" onClick={unlockFullSet} disabled={generating !== null}>
              {generating === "unlock" ? t("actions.redirecting") : t("actions.unlockFullSet", { price: bandPriceDisplay ?? "" })}
            </button>
            <button className="btn-outline" onClick={downloadBlankTemplate} disabled={generating !== null}>
              {generating === "blank" ? t("actions.generating") : t("actions.downloadBlankTemplate")}
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={downloadAll} disabled={selected.length === 0 || generating !== null}>
            {generating === "all" ? t("actions.generating") : t("actions.downloadAll")}
          </button>
          <button className="btn-outline" onClick={downloadBlankTemplate} disabled={generating !== null}>
            {generating === "blank" ? t("actions.generating") : t("actions.downloadBlankTemplate")}
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}