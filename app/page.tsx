import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  { icon: "📸", title: "Your favourite photo" },
  { icon: "🎨", title: "No more guessing colors" },
  { icon: "✏️", title: "Made for your Guangna markers", isGuangna: true },
];

const HOW = [
  { step: "01", label: "Upload", desc: "Upload any photo. We'll take care of the rest." },
  { step: "02", label: "Choose", desc: "Select your Guangna markers and skill level." },
  { step: "03", label: "Order", desc: "We create your custom Guangna by Number file" },
  { step: "04", label: "Color", desc: "Download, print, and start coloring!" },
];

const LEVELS = [
  { name: "Beginner", desc: "Ideal for your first Guangna by Number. Fewer colors, larger areas, easy and relaxing coloring.", emoji: "🌱", img: "/detail-beginner.png" },
  { name: "Intermediate", desc: "Balanced mix of effort and detail. More colors, shading and detail give you more variety.", emoji: "🌿", img: "/detail-int.png" },
  { name: "Advanced", desc: "A wider color range, intricate areas, more depth and color richness.", emoji: "🌲", img: "/detail-adv.png" },
];

const WHAT_YOU_GET = [
  { feature: "Paint by Number Outline (PDF)", beginner: true, intermediate: true, advanced: true },
  { feature: "Guangna Color Palette Guide (PDF)", beginner: true, intermediate: true, advanced: true },
  { feature: "Impression Finished Artwork (PDF)", beginner: true, intermediate: true, advanced: true },
  { feature: "Impression Finished Artwork (JPG)", beginner: false, intermediate: true, advanced: true },
  { feature: "Colored Paint by Number Outline (PDF)", beginner: false, intermediate: false, advanced: true },
];

