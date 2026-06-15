"""
============================================================
  pbn_generator.py  (v2 — production rewrite)
  ─────────────────────────────────────────────────────────
  Converts a source photo into a clean Paint-by-Number BW
  numbered outline + a matching colour-palette strip.

  HOW TO RUN:
    python3 pbn_generator.py --image photo.jpg --output outline.png
    python3 pbn_generator.py --image photo.jpg --colors 24 --output outline.png
    python3 pbn_generator.py --image photo.jpg --palette palette.csv --output outline.png

  PIPELINE SUMMARY:
    1. Load & resize to ≤ WORKING_WIDTH px (default 1500 px)
    2. Bilateral filter  — smooth flat areas, keep edges sharp
    3. Convert to Lab    — KMeans in perceptual colour space
    4. KMeans (k)        — colour quantisation
    5. Convert back to RGB, build label image
    6. Assign clusters → Guangna palette numbers (greedy ΔE)
    7. Median blur       — light smoothing of label map
    8. Merge small facets iteratively (< MIN_AREA px²)
    9. Final median blur — remove residual single-pixel jags
   10. Upscale × OUTPUT_SCALE with INTER_NEAREST
   11. Morphological close per label + approxPolyDP contours
   12. Distance-transform label placement (no overlaps)
   13. Palette strip appended to bottom of outline

  CHANGE LOG vs v1:
  ─────────────────
  • Bilateral filter replaces raw feed-to-KMeans  (step 2)
  • KMeans now runs in Lab space (step 3-4)        (better clusters)
  • Palette strip generated & saved alongside BW   (new step 13)
  • Free-KMeans mode: no Guangna palette needed    (--colors only)
  • Overlap-guard for number placement             (checks bboxes)
  • Colour-preview saved automatically             (--preview flag)
  • All tuning constants grouped at top            (unchanged API)
  • SciPy median_filter used for smoother blur     (replaces cv2.medianBlur
    on label maps to avoid uint8 value-clamping artefacts)
  • Better font fallback chain (Linux + macOS + Windows)
  • --min-area, --output-scale, --bilateral-d flags exposed

  STYLE GUIDE:
  ─────────────
  Target quality: custompbn.com
  Key characteristics:
    - Thin smooth contour lines (not jagged pixels)
    - Numbers at widest point of each region
    - Regions large enough to paint with an acrylic marker
    - No unpaintable micro-specks

  TUNING KNOBS (see constants below):
  ─────────────────────────────────────
  WORKING_WIDTH   1500   → increase for more detail, slower KMeans
  OUTPUT_SCALE    4      → 4× gives ~300 dpi on A4 from 1500 px base
  K_DEFAULT       24     → colours; 11-36 typical for PBN
  KMEANS_NINIT    8      → more restarts = more stable clusters
  BILATERAL_D     9      → bilateral neighbourhood diameter
  BILATERAL_SC    75     → sigma_color  (higher = more blending)
  BILATERAL_SS    75     → sigma_space  (higher = larger neighbourhood)
  SMOOTH_KERNEL   5      → median blur on label map (must be odd)
  MIN_AREA        2000   → px² at working res; regions smaller get merged
  CONTOUR_EPS     0.0015 → approxPolyDP factor (larger = smoother)
  CONTOUR_THICK   2      → line width at output resolution
  FONT_SCALE      6      → font_size = OUTPUT_SCALE × FONT_SCALE
  MIN_DIST_FACTOR 0.45   → fraction of font_size required in dist-transform
  MERGE_KERNEL    7      → dilation kernel for neighbour detection
  MORPH_CLOSE_K   5      → close kernel for contour cleanup
  PALETTE_SWATCH  60     → swatch square size in palette strip (px)

  KNOWN FAILURE MODES:
  ─────────────────────
  - Very dark photos: try --bilateral-sc 50 or add --colors 15
  - Thin features (hair, fingers): may merge; reduce --min-area to 800
  - Still-jaggy contours: TODO integrate vtracer for bezier curves
============================================================
"""

import argparse
import csv
import math
import sys
from pathlib import Path

# ── Dependency check ─────────────────────────────────────────────────────────
try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    from sklearn.cluster import KMeans
    import cv2
    from scipy.ndimage import median_filter, label as nd_label, find_objects
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with:  pip install numpy pillow scikit-learn opencv-python scipy")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
#  TUNING CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

