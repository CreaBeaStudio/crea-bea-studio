"use client";
// Save this file as app/[locale]/create/page.tsx
//
// UPDATED (2026-08-06, multi-brand): full rewrite of Step 2 (marker
// selection) and Step 3 (preview) to support Guangna AND Languo
// together, per Mirjam's [[multi-brand-pbn-expansion]] backend work
// (deployed 2026-08-05, /generate-multi-way).
//
//  - Step 2 now shows TWO always-visible set pickers (Guangna, Languo)
//    instead of one -- a customer can select sets from both brands at
//    once. selectedSets (single array) is replaced by
//    selectedGuangnaSets + selectedLanguoSets; everywhere downstream
//    that needs "all selected sets" combines them
//    ([...selectedGuangnaSets, ...selectedLanguoSets]) -- this is also
//    exactly what gets sent as the API's comma-separated `sets` field,
//    so confirm/page.tsx and submit-order/route.ts need NO changes:
//    they already treat `sets` as an opaque string[]/string, never
//    Guangna-specific.
//  - The free-text "individual codes" field now accepts BOTH Guangna
//    codes (bare digits, "GN-605", "HG-F01") and Languo codes
//    ("BR-702", "AG-171") in the same box, comma/space separated.
//    Validated via lib/guangna.ts's normalizeExtraCode() OR
//    lib/languo.ts's normalizeLanguoExtraCode() per token -- both are
//    the same real-code-table validators already used elsewhere in
//    the codebase (ColorConverter etc.), not a new hand-rolled regex.
//  - PreviewResult (owned/full366/natural, fixed shape) is replaced by
//    MultiPreviewResult (owned/references/natural), matching
//    /generate-multi-way's real response shape 1:1 (see main.py's
//    /generate-multi-way docstring). `references` is a dict with 0-4
//    keys ("guangna"/"paint"/"gel"/"plus"), one per brand/line the
//    customer touches and hasn't already maxed out -- NOT a fixed
//    owned/full366 pair anymore. The preview section maps over
//    Object.entries(previewResult.references) instead of rendering two
//    hardcoded panels. The old isFullPalette special-case (a single
//    full-width slider when GN-8101-366 was selected) is dropped --
//    with multiple possible reference brands there's no single
//    "the customer selected the full palette" case anymore; owned +
//    every reference panel now render uniformly in a responsive grid.
//  - Added a short note (per Mirjam, 2026-08-05 session notes) shown
//    when the customer has selected markers from BOTH Guangna and
//    Languo at once, since combined-brand generation is measurably
//    slower on the current Cloud Run sizing (~28-32s vs ~8s locally,
//    confirmed pre-existing infra, not a regression) -- sets
//    expectations rather than looking stuck.
//  - "wantsFullGuide" (free full-palette-guide opt-in) is kept as a
//    single generic checkbox shown once below whichever reference
//    panels render, rather than tied to one specific "full366" panel
//    as before -- still just a boolean carried through to order.json
//    unchanged; which reference line(s) it applies to is a
//    /generate-full-side decision for a future pass (see
//    [[multi-brand-pbn-expansion]]'s flagged /generate-full gap).
//
// Everything else (crop, background tools, quality floor, draft
// restore, paper size, email, cart/order summary, submit) is
// unchanged from the previous version.

import Navbar from "../components/Navbar";
import LoadingCat from "../components/LoadingCat";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { GUANGNA_BY_NUMBER, parseEuroPrice, toUsdEstimate } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";
import { saveDraft, loadDraft, fileToBase64, base64ToFile } from "@/lib/createDraft";
import { isApiErrorCode } from "@/lib/apiErrors";
import { SET_OPTIONS as GUANGNA_SET_OPTIONS_RAW, normalizeExtraCode } from "@/lib/guangna";

// EXPLICIT ORDER (2026-08-07, per Mirjam): Classic Brush + skin variants,
// Dual colors, and Dual tip sets follow her exact specified sequence
// rather than a pure numeric sort -- 366 before 408 is deliberate, and
// the 24F/12B skin variants slot into the main Classic Brush sequence
// rather than sitting off with the single-color dual-tip packs. Every
// key NOT listed here (dual-tip single-color 12-packs, Macaron, High
// Gloss) falls back to the original size-descending sort, appended
// after all of these.
const GUANGNA_SET_PRIORITY_ORDER: string[] = [
  // --- Classic Brush ---
  "GN.8101-488 (488 colors)",
  "GN.8101-366 (366 colors)",
  "GN.8101-408 (360 colors)",
  "GN.8101-360 (360 colors)",
  "GN.8101-288 (288 colors)",
  "GN.8101-240 (240 colors)",
  "GN.8101-168 (168 colors)",
  "GN.8101-120 (120 colors)",
  "GN.8101-100 (100 colors)",
  "GN.8101-72 (72 colors)",
  "GN.8101-60 (60 colors)",
  "GN.8101-48 (48 colors)",
  "GN.8101-36 (36 colors)",
  "GN.8101-24 (24 colors)",
  "GN.8101-12 (12 colors)",
  "GN.8201F-24 (24 colors)",
  "GN.8201B-12 (12 colors)",
  "GN.8201M-24 (24 colors)",
  

  // --- High Gloss ---
  "GN.586-288 (288 colors)",
  "GN.586-168 (168 colors)",
  "GN.586A-12 (12 colors)",
  "GN.586B-12 (12 colors)",
  "GN.586C-12 (12 colors)",
  "GN.586D-12 (12 colors)",
  "GN.586E-12 (12 colors)",
  "GN.586F-12 (12 colors)",
  "GN.586G-12 (12 colors)",
  "GN.586H-12 (12 colors)",
  "GN.586I-12 (12 colors)",
  "GN.586J-12 (12 colors)",
  "GN.586K-12 (12 colors)",
  "GN.586L-12 (12 colors)",
  "GN.586M-12 (12 colors)",
  "GN.586N-12 (12 colors)",
  "GN.586O-12 (12 colors)",
  "GN.586P-12 (12 colors)",
  "GN.586Q-12 (12 colors)",
  "GN.586R-12 (12 colors)",
  "GN.586S-12 (12 colors)",
  "GN.586T-12 (12 colors)",
  "GN.586U-12 (12 colors)",
  "GN.586V-12 (12 colors)",
  "GN.586W-12 (12 colors)",
  "GN.586X-12 (12 colors)",

  // --- Dual tip / Dual colors ---
  "GN.8106-84 (168 colors)",
  "GN.8106-60 (120 colors)",
  "GN.8106-30 (60 colors)",
  "GN.8109-240 (240 colors)",
  "GN.8109-72 (72 colors)",
  "GN.8102-36 (36 colors)",
  "GN.8109A-12 (12 colors)",
  "GN.8109B-12 (12 colors)",
  "GN.8109C-12 (12 colors)",
  "GN.8109D-12 (12 colors)",
  "GN.8109E-12 (12 colors)",
  "GN.8109F-12 (12 colors)",
  "GN.8109G-12 (12 colors)",
  "GN.8109H-12 (12 colors)",
  "GN.8109I-12 (12 colors)",
  "GN.8109K-12 (12 colors)",
];

