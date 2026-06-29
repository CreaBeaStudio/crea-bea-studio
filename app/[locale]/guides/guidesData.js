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
        heading: "1. Select and Upload Your Favorite Photo",
        body: "You can turn almost any digital photo or image into a color by number canvas pattern — a pet portrait, a favorite travel landscape, or a family photo.A pet, a portrait, a favorite landscape, your favorite memory — almost any photo works. Images with high contrast and distinct lighting convert into the cleanest line art patterns. While you don't need a professional studio photograph, avoiding heavy shadows ensures cleaner, highly defined numbered regions.",
      },
      {
        heading: "2. Match the Color-by Number to Your Specific Guangna Marker Set",
        body: "Unlike generic photo-to-coloring software that outputs random color codes, our line art conversion is built entirely around the Guangna color chart. Whether you own the 60-count starter pack, the medium 168 Classic Brush set or the popular Guangna 240 acrylic set, or the complete 366 brush pen collection, the generator restricts the color by number palette strictly to the marker numbers sitting on your art table. That's what makes the result paint-by-number ready instead of just a rough approximation - no more guessing.",
      },
      {
        heading: "3. Customize Your Detail and Difficulty Level",
        body: "You control the complexity of the final paint by number based on your skill level and how much time you want to invest. Beginner: Generates fewer total colors and larger, easier-to-fill numbered blocks. Advanced level: Maximizes your brush marker palette to produce finer detail, micro-shading regions, and hyper-realistic blending zones. More colors generally means more detail and smaller numbered regions.",
      },
      {
        heading: "4. Download Your Printable Numbered Outline and Start Coloring",
        body: "Once processed, your customized, printable paint-by-number PDF is sent straight to your email inbox, within 24 hour (but often much faster). The template maps every single blank shape on the page to a specific Guangna marker cap number. Simply print it out on heavy cardstock or marker paper, match your pen numbers to the sheet, and start coloring with the markers you already have, matched number for number.",
      },
      {
        heading: "Frequently Asked Questions: Custom Guangna Paint by Number.",
      },
      {
        heading: "Q: Can I use this generator with the Guangna 240 acrylic marker set?",
        body: "Yes. The custom generator is fully compatible with the Guangna 240 marker set, as well as the 60, 168, and 366-piece collections. The software strictly limits the generated template colors to the exact pen numbers included in your specific kit.",
      },
      {
        heading: "Q: What kind of photos work best for photo-to-paint-by-number conversion?",
        body: "Photos with clear subjects, distinct lighting, and high contrast produce the cleanest line art outlines. Close-up pet portraits, bold landscapes, and well-lit logos convert beautifully, while blurry or deeply shadowed images may create confusing patterns.",
      },
      {
        heading: "Q: How do I print my custom paint-by-number template?",
        body: "Your custom blueprint is delivered as a scaleable PDF file. You can print it at home on heavy marker paper or mixed-media cardstock, or upload the file to a local print shop to have it printed directly onto an unmounted canvas sheet.",
      },
      {
        heading: "Q: Will I need to mix colors or buy extra Guangna markers?",
        body: "No. Because the algorithm maps the image directly to your pre-selected palette, you will never have to manually mix inks or buy supplementary individual pens. Every numbered zone on your printable canvas corresponds exactly to a pen you already own.",
      },
      {
        heading: "Q: What happens if my photo has a color that isn't in my marker set?",
        body: "The software uses the dE2000 color delta formula to calculate the closest mathematical match from your inventory, ensuring the piece stays cohesive without needing new supplies. For critical shading areas, the template will often provide both the best technical match and a creative choice. This giving you the flexibility to choose a tone that enhances the depth, highlights, or fine details of your custom artwork.",
      },
      {
        heading: "Q: What is the benefit of a dedicated palette converter?",
        body: "Standard image-to-vector or coloring pages tools force you to guess which marker matches a generic printed color. This generator reverses the process, designing the artwork specifically for the physical tools you already own.",
      },
    ],
    cta: {
      href: "/create",
      label: "Convert my photo now →",
    },
  },
 
  "match-paint-color-to-guangna-markers": {
    title: "Guangna Marker Color Converter: How to Match Any Color From a Photo",
    description:
      "Stop guessing which marker is closest. Upload a photo of any color — a paint chip, fabric, a wall, anything — and find the exact Guangna acrylic brush marker match in seconds.",
    intro:
      "Trying to figure out which Guangna acrylic brush marker is closest to a color you have in mind is normally trial and error — holding pens up next to a swatch, squinting under different lighting, hoping you picked right. Our color converter skips all of that. Take a photo of the color, upload it, and we'll tell you exactly which Guangna marker matches.",
    sections: [
      {
        heading: "1. Select the color you want to match",
        body: "It can be almost anything — a paint chip from the hardware store, a piece of fabric, a flower, a wall, your lipstick, even a screenshot. If it has a color in it, you can match it. The converter handles any visual source.",
      },
      {
        heading: "2. Upload Your Photo, RGB, or HEX Code",
        body: "No special lighting setup or equipment needed — just a clear, well-lit photo of the color you're trying to match. Upload it directly into the color converter. Alternatively, if you are a digital artist, you can type your exact HEX or RGB values directly into the input field.",
      },
      {
        heading: "3. Get your closest Guangna acrylic brush match",
        body: "The tool analyzes the color in your photo and returns the closest matching acrylic brush marker number across the full Guangna lineup, so you know exactly which marker to reach for.",
      },
      {
        heading: "4. Filter by Your Personal Marker Set (e.g., Guangna 240 Set)",
        body: "Don't waste time looking at pens you don't own. You can toggle the tool to match colors only within the specific Guangna marker set you have on your desk. So you always know your best option before you start coloring.",
      },
      {
        heading: "People Also Ask:",
      },
      {
        heading: "Q. Can I match HEX codes to Guangna markers?",
        body: "A: Yes! The converter allows you to input exact digital HEX or RGB values to find the perfect Guangna code.",
      },
      {
        heading: "Q. How do I find a match if I only own the Guangna 240 set?",
        body: "A: You can input your color, select the set you have, and the converter will show the closest available match and the closest match available in your specific collection.",
      },
    ],
    cta: {
      href: "/color-converter",
      label: "Try the Color Converter →",
    },
  },
  "guangna-by-number-faq": {
    title: "Guangna by Number: Everything You Need to Know Before You Order",
    description:
      "From file delivery to refunds to which Guangna sets are supported — a complete walkthrough of how custom Guangna by Number ordering actually works.",
    intro:
      "Custom paint by number isn't a kit you grab off a shelf, so it's natural to have questions before you commit a photo and a few dollars to it. Here's a full walkthrough of how ordering actually works, beyond the quick-reference answers on our FAQ page.",
    sections: [
      {
        heading: "What exactly are you paying for?",
        body: "When you order, you're not buying a physical product — you're commissioning a digital conversion of your own photo. You receive three files: a printable Paint by Number Outline, a Custom Guangna Color Palette Guide matched to your exact marker set, and a Finished Artwork Impression so you can see roughly where you're headed before you pick up a pen. Nothing physical ships, and nothing generic is reused — every file is generated from your specific photo and your specific markers.",
      },
      {
        heading: "How fast is 'fast,' really?",
        body: "Files arrive within 24 hours of us receiving your photo, though most orders go out well before that. There's no queue you're stuck behind and no separate shipping wait — the moment the conversion is done, it's in your inbox.",
      },
      {
        heading: "What if my markers don't perfectly match the guide?",
        body: "This is one of the most common worries, and it's almost never a sign anything went wrong. Ink batches vary slightly, paper absorbs color differently, and printer color calibration isn't identical screen to screen. Your guide gives you the best mathematical match for your exact set — small shade variation is normal and won't break the final piece.",
      },
      {
        heading: "Do you support every Guangna set size?",
        body: "Every set listed on the creation page is fully supported, from the small 12-color starter pack up through the full 366 and 408-piece collections. If you own a set that isn't listed, email us — sets get added when there's demand, and it's a quick addition on our end.",
      },
      {
        heading: "Why CreaBeaStudio over a generic photo-to-coloring-page tool?",
        body: "Generic tools output colors that exist nowhere near your actual markers, leaving you guessing or mixing. Every palette here is built specifically around the Guangna lineup, which means the moment your file lands, you can start coloring with the pens already on your desk — no extra purchases, no approximating.",
      },
      {
        heading: "One more thing — if you came here from mystery coloring books",
        body: "If you're into mystery coloring books — the kind where a hidden image is revealed page by page — you'll recognize the appeal of Guangna by Number immediately, just flipped around. There's less mystery, since it's built from a photo you chose on purpose, but a lot more personal payoff: the picture that's revealed is one that actually means something to you.",
      },
    ],
    cta: {
      href: "/create",
      label: "Start your own Guangna by Number →",
    },
  },

  "guangna-marker-techniques-guide": {
    title: "Getting the Most Out of Your Guangna Markers: A Technique Guide",
    description:
      "Layering, blending, highlights, and fixing mistakes — practical Guangna marker techniques that take your paint by number from flat to polished.",
    intro:
      "Owning the right markers is only half the equation — how you use them is what separates a flat, blocky result from something that actually looks intentional. Here's a closer look at the techniques behind a polished Guangna by Number piece.",
    sections: [
      {
        heading: "Build color in layers, not in one pass",
        body: "The single biggest jump in quality comes from resisting the urge to fully saturate an area in one stroke. Lay down a first thin layer, let it dry, then go back over it. Layering builds richer, more even tone than pressing hard once — and it gives you room to fix uneven spots on the second pass instead of living with them.",
      },
      {
        heading: "Light to dark, every time",
        body: "Work your lighter suggested colors into an area before the darker ones. It's much easier to deepen a shade on top of something light than to lighten an area that's already gone too dark.",
      },
      {
        heading: "The white base-layer trick for pastels",
        body: "Pale pinks, soft yellows, and whites can look slightly see-through straight onto paper, especially over a printed number. Tap a white acrylic marker over the number first, let it dry for a few seconds, then color over it. That opaque base is what makes pastel sections look clean instead of washed out.",
      },
      {
        heading: "Match your tip to the job",
        body: "A 3mm chisel or medium tip clears large background areas fast. Swap to a 0.7mm fine tip the moment you're working a small numbered region, a tight corner, or fine detail — trying to do both jobs with one tip is the most common cause of messy edges.",
      },
      {
        heading: "When two colors are suggested for one area, that's not an error",
        body: "Your palette guide sometimes offers a creative alternative alongside the technical best match — that's intentional, not a mistake to puzzle over. It's there so you can add subtle variation or depth in skin tones, shadows, or fine details rather than flattening everything to a single shade.",
      },
      {
        heading: "Damage control: fixing a stray line",
        body: "Caught it while still wet? A slightly damp cotton swab or tissue, used immediately, lifts most small mistakes cleanly. Once it's dried, your best option is usually layering over it rather than trying to lift it — acrylic ink sets fast.",
      },
      {
        heading: "Keep your markers performing between sessions",
        body: "Store them lying flat so ink stays evenly distributed, snap caps shut the second you're done, and if a tip feels dry, a gentle shake plus a few presses on scrap paper usually brings it back before you assume it's dead.",
      },
    ],
    cta: {
      href: "/tips",
      label: "See the full Tips & Tricks reference →",
    },
  },
};
 
