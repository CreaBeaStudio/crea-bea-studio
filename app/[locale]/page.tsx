import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const FEATURES = [
  { icon: "📸", key: "featureCamera" },
  { icon: "🎨", key: "featureNoGuessing" },
  { icon: "✏️", key: "featureGuangna", isGuangna: true },
];

const HOW = [
  { step: "01", labelKey: "howUpload", descKey: "howUploadDesc" },
  { step: "02", labelKey: "howChoose", descKey: "howChooseDesc" },
  { step: "03", labelKey: "howOrder", descKey: "howOrderDesc" },
  { step: "04", labelKey: "howColor", descKey: "howColorDesc" },
];

const LEVELS = [
  { nameKey: "levelBeginner", descKey: "levelBeginnerDesc", emoji: "🌱", img: "/detail-beginner.png" },
  { nameKey: "levelIntermediate", descKey: "levelIntermediateDesc", emoji: "🌿", img: "/detail-int.png", popular: true },
  { nameKey: "levelAdvanced", descKey: "levelAdvancedDesc", emoji: "🌲", img: "/detail-adv.png" },
];

const WHAT_YOU_GET = [
  { featureKey: "wdygOutline", beginner: true, intermediate: true, advanced: true },
  { featureKey: "wdygPalette", beginner: true, intermediate: true, advanced: true },
  { featureKey: "wdygImpressionPdf", beginner: true, intermediate: true, advanced: true },
  { featureKey: "wdygImpressionJpg", beginner: false, intermediate: true, advanced: true },
  { featureKey: "wdygColoredOutline", beginner: false, intermediate: false, advanced: true },
];