const GUANGNA_SET_OPTIONS = [...GUANGNA_SET_OPTIONS_RAW]
  // Not matched by pbn-webservice's owned-set matching yet -- hide from
  // this picker until that's supported, even though the set exists in
  // lib/guangna.ts for the other tools (Color Converter, Reference
  // Guide, etc.) that do support it.
  .filter(s => !s.key.startsWith("GN.8301-Metallic"))
  .sort((a, b) => {
  const ia = GUANGNA_SET_PRIORITY_ORDER.indexOf(a.key);
  const ib = GUANGNA_SET_PRIORITY_ORDER.indexOf(b.key);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  const na = parseInt(a.label.match(/\((\d+)\s*colors?\)/i)?.[1] ?? "-1", 10);
  const nb = parseInt(b.label.match(/\((\d+)\s*colors?\)/i)?.[1] ?? "-1", 10);
  if (na !== nb) return nb - na;
  return a.label.localeCompare(b.label);
});
import { normalizeLanguoExtraCode } from "@/lib/languo";

// ── MULTI-BRAND: Languo set picker options (2026-08-06) ────────────────
// Hardcoded here (not imported from lib/languoSets.ts) deliberately --
// the frontend never needs each set's actual CODE membership (that
// resolution happens server-side, in main.py's
// _resolve_owned_ids_multi()), only the exact SET-NAME STRINGS to send
// as `sets` tokens and a "line" tag for grouping the picker. Using the
// exact names/line groupings straight from her real languoSets.json
// data (confirmed matching main.py's BIGGEST_SET_IDS_BY_LINE keys for
// the three "biggest set" names) avoids any risk of this file's Languo
// set list silently drifting from lib/languoSets.ts's own export shape.
// If lib/languoSets.ts's real TS export differs from this list (new
// sets added, names changed), update this array to match -- it MUST
// stay byte-for-byte in sync with the webservice's gn.LANGUO_SETS keys,
// since a mismatched string here means /generate-multi-way 400s with
// "Unrecognized set".
//
// UPDATED (2026-08-06, per Mirjam): imports the real token list from
// lib/languoSets.ts instead of hardcoding it a second time here --
// SET_OPTIONS' shape (key/label) mirrors lib/guangna.ts's own
// SET_OPTIONS by design (per her established "mirror the Guangna
// pattern" convention), so LANGUO_SET_OPTIONS is expected to have the
// same {key, label} shape. `key` is treated as the backend-critical
// token (byte-exact match to gn.LANGUO_SETS' keys) -- if this import
// doesn't compile, it means the real export differs from that
// assumption; check lib/languoSets.ts's actual export shape and
// adjust the `.key`/`.label` field names below to match, rather than
// guessing further.
//
// Display labels (LANGUO_PRETTY_LABELS below) and sort sizes
// (LANGUO_SET_SIZE) are a SEPARATE, hand-curated layer on top --
// deliberately decoupled from the import, so a cosmetic naming choice
// never risks the backend-critical token value. If you add a new
// Languo set to lib/languoSets.ts in the future, it'll automatically
// appear in this picker (solves the "forgot to add it somewhere
// else" problem) -- it'll just show its raw token as a fallback label
// until you also add an entry to LANGUO_PRETTY_LABELS/LANGUO_SET_SIZE
// below, which is a much smaller manual step than the old full
// duplication.
import { LANGUO_SETS as LANGUO_SET_OPTIONS_RAW, LANGUO_PRETTY_LABELS } from "@/lib/languoSets";

type LanguoLine = "paint" | "gel" | "plus" | "qimiart";

function deriveLanguoLine(token: string): LanguoLine {
  if (/gel/i.test(token)) return "gel";
  if (/plus/i.test(token)) return "plus";
  if (/qimiart/i.test(token)) return "qimiart";
  return "paint";
}


// Sort key (descending = largest set first, per Mirjam's request).
// Sets without a clear numeric size (the "Series" sub-palettes) sort
// after all numbered sets, alphabetically among themselves.
const LANGUO_SET_SIZE: Record<string, number> = {
  "Brush 288 Set": 288, "240 Set": 240, "192 Set": 192, "96 Set": 96,
  "72 Set": 72, "60 Set": 60, "48 Set": 48, "36 Set": 36, "24 Set": 24,
  "Gel 234 Set": 234, "Gel 45 Set": 45, "Gel 72 Set": 72, "Gel 99 Set": 99,
  "Gel 168/162 Set": 168,
  "PLUS 144 Set": 144, "PLUS 36 Set": 36, "PLUS 54 Set": 54,
  "PLUS 72 Set": 72, "PLUS 90 Set": 90,
};

type LanguoOption = { token: string; prettyLabel: string; line: LanguoLine; size: number };

// CORRECTED (2026-08-06): the real lib/languoSets.ts exports LANGUO_SETS
// as Record<string, {line, codes}> -- a dict keyed by set name, matching
// her raw languoSets.json data exactly -- NOT an array of {key,label}
// the way the first guess assumed (that guess came from a TS compile
// error, confirming the real shape rather than the assumed one).
function buildLanguoOptions(raw: Record<string, { line: string; codes: string[] }>): LanguoOption[] {
  const options: LanguoOption[] = Object.keys(raw).map(token => ({
    token,
    prettyLabel: LANGUO_PRETTY_LABELS[token] ?? token,
    line: deriveLanguoLine(token), // ignoring raw[token].line -- deriving from the
                                    // token itself keeps this resilient even if a
                                    // future set's own "line" field is inconsistent
    size: LANGUO_SET_SIZE[token] ?? -1, // -1 sorts after every numbered set
  }));
  return options.sort((a, b) => {
    if (a.size !== b.size) return b.size - a.size; // large -> small
    return a.prettyLabel.localeCompare(b.prettyLabel); // stable tiebreak
  });
}

const LANGUO_SET_OPTIONS: LanguoOption[] = buildLanguoOptions(LANGUO_SET_OPTIONS_RAW);

const LANGUO_LINE_LABELS: Record<LanguoLine, string> = {
  paint: "Paint",
  gel: "Gel Pens",
  plus: "PLUS Acrylic",
  qimiart: "x Qimiart",
};

const DEFAULT_LEVEL = "24";

const LEVEL_KEYS: Record<string, { labelKey: string; descKey: string; popular?: boolean }> = {
  "15": { labelKey: "levels.beginner",     descKey: "levels.beginnerDesc" },
  "24": { labelKey: "levels.intermediate", descKey: "levels.intermediateDesc", popular: true },
  "36": { labelKey: "levels.advanced",     descKey: "levels.advancedDesc" },
};
const LEVEL_VALUES = ["15", "24", "36"];

function priceFor(p: PaperSize) {
  return GUANGNA_BY_NUMBER[p === "letter" ? "us" : "a4"].price;
}

const LEVEL_TO_DIFFICULTY: Record<string, string> = {
  "15": "beginner",
  "24": "standard",
  "36": "advanced",
};

const MIN_PHOTO_DIMENSION = 1200;
const BG_TOOLS_ENABLED = false;

// OrderItem/prevOrders round-trip through URL params unchanged -- `sets`
// stays a plain string[] (now containing a mix of Guangna + Languo set
// tokens), so confirm/page.tsx's own OrderItem type needs NO change.
type OrderItem = {
  photoName:  string;
  level:      string;
  levelLabel: string;
  paperSize:  PaperSize;
  priceLabel: string;
  sets:       string[];
  indPens:    string;
};

