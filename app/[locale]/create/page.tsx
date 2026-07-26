"use client";
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

// UPDATED (2026-07-27):
//  - Submit now sends a `locale` field (read from this page's own
//    [locale] URL segment via useParams()) so submit-order/route.ts
//    can persist it into order.json -- first step of threading the
//    customer's language through to the post-purchase delivery email
//    (fulfillOrder.ts / lib/email.ts still need to pick this up).
//  - Errors coming back from our own API routes (submit-order,
//    generate-preview) are now translated via the shared "apiErrors"
//    namespace using the CODE the route returns (see lib/apiErrors.ts),
//    instead of `data.error || t("...")` -- that pattern never actually
//    hit the translated fallback since data.error was always a truthy
//    English string from the route itself, so every error showed up in
//    English regardless of locale. Client-detected failures (network
//    errors caught in the `catch` blocks, never having reached a route
//    at all) still use the existing create.step3.connectionError /
//    create.submit.genericError copy, since those aren't route
//    responses.
//
// UPDATED (2026-07-27, i18n pass): full i18n pass -- this page
// previously had NO next-intl integration at all (no useTranslations,
// no namespace). Per Mirjam's "go big for French" approach (same one
// used on Swatch Creator), every visible string here now routes
// through t() under a new "create" namespace -- step titles,
// descriptions, warnings, error messages, button labels, the order
// summary, and the Level labels/descriptions. MARKER_SETS (the 34
// physical marker-set names) are deliberately left untranslated for
// now -- flagged separately as an open question since some contain
// plain English color words ("Blue", "Skin") rather than pure SKU
// codes.
//
// UPDATED (2026-07-24): paper size choice moved here from /confirm as a
// new Step 4 ("Your Guangna Marker Sets" -> preview -> paper size ->
// email, which is now Step 5). Confirm no longer lets you pick paper
// size -- it just displays what was chosen here (read-only) and lets
// you go "back to make changes" if you want a different one. Order
// summary card now shows the paper size + resulting price too, so the
// summary is complete before checkout instead of only showing price at
// /confirm.
//
// UPDATED (2026-07-23): pricing text throughout now reflects flat
// paper-size pricing (see lib/lemonSqueezyPricing.ts's GUANGNA_BY_NUMBER)
// instead of the old per-difficulty 7€/9€/11€ tiers -- difficulty is
// still selected (via the Step 3 "bigger areas / more detail" buttons)
// and still drives generation, it just no longer changes price, so the
// price shown everywhere is the flat base (A4) price. The actual paper
// choice -- and therefore the final price -- still only happens on
// /confirm, same as before.
//
// Also fixes the "total so far: NaN€" cart bug: prevOrders (built by
// confirm-page.tsx's orderAnother()) no longer carries a numeric
// `price` field -- pricing moved from per-order difficulty tiers to a
// paper-size choice made ON /confirm, so each previous order's real
// price only exists as its `priceLabel` string, set at the point that
// order actually went through checkout. totalSoFar now parses that
// string instead of reading a `price` field that no longer exists.

