import Navbar from "../components/Navbar";

const SECTIONS = [
  {
    title: "🐾 Before You Start",
    tips: [
      { q: "Shake Before Use", a: "Shake the marker well and test until the ink flows evenly to avoid streaky lines. Gently press the nib on scrap paper until fully saturated. Never prime your markers directly on your coloring page, as this can cause large blobs and ruin a section." },
      { q: "Always Test First", a: "Colors may appear differently on various surfaces. Do a quick test before starting your final piece." },
    ]
  },
  {
    title: "🐾 Creative Control & Coloring Techniques",
    tips: [
      { q: "Creative Choice", a: "At times, more than one color may be suggested for the same area. This is intentional — giving you the freedom to enhance detail, shading, and variation, while letting your creativity shape a beautiful final result." },
      { q: "Work Light → Dark", a: "Begin with lighter colors and gradually move to darker shades for better control and more natural blending." },
      { q: "Use Light Pressure", a: "Create smooth, clean lines using gentle pressure. Apply more pressure only for thicker strokes — avoid forcing the tip." },
      { q: "Layer for Better Results", a: "Build up color in layers, allowing each layer to dry. This creates richer tones, smoother coverage, and helps correct small mistakes." },
      { q: "Blend with Timing", a: "Blend while the paint is still wet for soft gradients, or layer after drying for sharper contrast and definition." },
      { q: "Add Highlights for Depth", a: "Use white, lighter, or metallic tones on top to create highlights and achieve a more polished, professional finish." },
      { q: "Vary Your Marker Tips", a: "Use a 3mm medium or chisel tip to quickly fill large background areas. Switch to a 0.7mm extra-fine tip for tight corners, small numbers, and intricate details." },
      { q: "White Base Layer Trick", a: "Light colors like pastel pinks, yellows, and whites can be slightly transparent. Before coloring, tap a white acrylic marker over the printed number. Let it dry briefly to create an opaque base, then apply your chosen color on top." },
      { q: "Fix Mistakes While Wet", a: "If you color outside the lines, quickly wipe with a slightly damp tissue or cotton swab before the paint dries." },
    ]
  },
  {
    title: "🐾 Tools & Care",
    tips: [
      { q: "Keep the Tip Clean", a: "Wipe the tip occasionally to prevent color mixing and keep your shades crisp and accurate." },
      { q: "Store Horizontally", a: "Store markers horizontally to keep ink evenly distributed and ensure consistent flow." },
      { q: "Close Caps Tightly", a: "Always close your markers immediately after use to prevent them from drying out." },
      { q: "Revive a Dry Tip", a: "If a marker feels dry, gently shake it and press the nib on scrap paper to reactivate the flow before use." },
    ]
  },
];

export default function TipsAndTricks() {
  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:8 }}>
           Tips & Tricks 
           ♥Color Your Memories ♥
        </h1>


        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:48 }}>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:24, color:"var(--pink)", marginBottom:24 }}>
              {section.title}
            </h2>
            {section.tips.map((tip, ti) => (
              <div key={ti} style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid var(--border)" }}>
                <h3 style={{ fontWeight:800, fontSize:17, marginBottom:6, color:"var(--ink)" }}>{tip.q}</h3>
                <p style={{ color:"#555", fontSize:16, lineHeight:1.7 }}>{tip.a}</p>
              </div>
            ))}
          </div>
        ))}

        <div style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ color:"#666", marginBottom:16 }}>Still have questions?</p>
          <a href="mailto:hello@CreaBeaStudio.com" className="btn-primary" style={{ display:"inline-flex" }}>
            Contact us
          </a>
        </div>
      </main>
    </>
  );
}