// ── MULTI-BRAND: matches /generate-multi-way's real response shape
// (see main.py's /generate-multi-way + pbn_guangna_generate.py's
// generate_multi_way()) -- NOT the old fixed owned/full366/natural
// shape. `references` has 0-4 keys, one per brand/line the customer
// touches that isn't already at its biggest set. ─────────────────────
type LegendEntry = {
  number: number;
  rgb: number[];
  pixel_area: number;
  marker_id?: string;
  marker_name?: string;
  marker_ids?: string[];
  marker_names?: string[];
};
type PreviewBranch = {
  outline_png_base64: string;
  preview_png_base64: string;
  natural_region_count: number;
  final_region_count: number;
  legend: LegendEntry[];
};
type UpsellEntry = {
  marker_id: string;
  marker_name: string;
  marker_rgb: number[];
  region_count: number;
};
type ReferenceBranch = {
  result: PreviewBranch;
  upsell: UpsellEntry[];
};
type MultiPreviewResult = {
  owned: PreviewBranch | null;
  references: Record<string, ReferenceBranch>;
  natural: PreviewBranch | null;
  generation_seconds: number;
};

// Picks the N markers covering the most pixel area in a branch's legend
// -- unchanged logic from before, just no longer Guangna-specific
// (marker_id can now be any brand's code).
function topMarkers(legend: LegendEntry[] | undefined, n: number, exclude?: Set<string>): LegendEntry[] {
  if (!legend) return [];
  const byMarker = new Map<string, LegendEntry & { total_area: number }>();
  for (const e of legend) {
    if (!e.marker_id) continue;
    if (exclude?.has(e.marker_id)) continue;
    const existing = byMarker.get(e.marker_id);
    if (existing) {
      existing.total_area += e.pixel_area;
    } else {
      byMarker.set(e.marker_id, { ...e, total_area: e.pixel_area });
    }
  }
  return Array.from(byMarker.values())
    .sort((a, b) => b.total_area - a.total_area)
    .slice(0, n);
}

function MarkerSwatches({ legend, exclude }: { legend: LegendEntry[] | undefined; exclude?: Set<string> }) {
  const markers = topMarkers(legend, 5, exclude);
  if (markers.length === 0) return null;
  return (
    <div style={{display:"flex", gap:10, marginTop:8, flexWrap:"wrap"}}>
      {markers.map(m => (
        <div key={m.marker_id} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:3}} title={m.marker_name}>
          <div style={{
            width:26, height:26, borderRadius:7,
            background:`rgb(${m.rgb[0]}, ${m.rgb[1]}, ${m.rgb[2]})`,
            border:"1px solid rgba(0,0,0,0.15)",
          }} />
          <span style={{fontSize:10, color:"var(--muted)", fontWeight:600}}>
            {m.marker_id!.replace(/^GN-?/i, "")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── MULTI-BRAND: replaces toApiExtraCodes(). Normalizes each free-text
// token against BOTH real code tables (Guangna via normalizeExtraCode --
// handles bare-digit GN codes and HG- codes; Languo via
// normalizeLanguoExtraCode -- handles the 2-letter-prefix codes,
// excludes Glitter). A token that resolves against neither is dropped
// here (validateIndPensMulti below is what surfaces the error to the
// customer; this function's job is just building the API payload from
// whatever DID validate). ─────────────────────────────────────────────
function normalizeMultiExtraCode(token: string): string | null {
  return normalizeExtraCode(token) || normalizeLanguoExtraCode(token);
}
function toApiExtraCodesMulti(raw: string): string {
  return raw
    .split(/[,\s]+/)
    .map(c => c.trim())
    .filter(Boolean)
    .map(normalizeMultiExtraCode)
    .filter((c): c is string => Boolean(c))
    .join(",");
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedBlob(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  fileType: string
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    crop.width * scaleX, crop.height * scaleY
  );

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), fileType || "image/jpeg", 0.92);
  });
}