export default function Home() {
  const t = useTranslations("home");

  return (
    <>
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          align-items: end;
        }
        .hero-left {
          order: 1;
        }
        .hero-right {
          order: 2;
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
          .hero-left {
            order: 2;
          }
          .hero-right {
            order: 1;
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

            {/* Left: text */}
            <div className="hero-left">
              <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:16, marginBottom:16 }}>
                {t("badge")}
              </p>
              <h1 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(36px,5.5vw,58px)", lineHeight:1.1, marginBottom:24 }}>
                {t("heroTitle1")}<br />
                <span style={{ color:"#FF4D6D" }}>{t("heroTitle2")}</span><br />
                {t("heroTitle3")}
              </h1>
              <p style={{ fontSize:"clamp(16px,2.5vw,24px)", color:"#444", maxWidth:550, marginBottom:32, lineHeight:1.7 }}>
                {t("heroSubtitle")}
              </p>
              <div className="hero-buttons">
                <a href="/create" className="btn-primary hero-cta">
                  {t("heroCta")}
                </a>
                <a href="/examples" className="btn-outline hero-outline">{t("heroSeeExamples")}</a>
              </div>
              <div className="feature-cards">
                {FEATURES.map(f => (
                  <div key={f.key} className="feature-card">
                    {f.isGuangna
                      ? <Image src="/guangna-marker.png" alt="Guangna marker" width={45} height={30} style={{ objectFit:"contain", marginBottom:6 }} />
                      : <div style={{ fontSize:26, marginBottom:6 }}>{f.icon}</div>
                    }
                    <div style={{ fontWeight:700, fontSize:14 }}>{t(f.key)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image panel */}
            <div className="hero-right" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
              <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", width:"100%" }}>
                <div className="from-this-label" />
                <div style={{
                  background:"white", borderRadius:24, padding:16,
                  boxShadow:"0 20px 60px rgba(244,96,122,0.15)",
                  maxWidth:800, width:"100%"
                }}>
                 <Image src="/Dog_Legend4.png" alt="Sample PBN photo" width={800} height={800} loading="eager"
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
                <strong>{t("paletteBanner")}</strong>
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
              <Image src="/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{ objectFit:"contain", height:"auto" }} />
              {t("converterTitle")}
            </h2>
            <p style={{ fontSize:17, opacity:0.9, marginBottom:28 }}>
              {t("converterSubtitle")}
            </p>
            <Link href="/color-converter" style={{
              background:"white", color:"var(--pink)",
              borderRadius:50, padding:"14px 32px",
              fontWeight:700, fontSize:16,
              textDecoration:"none", display:"inline-block"
            }}>
              {t("converterCta")}
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:"80px 24px", background:"white" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <p style={{ textAlign:"center", color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>{t("processLabel")}</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", textAlign:"center", marginBottom:56 }}>
              {t("howTitle")}
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
                  <h3 style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>{t(h.labelKey)}</h3>
                  <p style={{ color:"#666", fontSize:15 }}>{t(h.descKey)}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center", marginTop:48 }}>
              <a href="/create" className="btn-primary" style={{ fontSize:17, padding:"16px 36px" }}>
                {t("createCta")}
              </a>
            </div>
          </div>
        </section>

        {/* ── SKILL LEVELS ── */}
        <section style={{ padding:"80px 24px", background:"var(--cream)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <p style={{ textAlign:"center", color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>{t("chooseLevelLabel")}</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", textAlign:"center", marginBottom:16 }}>
              {t("levelsTitle")}
            </h2>
            <p style={{ textAlign:"center", color:"#666", fontSize:16, maxWidth:500, margin:"0 auto 48px" }}>
              {t("levelsSubtitle")}
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
              {LEVELS.map(l => (
                <div key={l.nameKey} className="card" style={{
                  textAlign:"center", padding:32,
                  border: l.popular ? "2px solid var(--pink)" : "2px solid transparent",
                  position:"relative", borderRadius:20
                }}>
                  {l.popular && (
                    <div style={{
                      position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                      background:"var(--pink)", color:"white",
                      borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700
                    }}>{t("mostPopular")}</div>
                  )}
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                    <Image src={l.img} alt={`${t(l.nameKey)} detail`} width={350} height={250}
                      style={{ borderRadius:10, objectFit:"cover", border:"3px solid #eee", width:"100%", height:"auto" }} />
                  </div>
                  <div style={{ fontSize:32, marginBottom:8 }}>{l.emoji}</div>
                  <h3 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:24, marginBottom:12 }}>{t(l.nameKey)}</h3>
                  <p style={{ color:"#555", fontSize:15, marginBottom:24 }}>{t(l.descKey)}</p>
                  <a href="/create" className="btn-primary" style={{ width:"100%", display:"flex", justifyContent:"center" }}>
                    {t("tryLevel", { level: t(l.nameKey) })}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT IS THE GUANGNA COLOR PALETTE GUIDE? ── */}
        <section style={{ padding:"80px 24px", background:"white" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }} className="palette-grid">
            <div>
              <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>{t("includedLabel")}</p>
              <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(26px,4vw,38px)", marginBottom:24, lineHeight:1.2 }}>
                {t("paletteTitle1")}<br />{t("paletteTitle2")}
              </h2>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                {t("paletteP1")}
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                {t("paletteP2")}
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:16 }}>
                {t("paletteP3")}
              </p>
              <p style={{ fontSize:16, color:"#444", lineHeight:1.8, marginBottom:24 }}>
                {t("paletteP4")}
              </p>
              <p style={{ fontSize:17, fontWeight:800, color:"var(--pink)" }}>
                {t("paletteSlogan")}{" "}
                <Image src="/guangna-marker.png" alt="Guangna marker" width={150} height={100} style={{ objectFit:"contain", marginBottom:6 }} />
              </p>
            </div>

            <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
              <div style={{
                background:"linear-gradient(160deg,#8B6347 0%,#A0714F 30%,#7A5230 60%,#9C6D3E 100%)",
                borderRadius:20, padding:32,
                boxShadow:"0 20px 60px rgba(0,0,0,0.35)",
                width:"100%", maxWidth:520,
              }}>
                <div style={{ position:"relative" }}>
                  <div style={{
                    background:"white", borderRadius:4,
                    boxShadow:"0 8px 32px rgba(0,0,0,0.4), 2px 2px 0 rgba(255,255,255,0.3)",
                    overflow:"hidden", aspectRatio:"1.414 / 1", width:"100%",
                    transform:"rotate(-1.5deg)",
                  }}>
                    <Image src="/GN_Palette_landscape.png" alt="Guangna Color Palette Guide"
                      width={0} height={0} sizes="(max-width: 768px) 90vw, 50vw"
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
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
            <p style={{ color:"var(--pink)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontSize:13, marginBottom:12 }}>{t("everyOrderLabel")}</p>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,40px)", marginBottom:48 }}>
              {t("wdygTitle")}
            </h2>

            <div className="wdyg-table" style={{
              background:"white", borderRadius:20,
              boxShadow:"0 8px 40px rgba(0,0,0,0.08)",
              overflow:"auto", maxWidth:780, margin:"0 auto 40px",
            }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:15, minWidth:480 }}>
                <thead>
                  <tr>
                    <th style={{ padding:"16px 20px", textAlign:"left", background:"#f5f5f5", fontWeight:700, color:"#444" }} />
                    {[
                      { key: "levelBeginner" },
                      { key: "levelIntermediate" },
                      { key: "levelAdvanced" },
                    ].map(({ key }) => (
                      <th key={key} style={{
                        padding:"16px 12px", textAlign:"center",
                        background:"var(--pink)", color:"white",
                        fontFamily:"Nunito, sans-serif", fontWeight:800, fontSize:14,
                      }}>{t(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WHAT_YOU_GET.map((row, i) => (
                    <tr key={row.featureKey} style={{ borderTop: i === 0 ? "none" : "1px solid #eee" }}>
                      <td style={{ padding:"14px 16px", textAlign:"left", fontWeight:600, color:"#333", background:"#fafafa", fontSize:13 }}>
                        {t(row.featureKey)}
                      </td>
                      {(["beginner","intermediate","advanced"] as const).map(level => (
                        <td key={level} style={{ padding:"14px 12px", textAlign:"center" }}>
                          <input type="checkbox" checked={row[level]} readOnly
                            aria-label={`${t(row.featureKey)} — ${level}`}
                            style={{ width:20, height:20, accentColor:"var(--pink)", cursor:"default" }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="wdyg-cards">
              {([
                { level: "beginner" as const, nameKey: "levelBeginner", emoji: "🌱" },
                { level: "intermediate" as const, nameKey: "levelIntermediate", emoji: "🌿", popular: true },
                { level: "advanced" as const, nameKey: "levelAdvanced", emoji: "🌲" },
              ]).map(({ level, nameKey, emoji, popular }) => (
                <div key={nameKey} style={{
                  background:"white", borderRadius:20,
                  border: popular ? "2px solid var(--pink)" : "2px solid #eee",
                  padding:"24px 20px", position:"relative", textAlign:"left",
                }}>
                  {popular && (
                    <div style={{
                      position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                      background:"var(--pink)", color:"white",
                      borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700, whiteSpace:"nowrap",
                    }}>{t("mostPopular")}</div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                    <span style={{ fontSize:28 }}>{emoji}</span>
                    <span style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:22, color:"var(--ink)" }}>{t(nameKey)}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {WHAT_YOU_GET.map(row => (
                      <div key={row.featureKey} style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"10px 14px", borderRadius:12,
                        background: row[level] ? "rgba(244,96,122,0.06)" : "#fafafa",
                      }}>
                        <span style={{ fontSize:14, fontWeight:600, color: row[level] ? "var(--ink)" : "#aaa" }}>
                          {t(row.featureKey)}
                        </span>
                        <span style={{ fontSize:20, marginLeft:12 }}>{row[level] ? "✅" : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:40 }}>
              <a href="/create" className="btn-primary" style={{ fontSize:17, padding:"16px 40px" }}>
                {t("finalCta")}
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
            <p style={{ fontSize:13, marginBottom:12 }}>{t("footerTagline")}</p>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap", fontSize:13 }}>
              <a href="/create" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerCreate")}</a>
              <a href="/color-converter" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerConverter")}</a>
              <a href="/examples" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerExamples")}</a>
              <a href="/Tips&Tricks" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerTips")}</a>
              <a href="/faq" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerFaq")}</a>
            </div>
            <a href="https://www.tiktok.com/@CreaBeaStudio" target="_blank" rel="noopener noreferrer" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerTiktok")}</a><div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, marginTop:8 }}>
             <a href="/privacy" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerPrivacy")}</a>
             <a href="/terms" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerTerms")}</a>
             <a href="/refund" style={{ color:"#aaa", textDecoration:"none" }}>{t("footerRefund")}</a>
              </div><p style={{ marginTop:12, fontSize:12, opacity:0.5 }}>{t("footerRights", { year: new Date().getFullYear() })}</p>
          </div>
          <Image src="/logo-full.png" alt="CreaBeaStudio" width={0} height={0} sizes="20vw"
            style={{ height:"auto", width:"auto", maxHeight:120, maxWidth:160, objectFit:"contain" }} />
        </footer>
      </main>
    </>
  );
}