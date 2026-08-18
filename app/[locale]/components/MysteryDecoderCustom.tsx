"use client";

// Custom Mystery Decoder -- lets a customer pick their OWN mix of
// Guangna + Languo marker sets (not a fixed size/code like the
// pre-generated MysteryDecoderPacks.tsx tiles) and get a decoder
// matched to exactly what they own, combining both brands into one
// best-match-per-code pool. See lib/mysteryDecoderMatch.ts (pooling +
// matching) and lib/mysteryDecoderPdf.ts (PDF rendering, matches
// book_to_guangna_v2.py's row/band layout -- see that file's own
// header comment for the full v3 rebuild history).
//
// v2 (2026-08-15), per her direct feedback on v1:
//   1. Guangna/Languo set pickers changed from a checkbox-chip grid to
//      real native <select multiple> listboxes, matching the
//      dropdown-based multi-select pattern used on Swatch Creator and
//      the main Create page.
//   2. ALL user-facing text now goes through next-intl's t() under a
//      new "mysteryDecoderCustom" namespace -- nothing is hardcoded
//      English anymore in the UI layer. (This does NOT extend to the
//      generated PDF's own internal text -- the disclaimer/free-preview
//      note baked into the PDF itself via lib/mysteryDecoderPdf.ts stays
//      English for now, same as her existing pack PDFs; translating
//      PDF content is a materially bigger scope than translating page
//      UI and wasn't clearly what was being asked for. Flag if that's
//      wanted too.) See the EN translation block below this header
//      comment -- paste into en.json. Per her requirement, this feature
//      only needs EN+FR (not the site's full de/nl/es/it set) -- see
//      messages/mysteryDecoderCustom-en.json / -fr.json.
//   3. Free preview correctly reflects "the whole first page", not "the
//      first book row only" -- lib/mysteryDecoderPdf.ts's API changed
//      from a freeLineLimit line-count to a previewFirstPageOnly flag;
//      this component's call site updated to match.
//   4/5. No UI changes needed for the PDF-layout fixes (portrait
//      orientation, 30-code-per-line hard cap regardless of row size)
//      -- those live entirely in lib/mysteryDecoderPdf.ts.
//
// v3 (2026-08-17) -- the paid unlock is wired up for real:
//   - Extra-codes parsing (tokenize + normalize per brand) moved out to
//     lib/mysteryDecoderExtraCodes.ts's parseExtraCodesText(), so the
//     paid download page can re-run the EXACT same parsing against the
//     raw text saved at order time instead of risking the two drifting
//     apart.
//   - handleUnlock() now does the real submit-mystery-order ->
//     create-mystery-checkout -> LemonSqueezy redirect flow, mirroring
//     Swatch Creator's paywall. Locale comes from the route (useParams,
//     same pattern create/page.tsx already uses) so the customer lands
//     back on /{locale}/mystery-decoder-download after paying, and so
//     the webhook's backup email goes out in the right language.
//   - New translation keys: "unlockingButton", "unlockFailedError" --
//     added to the EN block below and to messages/mysteryDecoderCustom-fr.json.
//
// ARCHITECTURE STATUS: this component generates a real, live FREE
// PREVIEW (the entire first page) entirely client-side, and now also
// kicks off the real paid-unlock flow via handleUnlock(). The customer
// lands on /{locale}/mystery-decoder-download after paying, where the
// full (unlocked) PDF is generated the same way the free preview is
// here, just without the previewFirstPageOnly flag.
//
// BOOK DATA: fetched lazily per-book from the site's own public/
// folder (see BOOK_DATA_BASE below -- served as /mystery-decoder/...
// by Next.js) as plain {line, label, hex}[] JSON and wrapped into the
// BookData shape lib/mysteryDecoderMatch.ts expects
// ({book, count, entries}) at fetch time. She saved the 9 real book
// JSON files directly to public/mystery-decoder/ rather than
// uploading to GCS -- if that changes later, update BOOK_DATA_BASE
// back to the bucket URL. BOOKS below lists the exact filenames
// expected there.
//
// EXTRA OWNED CODES: lib/mysteryDecoderMatch.ts's buildCombinedPool()
// only accepts SET KEYS (a key into GUANGNA_SETS/LANGUO_SETS), not a
// raw list of codes -- rather than changing that module's signature,
// free-typed extra codes are injected here as a SYNTHETIC set key
// ("__extra_guangna__"/"__extra_languo__") added to a local copy of
// the sets dict before calling buildCombinedPool. If you ever refactor
// mysteryDecoderMatch.ts, keep this in mind -- those two key names are
// reserved/magic as far as this component (and the download page) are
// concerned.
//
// NEW translation keys needed under a "mysteryDecoderCustom" namespace
// -- EN block below, ready to paste into en.json (FR translation
// delivered alongside as messages/mysteryDecoderCustom-fr.json):
//
// "mysteryDecoderCustom": {
//   "selectBookLabel": "Choose your book",
//   "selectGuangnaSetsLabel": "Your Guangna marker sets",
//   "selectLanguoSetsLabel": "Your Languo marker sets",
//   "multiSelectHint": "Hold Ctrl (Windows) or Cmd (Mac) to select more than one.",
//   "extraCodesLabel": "Extra individual codes you own (optional)",
//   "extraCodesPlaceholder": "e.g. GN-605, HG-F01, BR-702",
//   "generatePreviewButton": "Generate free preview",
//   "generatingButton": "Generating preview...",
//   "unlockFullDecoderButton": "Unlock full decoder",
//   "unlockingButton": "Redirecting to checkout...",
//   "noSetsSelectedError": "Pick at least one marker set (or type in some codes you own) before generating a preview.",
//   "noMatchError": "Couldn't match any codes for this book -- try selecting a different set.",
//   "generationFailedError": "Something went wrong generating your preview. Please try again.",
//   "unlockFailedError": "Something went wrong starting checkout. Please try again, or contact us if it keeps happening.",
//   "freePreviewCaption": "Free preview (first page) -- unlock the full decoder to see every page.",
//   "viewPreviewButton": "View free preview PDF",
//   "languoLinePaint": "Paint",
//   "languoLineGel": "Gel Pens",
//   "languoLinePlus": "Plus",
//   "languoLineQimiart": "Languo x Qimiart",
//   "defaultSetLabel": "Your markers"
// }
//
// Save as components/MysteryDecoderCustom.tsx (crea-bea-studio).

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SET_OPTIONS, GUANGNA_SETS } from "@/lib/guangna";
import { LANGUO_SETS } from "@/lib/languoSets";
import { MYSTERY_DECODER_VARIANT } from "@/lib/mysteryDecoderPricing";
import { buildCombinedPool, matchBook, type BookData } from "@/lib/mysteryDecoderMatch";
import { buildFreePreviewDoc } from "@/lib/mysteryDecoderPdf";
import { parseExtraCodesText } from "@/lib/mysteryDecoderExtraCodes";