export default function Home() {
  return (
    <>
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          align-items: end;
          alignItems:"flex-end"
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .hero-cta {
          font-size: 17px;
          padding: 16px 36px;
          width: 100%;
          max-width: 432px;
          text-align: center;
        }
        .hero-outline {
          font-size: 17px;
          padding: 16px 36px;
        }
        .from-this-label {
          color: var(--pink);
          position: absolute;
          left: -70px;
          top: 10%;
          transform: translateY(-60%);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 28px;
          font-weight: 600;
        }
        .palette-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .feature-cards {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .feature-card {
          background: white;
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          flex: 1 1 130px;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hero-cta {
            max-width: 100%;
            font-size: 15px;
            padding: 14px 20px;
          }
          .hero-outline {
            font-size: 15px;
            padding: 14px 20px;
            width: 100%;
            text-align: center;
          }
          .hero-buttons {
            flex-direction: column;
          }
          .from-this-label {
            position: static;
            transform: none;
            margin-bottom: 8px;
            font-size: 20px;
            justify-content: center;
          }
          .palette-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .feature-cards {
            gap: 10px;
          }
          .feature-card {
            flex: 1 1 calc(50% - 10px);
          }
        }
      `}</style>

      <Navbar />
      <main>
        {/* ── HERO ── */}
        <section style={{ background:"linear-gradient(135deg,#FDF6F0 60%,#FFE8EE 100%)", padding:"80px 24px 60px" }}>
          <div style={{ maxWidth:1400, margin:"0 auto" }} className="hero-grid">
            <div>
              <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:16, marginBottom:16 }}>
                🐾 CreaBeaStudio
              </p>
              <h1 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(36px,5.5vw,58px)", lineHeight:1.1, marginBottom:24 }}>
                Turn your photo into<br />
                <span style={{ color:"#FF4D6D" }}>Guangna by Number</span><br />
                artwork
              </h1>
              <p style={{ fontSize:"clamp(16px,2.5vw,24px)", color:"#444", maxWidth:550, marginBottom:32, lineHeight:1.7 }}>
                Take the guesswork out of color selection - just pick up your Guangna brush markers and start coloring.
              </p>
              <div className="hero-buttons">
                <a href="/create" className="btn-primary hero-cta">
                  Create your Guangna By Number →
                </a>
                <a href="/examples" className="btn-outline hero-outline">See examples</a>
              </div>
              <div className="feature-cards">
                {FEATURES.map(f => (
                  <div key={f.title} className="feature-card">
                    {f.isGuangna
                      ? <Image src="/guangna-marker.png" alt="Guangna marker" width={45} height={30} style={{ objectFit:"contain", marginBottom:6 }} />
                      : <div style={{ fontSize:26, marginBottom:6 }}>{f.icon}</div>
                    }
                    <div style={{ fontWeight:700, fontSize:14 }}>{f.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image panel */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
              <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", width:"100%" }}>
                <div className="from-this-label">
                </div>
                <div style={{
                  background:"white", borderRadius:24, padding:16,
                  boxShadow:"0 20px 60px rgba(244,96,122,0.15)",
                  maxWidth:800, width:"100%"
                }}>
                 <Image src="/Dog_Legend3.png" alt="Sample PBN photo" width={800} height={800} 
                    style={{ borderRadius:16, objectFit:"cover", width:"100%", height:"600", minHeight:200, maxWidth:"100%" }} />
                </div>
              </div>
              <div style={{
                background:"var(--pink)", color:"white",
                borderRadius:16, padding:"16px 28px",
                fontWeight:700, fontSize:"clamp(16px,2vw,22px)", textAlign:"center",
                display:"flex", alignItems:"center", justifyContent:"center",
                width:"100%", maxWidth:800, marginTop:16
              }}>
                <strong>Guangna by Number <br /> with colour palette matched to your brush markers complete with Guangna codes and numbers.</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── GUANGNA COLOR CONVERTER ── */}
        <section style={{
          padding:"60px 24px",
          background:"linear-gradient(135deg,var(--pink) 0%,#c2185b 100%)",
          color:"white", textAlign:"center"
        }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(24px,4vw,36px)", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
  <Image src="/Guangna_brush.png" alt="Guangna_brush" width={120} height={84} style={{ objectFit:"contain" }} />
  Guangna Color Converter
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
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:32 }}>
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
              Higher levels include more colors and finer details — choose the level that suits you.
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
                    <Image src={l.img} alt={`${l.name} detail`} width={350} height={250}
                      style={{ borderRadius:10, objectFit:"cover", border:"3px solid #eee", width:"100%", height:"auto" }} />
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

        {/* ── WHAT IS THE GUANGNA COLOR PALETTE GUIDE? ── */}
        <section style={{ padding:"80px 24px", background:"white" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }} className="palette-grid">

            {/* Left: text */}
            <div>
              <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>Included with every order</p>
              <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(26px,4vw,38px)", marginBottom:24, lineHeight:1.2 }}>
                What is the Guangna<br />Color Palette Guide?
              </h2>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                The Guangna Color Palette Guide is your <strong>personalized roadmap to effortless, beautiful coloring</strong> — tailored specifically to the Guangna markers you own.
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                No more guessing which colors to use. No more creating test swatches or comparing endless shades. This guide removes the uncertainty and lets you jump straight into what you love: coloring.
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                Each section of your Guangna by Number design is matched with the best-fitting Guangna marker from <strong>your personal set</strong>, ensuring accurate and satisfying results every time. At times, you'll find creative color options — giving you the freedom to add subtle shading, depth, and dimension.
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:24 }}>
                Simply get your markers ready, follow the guide, and start coloring with confidence.
              </p>
              <p style={{ fontSize:17, fontWeight:800, color:"var(--pink)" }}>
                On your mark. Pick up your markers. Get set… and color.{" "}
                <Image src="/guangna-marker.png" alt="Guangna marker" width={150} height={100} style={{ objectFit:"contain", marginBottom:6 }} />
              </p>
            </div>

            {/* Right: palette guide image */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
              <div style={{
                background:"linear-gradient(160deg,#8B6347 0%,#A0714F 30%,#7A5230 60%,#9C6D3E 100%)",
                borderRadius:20,
                padding:32,
                boxShadow:"0 20px 60px rgba(0,0,0,0.35)",
                width:"100%",
                maxWidth:520,
              }}>
                <div style={{ position:"relative" }}>
                  <div style={{
                    background:"white",
                    borderRadius:4,
                    boxShadow:"0 8px 32px rgba(0,0,0,0.4), 2px 2px 0 rgba(255,255,255,0.3)",
                    overflow:"hidden",
                    aspectRatio:"1.414 / 1",
                    width:"100%",
                    transform:"rotate(-1.5deg)",
                  }}>
                    <Image
                      src="/GN_Palette_landscape.png"
                      alt="Guangna Color Palette Guide"
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 90vw, 50vw"
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                    />
                  </div>
                  <div style={{
                    position:"absolute", bottom:-6, left:"5%", right:"5%",
                    height:12, background:"rgba(0,0,0,0.25)",
                    borderRadius:"0 0 8px 8px", filter:"blur(6px)", zIndex:-1,
                  }}/>
                </div>
              </div>
            </div>

          </div>
        </section>

               {/* ── WHAT DO YOU GET? ── */}
               <section style={{ padding:"80px 24px", background:"var(--cream)" }}>
          <style>{`
            .wdyg-table { display: block; }
            .wdyg-cards { display: none; }
            @media (max-width: 768px) {
              .wdyg-table { display: none; }
              .wdyg-cards { display: flex; flex-direction: column; gap: 16px; }
            }
          `}</style>

          <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
            <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>Every order includes</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", marginBottom:48 }}>
              What do you get?
            </h2>

            {/* ── DESKTOP: Table ── */}
            <div className="wdyg-table" style={{
              background:"white", borderRadius:20,
              boxShadow:"0 8px 40px rgba(0,0,0,0.08)",
              overflow:"auto", maxWidth:780, margin:"0 auto 40px",
            }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:15, minWidth:480 }}>
                <thead>
                  <tr>
                    <th style={{ padding:"16px 20px", textAlign:"left", background:"#f5f5f5", fontWeight:700, color:"#444" }} />
                    {["Beginner","Intermediate","Advanced"].map(level => (
                      <th key={level} style={{
                        padding:"16px 12px", textAlign:"center",
                        background:"var(--pink)", color:"white",
                        fontFamily:"Nunito, sans-serif", fontWeight:800, fontSize:14,
                      }}>{level}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WHAT_YOU_GET.map((row, i) => (
                    <tr key={row.feature} style={{ borderTop: i === 0 ? "none" : "1px solid #eee" }}>
                      <td style={{ padding:"14px 16px", textAlign:"left", fontWeight:600, color:"#333", background:"#fafafa", fontSize:13 }}>
                        {row.feature}
                      </td>
                      {(["beginner","intermediate","advanced"] as const).map(level => (
                        <td key={level} style={{ padding:"14px 12px", textAlign:"center" }}>
                          <input type="checkbox" checked={row[level]} readOnly
                            aria-label={`${row.feature} — ${level}`}
                            style={{ width:20, height:20, accentColor:"var(--pink)", cursor:"default" }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE: Cards per level ── */}
            <div className="wdyg-cards">
              {([
                { level: "beginner" as const, name: "Beginner", emoji: "🌱" },
                { level: "intermediate" as const, name: "Intermediate", emoji: "🌿", popular: true },
                { level: "advanced" as const, name: "Advanced", emoji: "🌲" },
              ]).map(({ level, name, emoji, popular }) => (
                <div key={name} style={{
                  background:"white",
                  borderRadius:20,
                  border: popular ? "2px solid var(--pink)" : "2px solid #eee",
                  padding:"24px 20px",
                  position:"relative",
                  textAlign:"left",
                }}>
                  {popular && (
                    <div style={{
                      position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                      background:"var(--pink)", color:"white",
                      borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700,
                      whiteSpace:"nowrap",
                    }}>Most Popular</div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                    <span style={{ fontSize:28 }}>{emoji}</span>
                    <span style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:22, color:"var(--ink)" }}>{name}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {WHAT_YOU_GET.map(row => (
                      <div key={row.feature} style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"10px 14px", borderRadius:12,
                        background: row[level] ? "rgba(244,96,122,0.06)" : "#fafafa",
                      }}>
                        <span style={{ fontSize:14, fontWeight:600, color: row[level] ? "var(--ink)" : "#aaa" }}>
                          {row.feature}
                        </span>
                        <span style={{ fontSize:20, marginLeft:12 }}>
                          {row[level] ? "✅" : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:40 }}>
              <a href="/create" className="btn-primary" style={{ fontSize:17, padding:"16px 40px" }}>
                Create your Guangna by Number →
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background:"var(--ink)", color:"#aaa", padding:"24px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <p style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:16, color:"var(--pink)", marginBottom:4 }}>
              CreaBeaStudio
            </p>
            <p style={{ fontSize:13, marginBottom:12 }}>Color your memories, one number at a time. 🐾</p>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap", fontSize:13 }}>
              <a href="/create" style={{ color:"#aaa", textDecoration:"none" }}>Create</a>
              <a href="/color-converter" style={{ color:"#aaa", textDecoration:"none" }}>Color Converter</a>
              <a href="/examples" style={{ color:"#aaa", textDecoration:"none" }}>Examples</a>
              <a href="/Tips&Tricks" style={{ color:"#aaa", textDecoration:"none" }}>Tips&Tricks</a>
              <a href="/faq" style={{ color:"#aaa", textDecoration:"none" }}>FAQ</a>
            </div>
            <p style={{ marginTop:12, fontSize:12, opacity:0.5 }}>© {new Date().getFullYear()} CreaBeaStudio. All rights reserved.</p>
          </div>
          <Image src="/logo-full.png" alt="CreaBeaStudio" width={0} height={0} sizes="20vw"
            style={{ height:"auto", width:"auto", maxHeight:120, maxWidth:160, objectFit:"contain" }} />
        </footer>
      </main>
    </>
  );
}
