import Navbar from "../components/Navbar";

const FAQS = [
  { q:"What do I receive after placing an order?", a:"You will receive a complete digital package: a Paint by Number Outline (PDF), a Custom Guangna Color Palette Guide, and a Finished Artwork Impression (PDF). Please note: this is a custom digital artwork — no physical items will be shipped." },
  { q:"How long does it take to receive my design?", a:"Your files will be delivered to your inbox within 24 hours after we receive your photo (but usually much faster)." },
  { q:"What file formats can I upload?", a:"We accept JPG, PNG, WEBP, and HEIC. Most phone photos work perfectly." },
  { q:"What kind of photo works best?", a:"Use clear, high-resolution images with good lighting and subject in focus. Avoid blurry, dark, or heavily detailed photos. No screenshots or cropped pictures." },
  { q:"How long do you store my pictures?", a:"Your files are securely stored for 30 days, then permanently deleted." },
  { q:"What skill level is this suitable for?", a:"Our templates suit Beginner, Intermediate, and Advanced creators. If unsure, choose Intermediate — it's the best balance between detail and relaxing difficulty." },
  { q:"Why do I need to enter which Guangna sets I have?", a:"So we can build a palette using only the markers you own — no guesswork, no missing colors." },
  { q:"My marker color doesn't match the palette guide?", a:"Minor shade variations can occur due to ink batch differences, printing quality, or paper absorption. Your guide provides the best-match recommendation." },
  { q:"How do I print my coloring page?", a:"Print at home or at a local print shop. Use thicker paper (160-200 gsm), print at 100% scale, designed for A4 or Letter size." },
  { q:"Do you offer refunds?", a:"Due to the personalised digital nature of our products, refunds cannot be accepted once design work has started." },
  { q:"What makes CreaBeaStudio different?", a:"We specialise in custom coloring pages tailored specifically for Guangna brush markers — so you can start coloring immediately, without the time-consuming color selection task." },
];

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:40 }}>
        Frequently Asked Questions 
        ♥Color Your Memories ♥
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
