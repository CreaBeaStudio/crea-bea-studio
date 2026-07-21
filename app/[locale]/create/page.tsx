"use client";
import Navbar from "../components/Navbar";
import LoadingCat from "../components/LoadingCat";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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

const LEVELS = [
  { label:"🌱 Beginner",     value:"15", price:7,  priceLabel:"7 €",  desc:"Fewer colors, larger areas." },
  { label:"🌿 Intermediate", value:"24", price:9,  priceLabel:"9 €",  desc:"Balanced mix of effort and detail.", popular:true },
  { label:"🌲 Advanced",     value:"36", price:11, priceLabel:"11 €", desc:"Wide color range, detailed." },
];

const DEFAULT_LEVEL = "24";

const LEVEL_TO_VARIANT: Record<string, string> = {
  "15": "1797148",
  "24": "1797163",
  "36": "1797167",
};

// Maps the create page's existing price-tier levels onto the
// generation service's region-cap difficulty tiers (see webservice's
// DIFFICULTY_PRESETS, 2026-07-11). Prices/variant IDs above are
// unchanged -- only what each level triggers server-side has changed,
// from a fixed color-count to a percentage-of-natural-regions cap.
const LEVEL_TO_DIFFICULTY: Record<string, string> = {
  "15": "beginner",
  "24": "standard",
  "36": "advanced",
};

// ── QUALITY FLOOR: reject uploads below this on the shorter side.
// Below this, upscaling to our 1800px preview / 3000px purchase
// resolutions produces visibly soft edges and mushy region detection
// (see pbn-generation-pipeline notes on preview/purchase resolutions).
const MIN_PHOTO_DIMENSION = 1200;

// ── CROP: aspect ratio presets shown as quick-select buttons ──────────────
// Feature flag — set to true to re-enable these buttons later, once
// the Render service is upgraded off the free tier. Code stays intact,
// just not rendered while this is false.
const BG_TOOLS_ENABLED = false;

