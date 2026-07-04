// ─────────────────────────────────────────────────────────────────
// Free coloring pages — add a new page by adding one object below.
// Each page gets its own URL automatically: /free-coloring-pages/<id>
//
// To add a new page:
//   1. Drop the PDF into /public/coloring-pages/  (e.g. cat.pdf)
//   2. (Optional but recommended) drop two preview images into
//      /public/coloring-pages/thumbs/ :
//        - an "example" image: the colored/finished reference picture
//        - an "outline" image: a preview of the actual blank page
//      Crop these yourself, or ask Claude to crop them from a
//      customer-guide PDF the same way the two placeholders below
//      were made (page 1's photo, page 2's outline, both cropped
//      clean of tables/legend/logo — rotated back upright if needed).
//   3. Add an entry to the array below.
//
// Titles/descriptions here are shown as-is (not translated per-locale) —
// keeping this simple on purpose so adding a page never requires touching
// messages/*.json. If you'd like titles translated later, this is the
// place to extend (e.g. swap `title: string` for `title: Record<string,string>`).
// ─────────────────────────────────────────────────────────────────

/**
 * Fixed high-level buckets for category browsing/filtering.
 * Kept intentionally small and broad — add a new one only if a page
 * genuinely doesn't fit any existing bucket, not for every new subject.
 */
