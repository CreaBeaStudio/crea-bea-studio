import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslations } from "next-intl";

const sectionHeading = {
  fontFamily: "Nunito, sans-serif",
  fontWeight: 800,
  fontSize: 22,
  marginTop: 32,
  marginBottom: 12,
  color: "var(--ink)",
};

export default function TermsPage() {
  const t = useTranslations("terms");

  const email = (chunks: React.ReactNode) => (
    <a href="mailto:hello@creabeastudio.com">{chunks}</a>
  );
  const website = (chunks: React.ReactNode) => (
    <a href="http://www.creabeastudio.com">{chunks}</a>
  );
  const privacyLink = (chunks: React.ReactNode) => (
    <a href="/privacy">{chunks}</a>
  );
  const br = () => <br />;

  return (
    <>
      <Navbar />
      <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto", lineHeight: 1.7, color: "#333" }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", marginBottom: 8 }}>
          {t("title")}
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>{t("lastUpdated")}</p>

        <p>{t("intro1")}</p>
        <p>{t.rich("intro2", { website })}</p>
        <p>{t("intro3")}</p>
        <p>{t("intro4")}</p>

        <h2 style={sectionHeading}>{t("s1Heading")}</h2>
        <p>{t("s1Text")}</p>

        <h2 style={sectionHeading}>{t("s2Heading")}</h2>
        <p>{t("s2Text")}</p>

        <h2 style={sectionHeading}>{t("s3Heading")}</h2>
        <p>{t("s3Text")}</p>

        <h2 style={sectionHeading}>{t("s4Heading")}</h2>
        <p>{t("s4Text")}</p>

        <h2 style={sectionHeading}>{t("s5Heading")}</h2>
        <p>{t("s5Text")}</p>

        <h2 style={sectionHeading}>{t("s6Heading")}</h2>
        <p>{t("s6Intro")}</p>
        <ul>
          <li><strong>{t("s6Bullet1Label")}</strong> {t("s6Bullet1Text")}</li>
          <li><strong>{t("s6Bullet2Label")}</strong> {t("s6Bullet2Text")}</li>
          <li><strong>{t("s6Bullet3Label")}</strong> {t("s6Bullet3Text")}</li>
        </ul>

        <h2 style={sectionHeading}>{t("s7Heading")}</h2>
        <p>{t("s7Text")}</p>

        <h2 style={sectionHeading}>{t("s8Heading")}</h2>
        <p>{t("s8Text")}</p>

        <h2 style={sectionHeading}>{t("s9Heading")}</h2>
        <p>{t("s9Text")}</p>

        <h2 style={sectionHeading}>{t("s10Heading")}</h2>
        <p>{t("s10Text")}</p>

        <h2 style={sectionHeading}>{t("s11Heading")}</h2>
        <p>{t("s11Text")}</p>

        <h2 style={sectionHeading}>{t("s12Heading")}</h2>
        <p>{t.rich("s12Text", { privacyLink })}</p>

        <h2 style={sectionHeading}>{t("s13Heading")}</h2>
        <p>{t("s13Text")}</p>

        <h2 style={sectionHeading}>{t("s14Heading")}</h2>
        <p>{t("s14Text")}</p>

        <h2 style={sectionHeading}>{t("s15Heading")}</h2>
        <p>{t("s15Text")}</p>

        <h2 style={sectionHeading}>{t("s16Heading")}</h2>
        <p>{t("s16Text")}</p>

        <h2 style={sectionHeading}>{t("s17Heading")}</h2>
        <p>{t("s17Text")}</p>

        <h2 style={sectionHeading}>{t("s18Heading")}</h2>
        <p>{t("s18Text")}</p>

        <h2 style={sectionHeading}>{t("s19Heading")}</h2>
        <p>{t("s19Text")}</p>

        <h2 style={sectionHeading}>{t("s20Heading")}</h2>
        <p>{t("s20Text")}</p>

        <h2 style={sectionHeading}>{t("s21Heading")}</h2>
        <p>{t("s21Text")}</p>

        <h2 style={sectionHeading}>{t("s22Heading")}</h2>
        <p>{t("s22Text")}</p>

        <h2 style={sectionHeading}>{t("s23Heading")}</h2>
        <p>{t("s23Text")}</p>

        <h2 style={sectionHeading}>{t("s24Heading")}</h2>
        <p>{t("s24Text")}</p>

        <h2 style={sectionHeading}>{t("s25Heading")}</h2>
        <p>{t.rich("s25Address", { br, email })}</p>

        <p style={{ marginTop: 32, fontSize: 13, color: "#999" }}>
          {t("footerNote")}
        </p>
      </main>
      <Footer />
    </>
  );
}