function CreateInner() {
  const t = useTranslations("create");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const params = useSearchParams();
  const routeParams = useParams();
  const locale = (Array.isArray(routeParams?.locale) ? routeParams.locale[0] : routeParams?.locale) as string || "en";

  const ASPECT_PRESETS = [
    { label: t("step1.cropper.aspectFree"), value: undefined },
    { label: "1:1",  value: 1 },
    { label: "4:3",  value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
  ];

  const PAPER_LABELS: Record<PaperSize, string> = {
    a4: t("paper.a4"),
    letter: t("paper.letter"),
  };

  const [photo, setPhoto]           = useState<File|null>(null);
  const [photoUrl, setPhotoUrl]     = useState("");
  const [email, setEmail]           = useState("");
  const [level, setLevel]           = useState(DEFAULT_LEVEL);
  const [paperSize, setPaperSize]   = useState<PaperSize>("a4");
  // ── MULTI-BRAND: split from the old single `selectedSets` array so
  // Step 2's two picker lists each have their own checkbox state.
  // Combined via [...selectedGuangnaSets, ...selectedLanguoSets]
  // everywhere a flat list is needed downstream (draft persistence,
  // the API's `sets` field, URL params, order summary). ──────────────
  const [selectedGuangnaSets, setSelectedGuangnaSets] = useState<string[]>([]);
  const [selectedLanguoSets, setSelectedLanguoSets]   = useState<string[]>([]);
  const [individualPens, setIndividualPens] = useState("");
  const [indPenError, setIndPenError]       = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [prevOrders, setPrevOrders] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoDimError, setPhotoDimError] = useState("");
  const [pendingSmallPhoto, setPendingSmallPhoto] = useState<{ file: File; url: string; width: number; height: number } | null>(null);
  const [wantsFullGuide, setWantsFullGuide] = useState(false);

  const [previewResult, setPreviewResult]   = useState<MultiPreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState("");
  const [previewStale, setPreviewStale]     = useState(false);
  const [previousPreviewResult, setPreviousPreviewResult] = useState<MultiPreviewResult | null>(null);
  const [adjustmentMade, setAdjustmentMade] = useState(false);
  const [previewSkipped, setPreviewSkipped] = useState(false);
  const [photoRestoredNotice, setPhotoRestoredNotice] = useState(false);

  const [originalPhoto, setOriginalPhoto]   = useState<File|null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState("");
  const [showCropper, setShowCropper]       = useState(false);
  const [crop, setCrop]                     = useState<any>();
  const [completedCrop, setCompletedCrop]   = useState<any>();
  const [aspect, setAspect]                 = useState<number | undefined>(undefined);
  const cropImgRef = useRef<HTMLImageElement>(null);

  const [bgProcessing, setBgProcessing] = useState<"remove" | "blur" | null>(null);
  const [bgError, setBgError]           = useState("");

  useEffect(() => {
    const pEmail      = params.get("email");
    const pLevel      = params.get("level");
    const pPaperSize  = params.get("paperSize");
    const pSets       = params.get("sets");
    const pIndPens    = params.get("indPens");
    const pPrevOrders = params.get("prevOrders");

    const cameFromConfirm = pEmail !== null || pSets !== null || pIndPens !== null || pPrevOrders !== null;
    const isEditingExisting = pLevel !== null;
    const restoreFromDraft = !cameFromConfirm || isEditingExisting;
    const draft = restoreFromDraft ? loadDraft() : null;

    setEmail(pEmail ?? draft?.email ?? "");
    setLevel(pLevel && pLevel !== "reset" ? pLevel : (draft?.level ?? DEFAULT_LEVEL));
    if (pPaperSize === "a4" || pPaperSize === "letter") setPaperSize(pPaperSize);

    // ── MULTI-BRAND: pSets (from confirm's goBack/orderAnother, or a
    // restored draft) is a flat combined list -- split it back into
    // Guangna vs Languo buckets for the two picker lists' checkbox
    // state, using each option list's own known labels as the
    // classifier (a token not found in either is dropped rather than
    // guessed at).
    const guangnaLabels = new Set(GUANGNA_SET_OPTIONS.map(o => o.key));
    const languoLabels = new Set(LANGUO_SET_OPTIONS.map(o => o.token));
    const splitSets = (list: string[]) => ({
      guangna: list.filter(s => guangnaLabels.has(s)),
      languo: list.filter(s => languoLabels.has(s)),
    });
    if (pSets) {
      const { guangna, languo } = splitSets(pSets.split("|").filter(Boolean));
      setSelectedGuangnaSets(guangna);
      setSelectedLanguoSets(languo);
    } else if (draft?.selectedGuangnaSets || draft?.selectedLanguoSets) {
      setSelectedGuangnaSets(draft.selectedGuangnaSets ?? []);
      setSelectedLanguoSets(draft.selectedLanguoSets ?? []);
    }
    if (pIndPens) setIndividualPens(pIndPens);
    else if (draft?.individualPens) setIndividualPens(draft.individualPens);
    if (pPrevOrders) {
      try { setPrevOrders(JSON.parse(decodeURIComponent(pPrevOrders))); } catch {}
    }
    if (draft?.wantsFullGuide) setWantsFullGuide(true);
    if (draft?.previewSkipped) setPreviewSkipped(true);

    if (draft?.photoBase64 && draft.photoName) {
      base64ToFile(draft.photoBase64, draft.photoName, draft.photoType || "image/jpeg")
        .then(file => {
          setPhoto(file);
          setOriginalPhoto(file);
          const url = URL.createObjectURL(file);
          setPhotoUrl(url);
          setOriginalPhotoUrl(url);
          setPhotoRestoredNotice(true);
          setTimeout(() => setPhotoRestoredNotice(false), 6000);
        })
        .catch(() => {});
    }
  }, []);

  // NEW (2026-08-06): fire-and-forget pre-warm ping, sent as soon as
  // the page mounts -- well before the customer picks any markers or
  // clicks "Generate". Gives Cloud Run a head start spinning up an
  // instance during the time spent filling out the form. Deliberately
  // NOT awaited -- this must never block or slow down the page itself,
  // it's pure best-effort.
  useEffect(() => {
    fetch("/api/warm-preview").catch(() => {});
  }, []);

  const photoDraftRef = useRef<{ base64: string; name: string; type: string } | null>(null);

  const persistDraft = () => {
    saveDraft({
      photoBase64: photoDraftRef.current?.base64,
      photoName: photoDraftRef.current?.name,
      photoType: photoDraftRef.current?.type,
      email, level,
      selectedGuangnaSets, selectedLanguoSets,
      individualPens, wantsFullGuide, previewSkipped,
    });
  };

  useEffect(() => {
    let cancelled = false;
    if (photo) {
      fileToBase64(photo)
        .then(base64 => {
          if (cancelled) return;
          photoDraftRef.current = { base64, name: photo.name, type: photo.type };
          persistDraft();
        })
        .catch(() => {});
    } else {
      photoDraftRef.current = null;
      persistDraft();
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo]);

  useEffect(() => {
    persistDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, level, selectedGuangnaSets, selectedLanguoSets, individualPens, wantsFullGuide, previewSkipped]);

  useEffect(() => {
    if (previewResult) {
      setPreviewStale(true);
      setPreviousPreviewResult(null);
      setAdjustmentMade(false);
      setWantsFullGuide(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, selectedGuangnaSets, selectedLanguoSets, individualPens, level]);

  const acceptPhoto = (file: File, url: string) => {
    setPhotoDimError("");
    setPhoto(file);
    setPhotoUrl(url);
    setOriginalPhoto(file);
    setOriginalPhotoUrl(url);
    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspect(undefined);
    setPreviewResult(null);
    setPreviewStale(false);
    setPreviewError("");
    setPreviousPreviewResult(null);
    setAdjustmentMade(false);
    setWantsFullGuide(false);
    setPreviewSkipped(false);
    setPhotoRestoredNotice(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhotoDimError("");
    setPendingSmallPhoto(prev => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const shortSide = Math.min(img.naturalWidth, img.naturalHeight);
      if (shortSide < MIN_PHOTO_DIMENSION) {
        setPhotoDimError(
          t("step1.dimWarning", { width: img.naturalWidth, height: img.naturalHeight, min: MIN_PHOTO_DIMENSION })
        );
        setPendingSmallPhoto({ file, url, width: img.naturalWidth, height: img.naturalHeight });
        return;
      }
      acceptPhoto(file, url);
    };
    img.onerror = () => {
      acceptPhoto(file, url);
    };
    img.src = url;
  };

  const continueWithSmallPhoto = () => {
    if (!pendingSmallPhoto) return;
    acceptPhoto(pendingSmallPhoto.file, pendingSmallPhoto.url);
    setPendingSmallPhoto(null);
  };

  const discardSmallPhoto = () => {
    if (pendingSmallPhoto) URL.revokeObjectURL(pendingSmallPhoto.url);
    setPendingSmallPhoto(null);
    setPhotoDimError("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (cropImgRef.current && newAspect) {
      const { width, height } = cropImgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  const applyCrop = async () => {
    if (!cropImgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) {
      setShowCropper(false);
      return;
    }
    const fileType = originalPhoto?.type || "image/jpeg";
    const blob = await getCroppedBlob(cropImgRef.current, completedCrop, fileType);
    if (!blob) { setShowCropper(false); return; }
    const croppedFile = new File([blob], originalPhoto?.name || "cropped.jpg", { type: blob.type });
    setPhoto(croppedFile);
    setPhotoUrl(URL.createObjectURL(blob));
    setShowCropper(false);
  };

  const cancelCrop = () => {
    setShowCropper(false);
  };

  const resetToOriginal = () => {
    setPhoto(originalPhoto);
    setPhotoUrl(originalPhotoUrl);
    setShowCropper(false);
    setBgError("");
  };

  const applyBackgroundAction = async (action: "remove" | "blur") => {
    if (!photo) return;
    setBgProcessing(action);
    setBgError("");
    try {
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("action", action);
      if (action === "blur") formData.append("blurStrength", "18");

      const res = await fetch("/api/photo-tools", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data.error || t("step1.bgErrorDefault"));
      }
      const blob = await res.blob();
      const ext = action === "remove" ? "png" : "jpg";
      const baseName = photo.name.replace(/\.[^.]+$/, "");
      const newFile = new File([blob], `${baseName}-${action}.${ext}`, { type: blob.type });
      setPhoto(newFile);
      setPhotoUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setBgError(err?.message || t("step1.bgErrorDefault"));
    } finally {
      setBgProcessing(null);
    }
  };

  const toggleGuangnaSet = (value: string) => {
    setSelectedGuangnaSets(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };
  const toggleLanguoSet = (value: string) => {
    setSelectedLanguoSets(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // ── MULTI-BRAND: validates every free-text token against BOTH brands'
  // real code tables (see normalizeMultiExtraCode above). A token that
  // resolves against neither is reported as invalid, same UX as before.
  const validateIndPens = (val: string) => {
    setIndividualPens(val);
    if (!val.trim()) { setIndPenError(""); return; }
    const codes = val.split(/[,\s]+/).filter(Boolean);
    const invalid = codes.filter(c => !normalizeMultiExtraCode(c));
    if (invalid.length > 0) {
      setIndPenError(t("step2.invalidCodes", { codes: invalid.join(", ") }));
    } else {
      setIndPenError("");
    }
  };

  const currentLevelInfo = LEVEL_KEYS[level];
  const allSelectedSets = [...selectedGuangnaSets, ...selectedLanguoSets];
  const hasMarkersSelected = allSelectedSets.length > 0 || individualPens.trim().length > 0;

  // ── MULTI-BRAND: "bear with me, this combo takes a bit longer" note
  // -- shown when the customer has touched BOTH brands at once (either
  // via set pickers or the free-text field), matching Mirjam's
  // 2026-08-05 note on combined-brand generation being slower on the
  // current Cloud Run sizing.
  const extraCodesResolved = individualPens.trim()
    ? individualPens.split(/[,\s]+/).filter(Boolean).map(normalizeMultiExtraCode).filter(Boolean) as string[]
    : [];
  const hasGuangnaTouch = selectedGuangnaSets.length > 0 || extraCodesResolved.some(c => c.startsWith("GN-") || c.startsWith("HG-"));
  const hasLanguoTouch = selectedLanguoSets.length > 0 || extraCodesResolved.some(c => !c.startsWith("GN-") && !c.startsWith("HG-"));
  const isCrossBrand = hasGuangnaTouch && hasLanguoTouch;

  const selectedMarkersLabel = (() => {
    const setLabels = [
      ...selectedGuangnaSets.map(v => GUANGNA_SET_OPTIONS.find(s => s.key === v)?.label),
      ...selectedLanguoSets.map(v => LANGUO_SET_OPTIONS.find(s => s.token === v)?.prettyLabel ?? v),
    ].filter(Boolean) as string[];
    const parts = [...setLabels];
    if (extraCodesResolved.length) parts.push(t("step3.individualMarkers", { count: extraCodesResolved.length }));
    return parts.join(", ");
  })();

  const translateApiError = (code: unknown): string =>
    isApiErrorCode(code) ? tApiErrors(code) : tApiErrors("generic");

  // ── MULTI-BRAND: overrideGuangna/overrideLanguo replace the old
  // single overrideSets param, kept for signature compatibility though
  // nothing calls it with overrides anymore now that the "use full
  // Guangna palette" quick action is gone (see FIX note below). ──────
  //
  // FIX (2026-08-06, per Mirjam): selecting NO markers at all used to
  // silently fall back to matching against Guangna 366 -- wrong; it
  // should generate the "natural" branch instead (unconstrained
  // clustering, no marker snapping at all), which is exactly what
  // /generate-multi-way already does server-side whenever owned_ids
  // resolves empty (see main.py's generate_multi_way: `include_natural
  // = not owned_ids`). So the fix here is just to STOP blocking/
  // defaulting on an empty selection -- let the call through with
  // empty sets/extraCodes, and let the backend's own natural-fallback
  // logic do the right thing. The old block-and-offer-full-366 UI is
  // removed entirely (see the Step 3 JSX below).
  const generatePreview = async (overrideGuangna?: string[], overrideLanguo?: string[]) => {
    if (!photo || indPenError) return;
    const gSets = overrideGuangna ?? selectedGuangnaSets;
    const lSets = overrideLanguo ?? selectedLanguoSets;
    if (overrideGuangna) setSelectedGuangnaSets(overrideGuangna);
    if (overrideLanguo) setSelectedLanguoSets(overrideLanguo);
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const formData = new FormData();
      formData.append("image", photo);
      formData.append("sets", [...gSets, ...lSets].join(","));
      formData.append("extraCodes", toApiExtraCodesMulti(individualPens));
      formData.append("difficulty", LEVEL_TO_DIFFICULTY[level] || "standard");

      const res = await fetch("/api/generate-preview", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setPreviewError(translateApiError(data.error));
        setPreviewResult(null);
        return;
      }
      setPreviewResult(data);
      setPreviewStale(false);
      setPreviewSkipped(false);
      setPreviousPreviewResult(null);
      setAdjustmentMade(false);
    } catch (err) {
      setPreviewError(t("step3.connectionError"));
      setPreviewResult(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // FIX (2026-08-06): skip-preview no longer requires markers selected
  // either -- consistent with generatePreview above, an empty selection
  // is a valid choice (natural/unconstrained generation at order time),
  // not an error state to block.
  const skipPreview = () => {
    if (!photo || indPenError) return;
    setPreviewSkipped(true);
  };

  const regenerateWithDifficulty = async (difficulty: "beginner" | "advanced") => {
    if (!photo || indPenError || previewLoading || !previewResult) return;
    setPreviousPreviewResult(previewResult);
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const formData = new FormData();
      formData.append("image", photo);
      formData.append("sets", allSelectedSets.join(","));
      formData.append("extraCodes", toApiExtraCodesMulti(individualPens));
      formData.append("difficulty", difficulty);

      const res = await fetch("/api/generate-preview", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setPreviewError(translateApiError(data.error));
        setPreviousPreviewResult(null);
        return;
      }
      setPreviewResult(data);
      setAdjustmentMade(true);
    } catch (err) {
      setPreviewError(t("step3.connectionError"));
      setPreviousPreviewResult(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const restorePrevious = () => {
    if (!previousPreviewResult) return;
    setPreviewResult(previousPreviewResult);
    setPreviousPreviewResult(null);
    setAdjustmentMade(false);
  };

  const handleSubmit = async () => {
    if (!photo || !email || indPenError) return;
    if (!previewSkipped && (!previewResult || previewStale)) return;
    setSubmitting(true);
    setErrorMsg("");
    let orderId = "";
    try {
      const formData = new FormData();
      formData.append("image",      photo);
      formData.append("email",      email);
      formData.append("level",      level);
      formData.append("paperSize",  paperSize);
      formData.append("sets",       allSelectedSets.join(", "));
      formData.append("indPens",    individualPens);
      formData.append("wantsFullGuide", String(wantsFullGuide));
      formData.append("previewSkipped", String(previewSkipped));
      formData.append("locale", locale);
      const res  = await fetch("/api/submit-order", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        setErrorMsg(translateApiError(data.error));
        setSubmitting(false);
        return;
      }
      orderId = data.orderId;
    } catch (err) {
      console.error("Failed to submit order:", err);
      setErrorMsg(t("submit.genericError"));
      setSubmitting(false);
      return;
    }
    const q = new URLSearchParams({
      email, level,
      paperSize,
      photoName:  photo!.name,
      sets:       allSelectedSets.join("|"),
      indPens:    individualPens,
      orderId,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    setSubmitting(false);
    router.push(`/confirm?${q.toString()}`);
  };

  const canSubmit  = photo && email && !indPenError && (previewSkipped || (previewResult && !previewStale));
  const totalSoFar = prevOrders.reduce((acc, o) => acc + parseEuroPrice(o.priceLabel), 0);
  const selectedPrice = priceFor(paperSize);

  // PIVOT (2026-08-06): the reference branch is now text-only upsell
  // data, no rendered image (branch.result is always null now -- see
  // compute_upsell_data_only() on the webservice side). There's at
  // most one entry ("improved"). previewImage picks whichever real
  // image branch exists to actually display -- "owned" when the
  // customer selected any markers, otherwise "natural" (unconstrained
  // generation, shown when nothing was selected at all).
  const upsellMarkers: UpsellEntry[] = previewResult
    ? Object.values(previewResult.references)[0]?.upsell ?? []
    : [];
  const previewBranch: PreviewBranch | null = previewResult?.owned ?? previewResult?.natural ?? null;
  const previewIsNatural = !!previewResult && !previewResult.owned && !!previewResult.natural;

  return (
    <>
      <style>{`
        .create-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 28px;
        }
        @media (max-width: 768px) {
          .create-grid {
            grid-template-columns: 1fr;
          }
        }
        .marker-set-list {
          max-height: 340px;
          overflow-y: auto;
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 8px;
        }
        .marker-set-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        .marker-set-row:hover {
          background: #FFF0F3;
        }
        .marker-set-group-header {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 10px 12px 4px;
        }
        /* PIVOT (2026-08-06): preview-compare-grid removed -- only one
           image branch renders now (owned or natural), no multi-panel
           grid needed. */
        .full-width {
          grid-column: 1 / -1;
        }
        .email-input-big {
          font-size: 17px !important;
          padding: 14px 16px !important;
          border-radius: 12px !important;
        }
      `}</style>
      <Navbar />
      <main style={{padding:"40px 24px", maxWidth:1100, margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(26px,4vw,40px)", marginBottom:6}}>
          {t("pageTitle")}
        </h1>
        <p style={{color:"#666", marginBottom:8}}>
          {t("pageSubtitle")}
        </p>

        {prevOrders.length > 0 && (
          <div style={{background:"#FFF0F3", border:"2px solid var(--pink)", borderRadius:14, padding:"14px 18px", marginTop:16, marginBottom:4}}>
            <p style={{fontWeight:700, fontSize:14, color:"var(--pink)", marginBottom:8}}>
              {t("cart.summary", { count: prevOrders.length, total: `${totalSoFar.toFixed(2).replace(".", ",")}€` })}
            </p>
            {prevOrders.map((o, i) => (
              <p key={i} style={{fontSize:13, color:"#555", margin:"2px 0"}}>
                #{i+1} · {o.photoName} · {o.levelLabel} · {PAPER_LABELS[o.paperSize]} · {o.priceLabel}
              </p>
            ))}
            <button
              onClick={() => router.back()}
              style={{marginTop:8, fontSize:12.5, fontWeight:600, color:"var(--pink)", background:"none", border:"none", cursor:"pointer", padding:0}}
            >
              {t("cart.backToOrder")}
            </button>
          </div>
        )}

        <div className="create-grid">

          {/* Step 1: Photo -- unchanged */}
          <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>{t("step1.title")}</h2>

              {showCropper ? (
                <div>
                  <div style={{display:"flex", gap:8, marginBottom:10, flexWrap:"wrap"}}>
                    {ASPECT_PRESETS.map(p => (
                      <button
                        key={p.label}
                        onClick={() => handleAspectChange(p.value)}
                        style={{
                          fontSize:13, fontWeight:600, padding:"6px 12px", borderRadius:8,
                          border:`2px solid ${aspect === p.value ? "var(--pink)" : "var(--border)"}`,
                          background: aspect === p.value ? "#FFF0F3" : "white",
                          color: aspect === p.value ? "var(--pink)" : "#555",
                          cursor:"pointer",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{borderRadius:14, overflow:"hidden", border:"2px solid var(--border)", background:"#222", display:"flex", justifyContent:"center"}}>
                    <ReactCrop
                      crop={crop}
                      onChange={(_: any, percentCrop: any) => setCrop(percentCrop)}
                      onComplete={(c: any) => setCompletedCrop(c)}
                      aspect={aspect}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={cropImgRef}
                        src={originalPhotoUrl}
                        alt="Crop preview"
                        onLoad={onCropImageLoad}
                        style={{ maxHeight: 500, display: "block" }}
                      />
                    </ReactCrop>
                  </div>
                  <div style={{display:"flex", gap:10, marginTop:12}}>
                    <button
                      onClick={applyCrop}
                      className="btn-primary"
                      style={{flex:1, fontSize:14, padding:"10px"}}
                    >
                      {t("step1.cropper.apply")}
                    </button>
                    <button
                      onClick={cancelCrop}
                      style={{
                        flex:1, fontSize:14, padding:"10px", borderRadius:10,
                        border:"2px solid var(--border)", background:"white",
                        color:"#555", cursor:"pointer",
                      }}
                    >
                      {t("step1.cropper.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border:`2.5px dashed ${photoUrl ? "var(--pink)" : "var(--border)"}`,
                      borderRadius:14,
                      minHeight: photoUrl ? 0 : 200,
                      display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center",
                      cursor:"pointer", overflow:"hidden",
                      background: photoUrl ? "transparent" : "var(--cream)",
                      transition:"border-color 0.15s",
                    }}
                  >
                    {photoUrl
                      ? <img src={photoUrl} alt="Preview"
                          style={{width:"100%", height:"auto", maxHeight:500, objectFit:"contain", borderRadius:12, display:"block", margin:"0 auto"}}/>
                      : <>
                          <div style={{fontSize:44, marginBottom:8}}>🖼️</div>
                          <p style={{fontWeight:600, fontSize:15, marginBottom:4}}>{t("step1.dropHint")}</p>
                          <p style={{color:"var(--muted)", fontSize:13}}>{t("step1.browseHint")}</p>
                        </>
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
                  {photoRestoredNotice && (
                    <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:8}}>{t("step1.restoredNotice")}</p>
                  )}
                  {photoDimError && (
                    <div style={{marginTop:8, padding:"12px 14px", background:"#FFF8ED", border:"1.5px solid #F0DFC0", borderRadius:10}}>
                      <p style={{fontSize:12.5, color:"#8a6d1f", marginBottom:pendingSmallPhoto ? 8 : 0}}>⚠️ {photoDimError}</p>
                      {pendingSmallPhoto && (
                        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                          <button onClick={continueWithSmallPhoto} className="btn-primary" style={{fontSize:13, padding:"8px 14px"}}>
                            {t("step1.continueAnyway")}
                          </button>
                          <button onClick={discardSmallPhoto}
                            style={{fontSize:13, padding:"8px 14px", borderRadius:8, border:"2px solid var(--border)", background:"white", color:"#555", cursor:"pointer"}}>
                            {t("step1.chooseDifferent")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {photo && (
                    <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:6}}>
                      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8}}>
                        <p style={{fontSize:13, color:"var(--muted)"}}>✓ {photo.name}</p>
                        <div style={{display:"flex", gap:14, flexWrap:"wrap"}}>
                          <button onClick={() => setShowCropper(true)} disabled={!!bgProcessing}
                            style={{fontSize:16, color:"var(--pink)", background:"none", border:"none", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
                            <span style={{fontSize:20}}>✂️</span> {t("step1.cropLabel")}
                          </button>

                         {BG_TOOLS_ENABLED && (
                            <>
                              <button onClick={() => applyBackgroundAction("remove")} disabled={!!bgProcessing}
                                style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor: bgProcessing ? "default" : "pointer", fontWeight:600, opacity: bgProcessing && bgProcessing !== "remove" ? 0.4 : 1}}>
                                {bgProcessing === "remove" ? t("step1.removingBackground") : t("step1.removeBackground")}
                              </button>
                              <button onClick={() => applyBackgroundAction("blur")} disabled={!!bgProcessing}
                                style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor: bgProcessing ? "default" : "pointer", fontWeight:600, opacity: bgProcessing && bgProcessing !== "blur" ? 0.4 : 1}}>
                                {bgProcessing === "blur" ? t("step1.blurringBackground") : t("step1.blurBackground")}
                              </button>
                            </>
                          )}
                          {photo !== originalPhoto && (
                            <button onClick={resetToOriginal} disabled={!!bgProcessing}
                              style={{fontSize:12, color:"var(--muted)", background:"none", border:"none", cursor:"pointer"}}>
                              {t("step1.resetToOriginal")}
                            </button>
                          )}
                          <button onClick={() => { setPhoto(null); setPhotoUrl(""); setOriginalPhoto(null); setOriginalPhotoUrl(""); setBgError(""); setPhotoDimError(""); setPreviewResult(null); setPreviewError(""); setPreviousPreviewResult(null); setAdjustmentMade(false); setWantsFullGuide(false); setPreviewSkipped(false); setPhotoRestoredNotice(false); }} disabled={!!bgProcessing}
                            style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor:"pointer"}}>
                            {t("step1.remove")}
                          </button>
                        </div>
                      </div>
                      {bgError && (
                        <p style={{fontSize:12, color:"#c62828", margin:0}}>⚠️ {bgError}</p>
                      )}
                      {BG_TOOLS_ENABLED && bgProcessing && (
                        <p style={{fontSize:11, color:"var(--muted)", margin:0}}>
                          {t("step1.bgToolWakingUp")}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          {/* Step 2: Markers -- MULTI-BRAND: two always-visible picker
              lists (Guangna + Languo) instead of one. */}
          <div className="card" style={{display:"flex", flexDirection:"column"}}>
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step2.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                {t("step2.description")}
              </p>

              <h3 style={{fontWeight:700, fontSize:14, marginBottom:6}}>Guangna</h3>
              <div className="marker-set-list" style={{minHeight:140, marginBottom:16}}>
                {GUANGNA_SET_OPTIONS.map(s => (
                  <label key={s.key} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={selectedGuangnaSets.includes(s.key)}
                      onChange={() => toggleGuangnaSet(s.key)}
                      style={{accentColor:"var(--pink)"}}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>

              <h3 style={{fontWeight:700, fontSize:14, marginBottom:6}}>Languo</h3>
              <div className="marker-set-list" style={{minHeight:140}}>
                {(["paint", "gel", "plus", "qimiart"] as LanguoLine[]).map(line => (
                  <div key={line}>
                    <div className="marker-set-group-header">{LANGUO_LINE_LABELS[line]}</div>
                    {LANGUO_SET_OPTIONS.filter(s => s.line === line).map(s => (
                      <label key={s.token} className="marker-set-row">
                        <input
                          type="checkbox"
                          checked={selectedLanguoSets.includes(s.token)}
                          onChange={() => toggleLanguoSet(s.token)}
                          style={{accentColor:"var(--pink)"}}
                        />
                        <span>{s.prettyLabel}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>

              {allSelectedSets.length > 0 && (
                <p style={{fontSize:12, color:"var(--muted)", marginTop:8}}>
                  {t("step2.setsSelected", { count: allSelectedSets.length })}
                </p>
              )}
              <div style={{marginTop:18}}>
                <h3 style={{fontWeight:700, fontSize:15, marginBottom:4}}>{t("step2.additionalCodesTitle")}</h3>
                <p style={{fontSize:12, color:"var(--muted)", marginBottom:8}}>
                  {t("step2.additionalCodesDescription")}
                </p>
                <textarea
                  value={individualPens}
                  onChange={e => validateIndPens(e.target.value)}
                  placeholder={t("step2.codesPlaceholder")}
                  rows={2}
                  style={{resize:"vertical", border: indPenError ? "2px solid #c62828" : "2px solid var(--border)"}}
                />
                {indPenError && <p style={{fontSize:12, color:"#c62828", marginTop:4}}>⚠️ {indPenError}</p>}
              </div>
            </div>


            {/* Step 3: Generate preview -- full width. MULTI-BRAND:
                renders owned + however many reference panels the API
                returns, instead of a fixed owned/full366 pair. */}
            <div className="card full-width">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step3.title")}</h2>
          

              {/* MOVED (2026-08-06, per Mirjam): was in Step 2, now
                  sits right above the generate button in Step 3 -- the
                  moment right before the wait actually happens, rather
                  than earlier while still picking sets. */}
             {isCrossBrand && (
  <p style={{fontSize:12, color:"#8a6d1f", background:"#FFF8ED", border:"1.5px solid #F0DFC0", borderRadius:10, padding:"10px 12px", marginBottom:14, lineHeight:1.5}}>
    {t("step3.crossBrandNotice")}
  </p>
)}

              <button
                onClick={() => generatePreview()}
                disabled={!photo || !!indPenError || previewLoading}
                className="btn-primary"
                style={{
                  width:"100%", fontSize:15, padding:"12px",
                  opacity: (!photo || !!indPenError || previewLoading) ? 0.5 : 1,
                }}
              >
                {previewLoading
                  ? t("step3.generating")
                  : previewResult && !previewStale
                    ? t("step3.regenerate")
                    : t("step3.generate")}
              </button>

              {photo && !indPenError && (!previewResult || previewStale) && !previewSkipped && (
                <button
                  onClick={skipPreview}
                  disabled={previewLoading}
                  style={{marginTop:8, width:"100%", fontSize:13, fontWeight:600, color:"var(--pink)", background:"none", border:"none", cursor:"pointer", padding:"4px", textAlign:"center"}}
                >
                  {t("step3.skipPreview")}
                </button>
              )}
              {previewSkipped && (
                <p style={{fontSize:12.5, color:"var(--pink)", fontWeight:600, marginTop:8, textAlign:"center"}}>
                  {t("step3.previewSkippedNotice")}
                </p>
              )}

              {previewLoading && (
                <div style={{marginTop:14}}>
                  <LoadingCat />
                </div>
              )}

              {!photo && (
                <p style={{fontSize:12, color:"var(--muted)", marginTop:8}}>{t("step3.uploadFirst")}</p>
              )}
              {/* FIX (2026-08-06): the old "no sets selected" blocking
                  warning + "use full Guangna 366" quick action is
                  removed entirely -- selecting no markers is now a
                  valid choice that generates the natural/unconstrained
                  branch instead (see the "natural" panel below). */}

              {previewError && (
                <p style={{fontSize:13, color:"#c62828", marginTop:8}}>⚠️ {previewError}</p>
              )}
              {previewStale && previewResult && (
                <p style={{fontSize:12, color:"#b8860b", marginTop:8}}>
                  {t("step3.stalePreview")}
                </p>
              )}

              {previewResult && !previewStale && previewBranch && (
                <div style={{marginTop:16}}>
                  <div>
                    <p style={{fontSize:12.5, fontWeight:700, color:"var(--pink)", marginBottom:6}}>
                      {previewIsNatural
                        ? t("step3.naturalPreviewLabel")
                        : `${t("step3.yourMarkers")}${selectedMarkersLabel ? ` — ${selectedMarkersLabel}` : ""}`}
                    </p>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <BeforeAfterSlider
                      beforeImage={`data:image/png;base64,${previewBranch.preview_png_base64}`}
                      afterImage={`data:image/png;base64,${previewBranch.outline_png_base64}`}
                      beforeLabel={t("step3.beforeLabel")}
                      afterLabel={t("step3.afterLabel")}
                      aspectRatio={4 / 3}
                    />
                    </div>
                    {previewIsNatural ? (
                      <p style={{fontSize:12, color:"var(--muted)", marginTop:4}}>
                        {t("step3.naturalPreviewNote")}
                      </p>
                    ) : (
                      <>
                        <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:4}}>
                          {t("step3.matchedYourMarkers")}
                        </p>
                        <MarkerSwatches legend={previewBranch.legend} />
                      </>
                    )}
                  </div>

                  {/* PIVOT (2026-08-06): text/swatch-only upsell note --
                      no second rendered image. Only shown when there's
                      an owned branch (a natural-only preview has
                      nothing to upsell from) and the backend actually
                      found markers worth suggesting. */}
                  {!previewIsNatural && upsellMarkers.length > 0 && (
                    <div style={{marginTop:14, padding:"14px 16px", background:"#FFF8ED", border:"1.5px solid #F0DFC0", borderRadius:12}}>
                      <p style={{fontSize:13, fontWeight:700, color:"#8a6d1f", marginBottom:8}}>
                        {t("step3.upsellHeading")}
                      </p>
                      <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                        {upsellMarkers.map(m => (
                          <div key={m.marker_id} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:3}} title={m.marker_name}>
                            <div style={{
                              width:26, height:26, borderRadius:7,
                              background:`rgb(${m.marker_rgb[0]}, ${m.marker_rgb[1]}, ${m.marker_rgb[2]})`,
                              border:"1px solid rgba(0,0,0,0.15)",
                            }} />
                            <span style={{fontSize:10, color:"#8a6d1f", fontWeight:600}}>
                              {m.marker_id.replace(/^GN-?/i, "")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PIVOT (2026-08-06): free-guide opt-in now tied to
                      whether there's upsell data to build a guide from,
                      rather than a reference panel existing. */}
                  {!previewIsNatural && upsellMarkers.length > 0 && (
                    <label style={{display:"flex", alignItems:"flex-start", gap:8, marginTop:14, fontSize:12.5, color:"#555", cursor:"pointer"}}>
                      <input
                        type="checkbox"
                        checked={wantsFullGuide}
                        onChange={e => setWantsFullGuide(e.target.checked)}
                        style={{marginTop:2, accentColor:"var(--pink)"}}
                      />
                      <span>{t("step3.includeFullGuide")}</span>
                    </label>
                  )}

                  <div style={{marginTop:14, padding:"14px 16px", background:"#FAFAFA", border:"1.5px solid var(--border)", borderRadius:12}}>
                    {!adjustmentMade ? (
                      <>
                        <p style={{fontSize:14, fontWeight:700, marginBottom:10}}>
                          {t("step3.happyOrChange")}
                        </p>
                        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                          <button
                            onClick={() => regenerateWithDifficulty("beginner")}
                            className="btn-primary"
                            disabled={previewLoading}
                            style={{flex:"1 1 200px", fontSize:14, padding:"12px", opacity: previewLoading ? 0.6 : 1}}
                          >
                            {t("step3.largerAreas")}
                          </button>
                          <button
                            onClick={() => regenerateWithDifficulty("advanced")}
                            className="btn-primary"
                            disabled={previewLoading}
                            style={{flex:"1 1 200px", fontSize:14, padding:"12px", opacity: previewLoading ? 0.6 : 1}}
                          >
                            {t("step3.ultraDetailed")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={restorePrevious}
                        disabled={previewLoading || !previousPreviewResult}
                        style={{fontSize:14, fontWeight:700, padding:"10px 16px", borderRadius:10,
                          border:"2px solid var(--pink)", background:"white", color:"var(--pink)",
                          cursor: previewLoading ? "default" : "pointer", opacity: previewLoading ? 0.6 : 1}}
                      >
                        {t("step3.revertPrevious")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Paper size -- unchanged */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step4.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                {t("step4.description")}
              </p>
              <div style={{ display:"flex", gap:10 }}>
                {(["a4", "letter"] as PaperSize[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaperSize(p)}
                    style={{
                      flex:1, padding:"12px 16px", borderRadius:12,
                      border: paperSize === p ? "2px solid var(--pink)" : "2px solid var(--border)",
                      background: paperSize === p ? "var(--pink)" : "white",
                      color: paperSize === p ? "white" : "var(--ink)",
                      cursor:"pointer",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                    }}
                  >
                    <span style={{ fontWeight:700, fontSize:13 }}>{PAPER_LABELS[p]}</span>
                    {p === "letter" ? (
                      <>
                        <span style={{ fontWeight:900, fontSize:18, lineHeight:1.15 }}>
                          {toUsdEstimate(priceFor(p))}
                        </span>
                        <span style={{ fontWeight:500, fontSize:11, opacity:0.75 }}>
                          ≈ {priceFor(p)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontWeight:900, fontSize:18, lineHeight:1.15 }}>
                        {priceFor(p)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Email -- unchanged */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step5.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:12}}>{t("step5.description")}</p>
              <input type="email" className="email-input-big" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{width:"100%"}}/>
            </div>

            {/* Order summary -- unchanged, sets already generic */}
            <div style={{background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)", border:"2px solid var(--border)", borderRadius:16, padding:20}}>
              <h3 style={{fontWeight:800, fontSize:15, marginBottom:12}}>{t("summary.title")}</h3>
              <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:14}}>
                <Row label={t("summary.photo")}       value={photo ? `✓ ${photo.name}` : t("summary.none")}/>
                <Row label={t("summary.level")}       value={currentLevelInfo ? t(currentLevelInfo.labelKey) : t("summary.none")}/>
                <Row label={t("summary.markerSets")} value={allSelectedSets.length ? t("summary.nSelected", { count: allSelectedSets.length }) : t("summary.noneSelected")}/>
                <Row label={t("summary.preview")}     value={previewResult && !previewStale ? t("summary.generated") : previewSkipped ? t("summary.skipped") : t("summary.notYetGenerated")}/>
                <Row label={t("summary.paperSize")}  value={PAPER_LABELS[paperSize]}/>
                <Row label={t("summary.price")}       value={selectedPrice} highlight/>
                {prevOrders.length > 0 && (
                  <>
                    <div style={{borderTop:"1.5px solid var(--border)", margin:"4px 0"}}/>
                    <Row label={t("summary.previousOrders", { count: prevOrders.length })} value={`${totalSoFar.toFixed(2).replace(".", ",")}€`}/>
                  </>
                )}
              </div>
            </div>

            {/* Submit + status + error -- unchanged */}
            <div className="full-width" style={{display:"flex", flexDirection:"column", gap:8}}>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{width:"100%", fontSize:17, padding:"16px", opacity:(canSubmit && !submitting) ? 1 : 0.5}}
              >
                {submitting ? t("submit.sending") : canSubmit ? t("submit.order") : t("submit.orderDisabled")}
              </button>

              {!photo && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  {t("submit.uploadToStart")}
                </p>
              )}
              {photo && !previewSkipped && (!previewResult || previewStale) && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  {t("submit.generateOrSkip")}
                </p>
              )}
              {!email && photo && (previewSkipped || (previewResult && !previewStale)) && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  {t("submit.addEmail")}
                </p>
              )}
              {errorMsg && (
                <div style={{background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14}}>
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
        </div>
      </main>
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreateInner />
    </Suspense>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
      <span style={{color: highlight ? "var(--pink)" : "var(--muted)", fontWeight: highlight ? 700 : 400}}>
        {label}
      </span>
      <span style={{
        fontWeight: highlight ? 800 : 600,
        fontSize: highlight ? 15 : 14,
        color: highlight ? "var(--pink)" : "#333",
        textAlign:"right", maxWidth:"60%",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
      }}>
        {value}
      </span>
    </div>
  );
}