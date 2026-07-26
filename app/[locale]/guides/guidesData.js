// app/[locale]/guides/guidesData.js
//
// Central content store for all /guides/[slug] articles.
//
// Restructured (2026-07) to be locale-aware, now that this route lives
// under app/[locale]/ instead of a flat app/guides/. All content below
// is still English-only for now -- GUIDES_DATA.en is the master list
// that defines which guides exist at all (its keys drive both
// generateStaticParams and the hub page's listing).
//
// To add a translation: add a new top-level key (e.g. `fr: { ... }`)
// containing only the slugs you've translated so far -- you do NOT
// need every slug translated before adding the key. getGuide() and
// getGuidesForLocale() below both fall back to the English version of
// any guide missing from a given locale, so a partially-translated
// locale works fine; nothing needs to be "all or nothing."

const EN_GUIDES = {
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
        body: "When you order, you're not buying a physical product — you're commissioning a digital conversion of your own photo. You receive two files: a printable Paint by Number Outline, a Custom Guangna Color Palette Guide matched to your exact marker set with a Finished Artwork Impression so you can see roughly where you're headed before you pick up a pen. Nothing physical ships, and nothing generic is reused — every file is generated from your specific photo and your specific markers.",
      },
      {
        heading: "How fast is 'fast,' really?",
        body: "Files arrive within 1-10 minutes after your payment is confirmed. There's no queue you're stuck behind and no separate shipping wait — the moment the conversion is done, it's in your inbox.",
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

  "convert-coloring-book-legend-to-guangna-markers": {
    title: "Already Have a Coloring Book? Convert Its Color Legend to Guangna Markers",
    description:
      "Got a paint-by-number page from somewhere else, with its own numbered color legend? Here's how to turn that legend into a ready-to-use Guangna marker guide in minutes.",
    intro:
      "Not every paint-by-number page in your house came from CreaBeaStudio — and that's fine. Most coloring books and printed paint-by-number pages come with their own little color legend at the bottom: a row of swatches, each tied to a number. The Legend Converter takes that legend and tells you exactly which Guangna marker to use for each one, so you're not stuck guessing or buying a whole new set of pens to match someone else's color codes.",
    sections: [
      {
        heading: "1. Upload a Photo of the Legend",
        body: "Snap a clear, well-lit photo of the color legend printed on your page — the row or grid of numbered swatches, not the whole coloring page. Natural daylight works best; shadows and yellow indoor lighting can shift how the colors read and throw off the match. If you have access to a scanner, a scan will give you an even more accurate result than a phone photo.",
      },
      {
        heading: "2. Tell It How Many Colors to Convert",
        body: "Enter how many numbered swatches are in your legend. The tool will set up that many click targets for you to work through — you don't need to convert every single one in one sitting if you'd rather do it in batches.",
      },
      {
        heading: "3. Click Each Swatch on Your Photo",
        body: "Click the number below the photo to select which swatch you're working on, then click that exact color on the legend image itself. Repeat for each swatch. You don't have to go in order, and you can click any number again at any time to redo it if you misclick.",
      },
      {
        heading: "4. Optionally Narrow It to the Markers You Own",
        body: "If you select your specific Guangna set, the tool shows you the best match from markers you already own, alongside what the best possible match would be across the full Guangna lineup — so if a closer color exists outside your set, you'll see it and can decide whether it's worth picking up.",
      },
      {
        heading: "5. Match, Download, and Color",
        body: "Once every swatch is set, hit match and you'll get a clean, numbered palette guide on screen — and a downloadable PDF version styled the same way as the Guangna Color Palette Guide that comes with every custom order. Print it, set it next to your coloring page, and you're ready to go.",
      },
      {
        heading: "Frequently Asked Questions: Legend Converter",
      },
      {
        heading: "Q: Does this work with any paint-by-number book, not just CreaBeaStudio pages?",
        body: "Yes. The Legend Converter doesn't care where the coloring page came from — it only needs a clear photo of the color legend itself. Any printed page with a numbered color key works, in fact it even works with all kind of images and pictures. You can also upload the finished preview image of your Mystery Cologing book.",
      },
      {
        heading: "Q: What if my legend has more than 70-something colors?",
        body: "You can convert up to 72 swatches in a single legend. For anything larger, you'll get the best results splitting it into a couple of passes.",
      },
      {
        heading: "Q: I only own a small marker set — will this still work?",
        body: "Yes. Select your set and the converter restricts its primary recommendation to markers you actually own, while still showing you anything closer available outside your set, so you always know your options.",
      },
      {
        heading: "Q: How is this different from the regular Color Converter?",
        body: "The Color Converter matches one single color at a time — great for checking a single paint chip or photo. The Legend Converter is built for when you have a whole legend of colors to convert at once, with each one numbered and tracked through to a finished, downloadable guide.",
      },
    ],
    cta: {
      href: "/legend-converter",
      label: "Try the Legend Converter →",
    },
  },

  "match-languo-markers-to-guangna-codes": {
    title: "Own Languo Markers? Here's How to Find Their Closest Guangna Match",
    description:
      "Working from a Guangna-coded design but only have Languo markers on hand? The Languo to Guangna Converter finds the closest Guangna match for any Languo code, using real color-distance math instead of eyeballing swatches on a screen.",
    intro:
      "Languo and Guangna use completely different numbering systems, and neither publishes an official cross-reference between the two. If your painting guide calls for a Guangna code but your marker roll only has Languo codes printed on it, you're normally stuck guessing. The Languo to Guangna Converter removes the guesswork: type in a Languo code, and it tells you exactly which Guangna markers come closest — not by eye, but by measuring the actual color distance between them.",
    sections: [
      {
        heading: "1. Enter Your Languo Code",
        body: "Type the code exactly as it's printed on your marker, in the format used across the Languo Art 288 line — for example, RY-06. If a code isn't recognized, the converter tells you directly rather than silently returning nothing.",
      },
      {
        heading: "2. Optionally Narrow It to Markers You Own",
        body: 'Under "My Markers," select the Guangna set(s) you actually have, or list extra individual codes. This adds a second result showing the closest match from markers you already own, alongside the best match available across the full Guangna lineup — so you can see both what\'s technically closest and what\'s actually usable right now.',
      },
      {
        heading: "3. Get Your Top 3 Matches",
        body: 'Rather than a single "best guess," you get the three closest Guangna codes, ranked nearest-first. Sometimes the top result is an obvious winner; other times it\'s a genuine toss-up between two or three very close options. Seeing all three lets you make that judgment call yourself instead of trusting a single number blindly.',
      },
      {
        heading: "How the Matching Actually Works",
        body: "Every marker's color starts as a measured RGB value, but RGB alone isn't a reliable way to judge how different two colors actually look to a human eye — two colors can be numerically far apart but look nearly identical, or the reverse. To fix that, the converter first converts every color into Lab color space, which is built specifically so numeric distance lines up with visual distance much more closely than RGB does. It then measures the distance between colors using Delta E (CIE 1976), a standard formula for expressing how different two colors look as a single number — the smaller the number, the closer the visual match.",
      },
      {
        heading: "Frequently Asked Questions: Languo to Guangna Converter",
      },
      {
        heading: "Q: What is Delta E, in plain terms?",
        body: "It's a standard way of measuring how different two colors look to the human eye, expressed as one number. A lower Delta E means the colors are closer visually — it's the same math color scientists and printers use to judge color accuracy.",
      },
      {
        heading: "Q: Why do I get 3 matches instead of just 1?",
        body: "Because sometimes the single best match is an obvious standout, and sometimes two or three markers are all extremely close. Showing three lets you decide for yourself rather than trusting one number when the real answer is closer to a tie.",
      },
      {
        heading: "Q: Will the printed color match exactly?",
        body: "It'll be very close, but not guaranteed pixel-perfect. Screen colors and printed ink under real lighting are never perfectly identical, and ink batches, paper type, and marker age all introduce small variations. Always test on scrap paper before committing to a large area.",
      },
      {
        heading: "Q: What if I don't own any Guangna markers yet?",
        body: 'You\'ll still get the top 3 closest matches overall — the "My Markers" step is entirely optional and only adds a second, narrower result on top of that.',
      },
      {
        heading: "Q: How is this different from the Color Converter?",
        body: "The Color Converter matches a hex code, RGB value, or photographed color — any single color you give it. This tool is specifically for when you're starting from a Languo code and want its Guangna equivalent.",
      },
    ],
    cta: {
      href: "/languo-converter",
      label: "Try the Languo to Guangna Converter →",
    },
  },

  "create-custom-guangna-languo-swatch-cards": {
    title: "Build Your Own Printable Swatch Cards for Guangna and Languo Markers",
    description:
      "A swatch card shows you exactly what each marker actually looks like on paper, organized so you can find the shade you want without uncapping twenty markers. Here's how to build your own, and how the color organization behind it actually works.",
    intro:
      "A swatch card is the simplest tool a marker artist owns: a physical reference showing what color each marker really lays down, organized so finding the right shade is a quick flip through the card instead of a hunt through unsorted swatches. The DIY Swatch Card Creator builds these for you — from any Guangna set, any Languo set, individual codes, or a whole color family — and turns them into print-ready PDF cards.",
    sections: [
      {
        heading: "1. Choose Your Source",
        body: "Five tabs let you pull colors in from wherever they live: a full Guangna set, individual Guangna codes by search, a full Languo set, individual Languo codes, or an entire color family regardless of brand. Drag colors into your selection or just click them — everything you add shows up grouped by family, with per-family download and delete controls, and undo if you remove something by mistake.",
      },
      {
        heading: "2. Set Your Card Options",
        body: "Choose filled swatches (showing the actual color) or blank outlines for hand-coloring your own reference. Add an optional punch hole to the card header — left, center, or right — so a stack of cards can be threaded onto a binder ring. Pick one color family per card, or pack multiple families onto a card with an inline label wherever the family changes. Then choose A4 or US Letter paper.",
      },
      {
        heading: "3. Download and Print",
        body: "Each card holds up to 12 swatches, 4 cards per landscape page. Every swatch includes a punch-hole guide in its center — not for binding, but so you can hold the real marker behind the card and compare it to the printed color directly through the hole. If a family doesn't divide evenly into full cards, the leftover space fills with blank spare swatches instead of being left empty.",
      },
      {
        heading: "How the Color Families Were Built",
        body: "The order colors appear in is the genuinely useful part of a swatch card — not just a grid of colored squares, but colors grouped the way your eye actually thinks about color. Every marker was sorted into one of nine families (White/Grey/Black, Brown/Earth, Pink, Red, Orange, Yellow, Green, Blue, Violet/Purple) through three passes: first, converting each color's RGB value into HSL to separate hue from lightness, which is what allows sorting light-to-dark within a family; second, cross-referencing those values against the brands' own original naming conventions, since a manufacturer's groupings often encode real intent; and third, a manual visual review to fix spots where pure math produced a technically correct but visually awkward order. Colors that genuinely sit between two families — a vibrant blue-green, for instance — are included in both, rather than forced into a single choice. Metallic markers are the one exception, left out of the family grouping since they work differently from standard ink.",
      },
      {
        heading: "Printing and Assembling Your Cards",
        body: 'Use heavy cardstock, 200-300 gsm, matte or satin finish — regular copy paper will bleed and warp under heavy ink. Set print scaling to "Actual Size" or 100%, never "Fit to Page," which distorts the cut guidelines, and disable any automatic color enhancement so printed color stays accurate. A metal ruler, craft knife, and cutting mat give the cleanest cut edges, though scissors work fine too. Use a hole punch to cleanly remove each swatch\'s center circle, and thread finished cards onto a binder ring if you added a header hole.',
      },
      {
        heading: "Frequently Asked Questions: Swatch Card Creator",
      },
      {
        heading: "Q: Why aren't the swatches just sorted mathematically by hue?",
        body: "They started that way, but pure math can place two numerically close colors next to each other that look visually jarring side by side. The final visual review trades strict mathematical precision for a card that actually reads as a smooth gradient to the eye.",
      },
      {
        heading: "Q: What are the blank spare swatches for?",
        body: "When a color family doesn't divide evenly into full cards, the leftover space is filled with blank swatches rather than left empty — genuinely useful if you ever want to add a color of your own later.",
      },
      {
        heading: "Q: What's the punch hole in the middle of each swatch for?",
        body: "It's not for binding — it's so you can hold the actual marker behind the printed card and compare the real ink to the printed color directly through the hole.",
      },
      {
        heading: "Q: Can I make a card with just one color family?",
        body: "Yes — use the Color Family tab to pull in only the family you want, from either brand.",
      },
      {
        heading: "Q: Do I have to build my own, or are there pre-made options?",
        body: "Ready-made packs are available for the most popular Guangna and Languo set sizes, built using this same color-family system, each including a colored preset, a blank hand-coloring template, and a compact reference sheet.",
      },
    ],
    cta: {
      href: "/swatch-creator",
      label: "Try the DIY Swatch Card Creator →",
    },
  },
};