const MARKER_SETS = [
  { label:"Classic brush-366", value:"GN-8101-366" },
  { label:"Classic brush-408", value:"GN-8101-408" },
  { label:"Classic brush-360", value:"GN-8101-360" },
  { label:"Classic brush-288", value:"GN-8101-288" },
  { label:"Classic brush-240", value:"GN-8101-240" },
  { label:"Classic brush-168", value:"GN-8101-168" },
  { label:"Classic brush-120", value:"GN-8101-120" },
  { label:"Classic brush-100", value:"GN-8101-100" },
  { label:"Classic brush-72",  value:"GN-8101-72"  },
  { label:"Classic brush-60",  value:"GN-8101-60"  },
  { label:"Classic brush-48",  value:"GN-8101-48"  },
  { label:"Classic brush-36",  value:"GN-8101-36"  },
  { label:"Classic brush-24",  value:"GN-8101-24"  },
  { label:"Classic brush-12",  value:"GN-8101-12"  },
  { label:"Classic Brush: Skin (24F)",value:"GN.8201F-24" },
  { label:"Classic Brush: Skin (12B)",value:"GN.8201B-12" },
  { label:"Dual tip: 240",     value:"GN.8109-240" },
  { label:"Dual tip: 72",      value:"GN.8109-72"  },
  { label:"Dual tip: 36",      value:"GN.8102-36"  },
  { label:"Dual colors 84/168",value:"GN.8106-84"  },
  { label:"Dual colors 60/120",value:"GN.8106-60"  },
  { label:"Dual colors 30/60", value:"GN.8106-30"  },
  { label:"Dual tip: Blue",    value:"GN.8109A-12" },
  { label:"Dual tip: Pink",    value:"GN.8109B-12" },
  { label:"Dual tip: Green",   value:"GN.8109C-12" },
  { label:"Dual tip: Red",     value:"GN.8109D-12" },
  { label:"Dual tip: Purple",  value:"GN.8109E-12" },
  { label:"Dual tip: Yellow",  value:"GN.8109F-12" },
  { label:"Dual tip: Warm skin",      value:"GN.8109G-12" },
  { label:"Dual tip: Reddish brown",  value:"GN.8109H-12" },
  { label:"Dual tip: White-Gray",     value:"GN.8109I-12" },
  { label:"Dual tip: Tan",            value:"GN.8109J-12" },
  { label:"Dual tip: Pinkish skin",   value:"GN.8109K-12" },
  { label:"Macaron",                  value:"GN.8201M-24" },
];

const DEFAULT_LEVEL = "24";

// Labels/descriptions now come from t("levels.*") -- see LEVEL_KEYS
// below for the value/popular mapping this array still needs; the
// display text itself is no longer stored here.
const LEVEL_KEYS: Record<string, { labelKey: string; descKey: string; popular?: boolean }> = {
  "15": { labelKey: "levels.beginner",     descKey: "levels.beginnerDesc" },
  "24": { labelKey: "levels.intermediate", descKey: "levels.intermediateDesc", popular: true },
  "36": { labelKey: "levels.advanced",     descKey: "levels.advancedDesc" },
};
const LEVEL_VALUES = ["15", "24", "36"];

function priceFor(p: PaperSize) {
  return GUANGNA_BY_NUMBER[p === "letter" ? "us" : "a4"].price;
}

// Maps the create page's level selector onto the generation service's
// region-cap difficulty tiers (see webservice's DIFFICULTY_PRESETS,
// 2026-07-11).
const LEVEL_TO_DIFFICULTY: Record<string, string> = {
  "15": "beginner",
  "24": "standard",
  "36": "advanced",
};

// ── QUALITY FLOOR: reject uploads below this on the shorter side.
const MIN_PHOTO_DIMENSION = 1200;

// ── CROP: aspect ratio presets shown as quick-select buttons ──────────────
const BG_TOOLS_ENABLED = false;

// Matches confirm-page.tsx's OrderItem shape exactly -- both pages
// round-trip this through URL params via prevOrders, so they must
// agree on what fields exist. paperSize is now chosen here (Step 4)
// rather than on /confirm, but the field still lives on OrderItem
// since /confirm is what actually builds each finished OrderItem when
// pushing to prevOrders (see its orderAnother()).
type OrderItem = {
  photoName:  string;
  level:      string;
  levelLabel: string;
  paperSize:  PaperSize;
  priceLabel: string;
  sets:       string[];
  indPens:    string;
};

