import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { coloringPages } from "@/lib/coloringPages";
import Navbar from "../components/Navbar";

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
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
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

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
      }}>
        {coloringPages.map((page) => (
          <Link
            key={page.id}
            href={`/free-coloring-pages/${page.id}`}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "white",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {(page.exampleImage || page.outlineImage) && (
              <div style={{ display: "flex", gap: 8 }}>
                {page.exampleImage && (
                  <div style={{ flex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/coloring-pages/thumbs/${page.exampleImage}`}
                      alt={`${page.title} — colored example`}
                      style={{
                        width: "100%", aspectRatio: "3 / 4", objectFit: "cover",
                        borderRadius: 10, border: "1px solid var(--border)", display: "block",
                      }}
                    />
                  </div>
                )}
                {page.outlineImage && (
                  <div style={{ flex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/coloring-pages/thumbs/${page.outlineImage}`}
                      alt={`${page.title} — coloring page preview`}
                      style={{
                        width: "100%", aspectRatio: "3 / 4", objectFit: "cover",
                        borderRadius: 10, border: "1px solid var(--border)", display: "block",
                        background: "white",
                      }}
                    />
                    <div style={{
                      textAlign: "center", fontSize: 10, color: "var(--muted)",
                      marginTop: 3,
                    }}>
                      {t("previewLabel")}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: "var(--ink)" }}>
                {page.title}
              </h2>
              {page.description && (
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                  {page.description}
                </p>
              )}
            </div>
            <span
              style={{
                marginTop: "auto",
                textAlign: "center",
                padding: "10px 16px",
                borderRadius: 10,
                background: "var(--pink)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {page.price ? t("viewPage") : t("downloadButton")}
            </span>
          </Link>
        ))}
      </div>

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
    </>
  );
}
