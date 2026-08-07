// ─────────────────────────────────────────────────────────────────
// Free coloring pages — add a new page by adding one object below.
// Each page gets its own URL automatically: /free-coloring-pages/<id>
//
// ── PUBLIC ASSETS (2026-07-17): PDFs and thumbnail images now live in
// the same public GCS bucket as the examples page (crea-bea-public-
// assets), not /public -- see next.config.ts's images.remotePatterns
// and examples/page.tsx for the same pattern applied there. Moved out
// of /public to avoid growing git history with large binary files.
//
// To add a new page:
//   1. Upload the PDF to gs://crea-bea-public-assets/coloring-pages/
//      (e.g. cat.pdf) -- e.g.
//        gcloud storage cp cat.pdf gs://crea-bea-public-assets/coloring-pages/
//   2. (Optional but recommended) upload two preview images to
//      gs://crea-bea-public-assets/coloring-pages/thumbs/ :
//        - an "example" image: the colored/finished reference picture
//        - an "outline" image: a preview of the actual blank page
//      Crop these yourself, or ask Claude to crop them from a
//      customer-guide PDF the same way the two placeholders below
//      were made (page 1's photo, page 2's outline, both cropped
//      clean of tables/legend/logo — rotated back upright if needed).
//   3. Add an entry to the array below -- fileName/exampleImage/
//      outlineImage are still just FILENAMES (not full URLs); the
//      helper functions below turn them into full GCS URLs wherever
//      they're actually used (ColoringPagesBrowser, the detail page).
//
// Titles/descriptions here are shown as-is (not translated per-locale) —
// keeping this simple on purpose so adding a page never requires touching
// messages/*.json. If you'd like titles translated later, this is the
// place to extend (e.g. swap `title: string` for `title: Record<string,string>`).
// ─────────────────────────────────────────────────────────────────

const GCS_PUBLIC_BASE = "https://storage.googleapis.com/crea-bea-public-assets";

/** Full URL for a coloring page's downloadable PDF. */
export function coloringPageFileUrl(fileName: string): string {
  return `${GCS_PUBLIC_BASE}/coloring-pages/${fileName}`;
}

/** Full URL for a coloring page's example/outline thumbnail. */
export function coloringPageThumbUrl(imageName: string): string {
  return `${GCS_PUBLIC_BASE}/coloring-pages/thumbs/${imageName}`;
}

/**
 * Fixed high-level buckets for category browsing/filtering.
 * Kept intentionally small and broad — add a new one only if a page
 * genuinely doesn't fit any existing bucket, not for every new subject.
 */
export const CATEGORIES = [
  { id: "animals", label: "Animals" },
  { id: "nature", label: "Nature" },
  { id: "people", label: "People & Characters" },
  { id: "object", label: "Objects & Other" },
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
  /**
   * Which book format(s) this outline is suitable for. Leave undefined
   * for "works for both" (the default, safe for existing entries) —
   * only set this when an image is specifically simple (A5-only) or
   * a compound/collection design (A4-only). Your own judgment call.
   */
  suitableFormats?: ("A5" | "A4")[];/** Stable unique id — also used as the URL slug (/free-coloring-pages/<id>) and the React key, so keep it URL-safe (lowercase, hyphens). */
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
  /** Filename only — resolve with coloringPageFileUrl() to get the full GCS URL. Must exist at gs://crea-bea-public-assets/coloring-pages/<fileName> */
  fileName: string;
  /** Optional colored/finished reference image — filename only, resolve with coloringPageThumbUrl(). Must exist at gs://crea-bea-public-assets/coloring-pages/thumbs/<exampleImage> */
  exampleImage?: string;
  /** Optional preview of the actual blank coloring page — filename only, resolve with coloringPageThumbUrl(). Must exist at gs://crea-bea-public-assets/coloring-pages/thumbs/<outlineImage> */
  outlineImage?: string;
};