WORKING_WIDTH    = 1500
OUTPUT_SCALE     = 4
K_DEFAULT        = 24
KMEANS_NINIT     = 8
KMEANS_ITER      = 300

# Bilateral filter
BILATERAL_D      = 9
BILATERAL_SC     = 75
BILATERAL_SS     = 75

# Facet cleanup
SMOOTH_KERNEL    = 5     # must be odd; applied twice: after KMeans & after merge
MIN_AREA         = 2000  # px² at working resolution
MERGE_KERNEL     = 7
MORPH_CLOSE_K    = 5

# Outline drawing
CONTOUR_EPS      = 0.0015
CONTOUR_THICK    = 2
FONT_SCALE       = 6
MIN_DIST_FACTOR  = 0.45

# Palette strip
PALETTE_SWATCH   = 60    # px — side length of each colour swatch in strip

# ─────────────────────────────────────────────────────────────────────────────
#  GUANGNA COLOR CATALOG
# ─────────────────────────────────────────────────────────────────────────────

GUANGNA_COLORS = {
    "GN-600": (255,255,255), "GN-601": ( 76,166,218), "GN-602": (130,194,178),
    "GN-603": (251,234, 82), "GN-604": (226,153, 61), "GN-605": (197, 89, 72),
    "GN-606": (207,123,176), "GN-607": ( 82, 61,143), "GN-608": ( 22, 58,144),
    "GN-609": ( 60,135,125), "GN-610": (174,181,178), "GN-611": ( 20, 20, 20),
    "GN-612": (219,161,174), "GN-613": (107, 68,145), "GN-614": (152,196,114),
    "GN-615": (248,223, 75), "GN-616": ( 60,135,183), "GN-617": ( 40, 85,155),
    "GN-618": (222,157, 87), "GN-619": (193,137,145), "GN-620": (149,115,100),
    "GN-621": ( 52,120,195), "GN-622": (107,153,135), "GN-623": (181,154,195),
    "GN-624": (242,214,217), "GN-625": (240,201,187), "GN-626": (254,252,199),
    "GN-627": (196,223,198), "GN-628": (190,220,240), "GN-629": (174,179,216),
    "GN-630": (226,202,203), "GN-634": ( 81,143, 67), "GN-635": (181,176,209),
    "GN-636": ( 46,106,137), "GN-637": (162,169,146), "GN-638": (197,201,176),
    "GN-639": (187,154,131), "GN-643": (116, 99, 77), "GN-644": (201,155, 81),
    "GN-645": (225,207,169), "GN-646": (233,232,212), "GN-648": (191,212,114),
    "GN-649": (231,166,103), "GN-650": ( 63,143,203), "GN-651": (138,143,199),
    "GN-652": (200,194,115), "GN-654": (220,181,167), "GN-655": (230,152,186),
    "GN-656": (245,209,129), "GN-658": (217,172,196), "GN-659": ( 42, 99,174),
    "GN-663": (218,112, 60), "GN-664": (204, 55, 43), "GN-665": ( 95,167, 86),
    "GN-666": (195, 76,130), "GN-667": (221,117,114), "GN-668": ( 81,169, 94),
    "GN-669": (168,206,128), "GN-671": (174, 59, 91), "GN-672": (154, 78, 70),
    "GN-673": ( 27, 32,127), "GN-676": ( 61,139, 70), "GN-678": ( 50, 36,115),
    "GN-680": ( 63, 70, 74), "GN-681": (133,167,177), "GN-682": (111,145, 68),
    "GN-683": (251,232,201), "GN-684": (241,204,157), "GN-686": (206,206,206),
    "GN-687": (101,159, 75), "GN-688": ( 29, 66, 83), "GN-689": (141,182,221),
    "GN-691": (226,135,125), "GN-693": ( 92,113,129), "GN-697": ( 79,105, 80),
    "GN-700": (220,227,119), "GN-701": (249,225,203), "GN-702": (241,190,128),
    "GN-704": (235,181,177), "GN-706": (235,246,242), "GN-717": (233,211,181),
    "GN-719": (252,238,216), "GN-725": (225,132, 54), "GN-727": (180,205, 88),
    "GN-728": ( 59,135, 73), "GN-732": (254,247,176), "GN-734": (224,193,215),
    "GN-737": (154,204,188), "GN-740": ( 80,164, 85), "GN-742": (107,109,171),
    "GN-744": (213,210,231), "GN-802": (236,180, 93), "GN-819": (140,200,217),
    "GN-820": (100,185,217), "GN-822": (147,205,240), "GN-824": ( 29, 73,138),
    "GN-832": (136, 77,149), "GN-854": (226,152,157), "GN-873": (241,209,224),
}