const FR_GUIDES = {
  "turn-photo-into-guangna-paint-by-number": {
    title: "Comment transformer n'importe quelle photo en Guangna by Number personnalisé",
    description:
      "Un guide étape par étape pour convertir votre propre photo en peinture par numéro, parfaitement adaptée au set de feutres Guangna que vous possédez déjà.",
    intro:
      "Si vous possédez déjà un set de feutres Guangna, inutile de vous contenter de kits de peinture par numéro génériques avec des couleurs que vous n'utiliserez jamais. Voici comment fonctionne réellement la conversion de votre propre photo en une œuvre Guangna by Number personnalisée.",
    sections: [
      {
        heading: "1. Sélectionnez et téléchargez votre photo préférée",
        body: "Vous pouvez transformer presque n'importe quelle photo ou image numérique en modèle de toile à peindre par numéro — le portrait d'un animal, un paysage de voyage préféré, ou une photo de famille. Un animal, un portrait, un paysage préféré, votre souvenir favori — presque toutes les photos fonctionnent. Les images à fort contraste et à l'éclairage bien défini donnent les tracés les plus nets. Une photo de studio professionnelle n'est pas nécessaire, mais éviter les ombres marquées garantit des zones numérotées plus propres et mieux définies.",
      },
      {
        heading: "2. Adaptez la peinture par numéro à votre set de feutres Guangna spécifique",
        body: "Contrairement aux logiciels génériques de conversion photo-coloriage qui génèrent des codes couleur aléatoires, notre conversion en tracé est entièrement construite autour de la charte de couleurs Guangna. Que vous possédiez le pack de démarrage à 60 feutres, le set intermédiaire Classic Brush à 168, le populaire set acrylique Guangna 240, ou la collection complète à 366 feutres pinceaux, le générateur restreint strictement la palette de peinture par numéro aux numéros de feutres présents sur votre table de travail. C'est ce qui rend le résultat vraiment prêt à peindre, plutôt qu'une simple approximation — fini de deviner.",
      },
      {
        heading: "3. Personnalisez le niveau de détail et de difficulté",
        body: "Vous contrôlez la complexité de la peinture par numéro finale selon votre niveau et le temps que vous souhaitez y consacrer. Débutant : génère moins de couleurs au total et des zones numérotées plus grandes, plus faciles à remplir. Niveau avancé : exploite au maximum votre palette de feutres pinceaux pour produire des détails plus fins, des zones de micro-ombrage et des dégradés hyperréalistes. Plus il y a de couleurs, plus il y a de détails et plus les zones numérotées sont petites.",
      },
      {
        heading: "4. Téléchargez votre tracé numéroté imprimable et commencez à peindre",
        body: "Une fois le traitement terminé, votre PDF de peinture par numéro personnalisé et imprimable est envoyé directement dans votre boîte mail, en moins de 24 heures (souvent bien plus vite). Le modèle associe chaque zone vide de la page à un numéro de capuchon de feutre Guangna précis. Il vous suffit de l'imprimer sur du papier cartonné épais ou du papier pour feutres, de faire correspondre les numéros de vos feutres à la feuille, et de commencer à peindre avec les feutres que vous possédez déjà, numéro par numéro.",
      },
      {
        heading: "Questions fréquentes : Guangna by Number personnalisé",
      },
      {
        heading: "Q : Puis-je utiliser ce générateur avec le set de feutres acryliques Guangna 240 ?",
        body: "Oui. Le générateur personnalisé est entièrement compatible avec le set Guangna 240, ainsi qu'avec les collections de 60, 168 et 366 feutres. Le logiciel limite strictement les couleurs du modèle généré aux numéros de feutres exacts inclus dans votre kit spécifique.",
      },
      {
        heading: "Q : Quel type de photos fonctionne le mieux pour la conversion en peinture par numéro ?",
        body: "Les photos avec des sujets bien définis, un éclairage net et un fort contraste donnent les tracés les plus propres. Les gros plans d'animaux, les paysages marqués et les logos bien éclairés se convertissent magnifiquement, tandis que les images floues ou trop sombres peuvent créer des motifs confus.",
      },
      {
        heading: "Q : Comment imprimer mon modèle de peinture par numéro personnalisé ?",
        body: "Votre plan personnalisé est livré sous forme de fichier PDF redimensionnable. Vous pouvez l'imprimer chez vous sur du papier épais pour feutres ou du carton multi-supports, ou envoyer le fichier à une imprimerie locale pour le faire imprimer directement sur une feuille de toile non montée.",
      },
      {
        heading: "Q : Devrai-je mélanger des couleurs ou acheter des feutres Guangna supplémentaires ?",
        body: "Non. Comme l'algorithme associe directement l'image à votre palette présélectionnée, vous n'aurez jamais besoin de mélanger des encres manuellement ni d'acheter des feutres individuels supplémentaires. Chaque zone numérotée de votre toile imprimable correspond exactement à un feutre que vous possédez déjà.",
      },
      {
        heading: "Q : Que se passe-t-il si ma photo contient une couleur absente de mon set de feutres ?",
        body: "Le logiciel utilise la formule de différence de couleur dE2000 pour calculer la correspondance mathématique la plus proche dans votre inventaire, garantissant que l'œuvre reste cohérente sans achat de matériel supplémentaire. Pour les zones d'ombrage critiques, le modèle propose souvent à la fois la meilleure correspondance technique et une option créative. Cela vous donne la liberté de choisir une teinte qui renforce la profondeur, les reflets ou les détails fins de votre œuvre personnalisée.",
      },
      {
        heading: "Q : Quel est l'intérêt d'un convertisseur de palette dédié ?",
        body: "Les outils standards de conversion image-vecteur ou de pages à colorier vous obligent à deviner quel feutre correspond à une couleur imprimée générique. Ce générateur inverse le processus, en concevant l'œuvre spécifiquement pour les outils physiques que vous possédez déjà.",
      },
    ],
    cta: {
      href: "/create",
      label: "Convertir ma photo maintenant →",
    },
  },

  "match-paint-color-to-guangna-markers": {
    title: "Convertisseur de couleurs Guangna : comment associer n'importe quelle couleur à partir d'une photo",
    description:
      "Arrêtez de deviner quel feutre est le plus proche. Téléchargez une photo de n'importe quelle couleur — un échantillon de peinture, un tissu, un mur, n'importe quoi — et trouvez en quelques secondes le feutre pinceau acrylique Guangna qui correspond exactement.",
    intro:
      "Essayer de déterminer quel feutre pinceau acrylique Guangna se rapproche le plus d'une couleur que vous avez en tête relève habituellement de l'essai-erreur — tenir des feutres à côté d'un échantillon, plisser les yeux sous différents éclairages, espérer avoir fait le bon choix. Notre convertisseur de couleurs évite tout cela. Prenez une photo de la couleur, téléchargez-la, et nous vous indiquons exactement quel feutre Guangna correspond.",
    sections: [
      {
        heading: "1. Choisissez la couleur à faire correspondre",
        body: "Cela peut être presque n'importe quoi — un échantillon de peinture de quincaillerie, un morceau de tissu, une fleur, un mur, votre rouge à lèvres, même une capture d'écran. Si cela contient une couleur, vous pouvez la faire correspondre. Le convertisseur accepte n'importe quelle source visuelle.",
      },
      {
        heading: "2. Téléchargez votre photo, ou saisissez un code RVB ou HEX",
        body: "Aucun éclairage spécial ni matériel particulier n'est nécessaire — juste une photo nette et bien éclairée de la couleur que vous souhaitez faire correspondre. Téléchargez-la directement dans le convertisseur de couleurs. Si vous êtes un artiste numérique, vous pouvez aussi saisir directement vos valeurs HEX ou RVB exactes dans le champ prévu.",
      },
      {
        heading: "3. Obtenez votre correspondance la plus proche parmi les feutres pinceaux acryliques Guangna",
        body: "L'outil analyse la couleur de votre photo et renvoie le numéro de feutre pinceau acrylique le plus proche parmi toute la gamme Guangna, afin que vous sachiez exactement quel feutre choisir.",
      },
      {
        heading: "4. Filtrez selon votre set de feutres personnel (par ex. le set Guangna 240)",
        body: "Ne perdez pas de temps à regarder des feutres que vous ne possédez pas. Vous pouvez activer l'outil pour ne faire correspondre les couleurs qu'au sein du set de feutres Guangna spécifique que vous avez sur votre bureau. Vous connaissez ainsi toujours votre meilleure option avant de commencer à peindre.",
      },
      {
        heading: "Autres questions fréquentes :",
      },
      {
        heading: "Q. Puis-je faire correspondre des codes HEX aux feutres Guangna ?",
        body: "R : Oui ! Le convertisseur vous permet de saisir des valeurs numériques HEX ou RVB exactes pour trouver le code Guangna parfait.",
      },
      {
        heading: "Q. Comment trouver une correspondance si je ne possède que le set Guangna 240 ?",
        body: "R : Vous pouvez saisir votre couleur, sélectionner le set que vous possédez, et le convertisseur affichera la meilleure correspondance disponible ainsi que la meilleure correspondance disponible dans votre collection spécifique.",
      },
    ],
    cta: {
      href: "/color-converter",
      label: "Essayer le convertisseur de couleurs →",
    },
  },

  "guangna-by-number-faq": {
    title: "Guangna by Number : tout ce qu'il faut savoir avant de commander",
    description:
      "De la livraison des fichiers aux remboursements, en passant par les sets Guangna pris en charge — un tour d'horizon complet du fonctionnement réel des commandes Guangna by Number personnalisées.",
    intro:
      "La peinture par numéro personnalisée n'est pas un kit que l'on prend sur une étagère, il est donc normal d'avoir des questions avant d'y consacrer une photo et quelques euros. Voici un tour d'horizon complet du fonctionnement réel des commandes, au-delà des réponses rapides de notre page FAQ.",
    sections: [
      {
        heading: "Que payez-vous exactement ?",
        body: "Lorsque vous commandez, vous n'achetez pas un produit physique — vous commandez une conversion numérique de votre propre photo. Vous recevez deux fichiers : un tracé de peinture par numéro imprimable, et un guide de palette de couleurs Guangna personnalisé, adapté exactement à votre set de feutres, avec un aperçu de l'œuvre terminée pour visualiser à peu près le résultat avant même de prendre un feutre. Rien n'est expédié physiquement, et rien de générique n'est réutilisé — chaque fichier est généré à partir de votre photo et de vos feutres spécifiques.",
      },
      {
        heading: "« Rapide », ça veut dire quoi, concrètement ?",
        body: "Les fichiers arrivent entre 1 et 10 minutes après la confirmation de votre paiement. Pas de file d'attente, pas de délai de livraison séparé — dès que la conversion est terminée, elle est dans votre boîte mail.",
      },
      {
        heading: "Et si mes feutres ne correspondent pas parfaitement au guide ?",
        body: "C'est l'une des inquiétudes les plus fréquentes, et ce n'est presque jamais le signe d'un problème. Les lots d'encre varient légèrement, le papier absorbe la couleur différemment, et la calibration des couleurs d'imprimante n'est jamais identique d'un écran à l'autre. Votre guide vous donne la meilleure correspondance mathématique pour votre set exact — une légère variation de teinte est normale et ne compromettra pas le résultat final.",
      },
      {
        heading: "Prenez-vous en charge toutes les tailles de sets Guangna ?",
        body: "Tous les sets listés sur la page de création sont entièrement pris en charge, du petit pack de démarrage à 12 couleurs jusqu'aux collections complètes de 366 et 408 feutres. Si vous possédez un set qui n'est pas listé, écrivez-nous — de nouveaux sets sont ajoutés en fonction de la demande, et c'est rapide de notre côté.",
      },
      {
        heading: "Pourquoi choisir CreaBeaStudio plutôt qu'un outil générique de photo-vers-coloriage ?",
        body: "Les outils génériques produisent des couleurs qui n'ont rien à voir avec vos feutres réels, vous laissant deviner ou mélanger. Chaque palette ici est construite spécifiquement autour de la gamme Guangna, ce qui signifie que dès que votre fichier arrive, vous pouvez commencer à peindre avec les feutres déjà sur votre bureau — sans achat supplémentaire, sans approximation.",
      },
      {
        heading: "Encore une chose — si vous venez des livres de coloriage mystère",
        body: "Si vous aimez les livres de coloriage mystère — ceux où une image cachée se révèle page après page — vous reconnaîtrez immédiatement l'attrait de Guangna by Number, mais dans l'autre sens. Il y a moins de mystère, puisque l'image provient d'une photo que vous avez choisie exprès, mais la récompense personnelle est bien plus grande : l'image révélée est une image qui compte vraiment pour vous.",
      },
    ],
    cta: {
      href: "/create",
      label: "Créez votre propre Guangna by Number →",
    },
  },

  "guangna-marker-techniques-guide": {
    title: "Tirer le meilleur de vos feutres Guangna : guide des techniques",
    description:
      "Superposition, dégradés, reflets et rattrapage d'erreurs — des techniques concrètes avec les feutres Guangna pour transformer votre peinture par numéro d'un rendu plat à un résultat soigné.",
    intro:
      "Posséder les bons feutres n'est que la moitié de l'équation — c'est la façon de les utiliser qui fait la différence entre un rendu plat et figé et un résultat qui semble réellement voulu. Voici un aperçu détaillé des techniques qui donnent une œuvre Guangna by Number soignée.",
    sections: [
      {
        heading: "Construisez la couleur en couches, pas en une seule fois",
        body: "Le plus grand gain de qualité vient du fait de résister à l'envie de saturer complètement une zone en un seul geste. Posez d'abord une fine couche, laissez sécher, puis repassez dessus. La superposition donne une teinte plus riche et plus régulière qu'une pression forte en une seule fois — et cela vous laisse la possibilité de corriger les zones irrégulières au second passage plutôt que de vivre avec.",
      },
      {
        heading: "Du clair au foncé, à chaque fois",
        body: "Appliquez d'abord les couleurs claires suggérées sur une zone, avant les couleurs foncées. Il est bien plus facile d'assombrir une teinte par-dessus une zone claire que d'éclaircir une zone déjà devenue trop sombre.",
      },
      {
        heading: "L'astuce de la couche de base blanche pour les pastels",
        body: "Les roses pâles, jaunes doux et blancs peuvent paraître légèrement transparents directement sur le papier, surtout par-dessus un numéro imprimé. Tapotez d'abord un feutre acrylique blanc sur le numéro, laissez sécher quelques secondes, puis peignez par-dessus. Cette base opaque est ce qui donne aux zones pastel un rendu net plutôt que délavé.",
      },
      {
        heading: "Adaptez votre pointe à la tâche",
        body: "Une pointe biseautée de 3 mm ou une pointe moyenne permet de couvrir rapidement les grandes zones de fond. Passez à une pointe fine de 0,7 mm dès que vous travaillez une petite zone numérotée, un angle serré ou un détail fin — vouloir faire les deux avec la même pointe est la cause la plus fréquente de bords mal nets.",
      },
      {
        heading: "Quand deux couleurs sont suggérées pour une même zone, ce n'est pas une erreur",
        body: "Votre guide de palette propose parfois une alternative créative en plus de la meilleure correspondance technique — c'est intentionnel, pas une erreur à élucider. Cela vous permet d'ajouter une variation subtile ou de la profondeur dans les tons de peau, les ombres ou les détails fins, plutôt que d'aplatir le tout en une seule teinte.",
      },
      {
        heading: "Rattrapage : corriger un trait malencontreux",
        body: "Vous l'avez repéré pendant que c'était encore humide ? Un coton-tige ou un mouchoir légèrement humide, utilisé immédiatement, efface proprement la plupart des petites erreurs. Une fois sec, la meilleure option est généralement de repasser une couche par-dessus plutôt que d'essayer de l'effacer — l'encre acrylique sèche vite.",
      },
      {
        heading: "Gardez vos feutres performants entre deux séances",
        body: "Rangez-les à plat pour que l'encre reste bien répartie, refermez les capuchons dès que vous avez terminé, et si une pointe semble sèche, quelques secousses douces et quelques pressions sur un brouillon suffisent généralement à la réveiller avant de la considérer comme morte.",
      },
    ],
    cta: {
      href: "/tips",
      label: "Voir tous nos conseils et astuces →",
    },
  },

  "convert-coloring-book-legend-to-guangna-markers": {
    title: "Vous avez déjà un livre de coloriage ? Convertissez sa légende de couleurs en feutres Guangna",
    description:
      "Vous avez une page de peinture par numéro venue d'ailleurs, avec sa propre légende de couleurs numérotée ? Voici comment transformer cette légende en guide de feutres Guangna prêt à l'emploi en quelques minutes.",
    intro:
      "Toutes les pages de peinture par numéro que vous possédez ne viennent pas forcément de CreaBeaStudio — et ce n'est pas grave. La plupart des livres de coloriage et pages imprimées de peinture par numéro ont leur propre petite légende de couleurs en bas de page : une rangée d'échantillons, chacun associé à un numéro. Le Legend Converter prend cette légende et vous indique exactement quel feutre Guangna utiliser pour chacune, pour ne plus être coincé à deviner ou à acheter tout un nouveau set de feutres pour correspondre aux codes couleur de quelqu'un d'autre.",
    sections: [
      {
        heading: "1. Téléchargez une photo de la légende",
        body: "Prenez une photo nette et bien éclairée de la légende de couleurs imprimée sur votre page — la rangée ou la grille d'échantillons numérotés, pas toute la page de coloriage. La lumière naturelle du jour donne les meilleurs résultats ; les ombres et l'éclairage intérieur jaunâtre peuvent modifier la perception des couleurs et fausser la correspondance. Si vous avez accès à un scanner, un scan donnera un résultat encore plus précis qu'une photo prise avec un téléphone.",
      },
      {
        heading: "2. Indiquez combien de couleurs convertir",
        body: "Indiquez le nombre d'échantillons numérotés présents dans votre légende. L'outil créera autant de cibles à cliquer — vous n'êtes pas obligé de tous les convertir en une seule fois si vous préférez procéder par lots.",
      },
      {
        heading: "3. Cliquez sur chaque échantillon de votre photo",
        body: "Cliquez sur le numéro sous la photo pour sélectionner l'échantillon sur lequel vous travaillez, puis cliquez sur cette couleur exacte directement sur l'image de la légende. Répétez pour chaque échantillon. Vous n'êtes pas obligé de suivre l'ordre, et vous pouvez recliquer sur n'importe quel numéro à tout moment pour recommencer en cas d'erreur de clic.",
      },
      {
        heading: "4. Optionnel : limitez aux feutres que vous possédez",
        body: "Si vous sélectionnez votre set Guangna spécifique, l'outil vous montre la meilleure correspondance parmi les feutres que vous possédez déjà, ainsi que la meilleure correspondance possible dans toute la gamme Guangna — ainsi, si une couleur plus proche existe en dehors de votre set, vous la verrez et pourrez décider si elle vaut la peine d'être achetée.",
      },
      {
        heading: "5. Faites correspondre, téléchargez, et peignez",
        body: "Une fois tous les échantillons définis, cliquez sur faire correspondre et vous obtiendrez un guide de palette numéroté et net à l'écran — ainsi qu'une version PDF téléchargeable, dans le même style que le guide de palette de couleurs Guangna fourni avec chaque commande personnalisée. Imprimez-le, posez-le à côté de votre page de coloriage, et c'est parti.",
      },
      {
        heading: "Questions fréquentes : Legend Converter",
      },
      {
        heading: "Q : Cela fonctionne-t-il avec n'importe quel livre de peinture par numéro, pas seulement les pages CreaBeaStudio ?",
        body: "Oui. Le Legend Converter ne se soucie pas de l'origine de la page de coloriage — il a seulement besoin d'une photo nette de la légende de couleurs elle-même. Toute page imprimée avec une légende de couleurs numérotée fonctionne, et cela marche même avec toutes sortes d'images et de visuels. Vous pouvez aussi télécharger l'image d'aperçu final de votre livre de coloriage mystère.",
      },
      {
        heading: "Q : Que faire si ma légende contient plus de 70 couleurs environ ?",
        body: "Vous pouvez convertir jusqu'à 72 échantillons dans une seule légende. Au-delà, vous obtiendrez de meilleurs résultats en la divisant en deux passages.",
      },
      {
        heading: "Q : Je ne possède qu'un petit set de feutres — est-ce que cela fonctionnera quand même ?",
        body: "Oui. Sélectionnez votre set et le convertisseur limite sa recommandation principale aux feutres que vous possédez réellement, tout en vous montrant toute option plus proche disponible en dehors de votre set, afin que vous connaissiez toujours toutes vos options.",
      },
      {
        heading: "Q : En quoi est-ce différent du Convertisseur de couleurs classique ?",
        body: "Le Convertisseur de couleurs fait correspondre une seule couleur à la fois — idéal pour vérifier un seul échantillon de peinture ou une seule photo. Le Legend Converter est conçu pour lorsque vous avez toute une légende de couleurs à convertir en une fois, chacune numérotée et suivie jusqu'à un guide final téléchargeable.",
      },
    ],
    cta: {
      href: "/legend-converter",
      label: "Essayer le Legend Converter →",
    },
  },

  "match-languo-markers-to-guangna-codes": {
    title: "Vous possédez des feutres Languo ? Voici comment trouver leur correspondance Guangna la plus proche",
    description:
      "Vous travaillez à partir d'un modèle avec des codes Guangna mais n'avez que des feutres Languo sous la main ? Le convertisseur Languo vers Guangna trouve la correspondance Guangna la plus proche pour n'importe quel code Languo, grâce à un véritable calcul de distance colorimétrique plutôt qu'en comparant des échantillons à l'œil sur un écran.",
    intro:
      "Languo et Guangna utilisent des systèmes de numérotation totalement différents, et aucune des deux marques ne publie de correspondance officielle entre les deux. Si votre guide de peinture demande un code Guangna mais que votre trousse de feutres n'a que des codes Languo imprimés dessus, vous êtes normalement coincé à deviner. Le convertisseur Languo vers Guangna élimine ce problème : saisissez un code Languo, et il vous indique exactement quels feutres Guangna s'en rapprochent le plus — pas à l'œil, mais en mesurant la véritable distance colorimétrique entre eux.",
    sections: [
      {
        heading: "1. Saisissez votre code Languo",
        body: "Saisissez le code exactement tel qu'il est imprimé sur votre feutre, dans le format utilisé pour toute la gamme Languo Art 288 — par exemple, RY-06. Si un code n'est pas reconnu, le convertisseur vous le signale directement plutôt que de ne rien renvoyer silencieusement.",
      },
      {
        heading: "2. Optionnel : limitez aux feutres que vous possédez",
        body: "Dans « Mes feutres », sélectionnez le ou les sets Guangna que vous possédez réellement, ou indiquez des codes individuels supplémentaires. Cela ajoute un second résultat montrant la meilleure correspondance parmi les feutres que vous possédez déjà, en plus de la meilleure correspondance disponible dans toute la gamme Guangna — vous voyez ainsi à la fois ce qui est techniquement le plus proche et ce qui est réellement utilisable dès maintenant.",
      },
      {
        heading: "3. Obtenez vos 3 meilleures correspondances",
        body: "Plutôt qu'une seule « meilleure estimation », vous obtenez les trois codes Guangna les plus proches, classés du plus proche au moins proche. Parfois, le premier résultat s'impose clairement ; d'autres fois, c'est un véritable choix entre deux ou trois options très proches. Voir les trois vous permet de trancher vous-même plutôt que de vous fier aveuglément à un seul chiffre.",
      },
      {
        heading: "Comment fonctionne réellement la correspondance",
        body: "La couleur de chaque feutre part d'une valeur RVB mesurée, mais le RVB seul n'est pas un moyen fiable de juger à quel point deux couleurs paraissent réellement différentes à l'œil humain — deux couleurs peuvent être numériquement très éloignées mais paraître presque identiques, ou l'inverse. Pour corriger cela, le convertisseur convertit d'abord chaque couleur dans l'espace colorimétrique Lab, conçu spécifiquement pour que la distance numérique corresponde bien plus fidèlement à la distance visuelle que ne le fait le RVB. Il mesure ensuite la distance entre les couleurs à l'aide du Delta E (CIE 1976), une formule standard exprimant en un seul chiffre à quel point deux couleurs paraissent différentes — plus le chiffre est petit, plus la correspondance visuelle est proche.",
      },
      {
        heading: "Questions fréquentes : convertisseur Languo vers Guangna",
      },
      {
        heading: "Q : Qu'est-ce que le Delta E, en termes simples ?",
        body: "C'est une méthode standard pour mesurer à quel point deux couleurs paraissent différentes à l'œil humain, exprimée en un seul chiffre. Un Delta E plus bas signifie que les couleurs sont visuellement plus proches — c'est le même calcul que les scientifiques des couleurs et les imprimeurs utilisent pour juger de la précision colorimétrique.",
      },
      {
        heading: "Q : Pourquoi 3 correspondances au lieu d'une seule ?",
        body: "Parce que parfois, une seule meilleure correspondance se démarque clairement, et parfois deux ou trois feutres sont tous extrêmement proches. En montrer trois vous permet de décider vous-même plutôt que de vous fier à un seul chiffre quand la réalité est plus proche d'une égalité.",
      },
      {
        heading: "Q : La couleur imprimée correspondra-t-elle exactement ?",
        body: "Elle sera très proche, mais un rendu pixel-perfect n'est pas garanti. Les couleurs d'écran et l'encre imprimée sous un éclairage réel ne sont jamais parfaitement identiques, et les lots d'encre, le type de papier et l'âge du feutre introduisent tous de petites variations. Testez toujours sur un brouillon avant de vous engager sur une grande zone.",
      },
      {
        heading: "Q : Et si je ne possède encore aucun feutre Guangna ?",
        body: "Vous obtiendrez quand même les 3 meilleures correspondances générales — l'étape « Mes feutres » est entièrement optionnelle et ne fait qu'ajouter un second résultat, plus restreint, en complément.",
      },
      {
        heading: "Q : En quoi est-ce différent du Convertisseur de couleurs ?",
        body: "Le Convertisseur de couleurs fait correspondre un code hexadécimal, une valeur RVB ou une couleur photographiée — n'importe quelle couleur unique que vous lui donnez. Cet outil est spécifiquement destiné aux cas où vous partez d'un code Languo et souhaitez son équivalent Guangna.",
      },
    ],
    cta: {
      href: "/languo-converter",
      label: "Essayer le convertisseur Languo vers Guangna →",
    },
  },

  "create-custom-guangna-languo-swatch-cards": {
    title: "Créez vos propres cartes d'échantillons imprimables pour vos feutres Guangna et Languo",
    description:
      "Une carte d'échantillons vous montre exactement à quoi ressemble chaque feutre une fois posé sur le papier, organisée pour que vous trouviez la teinte voulue sans devoir déboucher vingt feutres. Voici comment créer la vôtre, et comment fonctionne réellement l'organisation des couleurs derrière cet outil.",
    intro:
      "Une carte d'échantillons est l'outil le plus simple que possède un artiste feutre : une référence physique montrant la couleur réelle posée par chaque feutre, organisée pour que trouver la bonne teinte se résume à feuilleter rapidement la carte plutôt qu'à chercher parmi des échantillons non triés. Le créateur de cartes d'échantillons DIY les génère pour vous — à partir de n'importe quel set Guangna, n'importe quel set Languo, de codes individuels, ou de toute une famille de couleurs — et les transforme en cartes PDF prêtes à imprimer.",
    sections: [
      {
        heading: "1. Choisissez votre source",
        body: "Cinq onglets vous permettent de récupérer des couleurs où qu'elles se trouvent : un set Guangna complet, des codes Guangna individuels par recherche, un set Languo complet, des codes Languo individuels, ou une famille de couleurs entière, quelle que soit la marque. Glissez les couleurs dans votre sélection ou cliquez simplement dessus — tout ce que vous ajoutez apparaît regroupé par famille, avec des contrôles de téléchargement et de suppression par famille, et une fonction annuler si vous supprimez quelque chose par erreur.",
      },
      {
        heading: "2. Définissez les options de votre carte",
        body: "Choisissez des échantillons remplis (montrant la couleur réelle) ou des contours vides à colorier vous-même comme référence. Ajoutez un trou de perforation optionnel en haut de la carte — à gauche, au centre ou à droite — pour pouvoir enfiler une pile de cartes sur un anneau de classeur. Choisissez une famille de couleurs par carte, ou regroupez plusieurs familles sur une carte avec une étiquette intégrée à chaque changement de famille. Choisissez ensuite un format de papier A4 ou US Letter.",
      },
      {
        heading: "3. Téléchargez et imprimez",
        body: "Chaque carte contient jusqu'à 12 échantillons, à raison de 4 cartes par page en format paysage. Chaque échantillon comporte un repère de perforation en son centre — non pas pour la reliure, mais pour pouvoir tenir le feutre réel derrière la carte et comparer directement la couleur imprimée à travers le trou. Si une famille ne se divise pas exactement en cartes complètes, l'espace restant est rempli d'échantillons vierges plutôt que d'être laissé vide.",
      },
      {
        heading: "Comment les familles de couleurs ont été construites",
        body: "L'ordre dans lequel les couleurs apparaissent est ce qui rend une carte d'échantillons réellement utile — pas seulement une grille de carrés colorés, mais des couleurs regroupées selon la façon dont l'œil perçoit réellement la couleur. Chaque feutre a été classé dans l'une des neuf familles (Blanc/Gris/Noir, Marron/Terre, Rose, Rouge, Orange, Jaune, Vert, Bleu, Violet/Pourpre) à travers trois passages : d'abord, la conversion de la valeur RVB de chaque couleur en TSL pour séparer la teinte de la luminosité, ce qui permet de trier du clair au foncé au sein d'une famille ; ensuite, un croisement de ces valeurs avec les conventions de nommage d'origine des marques, car les regroupements d'un fabricant traduisent souvent une véritable intention ; et enfin, une révision visuelle manuelle pour corriger les cas où le calcul pur donnait un ordre techniquement correct mais visuellement maladroit. Les couleurs qui se situent réellement entre deux familles — un bleu-vert vif, par exemple — sont incluses dans les deux, plutôt que forcées dans un seul choix. Les feutres métallisés sont la seule exception, exclus du regroupement par famille car ils fonctionnent différemment de l'encre standard.",
      },
      {
        heading: "Imprimer et assembler vos cartes",
        body: "Utilisez du papier cartonné épais, 200 à 300 g/m², fini mat ou satiné — le papier ordinaire pour imprimante bavera et gondolera sous une encre chargée. Réglez la mise à l'échelle d'impression sur « Taille réelle » ou 100 %, jamais « Ajuster à la page », qui déforme les repères de découpe, et désactivez toute amélioration automatique des couleurs pour que la couleur imprimée reste fidèle. Une règle en métal, un cutter et un tapis de découpe donnent les bords les plus nets, même si des ciseaux conviennent aussi. Utilisez une perforatrice pour retirer proprement le cercle central de chaque échantillon, et enfilez les cartes terminées sur un anneau de classeur si vous avez ajouté un trou en en-tête.",
      },
      {
        heading: "Questions fréquentes : créateur de cartes d'échantillons",
      },
      {
        heading: "Q : Pourquoi les échantillons ne sont-ils pas simplement triés mathématiquement par teinte ?",
        body: "C'est ainsi qu'ils ont commencé, mais le calcul pur peut placer côte à côte deux couleurs numériquement proches mais visuellement discordantes. La révision visuelle finale sacrifie la précision mathématique stricte au profit d'une carte qui se lit réellement comme un dégradé fluide à l'œil.",
      },
      {
        heading: "Q : À quoi servent les échantillons vierges supplémentaires ?",
        body: "Lorsqu'une famille de couleurs ne se divise pas exactement en cartes complètes, l'espace restant est rempli d'échantillons vierges plutôt que laissé vide — réellement utile si vous souhaitez un jour ajouter votre propre couleur.",
      },
      {
        heading: "Q : À quoi sert le trou de perforation au centre de chaque échantillon ?",
        body: "Ce n'est pas pour la reliure — c'est pour pouvoir tenir le feutre réel derrière la carte imprimée et comparer l'encre réelle à la couleur imprimée directement à travers le trou.",
      },
      {
        heading: "Q : Puis-je créer une carte avec une seule famille de couleurs ?",
        body: "Oui — utilisez l'onglet Famille de couleurs pour ne récupérer que la famille souhaitée, quelle que soit la marque.",
      },
      {
        heading: "Q : Dois-je créer la mienne, ou existe-t-il des options prêtes à l'emploi ?",
        body: "Des packs prêts à l'emploi sont disponibles pour les tailles de sets Guangna et Languo les plus populaires, construits selon ce même système de familles de couleurs, chacun incluant un modèle coloré prédéfini, un modèle vierge à colorier soi-même, et une fiche de référence compacte.",
      },
    ],
    cta: {
      href: "/swatch-creator",
      label: "Essayer le créateur de cartes d'échantillons DIY →",
    },
  },
};

export const GUIDES_DATA = {
  en: EN_GUIDES,
  fr: FR_GUIDES,
};

// Every guide slug that exists, based on the English master list. Used
// by generateStaticParams (so every locale gets a route for every
// guide, even before it's translated) and by the hub page's listing.
export function getAllSlugs() {
  return Object.keys(GUIDES_DATA.en);
}

// A single guide, honoring locale with an English fallback -- so a
// locale can have translations for only some slugs, and the rest just
// silently show English rather than 404ing or showing blank content.
export function getGuide(locale, slug) {
  return GUIDES_DATA[locale]?.[slug] ?? GUIDES_DATA.en[slug] ?? null;
}

// The full guide listing for a locale (English guide used per-slug
// wherever that locale doesn't have its own translated entry yet) --
// used by the hub page so it can list every guide regardless of how
// much of a given locale has been translated so far.
export function getGuidesForLocale(locale) {
  return getAllSlugs().map((slug) => [slug, getGuide(locale, slug)]);
}