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

export type ColoringPage = {
  /** Stable unique id — also used as the URL slug (/free-coloring-pages/<id>) and the React key, so keep it URL-safe (lowercase, hyphens). */
  id: string;
  /** Shown as the card/page title. */
  title: string;
  /** Optional short description shown on the gallery card and the detail page. */
  description?: string;
  /**
   * Optional tags for future search/filter and category pages
   * (e.g. /free-coloring-pages/animals). Not wired to any UI yet —
   * just collect them now so nothing needs re-tagging later.
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
    tags: ["girls", "animals"],
    fileName: "girl-teddybear.pdf",
    exampleImage: "girl-teddybear-example.jpg",
    outlineImage: "girl-teddybear-outline.jpg",
  },
  {
    id: "hippo",
    title: "Baby Hippo",
    description: "A cuddly baby hippo holding a cookie.",
    tags: ["animals"],
    fileName: "hippo.pdf",
    exampleImage: "hippo-example.jpg",
    outlineImage: "hippo-outline.jpg",
  },
  {
    id: "boy_backpack",
    title: "Boy with Backpack",
    description: "School boy with Backpack.",
    tags: ["boy, backpack, school, Guangna 72, Guangna 168, Guangna 366"],
    fileName: "boy_backpack.pdf",
    exampleImage: "boybackpack-example.jpg",
    outlineImage: "boybackpack-outline.jpg",
  },
  {
    id: "boy",
    title: "Cheerful boy",
    description: "A cheerful boy in a yellow t-shirt.",
    tags: ["boy", "yellow t-shirt", "happy", "cheerful", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "boy.pdf",
    exampleImage: "boy-example.jpg",
    outlineImage: "boy-outline.jpg",
  },
  {
    id: "boy-with-dino",
    title: "Boy with Green Toy Dinosaur",
    description: "A happy boy playing with his green toy dinosaur.",
    tags: ["boy", "green dinosaur", "toy", "happy", "Guangna 72", "Guangna 168", "Guangna 366"],
    fileName: "boydino.pdf",
    exampleImage: "boydino-example.jpg",
    outlineImage: "boydino-outline.jpg",
  },
  {
    id: "cat_orange",
    title: "Cute orange cat playing with wool",
    description: "Cute orange cat playing with wool.",
    tags: ["animal", "cat", "orange cat", "playing", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "cat_orange.pdf",
    exampleImage: "catorange-example.jpg",
    outlineImage: "catorange-outline.jpg",
  },
  {
    id: "dog",
    title: "Cute playful brown dog",
    description: "Cute playful brown dog.",
    tags: ["animal", "dog", "brown dog", "playing", "Guangna 60", "Guangna 168", "Guangna 366"],
    fileName: "dog.pdf",
    exampleImage: "dog-example.jpg",
    outlineImage: "dog-outline.jpg",
  },
  {
    id: "friends_jump",
    title: "Two friends jumping",
    description: "Two happy friends jumping together.",
    tags: ["friends", "two people", "children", "joyful", "Guangna 72", "Guangna 240", "Guangna 366"],
    fileName: "Friends_jump.pdf",
    exampleImage: "friendsjump-example.jpg",
    outlineImage: "friendsjump-outline.jpg",
  },
  {
    id: "girl_jump",
    title: "Joyful girl",
    description: "Happy girl, jumping for joy.",
    tags: ["girl", "happy", "jumping", "joyful", "Guangna 60", "Guangna 240", "Guangna 366"],
    fileName: "girl_jump.pdf",
    exampleImage: "girl_jump-example.jpg",
    outlineImage: "girl_jump-outline.jpg",
  },
];