# ─────────────────────────────────────────────────────────────────────────────
#  COLOR SCIENCE  (pure-Python, no extra deps)
# ─────────────────────────────────────────────────────────────────────────────

def rgb_to_lab(rgb: tuple) -> tuple:
    """Convert sRGB (0-255 ints) → CIE L*a*b* (D65)."""
    r, g, b = [x / 255.0 for x in rgb]
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    x /= 0.95047;  z /= 1.08883
    def f(t): return t ** (1/3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def delta_e(lab1: tuple, lab2: tuple) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(lab1, lab2)))


def rgb_array_to_lab(arr: np.ndarray) -> np.ndarray:
    """
    Vectorised RGB→Lab conversion.
    arr: float32 H×W×3 in [0,255]  →  float32 H×W×3 Lab
    Uses OpenCV for speed.
    """
    bgr = arr[..., ::-1].astype(np.float32)     # RGB → BGR
    bgr /= 255.0
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2Lab)  # OpenCV Lab: L[0,100], ab[-127,127]
    return lab


def lab_to_rgb_array(lab: np.ndarray) -> np.ndarray:
    """Inverse of rgb_array_to_lab.  Returns float32 in [0,255]."""
    bgr = cv2.cvtColor(lab.astype(np.float32), cv2.COLOR_Lab2BGR)
    return np.clip(bgr[..., ::-1] * 255.0, 0, 255).astype(np.float32)

# ─────────────────────────────────────────────────────────────────────────────
#  PALETTE LOADING
# ─────────────────────────────────────────────────────────────────────────────

def load_palette_from_csv(csv_path: Path) -> dict:
    """
    Load palette from CSV.
    Supports:
      guangna_palette_unduplicated.csv (Code, Hex Color, ..., Guangna Hex, ...)
      Simple: Code, R, G, B  or  Code, HexColor
    Returns { sequential_int: (R,G,B) }
    """
    palette = {}
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code_str = row.get("Code", "").strip()
            if not code_str.isdigit():
                continue
            code = int(code_str)
            hex_val = row.get("Guangna Hex", "").strip().lstrip("#")
            if len(hex_val) != 6:
                hex_val = row.get("Hex Color", "").strip().lstrip("#")
            if len(hex_val) != 6:
                continue
            try:
                r, g, b = int(hex_val[0:2], 16), int(hex_val[2:4], 16), int(hex_val[4:6], 16)
                palette[code] = (r, g, b)
            except ValueError:
                continue
    return palette


def build_palette_from_gn_set(gn_codes: list) -> dict:
    palette = {}
    for i, code in enumerate(gn_codes, start=1):
        if code in GUANGNA_COLORS:
            palette[i] = GUANGNA_COLORS[code]
        else:
            print(f"  ⚠  Unknown GN code: {code}")
    return palette