const BOOK_DATA_BASE = "/mystery-decoder";

interface BookOption {
  slug: string;
  title: string;
}

// All 9 real books, sourced from All_Matches.xlsx (2026-08-15 pass) --
// see /areas/mystery-decoder-custom.md for the indexed-color-fill bug
// that was found and fixed while generating these.
const BOOKS: BookOption[] = [
  { slug: "princess-vol1", title: "Princess Vol 1" },
  { slug: "princess-vol2", title: "Princess Vol 2" },
  { slug: "great-classics-vol1", title: "Great Classics Vol 1" },
  { slug: "great-classics-vol2", title: "Great Classics Vol 2" },
  { slug: "great-classics-vol3", title: "Great Classics Vol 3" },
  { slug: "great-classics-vol4", title: "Great Classics Vol 4" },
  { slug: "great-classics-vol11", title: "Great Classics Vol 11" },
  { slug: "great-classics-vol13", title: "Great Classics Vol 13" },
  { slug: "tres-grands-classiques", title: "Tres Grands Classiques" },
  { slug: "fantastiques", title: "Fantastiques" },
  { slug: "mondes-fantastiques", title: "Mondes Fantastiques" },
  { slug: "heros-vs-villains", title: "Heros vs Villains" },
  { slug: "special-portraits", title: "Special Portraits" },
  { slug: "pokemon", title: "Pokemon" },
];

// Groups LANGUO_SETS' keys by their `.line` field, preserving the
// object's own key order within each group -- mirrors the grouping
// create/page.tsx already does for the main PBN generator's Languo
// picker (see [[multi-brand-pbn-expansion]]), so this UI's grouping
// stays visually consistent with the rest of the site.
function groupLanguoSetsByLine(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const [key, set] of Object.entries(LANGUO_SETS)) {
    const line = set.line;
    if (!groups[line]) groups[line] = [];
    groups[line].push(key);
  }
  return groups;
}

const LANGUO_GROUPS = groupLanguoSetsByLine();
const EXTRA_GUANGNA_KEY = "__extra_guangna__";
const EXTRA_LANGUO_KEY = "__extra_languo__";
const SUPPORTED_LOCALES = new Set(["en", "fr"]);

const bookCache = new Map<string, BookData>();

