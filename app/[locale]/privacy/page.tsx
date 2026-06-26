import Navbar from "../components/Navbar";
import { useTranslations } from "next-intl";

const sectionHeading = {
  fontFamily: "Nunito, sans-serif",
  fontWeight: 800,
  fontSize: 22,
  marginTop: 32,
  marginBottom: 12,
  color: "var(--ink)",
};

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const email = (chunks: React.ReactNode) => (
    <a href="mailto:hello@creabeastudio.com">{chunks}</a>
  );
  const website = (chunks: React.ReactNode) => (
    <a href="http://www.creabeastudio.com">{chunks}</a>
  );
  const stripe = (chunks: React.ReactNode) => (
    <a href="https://stripe.com/en-my/privacy" target="_blank" rel="noopener noreferrer">{chunks}</a>
  );
  const lemon = (chunks: React.ReactNode) => (
    <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">{chunks}</a>
  );
  const payhip = (chunks: React.ReactNode) => (
    <a href="https://payhip.com/privacy" target="_blank" rel="noopener noreferrer">{chunks}</a>
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
        <ul>
          <li>{t.rich("bullet1", { website })}</li>
          <li>{t("bullet2")}</li>
          <li>{t("bullet3")}</li>
        </ul>

        <p>{t.rich("intro2", { email })}</p>

        <h2 style={sectionHeading}>{t("summaryHeading")}</h2>
        <p><strong>{t("sdpWhatQ")}</strong> {t("sdpWhatA")}</p>
        <p><strong>{t("sdpSensitiveQ")}</strong> {t("sdpSensitiveA")}</p>
        <p><strong>{t("sdpThirdPartyQ")}</strong> {t("sdpThirdPartyA")}</p>
        <p><strong>{t("sdpHowQ")}</strong> {t("sdpHowA")}</p>
        <p><strong>{t("sdpRightsQ")}</strong> {t("sdpRightsA")}</p>

        <h2 style={sectionHeading}>{t("s1Heading")}</h2>
        <p>{t("s1Intro")}</p>
        <ul>
          <li>{t("s1Bullet1")}</li>
        </ul>
        <p><strong>{t("s1SensitiveLabel")}</strong> {t("s1SensitiveText")}</p>
        <p>
        <strong>{t("s1PaymentLabel")}</strong> {t.rich("s1PaymentText", { stripe, lemon, payhip })}
        </p>

        <h2 style={sectionHeading}>{t("s2Heading")}</h2>
        <p>{t("s2Text")}</p>

        <h2 style={sectionHeading}>{t("s3Heading")}</h2>
        <p>{t("s3Intro")}</p>
        <ul>
          <li><strong>{t("s3Bullet1Label")}</strong> {t("s3Bullet1Text")}</li>
          <li><strong>{t("s3Bullet2Label")}</strong> {t("s3Bullet2Text")}</li>
          <li><strong>{t("s3Bullet3Label")}</strong> {t("s3Bullet3Text")}</li>
        </ul>

        <h2 style={sectionHeading}>{t("s4Heading")}</h2>
        <p>{t("s4Text")}</p>

        <h2 style={sectionHeading}>{t("s5Heading")}</h2>
        <p>{t("s5Text")}</p>

        <h2 style={sectionHeading}>{t("s6Heading")}</h2>
        <p>{t("s6Text")}</p>

        <h2 style={sectionHeading}>{t("s7Heading")}</h2>
        <p>{t.rich("s7Text1", { email })}</p>
        <p>{t("s7Text2")}</p>

        <h2 style={sectionHeading}>{t("s8Heading")}</h2>
        <p>{t("s8Text")}</p>

        <h2 style={sectionHeading}>{t("s9Heading")}</h2>
        <p>{t.rich("s9Text", { email })}</p>

        <h2 style={sectionHeading}>{t("s10Heading")}</h2>
        <p>{t("s10Text")}</p>

        <h2 style={sectionHeading}>{t("s11Heading")}</h2>
        <p>{t("s11Text")}</p>

        <h2 style={sectionHeading}>{t("s12Heading")}</h2>
        <p>{t.rich("s12Address", { br, email })}</p>
        <p>{t.rich("s12Rep", { email })}</p>

        <h2 style={sectionHeading}>{t("s13Heading")}</h2>
        <p>{t.rich("s13Text", { email })}</p>

        <p style={{ marginTop: 32, fontSize: 13, color: "#999" }}>
          {t("footerNote")}
        </p>
      </main>
    </>
  );
}