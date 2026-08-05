import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslations } from "next-intl";

const SECTIONS = [
  { key: "s1", tipCount: 2 },
  { key: "s2", tipCount: 9 },
  { key: "s3", tipCount: 4 },
];

export default function TipsAndTricks() {
  const t = useTranslations("tips");

  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:8 }}>
           {t("title")} <br /> 
        </h1>

        {SECTIONS.map((section) => (
          <div key={section.key} style={{ marginBottom:48 }}>
            <h2 style={{ fontFamily:"Nunito, sans-serif", fontWeight:900, fontSize:24, color:"var(--pink)", marginBottom:24 }}>
              {t(`${section.key}Title`)}
            </h2>
            {Array.from({ length: section.tipCount }, (_, i) => i + 1).map((n) => (
              <div key={n} style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid var(--border)" }}>
                <h3 style={{ fontWeight:800, fontSize:17, marginBottom:6, color:"var(--ink)" }}>{t(`${section.key}q${n}`)}</h3>
                <p style={{ color:"#555", fontSize:16, lineHeight:1.7 }}>{t(`${section.key}a${n}`)}</p>
              </div>
            ))}
          </div>
        ))}

        <div style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ color:"#666", marginBottom:16 }}>{t("stillQuestions")}</p>
          <a href="mailto:hello@CreaBeaStudio.com" className="btn-primary" style={{ display:"inline-flex" }}>
            {t("contactUs")}
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}