// Preview response shape, matching webservice's /generate-three-way
// JSON (see main.py's _branch_json()/_serialize_legend()). Only the
// fields the create page actually uses are declared here.
type LegendEntry = {
  number: number;
  rgb: number[];
  pixel_area: number;
  marker_id?: string;
  marker_name?: string;
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
type PreviewResult = {
  owned: PreviewBranch | null;
  full366: PreviewBranch | null;
  natural: PreviewBranch | null;
  upsell: UpsellEntry[] | null;
  generation_seconds: number;
};

function validateGnCode(code: string): boolean {
  const num = parseInt(code.replace(/^GN-?/i, ""), 10);
  return !isNaN(num) && num >= 600 && num <= 965;
}

// Picks the N markers that cover the most pixel area in this branch's
// result, so the swatches shown are the colors that actually dominate
// the design -- not just the first N printed numbers, which could all
// be tiny background-detail regions. legend_data has one entry per
// PRINTED number (a marker can repeat across many numbers), so entries
// sharing a marker_id are combined by summing pixel_area before
// ranking. Entries without a marker_id (shouldn't happen for
// owned/full366, only for the natural branch which isn't shown here)
// are skipped defensively.
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

// Converts the free-text individual marker codes field ("603, 648, 712"
// or "GN-603, gn-648") into the comma-separated "GN-xxx" form the
// generation service's extra_codes field expects.
function toApiExtraCodes(raw: string): string {
  return raw
    .split(/[,\s]+/)
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => {
      const num = c.replace(/^GN-?/i, "");
      return `GN-${num}`;
    })
    .join(",");
}

// ── CROP: centers a crop box at the chosen aspect ratio when first opened
// or when the aspect preset changes ─────────────────────────────────────
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

