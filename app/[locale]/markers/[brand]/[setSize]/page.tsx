// app/markers/[brand]/[setSize]/page.tsx
//
// Programmatic SEO landing page for marker/PBN set combinations.
// Covers every Classic Brush size from your CreateInner component's
// MARKER_SETS list (12 through 408).
//
// FUNNEL: each page's CTA links to /create?sets=<CODE> — your existing
// CreateInner component already reads that "sets" query param and
// pre-selects the matching marker set in Step 3.

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar"; // three levels deep: app/markers/[brand]/[setSize]/page.tsx -> app/components/Navbar
import { MARKER_DATA } from "../../../../../lib/markerData";
type Params = { params: Promise<{ brand: string; setSize: string; locale: string }> };

// -----------------------------------------------------------------------
// 1. DATA
// -----------------------------------------------------------------------


// -----------------------------------------------------------------------
// 2. STATIC PARAMS
// -----------------------------------------------------------------------
export function generateStaticParams() {
  return Object.entries(MARKER_DATA).flatMap(([brand, data]) =>
    Object.keys(data.sets).map((setSize) => ({
      brand,
      setSize,
    }))
  );
}

// -----------------------------------------------------------------------
// Shared lookup so metadata + JSON-LD + page body stay in sync.
// -----------------------------------------------------------------------
function getMarkerContext(brand: string, setSize: string) {
  const brandData = MARKER_DATA[brand?.toLowerCase()];
  const setInfo = brandData?.sets?.[setSize];
  if (!brandData || !setInfo) return null;

  const brandName = brandData.displayName;
  const title = `${brandName} ${setSize} Custom Paint by Number | Color Palette Guide`;
  const description = `Turn any photo into a custom ${brandName} ${setSize} paint by number with the exact ${setSize}-color palette. Free ${brandName} Color Palette Guide and instant ${brandName} by Number artwork — delivered to your inbox within 24 hours.`;

  return {
    brand: brand.toLowerCase(),
    brandName,
    setSize,
    code: setInfo.code,
    setLabel: setInfo.label,
    title,
    description,
  };
}

// -----------------------------------------------------------------------
// 3. METADATA
// -----------------------------------------------------------------------
export async function generateMetadata({ params }: Params) {
  const { brand, setSize, locale } = await params;
  const ctx = getMarkerContext(brand, setSize);

  if (!ctx) {
    return {
      title: "Custom Paint by Number | CreaBeaStudio",
      description: "Create a custom paint by number from any photo with CreaBeaStudio.",
    };
  }

  const canonicalPath = `/${locale}/markers/${ctx.brand}/${ctx.setSize}`;

  return {
    title: ctx.title,
    description: ctx.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: ctx.title,
      description: ctx.description,
      url: canonicalPath,
      siteName: "CreaBeaStudio",
      type: "website",
      images: [
        {
          url: "/og/default-marker-set.png",
          width: 1200,
          height: 630,
          alt: `${ctx.brandName} ${ctx.setSize} custom paint by number example`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ctx.title,
      description: ctx.description,
    },
  };
}

// -----------------------------------------------------------------------
// 4. PAGE COMPONENT
// -----------------------------------------------------------------------
export default async function MarkerSetPage({ params }: Params) {
  const { brand, setSize, locale } = await params;
  const ctx = getMarkerContext(brand, setSize);

  if (!ctx) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${ctx.brandName} ${ctx.setSize} Paint by Number Converter`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    description: ctx.description,
    url: `https://creabeastudio.com/${locale}/markers/${ctx.brand}/${ctx.setSize}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "CreaBeaStudio", url: "https://creabeastudio.com" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main style={{ padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "Nunito, sans-serif",
            color: "var(--pink)",
            fontWeight: 900,
            fontSize: "clamp(26px,4vw,40px)",
            marginBottom: 6,
          }}
        >
          {ctx.brandName} {ctx.setSize} Color Palette Guide
        </h1>

        <p style={{ color: "#666", marginBottom: 24, maxWidth: 680 }}>
          Upload any photo and we'll convert it into custom {ctx.brandName}{" "}
          {ctx.setSize} by Number artwork, matched precisely to your{" "}
          {ctx.setLabel} marker set. No guesswork on colors — just upload,
          choose your level, and your finished file lands in your inbox
          within 24 hours.
        </p>

        <div className="card" style={{ maxWidth: 520 }}>
          <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>
            Ready to start?
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 18 }}>
            Your {ctx.setLabel} set will be pre-selected automatically on the
            next step.
          </p>
          <Link
            href={`/create?sets=${ctx.code}`}
            className="btn-primary"
            style={{
              display: "inline-block",
              textAlign: "center",
              width: "100%",
              fontSize: 16,
              padding: "14px",
              textDecoration: "none",
            }}
          >
            ✨ Start my {ctx.brandName} {ctx.setSize} Paint by Number →
          </Link>
        </div>

        <p style={{ marginTop: 18, fontSize: 13 }}>
          <Link href="/" style={{ color: "var(--pink)" }}>
            ← Or browse all Guangna marker sets on our homepage
          </Link>
        </p>
      </main>
    </>
  );
}
