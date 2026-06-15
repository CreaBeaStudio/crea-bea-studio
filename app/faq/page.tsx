import Navbar from "../components/Navbar";

const FAQS = [
  { q:"What file formats can I upload?", a:"We accept JPG, PNG, WEBP, and HEIC. Most phone photos work perfectly." },
  { q:"How long does generation take?", a:"Usually 30–60 seconds depending on image complexity and chosen detail level." },
  { q:"Can I use my own Guangna marker selection?", a:"Yes! Select which sections/sets you own, or type individual pen codes separated by commas." },
  { q:"What does Beginner / Intermediate / Advanced mean?", a:"These map to 15, 24, or 36 Guangna colours in your palette. More colours = more shading and detail." },
  { q:"Do I need a Lemon Squeezy account to order?", a:"No — Lemon Squeezy handles checkout as a guest. You'll receive a download link by email." },
  { q:"Can I try before I buy?", a:"Yes! The preview on the Create page is free. You only pay to download the full-resolution print-ready file." },
  { q:"What markers does this work with?", a:"Exclusively with Guangna alcohol markers. Our colour catalogue covers the full Guangna range." },
];

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:40 }}>
          Frequently Asked Questions
        </h1>
        {FAQS.map((f,i)=>(
          <div key={i} style={{ marginBottom:28, paddingBottom:28, borderBottom:"1px solid var(--border)" }}>
            <h2 style={{ fontWeight:800, fontSize:18, marginBottom:8, color:"var(--ink)" }}>{f.q}</h2>
            <p style={{ color:"#555", fontSize:16, lineHeight:1.7 }}>{f.a}</p>
          </div>
        ))}
        <div style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ color:"#666", marginBottom:16 }}>Still have questions?</p>
          <a href="mailto:hello@creabeastudio.com" className="btn-primary" style={{ display:"inline-flex" }}>
            Contact us
          </a>
        </div>
      </main>
    </>
  );
}