def default_palette_for_k(k: int) -> dict:
    """Return a sensible default palette of k Guangna colours."""
    CURATED = {
        11: ["GN-600","GN-610","GN-620","GN-686","GN-639","GN-643",
             "GN-605","GN-680","GN-611","GN-673","GN-654"],
        12: ["GN-600","GN-610","GN-620","GN-686","GN-639","GN-643",
             "GN-605","GN-680","GN-611","GN-673","GN-654","GN-618"],
        15: ["GN-600","GN-686","GN-610","GN-639","GN-654","GN-620",
             "GN-643","GN-618","GN-605","GN-667","GN-680","GN-611",
             "GN-673","GN-614","GN-648"],
        24: ["GN-600","GN-686","GN-610","GN-639","GN-654",
             "GN-684","GN-620","GN-638","GN-643","GN-618","GN-625",
             "GN-605","GN-667","GN-663","GN-680","GN-611",
             "GN-673","GN-617","GN-614","GN-648","GN-727","GN-634",
             "GN-601","GN-645"],
        36: ["GN-600","GN-706","GN-686","GN-610","GN-637",
             "GN-638","GN-645","GN-639","GN-654","GN-684",
             "GN-701","GN-683","GN-717","GN-620","GN-643",
             "GN-618","GN-625","GN-605","GN-667","GN-663",
             "GN-664","GN-680","GN-611",
             "GN-678","GN-673","GN-617","GN-634","GN-648","GN-727",
             "GN-601","GN-609","GN-614","GN-668","GN-651","GN-636","GN-693"],
    }
    if k in CURATED:
        return build_palette_from_gn_set(CURATED[k])

    # Greedy farthest-point selection in Lab space
    all_codes = list(GUANGNA_COLORS.keys())
    if k >= len(all_codes):
        return build_palette_from_gn_set(all_codes)
    all_labs = {c: rgb_to_lab(GUANGNA_COLORS[c]) for c in all_codes}
    selected = [all_codes[0]]
    while len(selected) < k:
        best_code, best_dist = None, -1.0
        for c in all_codes:
            if c in selected:
                continue
            min_d = min(delta_e(all_labs[c], all_labs[s]) for s in selected)
            if min_d > best_dist:
                best_dist, best_code = min_d, c
        selected.append(best_code)
    return build_palette_from_gn_set(selected)

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 1  Load & Resize
# ─────────────────────────────────────────────────────────────────────────────

def load_and_resize(image_path: Path, target_width: int) -> Image.Image:
    img   = Image.open(image_path).convert("RGB")
    W, H  = img.size
    scale = min(target_width / W, 1.0)
    nW, nH = int(W * scale), int(H * scale)
    print(f"  Original: {W}×{H}  →  Working: {nW}×{nH}")
    return img.resize((nW, nH), Image.LANCZOS)

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 2  Bilateral Filter
# ─────────────────────────────────────────────────────────────────────────────

def bilateral_smooth(img: Image.Image,
                     d: int, sigma_color: float, sigma_space: float) -> np.ndarray:
    """
    Apply cv2.bilateralFilter to smooth flat areas while preserving edges.
    Returns float32 H×W×3 in [0,255].
    """
    arr = np.array(img, dtype=np.uint8)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    # bilateralFilter works better on uint8
    smoothed = cv2.bilateralFilter(bgr, d, sigma_color, sigma_space)
    return cv2.cvtColor(smoothed, cv2.COLOR_BGR2RGB).astype(np.float32)

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEPS 3 & 4  KMeans in Lab Space
# ─────────────────────────────────────────────────────────────────────────────

def kmeans_segment_lab(rgb_arr: np.ndarray, k: int) -> tuple:
    """
    Run KMeans in Lab colour space for perceptually uniform clustering.
    rgb_arr: float32 H×W×3 [0,255]
    Returns:
      labels: H×W int32 in [0, k-1]
      centers_rgb: k×3 float32 cluster centres converted back to RGB
    """
    H, W   = rgb_arr.shape[:2]
    lab    = rgb_array_to_lab(rgb_arr)          # H×W×3 Lab
    pixels = lab.reshape(-1, 3)

    km = KMeans(n_clusters=k, n_init=KMEANS_NINIT,
                max_iter=KMEANS_ITER, random_state=42)
    km.fit(pixels)
    labels = km.labels_.reshape(H, W).astype(np.int32)

    # Convert cluster centres back to RGB for palette matching
    centres_lab = km.cluster_centers_.reshape(1, k, 3).astype(np.float32)
    centres_rgb = lab_to_rgb_array(centres_lab).reshape(k, 3)
    return labels, centres_rgb

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 5  Assign clusters → palette numbers
# ─────────────────────────────────────────────────────────────────────────────

