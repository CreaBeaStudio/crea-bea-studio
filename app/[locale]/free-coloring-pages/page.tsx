import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { coloringPages } from "@/lib/coloringPages";

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
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
      <h1 style={{
        fontSize: 34, fontWeight: 800, textAlign: "center",
        marginBottom: 12, color: "var(--ink)",
      }}>
        {t("title")}
      </h1>
      <p style={{
        fontSize: 16, color: "var(--muted)", textAlign: "center",
        maxWidth: 640, margin: "0 auto 48px", lineHeight: 1.6,
      }}>
        {t("subtitle")}
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
      }}>
        {coloringPages.map((page) => (
          <div key={page.id} style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "white",
          }}>
            {(page.exampleImage || page.outlineImage) && (
              <div style={{ display: "flex", gap: 8 }}>
                {page.exampleImage && (
                  <div style={{ flex: 1, position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/coloring-pages/thumbs/${page.exampleImage}`}
                      alt={`${page.title} — colored example`}
                      style={{
                        width: "100%", aspectRatio: "3 / 4", objectFit: "cover",
                        borderRadius: 10, border: "1px solid var(--border)", display: "block",
                      }}
                    />
                    <span style={{
                      position: "absolute", bottom: 6, left: 6,
                      background: "var(--pink)", color: "white",
                      fontSize: 10, fontWeight: 700, padding: "3px 8px",
                      borderRadius: 20, letterSpacing: "0.02em",
                    }}>
                      {t("exampleLabel")}
                    </span>
                  </div>
                )}
                {page.outlineImage && (
                  <div style={{ flex: 1, position: "relative" }}>
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
                    <span style={{
                      position: "absolute", bottom: 6, left: 6,
                      background: "var(--ink)", color: "white",
                      fontSize: 10, fontWeight: 700, padding: "3px 8px",
                      borderRadius: 20, letterSpacing: "0.02em",
                    }}>
                      {t("previewLabel")}
                    </span>
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
            <a
              href={`/coloring-pages/${page.fileName}`}
              download
              style={{
                marginTop: "auto",
                textAlign: "center",
                padding: "10px 16px",
                borderRadius: 10,
                background: "var(--pink)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {t("downloadButton")}
            </a>
          </div>
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
  );
}