export const CATEGORIES = [
  { id: "animals", label: "Animals" },
  { id: "nature", label: "Nature" },
  { id: "people-characters", label: "People & Characters" },
  { id: "objects-other", label: "Objects & Other" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// ─────────────────────────────────────────────────────────────────
// Guangna GN-8101 marker set hierarchy.
//
// Each bigger set is a strict superset of every smaller set's colors
// (e.g. the 72-set = the 60-set's 60 markers + 12 additional ones).
// So someone who owns a bigger set automatically owns every color in
// all smaller sets too.
//
// 360 and 408 are the same 360/408-marker collection under two
// different catalog numbers — same colors, same rank. 366 is a
// separate, larger collection that is a superset of everything else,
// despite its number being smaller than 408.
//
// To tag a coloring page: add ONE tag for the *smallest* set that
// contains all the colors the page needs, e.g. tags: [..., "Guangna 72"].
// The cascading filter logic below automatically shows that page to
// anyone who owns 72 or any bigger set — you don't need to also tag
// 168, 240, 366, etc.
// ─────────────────────────────────────────────────────────────────

export const MARKER_SETS = [
  { label: "12", value: "GN-8101-12" },
  { label: "24", value: "GN-8101-24" },
  { label: "36", value: "GN-8101-36" },
  { label: "48", value: "GN-8101-48" },
  { label: "60", value: "GN-8101-60" },
  { label: "72", value: "GN-8101-72" },
  { label: "100", value: "GN-8101-100" },
  { label: "120", value: "GN-8101-120" },
  { label: "168", value: "GN-8101-168" },
  { label: "240", value: "GN-8101-240" },
  { label: "288", value: "GN-8101-288" },
  { label: "360", value: "GN-8101-360" },
  { label: "408", value: "GN-8101-408" },
  { label: "366", value: "GN-8101-366" },
] as const;

export type MarkerSetValue = (typeof MARKER_SETS)[number]["value"];

/**
 * Rank of each set in the "contains all smaller sets' colors" chain.
 * 360 and 408 share a rank since they're the same colors. 366 is the
 * top of the chain.
 */
const MARKER_SET_RANK: Record<string, number> = {
  "GN-8101-12": 1,
  "GN-8101-24": 2,
  "GN-8101-36": 3,
  "GN-8101-48": 4,
  "GN-8101-60": 5,
  "GN-8101-72": 6,
  "GN-8101-100": 7,
  "GN-8101-120": 8,
  "GN-8101-168": 9,
  "GN-8101-240": 10,
  "GN-8101-288": 11,
  "GN-8101-360": 12,
  "GN-8101-408": 12,
  "GN-8101-366": 13,
};

/**
 * Reads a tag like "Guangna 72" or "GN-8101-72" and returns its rank
 * in the size hierarchy, or null if the tag isn't a marker-set tag.
 */
function tagToMarkerRank(tag: string): number | null {
  const match = tag.match(/(\d+)\s*$/);
  if (!match) return null;
  const key = `GN-8101-${match[1]}`;
  return MARKER_SET_RANK[key] ?? null;
}

/**
 * True if someone who owns `ownedSetValue` has every color this page
 * needs. A page with no marker-set tags at all is treated as
 * compatible with every set. If a page has multiple marker-set tags
 * (legacy data), the smallest one is treated as the real requirement.
 */
export function pageMatchesMarkerSet(page: ColoringPage, ownedSetValue: MarkerSetValue): boolean {
  const ownedRank = MARKER_SET_RANK[ownedSetValue];
  const ranks = (page.tags || [])
    .map(tagToMarkerRank)
    .filter((r): r is number => r !== null);

  // A page with no marker-set tag hasn't been verified against any
  // specific set size yet — it should NOT be assumed to work with every
  // set (that would be wrong for pages that actually need lots of
  // colors but just haven't been tagged). Exclude it whenever a
  // specific set is selected, until it's properly tagged.
  if (ranks.length === 0) return false;

  const requiredRank = Math.min(...ranks);
  return ownedRank >= requiredRank;
}

export type ColoringPage = {
  /** Stable unique id — also used as the URL slug (/free-coloring-pages/<id>) and the React key, so keep it URL-safe (lowercase, hyphens). */
  id: string;
  /** Shown as the card/page title. */
  title: string;
  /** Optional short description shown on the gallery card and the detail page. */
  description?: string;
  /**
   * High-level bucket(s) for category browsing (see CATEGORIES above).
   * A page can belong to more than one — e.g. a boy playing with a
   * dinosaur can sit under both "people-characters" and "animals".
   */
  categories?: CategoryId[];
  /**
   * Freeform tags for keyword search (title/description/tag matching).
   * Not restricted to the CATEGORIES list — can include specific
   * details like Guangna set numbers, colors, moods, etc.
   */
  tags?: string[];
  /**
   * Leave undefined (or 0) for a free page. Set a number (whole EUR,
   * e.g. 2) to mark a page as paid — this isn't wired to checkout yet,
   * it's just here so the data model doesn't need to change again when
   * you add Lemon Squeezy/Payhip to this page later. The detail page
   * already branches on this (see the [slug]/page.tsx download section).
   */
  price?: number;
  /** Filename only — the file must exist at /public/coloring-pages/<fileName> */
  fileName: string;
  /** Optional colored/finished reference image — filename only, must exist at /public/coloring-pages/thumbs/<exampleImage> */
  exampleImage?: string;
  /** Optional preview of the actual blank coloring page — filename only, must exist at /public/coloring-pages/thumbs/<outlineImage> */
  outlineImage?: string;
};

export const coloringPages: ColoringPage[] = [
  {
    id: "girl-teddybear",
    title: "Girl with Teddy Bear",
    description: "A sweet girl hugging her favorite teddy bear.",
    categories: ["people-characters"],
    tags: ["girls", "animals", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "girl-teddybear.pdf",
    exampleImage: "girl-teddybear-example.jpg",
    outlineImage: "girl-teddybear-outline.jpg",
  },
  {
    id: "hippo",
    title: "Baby Hippo",
    description: "A cuddly baby hippo holding a cookie.",
    categories: ["animals"],
    tags: ["animals","Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "hippo.pdf",
    exampleImage: "hippo-example.jpg",
    outlineImage: "hippo-outline.jpg",
  },
  {
    id: "boy_backpack",
    title: "Boy with Backpack",
    description: "School boy with Backpack.",
    categories: ["people-characters"],
    tags: ["boy", "backpack", "school", "Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "boy_backpack.pdf",
    exampleImage: "boybackpack-example.jpg",
    outlineImage: "boybackpack-outline.jpg",
  },
  {
    id: "boy",
    title: "Cheerful boy",
    description: "A cheerful boy in a yellow striped  t-shirt.",
    categories: ["people-characters"],
    tags: ["boy", "yellow t-shirt", "happy", "cheerful", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "boy.pdf",
    exampleImage: "boy-example.jpg",
    outlineImage: "boy-outline.jpg",
  },
  {
    id: "boy-with-dino",
    title: "Boy with Green Toy Dinosaur",
    description: "A happy boy playing with his green toy dinosaur.",
    categories: ["people-characters"],
    tags: ["boy", "green dinosaur", "toy", "happy", "Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "boydino.pdf",
    exampleImage: "boydino-example.jpg",
    outlineImage: "boydino-outline.jpg",
  },
  {
    id: "cat_orange",
    title: "Cute orange cat",
    description: "Cute orange cat playing with wool.",
    categories: ["animals"],
    tags: ["animal", "cat", "orange cat", "playing", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "cat_orange.pdf",
    exampleImage: "catorange-example.jpg",
    outlineImage: "catorange-outline.jpg",
  },
  {
    id: "dog",
    title: "Cute brown dog",
    description: "Cute playful brown dog.",
    categories: ["animals"],
    tags: ["animal", "dog", "brown dog", "playing", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "dog.pdf",
    exampleImage: "dog-example.jpg",
    outlineImage: "dog-outline.jpg",
  },
  {
    id: "friends_jump",
    title: "Two friends jumping",
    description: "Two happy friends jumping together.",
    categories: ["people-characters"],
    tags: ["friends", "two people", "children", "joyful", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "Friends_jump.pdf",
    exampleImage: "friendsjump-example.jpg",
    outlineImage: "friendsjump-outline.jpg",
  },
  {
    id: "girl_jump",
    title: "Joyful girl",
    description: "Happy girl, jumping for joy.",
    categories: ["people-characters"],
    tags: ["girl", "happy", "jumping", "joyful", "Guangna 60", "Guangna 240", "Guangna 366"],
    fileName: "girl_jump.pdf",
    exampleImage: "girl_jump-example.jpg",
    outlineImage: "girl_jump-outline.jpg",
  },
  {
    id: "flower-red-2",
    title: "Flower red",
    description: "A beautiful bouquet with red flowers.",
    categories: ["nature"],
    tags: ["flower", "red", "bouquet", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "flower-red-2_.pdf",
    exampleImage: "flower-red-2-example.jpg",
    outlineImage: "flower-red-2-outline.jpg",
  },
  {
    id: "flower-orange-1",
    title: "Flower orange",
    description: "A beautiful orange flower.",
    categories: ["nature"],
    tags: ["flower", "orange", "single", "tulip", "Guangna 48", "Guangna 168 ", "Guangna 366"],
    fileName: "flower-orange-1.pdf",
    exampleImage: "flower-orange-1-example.jpg",
    outlineImage: "flower-orange-1-outline.jpg",
  },
  {
    id: "flower-red-1",
    title: "Flower red",
    description: "A beautiful red flowers.",
    categories: ["nature"],
    tags: ["flower", "red", "single", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "flower-red-1.pdf",
    exampleImage: "flower-red-1-example.jpg",
    outlineImage: "flower-red-1-outline.jpg",
  },
  {
    id: "house",
    title: "House in Field",
    description: "House in green field.",
    categories: ["objects-other"],
    tags: ["house", "farm", "green field", "clouds", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "House.pdf",
    exampleImage: "house-example.jpg",
    outlineImage: "house-outline.jpg",
  },
];