def assign_clusters_to_palette(centers_rgb: np.ndarray, palette: dict) -> dict:
    """
    Greedy unique ΔE assignment: each cluster → nearest available palette entry.
    Returns { cluster_index (0-based): palette_number (1-based) }
    """
    pal_labs = {num: rgb_to_lab(rgb) for num, rgb in palette.items()}
    pairs = []
    for ci in range(len(centers_rgb)):
        cl = rgb_to_lab(tuple(int(x) for x in centers_rgb[ci]))
        for num, pl in pal_labs.items():
            pairs.append((delta_e(cl, pl), ci, num))
    pairs.sort()

    cluster_to_label: dict = {}
    used_pal: set = set()
    for de, ci, num in pairs:
        if ci in cluster_to_label or num in used_pal:
            continue
        cluster_to_label[ci] = num
        used_pal.add(num)
        if len(cluster_to_label) == len(centers_rgb):
            break

    # Fallback for any unassigned clusters (shouldn't occur)
    all_nums = set(palette.keys())
    for ci in range(len(centers_rgb)):
        if ci not in cluster_to_label:
            remaining = all_nums - used_pal
            if remaining:
                best = min(remaining)
                cluster_to_label[ci] = best
                used_pal.add(best)
    return cluster_to_label

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 6  Facet Cleanup: Merge Small Regions
# ─────────────────────────────────────────────────────────────────────────────

def smooth_label_map(label_img: np.ndarray, kernel: int) -> np.ndarray:
    """
    Median filter on label map using scipy to avoid uint8 value clamping.
    kernel must be odd.
    """
    return median_filter(label_img, size=kernel, mode="nearest")


def merge_small_regions(label_img: np.ndarray, k: int,
                         min_area: int, max_iters: int = 20) -> np.ndarray:
    """
    Iteratively merge connected regions smaller than min_area px²
    into their most-contacted neighbour label.

    Improvement over v1: uses scipy connected-component labelling which
    handles multi-value label maps more robustly, and iterates until
    stable (no early exit with leftover micro-regions).
    """
    merged = label_img.copy()
    struct = np.ones((3, 3), dtype=np.uint8)            # 8-connectivity structure
    dil_k  = cv2.getStructuringElement(
                cv2.MORPH_ELLIPSE, (MERGE_KERNEL, MERGE_KERNEL))

    for iteration in range(max_iters):
        changed = False
        for lbl in range(1, k + 1):
            mask = (merged == lbl).astype(np.uint8)
            cc_map, n_cc = nd_label(mask, structure=struct)
            for cc in range(1, n_cc + 1):
                comp_mask = (cc_map == cc).astype(np.uint8)
                area = int(comp_mask.sum())
                if area >= min_area:
                    continue
                # Dilate the component to find its border neighbours
                dilated     = cv2.dilate(comp_mask * 255, dil_k)
                border_mask = (dilated > 0) & (comp_mask == 0)
                neighbours  = merged[border_mask]
                neighbours  = neighbours[neighbours != lbl]
                if len(neighbours) == 0:
                    continue
                counts = np.bincount(neighbours.astype(np.int64), minlength=k + 1)
                best   = int(np.argmax(counts[1:])) + 1
                if best == lbl:
                    continue
                merged[comp_mask > 0] = best
                changed = True

        if not changed:
            print(f"  Merge converged after {iteration + 1} iteration(s)")
            break
    else:
        print(f"  Merge hit max iterations ({max_iters}); some micro-regions may remain")

    return merged

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 7  Outline Generation
# ─────────────────────────────────────────────────────────────────────────────

def get_font(font_size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        # macOS
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        # Windows
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/Arial.ttf",
    ]
    for fp in candidates:
        try:
            return ImageFont.truetype(fp, font_size)
        except Exception:
            continue
    print("  ⚠  No TrueType font found; falling back to PIL default (small).")
    return ImageFont.load_default()


