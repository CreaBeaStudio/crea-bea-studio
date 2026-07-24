import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { coloringPages } from "@/lib/coloringPages";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ColoringPagesBrowser from "../components/ColoringPagesBrowser";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coloringPages" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FreeColoringPagesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coloringPages" });

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Image
          src="/marketing/Guangna_brush.png"
          alt="Guangna brush"
          width={120}
          height={84}
          style={{ objectFit: "contain", margin: "0 auto" }}
        />
      </div>
      <h1 style={{
        fontFamily: "Nunito, sans-serif", color: "var(--pink)", fontWeight: 900,
        fontSize: "clamp(26px,4vw,40px)", marginBottom: 8, textAlign: "center",
      }}>
        {t("title")}
      </h1>
      <p style={{ color: "#666", marginBottom: 12, textAlign: "center" }}>
        {t("subtitle")}
      </p>
      <p style={{ fontSize: 13, marginBottom: 36, textAlign: "center" }}>
        {t("crossLink.text")}{" "}
        <a href={`/${locale}/create`} style={{ color: "var(--pink)", fontWeight: 700 }}>
          {t("crossLink.linkText")}
        </a>
      </p>

      <ColoringPagesBrowser
        pages={coloringPages}
        previewLabel={t("previewLabel")}
        downloadButtonLabel={t("downloadButton")}
        viewPageLabel={t("viewPage")}
      />

      {/* Donate */}
      <div style={{
        marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
          {t("donate.text")}
        </p>
        <a
          href="https://ko-fi.com/creabeastudio"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            borderRadius: 20,
            background: "var(--pink)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          {t("donate.button")}
        </a>
      </div>
    </main>
    <Footer />
    </>
  );
}
