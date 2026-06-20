// app/guides/guidesData.js
//
// Central content store for all /guides/[slug] articles.
// Add a new guide by adding a new key here — both the hub page and the
// article page read from this file, so nothing else needs to change.
 
export const GUIDES_DATA = {
    "turn-photo-into-guangna-paint-by-number": {
      title: "How to Turn Any Photo Into a Custom Guangna Paint by Number",
      description:
        "A step-by-step look at converting your own photo into a paint by number, matched precisely to the Guangna marker set you already own.",
      intro:
        "If you already own a Guangna marker set, you don't have to settle for generic paint-by-number kits with colors you'll never use. Here's how converting your own photo into a custom Guangna by Number artwork actually works.",
      sections: [
        {
          heading: "1. Start with any photo",
          body: "A pet, a portrait, a favorite landscape — almost any photo works. Higher-contrast images with clear subjects tend to convert into the cleanest line art, but you don't need a professional photo to get a great result.",
        },
        {
          heading: "2. Tell us which Guangna set you own",
          body: "Whether you've got the 60, 168, 240, or 366-color Classic Brush set, the conversion is built around the exact palette inside your set — not a generic 'best guess' color range. That's what makes the result paint-by-number ready instead of just a rough approximation.",
        },
        {
          heading: "3. Choose your detail level",
          body: "More colors generally means more detail and smaller numbered regions. Beginners often start with fewer colors and larger areas, while more experienced painters go for finer detail and a wider color range.",
        },
        {
          heading: "4. Get your file and start painting",
          body: "Your finished, numbered template is delivered straight to your inbox — typically within 24 hours — so you can start painting with the markers you already have, matched number for number.",
        },
      ],
      cta: {
        href: "/create",
        label: "Convert my photo now →",
      },
    },
  };
   
  