import Navbar from "../components/Navbar";
import { useTranslations } from "next-intl";

const FAQ_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12];

export default function FAQ() {
  const t = useTranslations("faq");

  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:740, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", marginBottom:40 }}>
          {t("title")} <br /> ♥{t("subtitle")}♥
        </h1>
        {FAQ_KEYS.map((n)=>(
          <div key={n} style={{ marginBottom:28, paddingBottom:28, borderBottom:"1px solid var(--border)" }}>
            <h2 style={{ fontWeight:800, fontSize:18, marginBottom:8, color:"var(--ink)" }}>{t(`q${n}`)}</h2>
            <p style={{ color:"#555", fontSize:16, lineHeight:1.7 }}>{t(`a${n}`)}</p>
          </div>
        ))}
        <div style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ color:"#666", marginBottom:16 }}>{t("stillQuestions")}</p>
          <a href="mailto:hello@creabeastudio.com" className="btn-primary" style={{ display:"inline-flex" }}>
            {t("contactUs")}
          </a>
        </div>
      </main>
    </>
  );
}