async function fetchBook(slug: string): Promise<BookData> {
  const cached = bookCache.get(slug);
  if (cached) return cached;
  const res = await fetch(`${BOOK_DATA_BASE}/${slug}.json`);
  if (!res.ok) throw new Error(`Failed to fetch book data for ${slug}: ${res.status}`);
  const raw: { line: string; label: string; hex: string }[] = await res.json();
  const book: BookData = { book: slug, count: raw.length, entries: raw };
  bookCache.set(slug, book);
  return book;
}

function selectedOptionValues(e: React.ChangeEvent<HTMLSelectElement>): string[] {
  return Array.from(e.target.selectedOptions).map((o) => o.value);
}

export default function MysteryDecoderCustom() {
  const t = useTranslations("mysteryDecoderCustom");
  const routeParams = useParams();
  const locale = SUPPORTED_LOCALES.has(String(routeParams?.locale)) ? String(routeParams.locale) : "en";

  const [selectedBookSlug, setSelectedBookSlug] = useState<string>(BOOKS[0].slug);
  const [selectedGuangnaSets, setSelectedGuangnaSets] = useState<string[]>([]);
  const [selectedLanguoSets, setSelectedLanguoSets] = useState<string[]>([]);
  const [extraCodesText, setExtraCodesText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const languoLineLabel = (line: string): string => {
    switch (line) {
      case "paint": return t("languoLinePaint");
      case "gel": return t("languoLineGel");
      case "plus": return t("languoLinePlus");
      case "qimiart": return t("languoLineQimiart");
      default: return line;
    }
  };

  const bookTitleFor = (slug: string): string => BOOKS.find((b) => b.slug === slug)?.title ?? slug;

  const setLabelFor = (guangnaKeys: string[], languoKeys: string[]): string => {
    const pickedLabels = [...guangnaKeys, ...languoKeys];
    return pickedLabels.length ? pickedLabels.join(" + ") : t("defaultSetLabel");
  };

  const handleGeneratePreview = useCallback(async () => {
    setErrorMsg(null);
    setPreviewUrl(null);

    const { guangnaCodes: extraGuangnaCodes, languoCodes: extraLanguoCodes } = parseExtraCodesText(extraCodesText);

    const guangnaSetKeys = [...selectedGuangnaSets];
    const languoSetKeys = [...selectedLanguoSets];
    const guangnaSetsForPool: Record<string, string[]> = { ...GUANGNA_SETS };
    const languoSetsForPool: Record<string, { line: string; codes: string[] }> = { ...LANGUO_SETS };

    if (extraGuangnaCodes.length) {
      guangnaSetsForPool[EXTRA_GUANGNA_KEY] = extraGuangnaCodes;
      guangnaSetKeys.push(EXTRA_GUANGNA_KEY);
    }
    if (extraLanguoCodes.length) {
      languoSetsForPool[EXTRA_LANGUO_KEY] = { line: "extra", codes: extraLanguoCodes };
      languoSetKeys.push(EXTRA_LANGUO_KEY);
    }

    if (guangnaSetKeys.length === 0 && languoSetKeys.length === 0) {
      setErrorMsg(t("noSetsSelectedError"));
      return;
    }

    setIsGenerating(true);
    try {
      const book = await fetchBook(selectedBookSlug);
      const pool = buildCombinedPool(guangnaSetKeys, languoSetKeys, guangnaSetsForPool, languoSetsForPool);
      const matches = matchBook(book, pool);
      if (matches.length === 0) {
        setErrorMsg(t("noMatchError"));
        return;
      }
      const bookTitle = bookTitleFor(selectedBookSlug);
      const setLabel = setLabelFor(selectedGuangnaSets, selectedLanguoSets);
      const doc = await buildFreePreviewDoc(matches, bookTitle, "safe", setLabel);
      const blobUrl = doc.output("bloburl") as unknown as string;
      setPreviewUrl(blobUrl);
    } catch (err) {
      console.error("Custom Mystery Decoder preview generation failed:", err);
      setErrorMsg(t("generationFailedError"));
    } finally {
      setIsGenerating(false);
    }
  }, [selectedBookSlug, selectedGuangnaSets, selectedLanguoSets, extraCodesText, t]);

  // Real paid-unlock flow: save the selection (submit-mystery-order),
  // create a LemonSqueezy checkout for the flat-price Mystery Decoder
  // variant (create-mystery-checkout), then redirect the customer there.
  // Payment confirmation itself happens asynchronously via the webhook;
  // the customer lands back on /{locale}/mystery-decoder-download once
  // it's done, where the full PDF is generated the same way the free
  // preview is here (see that page for the mirrored pool-building
  // logic).
  const handleUnlock = useCallback(async () => {
    setUnlockError(null);
    setIsUnlocking(true);

    const checkoutTab = window.open("", "_blank");

    try {
      const bookTitle = bookTitleFor(selectedBookSlug);
      const setLabel = setLabelFor(selectedGuangnaSets, selectedLanguoSets);

      const submitRes = await fetch("/api/submit-mystery-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: selectedBookSlug,
          bookTitle,
          guangnaSetKeys: selectedGuangnaSets,
          languoSetKeys: selectedLanguoSets,
          extraCodesText,
          setLabel,
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.orderId) {
        throw new Error(submitData.error ?? "SUBMIT_FAILED");
      }

      const checkoutRes = await fetch("/api/create-mystery-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: submitData.orderId, locale }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error ?? "CHECKOUT_FAILED");
      }

      if (checkoutTab) {
        checkoutTab.location.href = checkoutData.url;
      } else {
        window.location.href = checkoutData.url;
      }
    } catch (err) {
      if (checkoutTab) checkoutTab.close();
      console.error("Custom Mystery Decoder unlock failed:", err);
      setUnlockError(t("unlockFailedError"));
    } finally {
      setIsUnlocking(false);
    }
  }, [selectedBookSlug, selectedGuangnaSets, selectedLanguoSets, extraCodesText, locale, t]);
  
  return (
    <div>
      <style>{`
        .mdc-section-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 8px;
          margin-top: 20px;
          text-transform: uppercase;
        }
        .mdc-select {
          width: 100%;
          max-width: 420px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .mdc-multiselect {
          width: 100%;
          max-width: 420px;
          padding: 6px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 13px;
          color: var(--ink);
        }
        .mdc-multiselect optgroup {
          font-weight: 700;
          color: var(--ink);
        }
        .mdc-multiselect option {
          padding: 4px 6px;
        }
        .mdc-hint {
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 4px;
        }
        .mdc-extra-input {
          width: 100%;
          max-width: 420px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
          color: var(--ink);
        }
        .mdc-error {
          color: #c0392b;
          font-size: 13px;
          margin-top: 10px;
        }
      `}</style>

      <div className="mdc-section-label">{t("selectBookLabel")}</div>
      <select
        className="mdc-select"
        value={selectedBookSlug}
        onChange={(e) => {
          setSelectedBookSlug(e.target.value);
          setPreviewUrl(null);
          setErrorMsg(null);
        }}
      >
        {BOOKS.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.title}
          </option>
        ))}
      </select>

      <div className="mdc-section-label">{t("selectGuangnaSetsLabel")}</div>
      <select
        className="mdc-multiselect"
        multiple
        size={8}
        value={selectedGuangnaSets}
        onChange={(e) => setSelectedGuangnaSets(selectedOptionValues(e))}
      >
        {SET_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="mdc-hint">{t("multiSelectHint")}</div>

      <div className="mdc-section-label">{t("selectLanguoSetsLabel")}</div>
      <select
        className="mdc-multiselect"
        multiple
        size={10}
        value={selectedLanguoSets}
        onChange={(e) => setSelectedLanguoSets(selectedOptionValues(e))}
      >
        {Object.entries(LANGUO_GROUPS).map(([line, keys]) => (
          <optgroup key={line} label={languoLineLabel(line)}>
            {keys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="mdc-hint">{t("multiSelectHint")}</div>

      <div className="mdc-section-label">{t("extraCodesLabel")}</div>
      <input
        type="text"
        className="mdc-extra-input"
        placeholder={t("extraCodesPlaceholder")}
        value={extraCodesText}
        onChange={(e) => setExtraCodesText(e.target.value)}
      />

      <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn-primary"
          disabled={isGenerating}
          onClick={handleGeneratePreview}
          style={{ padding: "10px 20px", fontSize: 14 }}
        >
          {isGenerating ? t("generatingButton") : t("generatePreviewButton")}
        </button>

          <button
            type="button"
            disabled={isUnlocking}
            onClick={handleUnlock}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 8,
              border: "1px solid var(--pink)",
              background: "white",
              color: "var(--pink)",
              cursor: isUnlocking ? "default" : "pointer",
              opacity: isUnlocking ? 0.7 : 1,
            }}
          >
            {isUnlocking ? t("unlockingButton") : t("unlockFullDecoderButton", { price: MYSTERY_DECODER_VARIANT.price })}
            </button>
      
      </div>

      {errorMsg && <div className="mdc-error">{errorMsg}</div>}
      {unlockError && <div className="mdc-error">{unlockError}</div>}

      {previewUrl && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
            {t("freePreviewCaption")}
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13, color: "var(--pink)", fontWeight: 700, textDecoration: "none",
              border: "1px solid var(--pink)", borderRadius: 8, padding: "8px 14px",
            }}
          >
            {t("viewPreviewButton")}
          </a>
        </div>
      )}
    </div>
  );
}
