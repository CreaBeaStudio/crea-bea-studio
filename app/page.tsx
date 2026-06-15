import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  { icon: "📸", title: "Your favourite photo" },
  { icon: "🎨", title: "No more guessing colours" },
  { icon: "✏️", title: "Made for your Guangna markers", isGuangna: true },
];

const HOW = [
  { step: "01", label: "Upload", desc: "Drop in any photo. We handle the rest." },
  { step: "02", label: "Choose", desc: "Pick your Guangna markers and skill level." },
  { step: "03", label: "Order", desc: "" },
  { step: "04", label: "Color", desc: "Download, Print & Have fun" },
];

const LEVELS = [
  { name: "Beginner", desc: "Ideal for your first Guangna by Number. Bold regions, easy fills.", emoji: "🌱", img: "/detail-beginner.png" },
  { name: "Intermediate", desc: "More shading & detail. Great for portraits.", emoji: "🌿", img: "/detail-int.png" },
  { name: "Advanced", desc: "Professional depth and colour richness.", emoji: "🌲", img: "/detail-adv.png" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── HERO ── */}
        <section style={{ background:"linear-gradient(135deg,#FDF6F0 60%,#FFE8EE 100%)", padding:"80px 24px 60px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
            <div>
              <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:16 }}>
                🐾 CreaBea Studio
              </p>
              <h1 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(36px,5.5vw,58px)", lineHeight:1.1, marginBottom:24 }}>
                Turn your photo into<br />
                <span style={{ color:"#FF4D6D" }}>Guangna by Number</span><br />
                artwork
              </h1>
              <p style={{ fontSize:18, color:"#444", maxWidth:480, marginBottom:32, lineHeight:1.7 }}>
                Turn your favourite photos into paint-by-number colouring pages with a personalised Guangna marker colour palette guide.
              </p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40 }}>
                <a href="/create" className="btn-primary" style={{ fontSize:17, padding:"16px 36px" }}>
                  Create your Guangna By Number →
                </a>
                <a href="/examples" className="btn-outline">See examples</a>
              </div>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {FEATURES.map(f => (
                  <div key={f.title} style={{
                    background:"white", borderRadius:14, padding:"16px 20px",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.06)", flex:"1 1 130px"
                  }}>
                    {f.isGuangna
                      ? <Image src="/guangna-marker.png" alt="Guangna marker" width={36} height={24} style={{ objectFit:"contain", marginBottom:6 }} />
                      : <div style={{ fontSize:26, marginBottom:6 }}>{f.icon}</div>
                    }
                    <div style={{ fontWeight:700, fontSize:14 }}>{f.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image panel */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
              <p style={{ textAlign:"center", fontWeight:700, fontSize:17, color:"#333", maxWidth:380, lineHeight:1.5 }}>
                Take the guesswork out of color selection — just pick up your Guangna markers and start coloring.
              </p>
              <div style={{ position:"relative", display:"flex", justifyContent:"center", width:"100%" }}>
                {/* "From this" with flipped arrow (pointing right toward image) */}
                <div style={{
                  position:"absolute", left:0, top:"50%", transform:"translateY(-60%)",
                  display:"flex", alignItems:"center", gap:4, fontSize:15, fontWeight:600, color:"#555"
                }}>
                  <span>From this</span>
                  <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                    <path d="M5 15 Q30 5 55 15" stroke="#999" strokeWidth="2" fill="none"/>
                    <polygon points="52,11 58,15 52,19" fill="#999"/>
                  </svg>
                </div>
                <div style={{
                  background:"white", borderRadius:24, padding:16,
                  boxShadow:"0 20px 60px rgba(244,96,122,0.15)",
                  transform:"rotate(2deg)", maxWidth:460
                }}>
                  <Image src="/dog-legends.png" alt="Sample PBN photo" width={460} height={460}
                    style={{ borderRadius:16, objectFit:"cover", width:"100%", height:"auto" }} />
                </div>
              </div>
              {/* "to this" box — bigger font, bigger box */}
              <div style={{
                background:"var(--pink)", color:"white",
                borderRadius:16, padding:"14px 28px",
                fontWeight:700, fontSize:19, textAlign:"center",
              }}>
                <strong>to this</strong> — Guangna by Number with personalised palette
              </div>
            </div>
          </div>
        </section>

        {/* ── GUANGNA COLOR CONVERTER (after hero, no logo) ── */}
        <section style={{
          padding:"60px 24px",
          background:"linear-gradient(135deg,var(--pink) 0%,#c2185b 100%)",
          color:"white", textAlign:"center"
        }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(24px,4vw,36px)", marginBottom:16 }}>
              🎨 Guangna Color Converter
            </h2>
            <p style={{ fontSize:17, opacity:0.9, marginBottom:28 }}>
              Do you have a #HEX, RGB or a picture? Find the closest Guangna color instantly.
            </p>
            <Link href="/color-converter" style={{
              background:"white", color:"var(--pink)",
              borderRadius:50, padding:"14px 32px",
              fontWeight:700, fontSize:16,
              textDecoration:"none", display:"inline-block"
            }}>
              Open Guangna Color Converter →
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:"80px 24px", background:"white" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <p style={{ textAlign:"center", color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>Process</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", textAlign:"center", marginBottom:56 }}>
              How it Works
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:32 }}>
              {HOW.map(h => (
                <div key={h.step} style={{ textAlign:"center" }}>
                  <div style={{
                    width:60, height:60, borderRadius:"50%",
                    background:"linear-gradient(135deg,var(--pink),var(--pink-light))",
                    color:"white", fontFamily:"Nunito, sans-serif", fontWeight:900,
                    fontSize:20, display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 16px", boxShadow:"0 4px 16px rgba(244,96,122,0.3)"
                  }}>{h.step}</div>
                  <h3 style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>{h.label}</h3>
                  {h.desc && <p style={{ color:"#666", fontSize:15 }}>{h.desc}</p>}
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center", marginTop:48 }}>
              <a href="/create" className="btn-primary" style={{ fontSize:17, padding:"16px 36px" }}>
                Create your Guangna by Number page
              </a>
            </div>
          </div>
        </section>

        {/* ── SKILL LEVELS ── */}
        <section style={{ padding:"80px 24px", background:"var(--cream)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <p style={{ textAlign:"center", color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>Choose your level</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", textAlign:"center", marginBottom:16 }}>
              From beginner to advanced
            </h2>
            <p style={{ textAlign:"center", color:"#666", fontSize:16, maxWidth:500, margin:"0 auto 48px" }}>
              Select how many Guangna colours you want in your palette — more colours means more detail.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
              {LEVELS.map(l => (
                <div key={l.name} className="card" style={{
                  textAlign:"center", padding:32,
                  border: l.name==="Intermediate" ? "2px solid var(--pink)" : "2px solid transparent",
                  position:"relative", borderRadius:20
                }}>
                  {l.name==="Intermediate" && (
                    <div style={{
                      position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                      background:"var(--pink)", color:"white",
                      borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700
                    }}>Most Popular</div>
                  )}
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                    <Image src={l.img} alt={`${l.name} detail`} width={180} height={180}
                      style={{ borderRadius:16, objectFit:"cover", border:"3px solid #eee" }} />
                  </div>
                  <div style={{ fontSize:32, marginBottom:8 }}>{l.emoji}</div>
                  <h3 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:24, marginBottom:12 }}>{l.name}</h3>
                  <p style={{ color:"#555", fontSize:15, marginBottom:24 }}>{l.desc}</p>
                  <a href="/create" className="btn-primary" style={{ width:"100%", display:"flex", justifyContent:"center" }}>
                    Try {l.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background:"var(--ink)", color:"#aaa", padding:"40px 24px", textAlign:"center" }}>
          <div style={{ marginBottom:16 }}>
            <Image src="/logo-full.png" alt="CreaBea Studio" width={120} height={120} style={{ objectFit:"contain" }} />
          </div>
          <p style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:20, color:"var(--pink)", marginBottom:8 }}>
            CreaBea Studio
          </p>
          <p style={{ fontSize:14 }}>Color your memories, one number at a time. 🐾</p>
          <div style={{ marginTop:16, display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap", fontSize:13 }}>
            <a href="/create" style={{ color:"#aaa", textDecoration:"none" }}>Create</a>
            <a href="/color-converter" style={{ color:"#aaa", textDecoration:"none" }}>Color Converter</a>
            <a href="/examples" style={{ color:"#aaa", textDecoration:"none" }}>Examples</a>
            <a href="/faq" style={{ color:"#aaa", textDecoration:"none" }}>FAQ</a>
          </div>
          <p style={{ marginTop:20, fontSize:12, opacity:0.5 }}>© {new Date().getFullYear()} CreaBea Studio. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