export const coloringPages: ColoringPage[] = [
  {
    id: "girl-teddybear",
    title: "Girl with Teddy Bear",
    description: "A sweet girl hugging her favorite teddy bear.",
    categories: ["people"],
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
    categories: ["people"],
    tags: ["boy", "backpack", "school", "Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "boy_backpack.pdf",
    exampleImage: "boybackpack-example.jpg",
    outlineImage: "boybackpack-outline.jpg",
  },
  {
    id: "boy",
    title: "Cheerful boy",
    description: "A cheerful boy in a yellow striped  t-shirt.",
    categories: ["people"],
    tags: ["boy", "yellow t-shirt", "happy", "cheerful", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "boy.pdf",
    exampleImage: "boy-example.jpg",
    outlineImage: "boy-outline.jpg",
  },
  {
    id: "boy-with-dino",
    title: "Boy with Green Toy Dinosaur",
    description: "A happy boy playing with his green toy dinosaur.",
    categories: ["people"],
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
    categories: ["people"],
    tags: ["friends", "two people", "children", "joyful", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "Friends_jump.pdf",
    exampleImage: "friendsjump-example.jpg",
    outlineImage: "friendsjump-outline.jpg",
  },
  {
    id: "girl_jump",
    title: "Joyful girl",
    description: "Happy girl, jumping for joy.",
    categories: ["people"],
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
    id: "plane",
    title: "Toy plane",
    description: "Green toy plane",
    categories: ["object"],
    tags: ["green", "toy", "plane", "propellor", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "plane.pdf",
    exampleImage: "plane-example.jpg",
    outlineImage: "plane-outline.jpg",
  },
  {
    id: "tow-truck",
    title: "Toy tow-truck",
    description: "Plastic toy tow-truck in bright colors",
    categories: ["object"],
    tags: ["toy", "tow truck", "truck", "plastic toy", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "tow-truck.pdf",
    exampleImage: "tow-truck-example.jpg",
    outlineImage: "tow-truck-outline.jpg",
  },
  {
    id: "two-dogs",
    title: "Two dogs",
    description: "Two friendly dogs ",
    categories: ["animals"],
    tags: ["dogs", "terrier", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "two-dogs.pdf",
    exampleImage: "two-dogs-example.jpg",
    outlineImage: "two-dogs-outline.jpg",
  },
  {
    id: "big_boy-little_girl",
    title: "Brother and little sister",
    description: "Brother giving toy to his little sister",
    categories: ["people" ],
    tags: ["big boy", "little girl", "brother", "sister", "blue tshirt", "red dress", "toy", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "big_boy-little_girl.pdf",
    exampleImage: "big-boy-little-girl-example.jpg",
    outlineImage: "big-boy-little-girl-outline.jpg",
  },
  {
    id: "boy-school-3",
    title: "School boy",
    description: "Schoolboy sitting on pencil",
    categories: ["people"],
    tags: ["school boy", "yello pencil", "flying", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "boy-school-3.pdf",
    exampleImage: "boy-school-3-example.jpg",
    outlineImage: "boy-school-3-outline.jpg",
  },
  {
    id: "boy-girl-school-2",
    title: "Schoolboy and girl sitting on pencil",
    description: "Happy school biy and girl sitting on pencil, holding books",
    categories: ["people"],
    tags: ["school", "boy", "girl", "book", "pencil", "happy", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "boy-girl-school-2.pdf",
    exampleImage: "boy-girl-school-2-example.jpg",
    outlineImage: "boy-girl-school-2-outline.jpg",
  },
  {
    id: "kids-playing",
    title: "Playing children",
    description: "Four kids playing",
    categories: ["people"],
    tags: ["Four kids", "children", "playing", "toys", "blocks", "sitting", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "kids-playing.pdf",
    exampleImage: "kids-playing-example.jpg",
    outlineImage: "kids-playing-outline.jpg",
  },
  {
    id: "big_girl-little_boy",
    title: "Big sister with little brother",
    description: "Sister reading book to little brother",
    categories: ["people"],
    tags: ["big", "sister", "reading", "book", "little brother", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "big_girl-little_boy.pdf",
    exampleImage: "big-girl-little-boy-example.jpg",
    outlineImage: "big-girl-little-boy-outline.jpg",
  },
  {
    id: "dog-orange",
    title: "Cute dog",
    description: "cute smiling orange retriever",
    categories: ["animals"],
    tags: ["dog", "orange", "retriever", "labrador", "smiling", "cute", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "dog-orange.pdf",
    exampleImage: "dog-orange-example.jpg",
    outlineImage: "dog-orange-outline.jpg",
  },
  {
    id: "dog-white-spots",
    title: "Playing dog",
    description: "Playful white dog with spots",
    categories: ["animals"],
    tags: ["playful", "dog", "white", "spots", "black ears", "Guangna 48", "Guangna 120", "Guangna 366"],
    fileName: "dog-white-spots.pdf",
    exampleImage: "dog-white-spots-example.jpg",
    outlineImage: "dog-white-spots-outline.jpg",
  },
  {
    id: "kids-toy-dino",
    title: "kids-toy-dino",
    description: "Three kids playing with toy dino's",
    categories: ["people"],
    tags: ["three", "kids", "children", "playing", "toys", "dinosaurs", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "kids-toy-dino.pdf",
    exampleImage: "kids-toy-dino-example.jpg",
    outlineImage: "kids-toy-dino-outline.jpg",
  },
  {
    id: "unicorn",
    title: "Unicorn",
    description: "Colorful unicorn",
    categories: ["animals"],
    tags: ["cute", "unicorn", "colorful", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "unicorn.pdf",
    exampleImage: "unicorn-example.jpg",
    outlineImage: "unicorn-outline.jpg",
  },
  {
    id: "lion",
    title: "Lion",
    description: "Friendly lion",
    categories: ["animals"],
    tags: ["lion", "safari", "wild", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "lion.pdf",
    exampleImage: "lion-example.jpg",
    outlineImage: "lion-outline.jpg",
  },
  {
    id: "zoo",
    title: "Zoo",
    description: "Zoo animals",
    categories: ["animals"],
    tags: ["zoo", "lion", "giraffe", "rhino", "elephant", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "zoo.pdf",
    exampleImage: "zoo-example.jpg",
    outlineImage: "zoo-outline.jpg",
  },
  {
    id: "butterfly-green-pink",
    title: "Colorful green and pink butterfly",
    description: "Butterfly with green and pink wings",
    categories: ["animals"],
    tags: ["butterfly", "green", "pink", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "butterfly-green-pink.pdf",
    exampleImage: "butterfly-green-pink-example.jpg",
    outlineImage: "butterfly-green-pink-outline.jpg",
  },
  {
    id: "fish-blue-orange",
    title: "Tropical colorful fish",
    description: "Colorful blue and orange striped tropical fish  ",
    categories: ["animals"],
    tags: ["fish", "tropical", "ocean", "blue", "orange", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "fish-blue-orange.pdf",
    exampleImage: "fish-blue-orange-example.jpg",
    outlineImage: "fish-blue-orange-outline.jpg",
  },
  {
    id: "parrot",
    title: "Colorful parrot",
    description: "Parrot sitting on tree branch",
    categories: ["animals"],
    tags: ["parrot", "ara", "bird", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "parrot.pdf",
    exampleImage: "parrot-example.jpg",
    outlineImage: "parrot-outline.jpg",
  },
  {
    id: "pink-rose",
    title: "Pink dog rose",
    description: "Pink dog rose in vintage style",
    categories: ["nature"],
    tags: ["vintage", "pink", "rose", "wild flower", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "pink-rose.pdf",
    exampleImage: "pink-rose-example.jpg",
    outlineImage: "pink-rose-outline.jpg",
  },
  {
    id: "hanging-plants",
    title: "Three hanging plants",
    description: "Three hangings houseplants",
    categories: ["nature"],
    tags: ["plants", "indoor plants", "potted plants", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "hanging-plants.pdf",
    exampleImage: "hanging-plants-example.jpg",
    outlineImage: "hanging-plants-outline.jpg",
  },
  {
    id: "red-apple",
    title: "Red delicious apple",
    description: "Painting of red delicious apple",
    categories: ["nature"],
    tags: ["red", "apple", "painting", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "red-apple.pdf",
    exampleImage: "red-apple-example.jpg",
    outlineImage: "red-apple-outline.jpg",
  },
  {
    id: "zinnia-flowers",
    title: "Two zinnia flowers",
    description: "Fully opened vibrant red zinnia flower and a soft peach-yellow flower ",
    categories: ["nature"],
    tags: ["vibrant", "red flower", "peach flower", "yellow flower", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "zinnia-flowers.pdf",
    exampleImage: "zinnia-flowers-example.jpg",
    outlineImage: "zinnia-flowers-outline.jpg",
  },
  {
    id: "flower-blue",
    title: "Forget-me-not",
    description: "Blue Forget-me-not flowers",
    categories: ["nature"],
    tags: ["blue flower", "forget me nots", "watercolor", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "flower-blue.pdf",
    exampleImage: "flower-blue-example.jpg",
    outlineImage: "flower-blue-outline.jpg",
  },
  {
    id: "flowerpot-blue",
    title: "Flowerpot with two blue flowers",
    description: "Flowerpot with two blue flowers",
    categories: ["nature"],
    tags: ["flowerpot", "earthen flowerpot", "blue", "asters", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "flowerpot-blue.pdf",
    exampleImage: "flowerpot-blue-example.jpg",
    outlineImage: "flowerpot-blue-outline.jpg",
  },
  {
    id: "cakes",
    title: "Four petit fours",
    description: "Four delicious petit fours",
    categories: ["object"],
    tags: ["cakes", "chocolate", "dessert", "delicious", "pink", "Guangna 48", "Guangna 168", "Guangna 366"],
    fileName: "cakes.pdf",
    exampleImage: "cakes-example.jpg",
    outlineImage: "cakes-outline.jpg",
  },
  {
    id: "houses",
    title: "Four houses",
    description: "Street with four houses",
    categories: ["object"],
    tags: ["cosy", "houses", "european", "Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "houses.pdf",
    exampleImage: "houses-example.jpg",
    outlineImage: "houses-outline.jpg",
  },
  {
    id: "police-car",
    title: "Police car",
    description: "Police car with siren",
    categories: ["object"],
    tags: ["police", "car", "black", "Guangna 48", "Guangna 120", "Guangna 366"],
    fileName: "police-car.pdf",
    exampleImage: "police-car-example.jpg",
    outlineImage: "police-car-outline.jpg",
  },
  {
    id: "candy-jar",
    title: "Two candy jars on shelf",
    description: "Two jars with colorful candy",
    categories: ["object"],
    tags: ["yellow", "green", "candy", "pink and yellow", "sweets", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "candy-jar.pdf",
    exampleImage: "candy-jar-example.jpg",
    outlineImage: "candy-jar-outline.jpg",
  },
  {
    id: "ferriswheel",
    title: "Ferriswheel",
    description: "Ferriswheel",
    categories: ["object"],
    tags: ["amusement park", "theme park", "Guangna 48", "Guangna 120", "Guangna 366"],
    fileName: "ferriswheel.pdf",
    exampleImage: "ferriswheel-example.jpg",
    outlineImage: "ferriswheel-outline.jpg",
  },
  {
    id: "bento-box",
    title: "Bento box",
    description: "Bento box with rice and vegetables",
    categories: ["object"],
    tags: ["Japanese", "food", "rice", "vegetables", "delicious", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "bento-box.pdf",
    exampleImage: "bento-box-example.jpg",
    outlineImage: "bento-box-outline.jpg",
  },
];