const ASPECT_PRESETS = [
  { label: "Free", value: undefined },
  { label: "1:1",  value: 1 },
  { label: "4:3",  value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

type OrderItem = {
  photoName:  string;
  level:      string;
  levelLabel: string;
  price:      number;
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

function FxTag({ eur, gbp }: { eur: number; gbp: number | null }) {
  if (!gbp) return null;
  return (
    <span style={{ fontSize: 11, color: "#999", fontWeight: 400, marginLeft: 6 }}>
      ≈ £{(eur * gbp).toFixed(0)}
    </span>
  );
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
  const router = useRouter();
  const params = useSearchParams();

  const [photo, setPhoto]           = useState<File|null>(null);
  const [photoUrl, setPhotoUrl]     = useState("");
  const [email, setEmail]           = useState("");
  const [level, setLevel]           = useState(DEFAULT_LEVEL);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [individualPens, setIndividualPens] = useState("");
  const [indPenError, setIndPenError]       = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [prevOrders, setPrevOrders] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [gbpRate, setGbpRate]       = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── QUALITY FLOOR: set when a dropped/selected photo is smaller than
  // MIN_PHOTO_DIMENSION on its shorter side; the file is rejected (not
  // set as the working photo) and this message shown instead. ─────────
  const [photoDimError, setPhotoDimError] = useState("");

  // ── FULL GUIDE (2026-07-17): opt-in checkbox on the full366 upsell
  // panel -- "also prepare my free complete palette guide". Unchecked
  // by default. Only ever surfaced again in the post-purchase delivery
  // email if accepted -- there's no earlier confirmation UI, per
  // Mirjam's call to keep this out of the create-page flow itself. ────
  const [wantsFullGuide, setWantsFullGuide] = useState(false);

  // ── PREVIEW: required generation step before Submit unlocks ──────────
  const [previewResult, setPreviewResult]   = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState("");
  // True whenever photo/sets/codes/level changed since the last
  // successful preview -- forces a fresh preview before submitting
  // rather than letting a stale one (generated against different
  // inputs) slip through.
  const [previewStale, setPreviewStale]     = useState(false);
  // True while the "you haven't selected any sets" confirm box is
  // showing, after the user hits Generate preview with zero sets and
  // no individual codes entered.
  const [showNoSetsWarning, setShowNoSetsWarning] = useState(false);
  // ── ADJUST: "Happy with this, or want changes?" flow. previousPreviewResult
  // holds the pre-adjustment result so a single click can revert to it.
  // adjustmentMade is true once the user has picked "bigger areas" or
  // "more detail" at least once for the CURRENT preview -- while true,
  // the two adjustment buttons are replaced with a single revert button. ──
  const [previousPreviewResult, setPreviousPreviewResult] = useState<PreviewResult | null>(null);
  const [adjustmentMade, setAdjustmentMade] = useState(false);

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
    const pSets       = params.get("sets");
    const pIndPens    = params.get("indPens");
    const pPrevOrders = params.get("prevOrders");
    if (pEmail)   setEmail(pEmail);
    setLevel(pLevel && pLevel !== "reset" ? pLevel : DEFAULT_LEVEL);
    if (pSets)    setSelectedSets(pSets.split("|").filter(Boolean));
    if (pIndPens) setIndividualPens(pIndPens);
    if (pPrevOrders) {
      try { setPrevOrders(JSON.parse(decodeURIComponent(pPrevOrders))); } catch {}
    }
  }, []);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/EUR")
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          setGbpRate(data.rates.GBP * 1.05);
        }
      })
      .catch(() => {});
  }, []);

  // ── PREVIEW: any change to what would be generated invalidates the
  // last preview. Only fires once a preview actually exists -- doesn't
  // do anything on initial mount or while the user is still making
  // their first round of choices. ──────────────────────────────────────
  useEffect(() => {
    if (previewResult) {
      setPreviewStale(true);
      setPreviousPreviewResult(null);
      setAdjustmentMade(false);
      // A changed selection means a changed upsell/full366 result too --
      // don't carry the opt-in forward against markers that no longer
      // match what was actually shown.
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
    // ── CROP: remember the original so the user can re-crop from full
    // quality later, and reset any in-progress crop UI ──────────────────
    setOriginalPhoto(file);
    setOriginalPhotoUrl(url);
    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspect(undefined);
    // A new photo makes any existing preview meaningless immediately,
    // not just "stale" -- clear it outright rather than waiting for the
    // staleness effect (which would still show the old images briefly).
    setPreviewResult(null);
    setPreviewStale(false);
    setPreviewError("");
    setShowNoSetsWarning(false);
    setPreviousPreviewResult(null);
    setAdjustmentMade(false);
    setWantsFullGuide(false);
  };

  // ── QUALITY FLOOR: reads the image's natural dimensions before
  // accepting it. Photos under MIN_PHOTO_DIMENSION on the shorter side
  // are rejected outright (not set as the working photo) rather than
  // silently upscaled -- upscaling that far produces soft edges and
  // mushy region detection at both our 1800px preview and 3000px
  // purchase resolutions. Formats the browser can't decode client-side
  // (e.g. HEIC in some Chrome builds) skip the check and are accepted
  // as-is; the server-side generation step still handles them. ────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhotoDimError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const shortSide = Math.min(img.naturalWidth, img.naturalHeight);
      if (shortSide < MIN_PHOTO_DIMENSION) {
        setPhotoDimError(
          `This photo is ${img.naturalWidth}×${img.naturalHeight}px — a bit small for a sharp result. Please upload a photo at least ${MIN_PHOTO_DIMENSION}px on the shorter side.`
        );
        URL.revokeObjectURL(url);
        return;
      }
      acceptPhoto(file, url);
    };
    img.onerror = () => {
      acceptPhoto(file, url);
    };
    img.src = url;
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
  // proxies to the separate Python service. Operates on whatever the
  // CURRENT working photo is (post-crop, if cropped) — "Reset to
  // original" still fully reverts to the pristine upload either way. ──
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
        throw new Error(data.error || "Something went wrong processing your photo.");
      }
      const blob = await res.blob();
      const ext = action === "remove" ? "png" : "jpg";
      const baseName = photo.name.replace(/\.[^.]+$/, "");
      const newFile = new File([blob], `${baseName}-${action}.${ext}`, { type: blob.type });
      setPhoto(newFile);
      setPhotoUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setBgError(err?.message || "Something went wrong processing your photo. Please try again.");
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
      setIndPenError(`Invalid code(s): ${invalid.join(", ")}. Must be 3-digit numbers between 600 and 965.`);
    } else {
      setIndPenError("");
    }
  };

  const currentLevelInfo = LEVELS.find(l => l.value === level)!;
  const hasMarkersSelected = selectedSets.length > 0 || individualPens.trim().length > 0;
  // Human-readable summary of what's selected, shown next to "Your markers"
  // in the preview -- e.g. "Classic brush-408, 2 individual markers".
  const selectedMarkersLabel = (() => {
    const setLabels = selectedSets
      .map(v => MARKER_SETS.find(s => s.value === v)?.label)
      .filter(Boolean) as string[];
    const parts = [...setLabels];
    const extraCodes = toApiExtraCodes(individualPens).split(",").filter(Boolean);
    if (extraCodes.length) parts.push(`${extraCodes.length} individual marker${extraCodes.length > 1 ? "s" : ""}`);
    return parts.join(", ");
  })();
  // True once the user's selection already IS the full 366-color palette
  // (either they explicitly checked that set, or the no-sets-selected
  // warning flow confirmed it) -- in that case "Your markers" and "Full
  // color palette" would be identical, so only one column is shown.
  const isFullPalette = selectedSets.includes("GN-8101-366");

  // ── PREVIEW: calls our own /api/generate-preview route, which proxies
  // to the Cloud Run generation service server-side (API key never
  // touches the browser). Takes roughly 15-20s.
  //
  // If called with no marker sets selected and no individual codes
  // entered, shows a confirm warning instead of generating -- unless
  // overrideSets is passed (used by the "Yes, use full set" button),
  // in which case it generates immediately against that set list and
  // also updates selectedSets to match, so the rest of the page (order
  // summary, submit) reflects what was actually generated. ────────────
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
        setPreviewError(data.error || "Something went wrong generating your preview. Please try again.");
        setPreviewResult(null);
        return;
      }
      setPreviewResult(data);
      setPreviewStale(false);
      // A brand-new generation starts a fresh adjustment cycle.
      setPreviousPreviewResult(null);
      setAdjustmentMade(false);
    } catch (err) {
      setPreviewError("Something went wrong generating your preview. Please check your connection and try again.");
      setPreviewResult(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── ADJUST: regenerates at a specific difficulty tier ("bigger areas" =
  // beginner, "more detail, smaller areas" = advanced) using the SAME
  // sets/codes already selected -- this does not touch the (currently
  // hidden) Level card's `level` state, only this one regeneration.
  // Stashes the current result so a single click can revert to it. ────
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
        setPreviewError(data.error || "Something went wrong generating your preview. Please try again.");
        setPreviousPreviewResult(null);
        return;
      }
      setPreviewResult(data);
      setAdjustmentMade(true);
    } catch (err) {
      setPreviewError("Something went wrong generating your preview. Please check your connection and try again.");
      setPreviousPreviewResult(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── ADJUST: reverts to the result from before the last adjustment. ───
  const restorePrevious = () => {
    if (!previousPreviewResult) return;
    setPreviewResult(previousPreviewResult);
    setPreviousPreviewResult(null);
    setAdjustmentMade(false);
  };

  const handleSubmit = async () => {
    if (!photo || !email || indPenError || !previewResult || previewStale) return;
    setSubmitting(true);
    setErrorMsg("");
    let orderId = "";
    try {
      const levelInfo  = LEVELS.find(l => l.value === level)!;
      const filledSets = selectedSets;
      const thisOrder: OrderItem = {
        photoName:  photo.name,
        level,
        levelLabel: levelInfo.label,
        price:      levelInfo.price,
        priceLabel: levelInfo.priceLabel,
        sets:       filledSets,
        indPens:    individualPens,
      };
      const allOrders  = [...prevOrders, thisOrder];
      const grandTotal = allOrders.reduce((acc, o) => acc + o.price, 0);
      const formData = new FormData();
      formData.append("image",      photo);
      formData.append("email",      email);
      formData.append("level",      level);
      formData.append("sets",       filledSets.join(", "));
      formData.append("indPens",    individualPens);
      formData.append("allOrders",  JSON.stringify(allOrders));
      formData.append("grandTotal", String(grandTotal));
      formData.append("wantsFullGuide", String(wantsFullGuide));
      const res  = await fetch("/api/submit-order", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        setErrorMsg(data.error || "Something went wrong submitting your order. Please try again or contact hello@creabeastudio.com.");
        setSubmitting(false);
        return;
      }
      orderId = data.orderId;
    } catch (err) {
      console.error("Failed to submit order:", err);
      setErrorMsg("Something went wrong submitting your order. Please try again or contact hello@creabeastudio.com.");
      setSubmitting(false);
      return;
    }
    const filledSets = selectedSets;
    const q = new URLSearchParams({
      email, level,
      photoName:  photo!.name,
      sets:       filledSets.join("|"),
      indPens:    individualPens,
      orderId,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    setSubmitting(false);
    router.push(`/confirm?${q.toString()}`);
  };

  const canSubmit  = photo && email && !indPenError && previewResult && !previewStale;
  const totalSoFar = prevOrders.reduce((acc, o) => acc + o.price, 0);

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
      `}</style>
      <Navbar />
      <main style={{padding:"40px 24px", maxWidth:1100, margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(26px,4vw,40px)", marginBottom:6}}>
          Create Your Custom Guangna by Number
        </h1>
        <p style={{color:"#666", marginBottom:8}}>
        Upload your photo, choose your Guangna markers, and preview your design for free before you order.
        </p>

        {prevOrders.length > 0 && (
          <div style={{background:"#FFF0F3", border:"2px solid var(--pink)", borderRadius:14, padding:"14px 18px", marginTop:16, marginBottom:4}}>
            <p style={{fontWeight:700, fontSize:14, color:"var(--pink)", marginBottom:8}}>
              🛒 You have {prevOrders.length} order{prevOrders.length > 1 ? "s" : ""} in your cart — total so far: <strong>{totalSoFar}€</strong>
            </p>
            {prevOrders.map((o, i) => (
              <p key={i} style={{fontSize:13, color:"#555", margin:"2px 0"}}>
                #{i+1} · {o.photoName} · {o.levelLabel} · {o.priceLabel}
              </p>
            ))}
          </div>
        )}

        <div className="create-grid">

          {/* Step 1: Photo */}
          <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>Step 1: 📸 Upload your photo</h2>

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
                      ✂️ Apply Crop
                    </button>
                    <button
                      onClick={cancelCrop}
                      style={{
                        flex:1, fontSize:14, padding:"10px", borderRadius:10,
                        border:"2px solid var(--border)", background:"white",
                        color:"#555", cursor:"pointer",
                      }}
                    >
                      Cancel
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
                          <p style={{fontWeight:600, fontSize:15, marginBottom:4}}>Drop photo here</p>
                          <p style={{color:"var(--muted)", fontSize:13}}>or click to browse · JPG, PNG, HEIC</p>
                        </>
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
                  {photoDimError && (
                    <p style={{fontSize:12, color:"#c62828", marginTop:8}}>⚠️ {photoDimError}</p>
                  )}
                  {photo && (
                    <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:6}}>
                      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8}}>
                        <p style={{fontSize:13, color:"var(--muted)"}}>✓ {photo.name}</p>
                        <div style={{display:"flex", gap:14, flexWrap:"wrap"}}>
                          {/* ── CROP: entry point button ── */}
                          <button onClick={() => setShowCropper(true)} disabled={!!bgProcessing}
                            style={{fontSize:16, color:"var(--pink)", background:"none", border:"none", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
                            <span style={{fontSize:20}}>✂️</span> Crop
                          </button>
                     
                         {/* ── BACKGROUND TOOLS: remove / blur — hidden via flag, code intact ── */}
                         {BG_TOOLS_ENABLED && (
                            <>
                              <button onClick={() => applyBackgroundAction("remove")} disabled={!!bgProcessing}
                                style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor: bgProcessing ? "default" : "pointer", fontWeight:600, opacity: bgProcessing && bgProcessing !== "remove" ? 0.4 : 1}}>
                                {bgProcessing === "remove" ? "⏳ Removing…" : "🪄 Remove Background"}
                              </button>
                              <button onClick={() => applyBackgroundAction("blur")} disabled={!!bgProcessing}
                                style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor: bgProcessing ? "default" : "pointer", fontWeight:600, opacity: bgProcessing && bgProcessing !== "blur" ? 0.4 : 1}}>
                                {bgProcessing === "blur" ? "⏳ Blurring…" : "🌫️ Blur Background"}
                              </button>
                            </>
                          )}
                          {photo !== originalPhoto && (
                            <button onClick={resetToOriginal} disabled={!!bgProcessing}
                              style={{fontSize:12, color:"var(--muted)", background:"none", border:"none", cursor:"pointer"}}>
                              ↺ Reset to original
                            </button>
                          )}
                          <button onClick={() => { setPhoto(null); setPhotoUrl(""); setOriginalPhoto(null); setOriginalPhotoUrl(""); setBgError(""); setPhotoDimError(""); setPreviewResult(null); setPreviewError(""); setShowNoSetsWarning(false); setPreviousPreviewResult(null); setAdjustmentMade(false); setWantsFullGuide(false); }} disabled={!!bgProcessing}
                            style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor:"pointer"}}>
                            Remove
                          </button>
                        </div>
                      </div>
                      {bgError && (
                        <p style={{fontSize:12, color:"#c62828", margin:0}}>⚠️ {bgError}</p>
                      )}
                      {BG_TOOLS_ENABLED && bgProcessing && (
                        <p style={{fontSize:11, color:"var(--muted)", margin:0}}>
                          This can take up to a minute if the photo tool is just waking up — hang tight.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Level card -- temporarily hidden while Mirjam decides where the
                price selector belongs. The Step 3 "bigger areas / more detail"
                buttons now cover the difficulty-tier role this played; the
                `level` state still defaults to "24" (Intermediate) and drives
                pricing, LEVEL_TO_DIFFICULTY, and the order summary unchanged.
                Flip `false` to `true` to bring this back. ── */}
            {false && (
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>Select your level</h2>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {LEVELS.map(l => (
                  <label key={l.value} style={{
                    display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                    padding:"12px 16px", borderRadius:12,
                    border:`2px solid ${level === l.value ? "var(--pink)" : "var(--border)"}`,
                    background: level === l.value ? "#FFF0F3" : "white",
                    transition:"all 0.15s", position:"relative",
                  }}>
                    <input type="radio" name="level" value={l.value}
                      checked={level === l.value} onChange={() => setLevel(l.value)}
                      style={{accentColor:"var(--pink)"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                        {l.label} — {l.priceLabel}
                        <FxTag eur={l.price} gbp={gbpRate} />
                        {l.popular && (
                          <span style={{fontSize:11, fontWeight:700, background:"var(--pink)", color:"white", borderRadius:20, padding:"2px 8px", letterSpacing:"0.03em"}}>
                            ★ Most Popular
                          </span>
                        )}
                      </div>
                      <div style={{color:"var(--muted)", fontSize:13}}>{l.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{marginTop:16, padding:"10px 14px", background:"#f9f9f9", borderRadius:10, borderLeft:"3px solid var(--border)"}}>
                <p style={{fontSize:11, color:"#999", margin:0, lineHeight:1.6}}>
                  💱 Prices shown in EUR. The approximate equivalent in GBP is shown for indication only, based on indicative exchange rates. Your bank or card provider may apply different rates and fees.
                </p>
              </div>
            </div>
            )}

          {/* Step 2: Markers */}
          <div className="card" style={{display:"flex", flexDirection:"column"}}>
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>Step 2: 🖊️ Your Guangna Marker Sets</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                Select every set you own — we'll build the palette from your markers. You can pick as many as you like, or leave this empty to preview against the full Guangna color palette.
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
                  {selectedSets.length} set{selectedSets.length > 1 ? "s" : ""} selected
                </p>
              )}
              <div style={{marginTop:18}}>
                <h3 style={{fontWeight:700, fontSize:15, marginBottom:4}}>Additional Marker Codes</h3>
                <p style={{fontSize:12, color:"var(--muted)", marginBottom:8}}>
                  Add your individual markers — GN codes (3-digit, comma or space separated). Metallic pens not included.
                </p>
                <textarea
                  value={individualPens}
                  onChange={e => validateIndPens(e.target.value)}
                  placeholder="e.g. 603, 648, 712"
                  rows={2}
                  style={{resize:"vertical", border: indPenError ? "2px solid #c62828" : "2px solid var(--border)"}}
                />
                {indPenError && <p style={{fontSize:12, color:"#c62828", marginTop:4}}>⚠️ {indPenError}</p>}
              </div>
            </div>

            {/* Step 3: Generate preview -- full width */}
            <div className="card full-width">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>Step 3: 🖼️ Free instant preview, high-res to your inbox for 9 € </h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
              Generate your free preview in 15-30 seconds and see exactly how it looks before you buy. Order the full high-res file for 9 € to receive it straight to your inbox.
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
                  ? "⏳ Generating your preview… (~15-30s)"
                  : previewResult && !previewStale
                    ? "🔄 Regenerate preview"
                    : "🎨 Generate free preview"}
              </button>

              {previewLoading && (
                <div style={{marginTop:14}}>
                  <LoadingCat />
                </div>
              )}

              {!photo && (
                <p style={{fontSize:12, color:"var(--muted)", marginTop:8}}>Upload a photo first.</p>
              )}

              {showNoSetsWarning && (
                <div style={{marginTop:8, padding:"12px 14px", background:"#FFF8ED", border:"1.5px solid #F0DFC0", borderRadius:10}}>
                  <p style={{fontSize:13, fontWeight:700, color:"#8a6d1f", marginBottom:8}}>
                    You haven't selected any Guangna sets — do you want to continue with the full color palette?
                  </p>
                  <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                    <button onClick={() => generatePreview(["GN-8101-366"])} className="btn-primary" style={{fontSize:13, padding:"8px 14px"}}>
                      Yes, use full set
                    </button>
                    <button onClick={() => setShowNoSetsWarning(false)}
                      style={{fontSize:13, padding:"8px 14px", borderRadius:8, border:"2px solid var(--border)", background:"white", color:"#555", cursor:"pointer"}}>
                      Cancel, let me pick sets
                    </button>
                  </div>
                </div>
              )}

              {previewError && (
                <p style={{fontSize:13, color:"#c62828", marginTop:8}}>⚠️ {previewError}</p>
              )}
              {previewStale && previewResult && (
                <p style={{fontSize:12, color:"#b8860b", marginTop:8}}>
                  Your photo or selections changed — generate a new preview before ordering.
                </p>
              )}

              {previewResult && !previewStale && (previewResult.owned || previewResult.full366) && (
                <div style={{marginTop:16}}>
                  {isFullPalette ? (
                    (() => {
                      const branch = previewResult.owned || previewResult.full366!;
                      return (
                        <div>
                          <BeforeAfterSlider
                            beforeImage={`data:image/png;base64,${branch.preview_png_base64}`}
                            afterImage={`data:image/png;base64,${branch.outline_png_base64}`}
                            beforeLabel="Colored preview"
                            afterLabel="Numbered outline"
                            aspectRatio={4 / 3}
                          />
                          <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:4}}>
                            🎨 Matched to real Guangna markers — the colors you see are what you'll paint with.
                          </p>
                          <MarkerSwatches legend={branch.legend} />
                        </div>
                      );
                    })()
                  ) : (
                  <div className={previewResult.owned && previewResult.full366 ? "preview-compare-grid" : undefined}>
                    {previewResult.owned && (
                      <div>
                        <p style={{fontSize:12.5, fontWeight:700, color:"var(--pink)", marginBottom:6}}>
                          Your markers{selectedMarkersLabel ? ` — ${selectedMarkersLabel}` : ""}
                        </p>
                        <BeforeAfterSlider
                          beforeImage={`data:image/png;base64,${previewResult.owned.preview_png_base64}`}
                          afterImage={`data:image/png;base64,${previewResult.owned.outline_png_base64}`}
                          beforeLabel="Colored preview"
                          afterLabel="Numbered outline"
                          aspectRatio={4 / 3}
                        />
                        <p style={{fontSize:12, color:"var(--pink)", fontWeight:600, marginTop:4}}>
                          🎨 Matched to your Guangna markers — you'll be using these when coloring your Guangna-by-Number.
                        </p>
                        <MarkerSwatches legend={previewResult.owned.legend} />
                      </div>
                    )}
                    {previewResult.full366 && (
                      <div>
                        <p style={{fontSize:12.5, fontWeight:700, color:"var(--pink)", marginBottom:6}}>Full color palette</p>
                        <BeforeAfterSlider
                          beforeImage={`data:image/png;base64,${previewResult.full366.preview_png_base64}`}
                          afterImage={`data:image/png;base64,${previewResult.full366.outline_png_base64}`}
                          beforeLabel="Colored preview"
                          afterLabel="Numbered outline"
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
                                  ✨ Adding these markers will help your Guangna-by-Number look closer to the original uploaded image.
                                </p>
                              )}
                              <MarkerSwatches legend={previewResult.full366!.legend} exclude={excludeIds} />
                            </>
                          );
                        })()}
                        {/* ── FULL GUIDE: free opt-in, unchecked by default. Only
                            reappears later in the delivery email if checked --
                            nothing else on this page changes based on it. ── */}
                        <label style={{display:"flex", alignItems:"flex-start", gap:8, marginTop:10, fontSize:12.5, color:"#555", cursor:"pointer"}}>
                          <input
                            type="checkbox"
                            checked={wantsFullGuide}
                            onChange={e => setWantsFullGuide(e.target.checked)}
                            style={{marginTop:2, accentColor:"var(--pink)"}}
                          />
                          <span>📩 Please include my Free full color Palette Guide with my order, in case I want to add more markers later.</span>
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
                    💡 This preview is scaled down for speed, so some fine detail is softened here. Your purchased file is generated at full resolution, with sharper lines and richer detail. See the difference for yourself on our{" "}
                    <a href="/examples" style={{ color: "var(--pink)", fontWeight: 700 }}>
                      examples page →
                    </a>
                  </div>

                  {/* ── ADJUST: happy-with-this flow. Two buttons regenerate at a
                      different difficulty tier using the same sets/codes; once used,
                      they're replaced by a single revert button. ── */}
                  <div style={{marginTop:14, padding:"14px 16px", background:"#FAFAFA", border:"1.5px solid var(--border)", borderRadius:12}}>
                    {!adjustmentMade ? (
                      <>
                        <p style={{fontSize:14, fontWeight:700, marginBottom:10}}>
                        Looks good, or would you like to make changes?
                        </p>
                        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                          <button
                            onClick={() => regenerateWithDifficulty("beginner")}
                            className="btn-primary"
                            disabled={previewLoading}
                            style={{flex:"1 1 200px", fontSize:14, padding:"12px", opacity: previewLoading ? 0.6 : 1}}
                          >
                           Larger Coloring Areas (7 €)
                          </button>
                          <button
                            onClick={() => regenerateWithDifficulty("advanced")}
                            className="btn-primary"
                            disabled={previewLoading}
                            style={{flex:"1 1 200px", fontSize:14, padding:"12px", opacity: previewLoading ? 0.6 : 1}}
                          >
                            Ultra Detailed Design (11 €)
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
                        ↺ Previous one was better
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Email */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>Step 4: ✉️ Your email</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:12}}>Your finished file will be sent straight to your email.</p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>

            {/* Order summary */}
            <div style={{background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)", border:"2px solid var(--border)", borderRadius:16, padding:20}}>
              <h3 style={{fontWeight:800, fontSize:15, marginBottom:12}}>📋 Order summary</h3>
              <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:14}}>
                <Row label="Photo"       value={photo ? `✓ ${photo.name}` : "—"}/>
                <Row label="Level"       value={currentLevelInfo ? `${currentLevelInfo.label} — ${currentLevelInfo.priceLabel}` : "—"}/>
                <Row label="Marker sets" value={selectedSets.length ? `${selectedSets.length} selected` : "None selected"}/>
                <Row label="Preview"     value={previewResult && !previewStale ? "✓ Generated" : "Not yet generated"}/>
                {prevOrders.length > 0 && (
                  <>
                    <div style={{borderTop:"1.5px solid var(--border)", margin:"4px 0"}}/>
                    <Row label={`Previous orders (${prevOrders.length})`} value={`${totalSoFar}€`}/>
                    <Row label="This order" value={currentLevelInfo ? currentLevelInfo.priceLabel : "—"}/>
                    <div style={{borderTop:"1.5px solid var(--pink)", margin:"4px 0"}}/>
                    <Row label="🧾 New total" value={`${totalSoFar + (currentLevelInfo?.price ?? 0)}€`} highlight/>
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
                {submitting ? "⏳ Sending your order…" : canSubmit ? "✨ Order Your Custom Guangna by Number →" : "✨ Order Your Custom Guangna by Number"}
              </button>

              {!photo && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  Upload a photo to get started
                </p>
              )}
              {photo && (!previewResult || previewStale) && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  Generate a preview to continue
                </p>
              )}
              {!email && photo && previewResult && !previewStale && (
                <p style={{textAlign:"center", fontSize:13, color:"var(--muted)"}}>
                  Add your email to continue
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