def generate_bw_outline(label_img: np.ndarray, k: int,
                         scale: int, font_size: int,
                         min_area: int) -> Image.Image:
    """
    Generate the final white-background BW numbered outline.
    label_img : H×W int32, values 1..k
    scale     : upscale factor (OUTPUT_SCALE)
    """
    H, W   = label_img.shape
    OW, OH = W * scale, H * scale

    # Upscale with nearest-neighbour to keep sharp region boundaries
    up = cv2.resize(label_img.astype(np.uint8), (OW, OH),
                    interpolation=cv2.INTER_NEAREST)

    canvas = np.full((OH, OW, 3), 255, dtype=np.uint8)

    close_k = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (MORPH_CLOSE_K, MORPH_CLOSE_K))

    for lbl in range(1, k + 1):
        mask    = (up == lbl).astype(np.uint8) * 255
        mask_cl = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, close_k)
        contours, _ = cv2.findContours(mask_cl, cv2.RETR_EXTERNAL,
                                        cv2.CHAIN_APPROX_TC89_KCOS)
        smooth_c = []
        for cnt in contours:
            arc = cv2.arcLength(cnt, True)
            if arc == 0:
                continue
            approx = cv2.approxPolyDP(cnt, CONTOUR_EPS * arc, True)
            smooth_c.append(approx)
        cv2.drawContours(canvas, smooth_c, -1, (0, 0, 0),
                          thickness=CONTOUR_THICK)

    # ── Number placement with overlap guard ──────────────────────────────────
    pil_out   = Image.fromarray(canvas)
    draw      = ImageDraw.Draw(pil_out)
    font      = get_font(font_size)
    min_area_out = min_area * scale * scale
    placed_boxes: list = []        # list of (x0,y0,x1,y1) already placed
    placed = 0

    for lbl in range(1, k + 1):
        mask    = (up == lbl).astype(np.uint8) * 255
        mask_cl = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, close_k)
        n_cc, cc_map, cc_stats, _ = cv2.connectedComponentsWithStats(
            mask_cl, connectivity=8)

        for cc in range(1, n_cc):
            if cc_stats[cc, cv2.CC_STAT_AREA] < min_area_out:
                continue
            cc_mask = (cc_map == cc).astype(np.uint8) * 255
            dist    = cv2.distanceTransform(cc_mask, cv2.DIST_L2, 5)
            _, md, _, ml = cv2.minMaxLoc(dist)
            if md < font_size * MIN_DIST_FACTOR:
                continue

            cx, cy  = ml
            txt     = str(lbl)
            bb      = draw.textbbox((0, 0), txt, font=font)
            tw, th  = bb[2] - bb[0], bb[3] - bb[1]
            tx, ty  = cx - tw // 2, cy - th // 2

            # Overlap guard — skip if this bbox collides with an already-placed one
            new_box = (tx, ty, tx + tw, ty + th)
            overlap = any(
                not (new_box[2] < pb[0] or new_box[0] > pb[2] or
                     new_box[3] < pb[1] or new_box[1] > pb[3])
                for pb in placed_boxes
            )
            if overlap:
                continue

            placed_boxes.append(new_box)

            # White halo then black text
            halo = max(2, font_size // 10)
            step = max(1, halo // 2)
            for dx in range(-halo, halo + 1, step):
                for dy in range(-halo, halo + 1, step):
                    draw.text((tx + dx, ty + dy), txt,
                               fill=(255, 255, 255), font=font)
            draw.text((tx, ty), txt, fill=(0, 0, 0), font=font)
            placed += 1

    print(f"  Labels placed: {placed}")
    return pil_out

# ─────────────────────────────────────────────────────────────────────────────
#  PIPELINE — STEP 8  Colour Palette Strip
# ─────────────────────────────────────────────────────────────────────────────

def generate_palette_strip(palette: dict, swatch_size: int = PALETTE_SWATCH,
                            font_size: int = 14) -> Image.Image:
    """
    Render a horizontal palette strip with colour swatches + number labels.
    Returns a PIL Image ready to concatenate below the outline.
    """
    k        = len(palette)
    pad      = 8
    strip_h  = swatch_size + 2 * pad + font_size + 4
    strip_w  = k * (swatch_size + pad) + pad

    strip = Image.new("RGB", (strip_w, strip_h), (245, 245, 245))
    draw  = ImageDraw.Draw(strip)
    try:
        fnt = ImageFont.truetype(
            next((fp for fp in [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "C:/Windows/Fonts/arialbd.ttf",
            ] if Path(fp).exists()), ""), font_size)
    except Exception:
        fnt = ImageFont.load_default()

    for i, (num, rgb) in enumerate(sorted(palette.items())):
        x0 = pad + i * (swatch_size + pad)
        y0 = pad
        # Colour swatch with thin border
        draw.rectangle([x0, y0, x0 + swatch_size, y0 + swatch_size],
                        fill=rgb, outline=(0, 0, 0), width=1)
        # Number below swatch
        txt = str(num)
        bb  = draw.textbbox((0, 0), txt, font=fnt)
        tw  = bb[2] - bb[0]
        tx  = x0 + (swatch_size - tw) // 2
        ty  = y0 + swatch_size + 3
        draw.text((tx, ty), txt, fill=(30, 30, 30), font=fnt)

    return strip


def generate_color_preview(label_img: np.ndarray, palette: dict) -> Image.Image:
    """Colour-filled preview of the segmented image."""
    H, W = label_img.shape
    out  = np.zeros((H, W, 3), dtype=np.uint8)
    for lbl, rgb in palette.items():
        out[label_img == lbl] = rgb
    return Image.fromarray(out)

# ─────────────────────────────────────────────────────────────────────────────
#  MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def run(args):
    image_path  = Path(args.image)
    output_path = Path(args.output)
    min_area    = args.min_area

    print("=" * 58)
    print("  PBN Generator v2")
    print(f"  Image   : {image_path.name}")
    print(f"  Output  : {output_path.name}")
    print(f"  Min area: {min_area} px²")
    print("=" * 58)

    # ── Palette ───────────────────────────────────────────────────────────────
    free_mode = False      # True → no Guangna matching, just sequential numbers
    if args.palette:
        print(f"\n[1] Loading palette from {args.palette} …")
        palette = load_palette_from_csv(Path(args.palette))
        k       = len(palette)
        print(f"    {k} colors loaded")
    elif args.colors:
        k = args.colors
        print(f"\n[1] Using {k}-color Guangna palette …")
        palette = default_palette_for_k(k)
        if not palette:
            # Fallback: free KMeans, number sequentially
            print("    ⚠  Palette not found; running in free-KMeans mode.")
            palette = None
            free_mode = True
    else:
        k = K_DEFAULT
        print(f"\n[1] Using default {k}-color Guangna palette …")
        palette = default_palette_for_k(k)

    if palette and not free_mode:
        k = len(palette)   # palette CSV might differ from --colors
        print(f"    Palette: { {n: '#%02X%02X%02X' % rgb for n,rgb in sorted(palette.items())} }")

    # ── Load & resize ─────────────────────────────────────────────────────────
    print(f"\n[2] Loading & resizing image …")
    img  = load_and_resize(image_path, args.working_width)
    W, H = img.size

    # ── Bilateral filter ──────────────────────────────────────────────────────
    print(f"\n[3] Bilateral filter (d={args.bilateral_d}, "
          f"σc={args.bilateral_sc}, σs={args.bilateral_ss}) …")
    smooth_rgb = bilateral_smooth(img, args.bilateral_d,
                                  args.bilateral_sc, args.bilateral_ss)

    # ── KMeans in Lab space ───────────────────────────────────────────────────
    print(f"\n[4] KMeans (k={k}, n_init={KMEANS_NINIT}) in Lab space …")
    raw_labels, centres_rgb = kmeans_segment_lab(smooth_rgb, k)

    # ── Assign clusters → palette / sequential numbers ────────────────────────
    if free_mode or palette is None:
        print("\n[5] Sequential label assignment (free-KMeans mode) …")
        cluster_to_label = {ci: ci + 1 for ci in range(k)}
        palette = {ci + 1: tuple(int(x) for x in centres_rgb[ci])
                   for ci in range(k)}
    else:
        print("\n[5] Assigning clusters to palette colours (greedy ΔE) …")
        cluster_to_label = assign_clusters_to_palette(centres_rgb, palette)
        print(f"    Assignment: {cluster_to_label}")

    label_img = np.vectorize(cluster_to_label.get)(raw_labels).astype(np.int32)

    # ── Smooth label map ──────────────────────────────────────────────────────
    print(f"\n[6] Smoothing label map (kernel={SMOOTH_KERNEL}) …")
    label_img = smooth_label_map(label_img, SMOOTH_KERNEL)

    # ── Merge small regions ───────────────────────────────────────────────────
    print(f"\n[7] Merging regions < {min_area} px² …")
    label_img = merge_small_regions(label_img, k, min_area)

    # Final tidy-up pass with a small median filter
    label_img = smooth_label_map(label_img, 3)

    dist_after = {i: int(np.sum(label_img == i)) for i in range(1, k + 1)}
    print(f"    px distribution: { {i:v for i,v in dist_after.items() if v>0} }")

    # ── Generate BW outline ───────────────────────────────────────────────────
    scale     = args.output_scale
    font_size = scale * FONT_SCALE
    OW, OH    = W * scale, H * scale
    print(f"\n[8] Generating BW outline ({OW}×{OH}) …")
    bw_outline = generate_bw_outline(label_img, k, scale, font_size, min_area)

    # ── Palette strip ─────────────────────────────────────────────────────────
    print("\n[9] Generating palette strip …")
    strip = generate_palette_strip(palette, swatch_size=PALETTE_SWATCH,
                                   font_size=max(12, font_size // 2))

    # Resize strip to match outline width
    if strip.width != bw_outline.width:
        strip = strip.resize((bw_outline.width,
                               int(strip.height * bw_outline.width / strip.width)),
                              Image.LANCZOS)

    # Concatenate outline + palette strip
    combined_h = bw_outline.height + strip.height
    combined   = Image.new("RGB", (bw_outline.width, combined_h), (255, 255, 255))
    combined.paste(bw_outline, (0, 0))
    combined.paste(strip, (0, bw_outline.height))

    combined.save(output_path, "PNG", optimize=True)
    print(f"    Saved: {output_path}")

    # ── Optional colour preview ───────────────────────────────────────────────
    if args.preview:
        preview_path = output_path.with_name(output_path.stem + "_color_preview.png")
        preview      = generate_color_preview(label_img, palette)
        preview.save(preview_path, "PNG")
        print(f"    Preview: {preview_path}")

    print(f"\n✓ Done — {output_path}")

# ─────────────────────────────────────────────────────────────────────────────
#  CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Convert a photo to a Paint-by-Number BW outline + palette strip.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 24-colour free-flow (no Guangna matching):
  python3 pbn_generator.py --image photo.jpg --colors 24 --output outline.png

  # Guangna palette from automator CSV:
  python3 pbn_generator.py --image photo.jpg --palette palette.csv --output outline.png

  # Larger min-area (fewer small regions) + colour preview:
  python3 pbn_generator.py --image photo.jpg --colors 15 --min-area 4000 --preview --output outline.png

  # Stronger bilateral smooth (good for noisy/grainy photos):
  python3 pbn_generator.py --image photo.jpg --bilateral-d 12 --bilateral-sc 100 --bilateral-ss 100 --output outline.png
        """
    )
    parser.add_argument("--image",        required=True,  help="Source photo path")
    parser.add_argument("--output",       required=True,  help="Output PNG path")
    parser.add_argument("--palette",      default=None,   help="CSV palette (guangna_palette_unduplicated.csv)")
    parser.add_argument("--colors",       type=int, default=K_DEFAULT,
                        help=f"Number of colors when not using --palette (default: {K_DEFAULT})")
    parser.add_argument("--min-area",     type=int, default=MIN_AREA, dest="min_area",
                        help=f"Minimum facet area px² at working res (default: {MIN_AREA})")
    parser.add_argument("--working-width",type=int, default=WORKING_WIDTH, dest="working_width",
                        help=f"Resize image to this width before processing (default: {WORKING_WIDTH})")
    parser.add_argument("--output-scale", type=int, default=OUTPUT_SCALE, dest="output_scale",
                        help=f"Upscale factor for final output (default: {OUTPUT_SCALE})")
    parser.add_argument("--bilateral-d",  type=int,   default=BILATERAL_D,  dest="bilateral_d",
                        help=f"Bilateral filter neighbourhood diameter (default: {BILATERAL_D})")
    parser.add_argument("--bilateral-sc", type=float, default=BILATERAL_SC, dest="bilateral_sc",
                        help=f"Bilateral sigma_color (default: {BILATERAL_SC})")
    parser.add_argument("--bilateral-ss", type=float, default=BILATERAL_SS, dest="bilateral_ss",
                        help=f"Bilateral sigma_space (default: {BILATERAL_SS})")
    parser.add_argument("--preview",      action="store_true",
                        help="Also save a colour-filled preview image")
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