// ── CROP: draws the selected crop region (in displayed-image pixel units)
// onto a canvas at the photo's full original resolution, then exports it
// as a Blob. Standard react-image-crop pattern. ─────────────────────────
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
  // Route-segment locale ([locale] in app/[locale]/create/page.tsx) --
  // distinct from `params` above, which is the query-string reader.
  // Sent along at submit time so submit-order/route.ts can persist it
  // into order.json for the eventual delivery-email locale wiring.
  const routeParams = useParams();
  const locale = (Array.isArray(routeParams?.locale) ? routeParams.locale[0] : routeParams?.locale) as string || "en";

  // Aspect preset labels: only "Free" is actual text (t("step1.cropper.aspectFree"));
  // the ratio strings (1:1, 4:3, 16:9) are numeric notation, not language, so they
  // stay as plain data here rather than translation keys.
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
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [individualPens, setIndividualPens] = useState("");
  const [indPenError, setIndPenError]       = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [prevOrders, setPrevOrders] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── QUALITY FLOOR: set when a dropped/selected photo is smaller than
  // MIN_PHOTO_DIMENSION on its shorter side; the file is rejected (not
  // set as the working photo) and this message shown instead. ─────────
  const [photoDimError, setPhotoDimError] = useState("");

  // ── QUALITY FLOOR (2026-07-24): a too-small photo no longer blocks
  // outright -- it's held here (not yet accepted as the working photo)
  // while photoDimError's warning is shown with a "continue anyway?"
  // choice, same pattern as showNoSetsWarning below. Cleared either by
  // acceptPhoto() (continuing) or by discarding it (choosing a
  // different photo).
  const [pendingSmallPhoto, setPendingSmallPhoto] = useState<{ file: File; url: string; width: number; height: number } | null>(null);

  // ── FULL GUIDE (2026-07-17): opt-in checkbox on the full366 upsell
  // panel -- "also prepare my free complete palette guide". Unchecked
  // by default.
  const [wantsFullGuide, setWantsFullGuide] = useState(false);

  // ── PREVIEW: required generation step before Submit unlocks, unless
  // skipped -- see SKIP PREVIEW below. ──────────────────────────────────
  const [previewResult, setPreviewResult]   = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState("");
  const [previewStale, setPreviewStale]     = useState(false);
  const [showNoSetsWarning, setShowNoSetsWarning] = useState(false);
  const [previousPreviewResult, setPreviousPreviewResult] = useState<PreviewResult | null>(null);
  const [adjustmentMade, setAdjustmentMade] = useState(false);

  // ── SKIP PREVIEW (2026-07-23): lets a customer who already knows
  // what they want order directly, without waiting on generation.
  // Reset whenever a new photo is uploaded (a fresh photo deserves a
  // fresh decision) and, like previewStale, doesn't need to be reset on
  // every input change -- if they change their mind and skip again
  // after tweaking sets/level, that's still a valid "I know what I
  // want" choice.
  const [previewSkipped, setPreviewSkipped] = useState(false);

  // ── DRAFT PERSISTENCE: brief confirmation shown when the photo comes
  // back from a restored draft (vs. a fresh upload), so it's clear
  // what just happened rather than a photo silently appearing.
  const [photoRestoredNotice, setPhotoRestoredNotice] = useState(false);

  // ── CROP: original upload kept separate from the (possibly cropped)
  // working version, so re-cropping always starts from full quality ──────
  const [originalPhoto, setOriginalPhoto]   = useState<File|null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState("");
  const [showCropper, setShowCropper]       = useState(false);
  const [crop, setCrop]                     = useState<any>();
  const [completedCrop, setCompletedCrop]   = useState<any>();
  const [aspect, setAspect]                 = useState<number | undefined>(undefined);
  const cropImgRef = useRef<HTMLImageElement>(null);

  // ── BACKGROUND TOOLS: remove / blur ─────────────────────────────────
  const [bgProcessing, setBgProcessing] = useState<"remove" | "blur" | null>(null);
  const [bgError, setBgError]           = useState("");

  useEffect(() => {
    const pEmail      = params.get("email");
    const pLevel      = params.get("level");
    const pPaperSize  = params.get("paperSize");
    const pSets       = params.get("sets");
    const pIndPens    = params.get("indPens");
    const pPrevOrders = params.get("prevOrders");

    // confirm's two "back to /create" actions look almost identical in
    // their params, but differ in one telling way: goBack() ("make
    // changes") always includes `level`, since it's editing the order
    // that's already fully filled out; orderAnother() deliberately
    // omits it, since it's starting a fresh item. That's the existing
    // signal (no new param needed) for whether landing here should
    // restore the previous photo (editing) or not (a genuinely new
    // item, where restoring the OLD photo would be actively wrong).
    // Bare navigation with no params at all (e.g. back from /examples)
    // restores everything, same as editing.
    const cameFromConfirm = pEmail !== null || pSets !== null || pIndPens !== null || pPrevOrders !== null;
    const isEditingExisting = pLevel !== null;
    const restoreFromDraft = !cameFromConfirm || isEditingExisting;
    const draft = restoreFromDraft ? loadDraft() : null;

    setEmail(pEmail ?? draft?.email ?? "");
    setLevel(pLevel && pLevel !== "reset" ? pLevel : (draft?.level ?? DEFAULT_LEVEL));
    // paperSize restore is intentionally NOT gated by the
    // editing-vs-new distinction above: whether you're editing an
    // existing order or starting a fresh one via "order another",
    // carrying over the last-chosen paper size is a reasonable
    // default either way (same convenience as email/sets carrying
    // over in orderAnother()). Falls back to the "a4" initial state
    // when no paperSize param is present at all.
    if (pPaperSize === "a4" || pPaperSize === "letter") setPaperSize(pPaperSize);
    if (pSets) setSelectedSets(pSets.split("|").filter(Boolean));
    else if (draft?.selectedSets) setSelectedSets(draft.selectedSets);
    if (pIndPens) setIndividualPens(pIndPens);
    else if (draft?.individualPens) setIndividualPens(draft.individualPens);
    if (pPrevOrders) {
      try { setPrevOrders(JSON.parse(decodeURIComponent(pPrevOrders))); } catch {}
    }
    if (draft?.wantsFullGuide) setWantsFullGuide(true);
    if (draft?.previewSkipped) setPreviewSkipped(true);

    // The photo is the one field that can NEVER arrive via URL params --
    // this is the only path that restores it.
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

  // ── DRAFT PERSISTENCE: keeps sessionStorage in sync with the working
  // state so a detour to /examples (which customers are actively
  // encouraged to visit before finishing an order, to see the
  // resolution comparison) or an accidental navigation away doesn't
  // lose the upload. Split into two effects so typing in the email
  // field doesn't re-encode the photo to base64 on every keystroke --
  // that only happens when the photo itself actually changes; the
  // cached result lives in photoDraftRef and gets reused by the
  // lighter-weight effect below. ─────────────────────────────────────
  const photoDraftRef = useRef<{ base64: string; name: string; type: string } | null>(null);

  const persistDraft = () => {
    saveDraft({
      photoBase64: photoDraftRef.current?.base64,
      photoName: photoDraftRef.current?.name,
      photoType: photoDraftRef.current?.type,
      email, level, selectedSets, individualPens, wantsFullGuide, previewSkipped,
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
  }, [email, level, selectedSets, individualPens, wantsFullGuide, previewSkipped]);

  // ── PREVIEW: any change to what would be generated invalidates the
  // last preview. Only fires once a preview actually exists -- doesn't
  // do anything on initial mount or while the user is still making
  // their first round of choices. paperSize deliberately isn't in this
  // list -- it doesn't affect generation, only the final PDF layout, so
  // changing it shouldn't force a fresh preview. ───────────────────────
  useEffect(() => {
    if (previewResult) {
      setPreviewStale(true);
      setPreviousPreviewResult(null);
      setAdjustmentMade(false);
      setWantsFullGuide(false);
    }
  }, [photo, selectedSets, individualPens, level]);

  // ── QUALITY FLOOR: finishes accepting a photo once it has passed (or
  // skipped, e.g. undecodable format) the dimension check. This is the
  // same "new photo" reset handleFile always did. ─────────────────────
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
    setShowNoSetsWarning(false);
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

  // ── QUALITY FLOOR: user chose "continue anyway" on a below-recommended
  // photo -- accept it as the working photo like any other. ───────────
  const continueWithSmallPhoto = () => {
    if (!pendingSmallPhoto) return;
    acceptPhoto(pendingSmallPhoto.file, pendingSmallPhoto.url);
    setPendingSmallPhoto(null);
  };

  // ── QUALITY FLOOR: user chose to pick a different photo instead --
  // discard the pending one, clear the warning, nothing becomes the
  // working photo. ─────────────────────────────────────────────────────
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

  // ── CROP: handlers ───────────────────────────────────────────────────
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

  // ── BACKGROUND TOOLS: calls our own /api/photo-tools route, which
  // proxies to the separate Python service. ────────────────────────────
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

  const toggleSet = (value: string) => {
    setSelectedSets(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const validateIndPens = (val: string) => {
    setIndividualPens(val);
    if (!val.trim()) { setIndPenError(""); return; }
    const codes = val.split(/[,\s]+/).filter(Boolean);
    const invalid = codes.filter(c => !validateGnCode(c));
    if (invalid.length > 0) {
      setIndPenError(t("step2.invalidCodes", { codes: invalid.join(", ") }));
    } else {
      setIndPenError("");
    }
  };

  const currentLevelInfo = LEVEL_KEYS[level];
  const hasMarkersSelected = selectedSets.length > 0 || individualPens.trim().length > 0;
  const selectedMarkersLabel = (() => {
    const setLabels = selectedSets
      .map(v => MARKER_SETS.find(s => s.value === v)?.label)
      .filter(Boolean) as string[];
    const parts = [...setLabels];
    const extraCodes = toApiExtraCodes(individualPens).split(",").filter(Boolean);
    if (extraCodes.length) parts.push(t("step3.individualMarkers", { count: extraCodes.length }));
    return parts.join(", ");
  })();
  const isFullPalette = selectedSets.includes("GN-8101-366");

  // Shared: translates a code the route returned via lib/apiErrors.ts's
  // whitelist, falling back to a generic message for anything else
  // (an older deploy of a route, or a code this list hasn't caught up
  // with yet) -- never displays a raw route string directly.
  const translateApiError = (code: unknown): string =>
    isApiErrorCode(code) ? tApiErrors(code) : tApiErrors("generic");

  const generatePreview = async (overrideSets?: string[]) => {
    if (!photo || indPenError) return;
    const setsToUse = overrideSets ?? selectedSets;
    if (setsToUse.length === 0 && !individualPens.trim()) {
      setShowNoSetsWarning(true);
      return;
    }
    setShowNoSetsWarning(false);
    if (overrideSets) setSelectedSets(overrideSets);
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const formData = new FormData();
      formData.append("image", photo);
      formData.append("sets", setsToUse.join(","));
      formData.append("extraCodes", toApiExtraCodes(individualPens));
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

  // ── SKIP PREVIEW: lets someone who already knows what they want order
  // without waiting on generation. Still requires a photo + valid
  // marker input, same as generating a preview would -- just doesn't
  // require the actual preview call. ────────────────────────────────────
  const skipPreview = () => {
    if (!photo || indPenError) return;
    if (selectedSets.length === 0 && !individualPens.trim()) {
      setShowNoSetsWarning(true);
      return;
    }
    setShowNoSetsWarning(false);
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
      formData.append("sets", selectedSets.join(","));
      formData.append("extraCodes", toApiExtraCodes(individualPens));
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
      const filledSets = selectedSets;
      const formData = new FormData();
      formData.append("image",      photo);
      formData.append("email",      email);
      formData.append("level",      level);
      formData.append("paperSize",  paperSize);
      formData.append("sets",       filledSets.join(", "));
      formData.append("indPens",    individualPens);
      formData.append("wantsFullGuide", String(wantsFullGuide));
      formData.append("previewSkipped", String(previewSkipped));
      // Customer's locale -- see submit-order/route.ts, which persists
      // this into order.json for the delivery-email locale wiring.
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
    const filledSets = selectedSets;
    const q = new URLSearchParams({
      email, level,
      paperSize,
      photoName:  photo!.name,
      sets:       filledSets.join("|"),
      indPens:    individualPens,
      orderId,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    setSubmitting(false);
    router.push(`/confirm?${q.toString()}`);
  };

  const canSubmit  = photo && email && !indPenError && (previewSkipped || (previewResult && !previewStale));
  // Previous orders' real prices only ever exist as priceLabel strings
  // (set once each order actually reached /confirm) -- parse those
  // rather than relying on a numeric `price` field that no longer
  // exists on OrderItem.
  const totalSoFar = prevOrders.reduce((acc, o) => acc + parseEuroPrice(o.priceLabel), 0);
  const selectedPrice = priceFor(paperSize); // reflects the paper size chosen in Step 4

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
        .preview-compare-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .preview-compare-grid {
            grid-template-columns: 1fr;
          }
        }
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

          {/* Step 1: Photo */}
          <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>{t("step1.title")}</h2>

              {/* ── CROP: cropper UI replaces the static preview while active ── */}
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
                          {/* ── CROP: entry point button ── */}
                          <button onClick={() => setShowCropper(true)} disabled={!!bgProcessing}
                            style={{fontSize:16, color:"var(--pink)", background:"none", border:"none", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
                            <span style={{fontSize:20}}>✂️</span> {t("step1.cropLabel")}
                          </button>
                     
                         {/* ── BACKGROUND TOOLS: remove / blur — hidden via flag, code intact ── */}
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
                          <button onClick={() => { setPhoto(null); setPhotoUrl(""); setOriginalPhoto(null); setOriginalPhotoUrl(""); setBgError(""); setPhotoDimError(""); setPreviewResult(null); setPreviewError(""); setShowNoSetsWarning(false); setPreviousPreviewResult(null); setAdjustmentMade(false); setWantsFullGuide(false); setPreviewSkipped(false); setPhotoRestoredNotice(false); }} disabled={!!bgProcessing}
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

          {/* Step 2: Markers */}
          <div className="card" style={{display:"flex", flexDirection:"column"}}>
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step2.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                {t("step2.description")}
              </p>
              <div className="marker-set-list" style={{flex:"1 1 auto", minHeight:200}}>
                {MARKER_SETS.map(s => (
                  <label key={s.value} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={selectedSets.includes(s.value)}
                      onChange={() => toggleSet(s.value)}
                      style={{accentColor:"var(--pink)"}}
                    />
                    <span>{s.label} <span style={{color:"var(--muted)"}}>({s.value})</span></span>
                  </label>
                ))}
              </div>
              {selectedSets.length > 0 && (
                <p style={{fontSize:12, color:"var(--muted)", marginTop:8}}>
                  {t("step2.setsSelected", { count: selectedSets.length })}
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

            {/* Step 3: Generate preview -- full width */}
            <div className="card full-width">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step3.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                {t("step3.description", { price: selectedPrice })}
              </p>
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

              {/* ── SKIP PREVIEW: only offered before a preview exists (or once
                  the existing one's gone stale) -- once you HAVE a fresh
                  preview, there's nothing left to skip. ── */}
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

              {showNoSetsWarning && (
                <div style={{marginTop:8, padding:"12px 14px", background:"#FFF8ED", border:"1.5px solid #F0DFC0", borderRadius:10}}>
                  <p style={{fontSize:13, fontWeight:700, color:"#8a6d1f", marginBottom:8}}>
                    {t("step3.noSetsWarning")}
                  </p>
                  <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                    <button onClick={() => generatePreview(["GN-8101-366"])} className="btn-primary" style={{fontSize:13, padding:"8px 14px"}}>
                      {t("step3.useFullSet")}
                    </button>
                    <button onClick={() => setShowNoSetsWarning(false)}
                      style={{fontSize:13, padding:"8px 14px", borderRadius:8, border:"2px solid var(--border)", background:"white", color:"#555", cursor:"pointer"}}>
                      {t("step3.cancelPickSets")}
                    </button>
                  </div>
                </div>
              )}

              {previewError && (
                <p style={{fontSize:13, color:"#c62828", marginTop:8}}>⚠️ {previewError}</p>
              )}
              {previewStale && previewResult && (
                <p style={{fontSize:12, color:"#b8860b", marginTop:8}}>
                  {t("step3.stalePreview")}
                </p>
              )}

              {previewResult && !previewStale && (previewResult.owned || previewResult.full366) && (
                <div style={{marginTop:16}}>
                  {isFullPalette ? (
                    (() => {
                      const branch = previewResult.owned || previewResult.full366!;
                      return (
                        <div className="preview-compare-grid">
                          <div>
                            <BeforeAfterSlider
                              beforeImage={`data:image/png;base64,${branch.preview_png_base64}`}
                              afterImage={`data:image/png;base64,${branch.outline_png_base64}`}
                              beforeLabel={t("step3.beforeLabel")}
                              afterLabel={t("step3.afterLabel")}
                              aspectRatio={4 / 3}
                            />
                            <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:4}}>
                              {t("step3.matchedFullPalette")}
                            </p>
                            <MarkerSwatches legend={branch.legend} />
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                  <div className={previewResult.owned && previewResult.full366 ? "preview-compare-grid" : undefined}>
                    {previewResult.owned && (
                      <div>
                        <p style={{fontSize:12.5, fontWeight:700, color:"var(--pink)", marginBottom:6}}>
                          {t("step3.yourMarkers")}{selectedMarkersLabel ? ` — ${selectedMarkersLabel}` : ""}
                        </p>
                        <BeforeAfterSlider
                          beforeImage={`data:image/png;base64,${previewResult.owned.preview_png_base64}`}
                          afterImage={`data:image/png;base64,${previewResult.owned.outline_png_base64}`}
                          beforeLabel={t("step3.beforeLabel")}
                          afterLabel={t("step3.afterLabel")}
                          aspectRatio={4 / 3}
                        />
                        <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:4}}>
                          {t("step3.matchedYourMarkers")}
                        </p>
                        <MarkerSwatches legend={previewResult.owned.legend} />
                      </div>
                    )}
                    {previewResult.full366 && (
                      <div>
                        <p style={{fontSize:12.5, fontWeight:700, color:"var(--pink)", marginBottom:6}}>{t("step3.fullColorPalette")}</p>
                        <BeforeAfterSlider
                          beforeImage={`data:image/png;base64,${previewResult.full366.preview_png_base64}`}
                          afterImage={`data:image/png;base64,${previewResult.full366.outline_png_base64}`}
                          beforeLabel={t("step3.beforeLabel")}
                          afterLabel={t("step3.afterLabel")}
                          aspectRatio={4 / 3}
                        />
                        {(() => {
                          const excludeIds = previewResult.owned
                            ? new Set(previewResult.owned.legend.map(e => e.marker_id).filter((id): id is string => Boolean(id)))
                            : undefined;
                          const full366Top = topMarkers(previewResult.full366!.legend, 5, excludeIds);
                          return (
                            <>
                              {full366Top.length > 0 && (
                                <p style={{fontSize:12, color:"#8a6d1f", fontWeight:600, marginTop:4}}>
                                  {t("step3.addingMarkersHelps")}
                                </p>
                              )}
                              <MarkerSwatches legend={previewResult.full366!.legend} exclude={excludeIds} />
                            </>
                          );
                        })()}
                        {/* ── FULL GUIDE: free opt-in, unchecked by default. ── */}
                        <label style={{display:"flex", alignItems:"flex-start", gap:8, marginTop:10, fontSize:12.5, color:"#555", cursor:"pointer"}}>
                          <input
                            type="checkbox"
                            checked={wantsFullGuide}
                            onChange={e => setWantsFullGuide(e.target.checked)}
                            style={{marginTop:2, accentColor:"var(--pink)"}}
                          />
                          <span>{t("step3.includeFullGuide")}</span>
                        </label>
                      </div>
                      
                    )}
                  </div>
                  )}

                  <div style={{
                    marginTop: 12, padding: "14px 16px", background: "var(--cream)",
                    border: "1.5px solid var(--border)", borderRadius: 10,
                    fontSize: 14, color: "#444", lineHeight: 1.6,
                  }}>
                    {t("step3.scaledDownNotice")}{" "}
                    <a href="/examples" style={{ color: "var(--pink)", fontWeight: 700 }}>
                      {t("step3.examplesLink")}
                    </a>
                  </div>

                  {/* ── ADJUST: happy-with-this flow. Two buttons regenerate at a
                      different difficulty tier using the same sets/codes; once used,
                      they're replaced by a single revert button. Prices removed --
                      difficulty no longer affects price, see GUANGNA_BY_NUMBER. ── */}
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

            {/* Step 4: Paper size */}
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

            {/* Step 5: Email */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>{t("step5.title")}</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:12}}>{t("step5.description")}</p>
              <input type="email" className="email-input-big" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{width:"100%"}}/>
            </div>

            {/* Order summary */}
            <div style={{background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)", border:"2px solid var(--border)", borderRadius:16, padding:20}}>
              <h3 style={{fontWeight:800, fontSize:15, marginBottom:12}}>{t("summary.title")}</h3>
              <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:14}}>
                <Row label={t("summary.photo")}       value={photo ? `✓ ${photo.name}` : t("summary.none")}/>
                <Row label={t("summary.level")}       value={currentLevelInfo ? t(currentLevelInfo.labelKey) : t("summary.none")}/>
                <Row label={t("summary.markerSets")} value={selectedSets.length ? t("summary.nSelected", { count: selectedSets.length }) : t("summary.noneSelected")}/>
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

            {/* Submit + status + error -- spans the full grid width */}
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