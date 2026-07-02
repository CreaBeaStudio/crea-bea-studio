// ─────────────────────────────────────────────────────────────────
// Free coloring pages — add a new page by adding one object below.
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
//      clean of tables/legend/logo).
//   3. Add an entry to the array below.
//
// Titles/descriptions here are shown as-is (not translated per-locale) —
// keeping this simple on purpose so adding a page never requires touching
// messages/*.json. If you'd like titles translated later, this is the
// place to extend (e.g. swap `title: string` for `title: Record<string,string>`).
// ─────────────────────────────────────────────────────────────────

export type ColoringPage = {
  /** Stable unique id — used as the React key and in the download URL, so keep it URL-safe (lowercase, hyphens). */
  id: string;
  /** Shown as the card title. */
  title: string;
  /** Optional short description under the title. */
  description?: string;
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
    fileName: "girl-teddybear.pdf",
    exampleImage: "girl-teddybear-example.jpg",
    outlineImage: "girl-teddybear-outline.jpg",
  },
  {
    id: "hippo",
    title: "Baby Hippo",
    description: "A cuddly baby hippo holding a cookie.",
    fileName: "hippo.pdf",
    exampleImage: "hippo-example.jpg",
    outlineImage: "hippo-outline.jpg",
  },
];
