import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { coloringPages, coloringPageFileUrl, coloringPageThumbUrl } from "@/lib/coloringPages";
import Navbar from "../../components/Navbar";
import BeforeAfterSlider from "../../components/BeforeAfterSlider";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Pre-generate a page for every entry in coloringPages at build time.
export function generateStaticParams() {
  return coloringPages.map((page) => ({ slug: page.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = coloringPages.find((p) => p.id === slug);
  if (!page) return {};

  const t = await getTranslations({ locale, namespace: "coloringPages" });
  return {
    title: `${page.title} — ${t("title")} | CreaBeaStudio`,
    description: page.description || t("metaDescription"),
  };
}

export default async function ColoringPageDetail({ params }: Props) {
  const { locale, slug } = await params;
  const page = coloringPages.find((p) => p.id === slug);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "coloringPages" });
  const isPaid = !!page.price;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
      <Link
        href="/free-coloring-pages"
        style={{
          display: "inline-block", marginBottom: 24, fontSize: 14,
          color: "var(--muted)", textDecoration: "none",
        }}
      >
        ← {t("backToAll")}
      </Link>

      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>
        {page.title}
      </h1>
      {page.description && (
        <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
          {page.description}
        </p>
      )}

      {page.exampleImage && page.outlineImage ? (
        // Both images present — interactive before/after slider.
        <div style={{ marginBottom: 32 }}>
          <BeforeAfterSlider
            beforeImage={coloringPageThumbUrl(page.exampleImage)}
            afterImage={coloringPageThumbUrl(page.outlineImage)}
            beforeLabel="Reference"
            afterLabel={t("previewLabel")}
            aspectRatio={3 / 4}
          />
        </div>
      ) : (
        // Fallback: only one image configured (e.g. a page still being set up) —
        // show whichever single image exists, same as before.
        (page.exampleImage || page.outlineImage) && (
          <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            {page.exampleImage && (
              <div style={{ flex: "1 1 240px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coloringPageThumbUrl(page.exampleImage)}
                  alt={`${page.title} — Reference`}
                  style={{
                    width: "100%", borderRadius: 12, border: "1px solid var(--border)",
                    display: "block", objectFit: "cover", aspectRatio: "3 / 4",
                  }}
                />
              </div>
            )}
            {page.outlineImage && (
              <div style={{ flex: "1 1 240px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coloringPageThumbUrl(page.outlineImage)}
                  alt={`${page.title} — coloring page preview`}
                  style={{
                    width: "100%", borderRadius: 12, border: "1px solid var(--border)",
                    display: "block", objectFit: "cover", aspectRatio: "3 / 4",
                  }}
                />
                <div style={{
                  textAlign: "center", fontSize: 11, color: "var(--muted)",
                  marginTop: 4,
                }}>
                  {t("previewLabel")}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {isPaid ? (
        // Placeholder for when checkout is wired up — swap this <div> for
        // a real Lemon Squeezy / Payhip link when ready. page.price is
        // already available here.
        <div style={{
          textAlign: "center", padding: "16px", borderRadius: 12,
          background: "var(--cream)", color: "var(--muted)", fontSize: 14,
        }}>
          {t("comingSoon")}
        </div>
      ) : (
        <a
          href={coloringPageFileUrl(page.fileName)}
          download
          style={{
            display: "block", textAlign: "center", padding: "14px 24px",
            borderRadius: 12, background: "var(--pink)", color: "white",
            fontWeight: 700, fontSize: 16, textDecoration: "none",
          }}
        >
          {t("downloadButton")}
        </a>
      )}

      {/* Donate */}
      <div style={{
        marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)",
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
            display: "inline-block", padding: "10px 22px", borderRadius: 20,
            background: "var(--pink)", color: "white", fontWeight: 700,
            fontSize: 13, textDecoration: "none",
          }}
        >
          {t("donate.button")}
        </a>
      </div>
    </main>
    </>
  );
}
