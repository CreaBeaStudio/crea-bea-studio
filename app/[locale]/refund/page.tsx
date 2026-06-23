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

export default function RefundPage() {
  const t = useTranslations("refund");

  const email = (chunks: React.ReactNode) => (
    <a href="mailto:hello@creabeastudio.com">{chunks}</a>
  );
  const termsLink = (chunks: React.ReactNode) => (
    <a href="/terms">{chunks}</a>
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

        <p>{t("intro")}</p>

        <h2 style={sectionHeading}>{t("s1Heading")}</h2>
        <p>{t.rich("s1Text", { email })}</p>

        <h2 style={sectionHeading}>{t("s2Heading")}</h2>
        <p>{t("s2Text")}</p>

        <h2 style={sectionHeading}>{t("s3Heading")}</h2>
        <p>{t.rich("s3Text", { termsLink })}</p>

        <h2 style={sectionHeading}>{t("s4Heading")}</h2>
        <p>{t("s4Text")}</p>

        <h2 style={sectionHeading}>{t("s5Heading")}</h2>
        <p>{t.rich("s5Address", { br, email })}</p>
      </main>
    </>
  );
}