// app/[locale]/guides/[slug]/page.tsx
//
// Individual guide article. Pre-rendered at build time for every
// locale x guide-slug combination. Add a new guide by adding an entry
// to guidesData.js -- no changes needed here.
//
// Moved here (2026-07) from the old flat app/guides/[slug]/page.tsx so
// this route is locale-prefixed like the rest of the site (/fr/guides/...
// instead of an un-prefixed /guides/...) -- these are SEO articles, so a
// French visitor's search results should actually point at a French URL,
// not just French-flavored content sitting under an English-only path.
//
// Import paths below are UNCHANGED from the old flat route: this file
// gained exactly one extra parent directory ([locale]), and Navbar
// gained exactly one matching extra parent directory (it already lives
// at app/[locale]/components/Navbar.tsx per the site's existing
// convention), so the relative path up-two-levels-then-into-components
// still resolves correctly.

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar"; // app/[locale]/guides/[slug]/page.tsx -> app/[locale]/components/Navbar
import { getGuide, getAllSlugs } from "../guidesData";

type Params = { params: Promise<{ slug: string; locale: string }> };

// Shape of a single guide entry. Declared here (rather than relying on
// TypeScript's inferred type from the plain .js data file) so that
// indexing by a dynamic string (the URL slug) type-checks.
type Guide = {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body?: string }[];
  cta: { href: string; label: string };
};

// Only the new [slug] segment needs generating here -- the [locale]
// segment above this route is already handled by the site's existing
// top-level locale generateStaticParams (every other app/[locale]/...
// page relies on the same parent-level mechanism rather than each page
// re-declaring the locale list), so Next.js combines that with the
// slugs returned here automatically.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug, locale } = await params;
  const guide: Guide | null = getGuide(locale, slug);
  if (!guide) {
    return {
      title: "Guide | CreaBeaStudio",
      description: "Paint by number guides from CreaBeaStudio.",
    };
  }
  const canonicalPath = `/${locale}/guides/${slug}`;
  return {
    title: `${guide.title} | CreaBeaStudio`,
    description: guide.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonicalPath,
      siteName: "CreaBeaStudio",
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug, locale } = await params;
  const guide: Guide | null = getGuide(locale, slug);

  if (!guide) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: `https://creabeastudio.com/${locale}/guides/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "CreaBeaStudio",
      url: "https://creabeastudio.com",
    },
  };

  // Any section whose heading starts with "Q" (e.g. "Q: ..." or "Q. ...")
  // is treated as an FAQ entry — this lets FAQ schema build itself from
  // guidesData.js with no extra tagging needed per guide.
  const faqEntries = guide.sections.filter((s) =>
    /^Q[:.]/.test(s.heading.trim())
  );

  const faqSchema =
    faqEntries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries.map((entry) => ({
            "@type": "Question",
            name: entry.heading.replace(/^Q[:.]\s*/, ""),
            acceptedAnswer: {
              "@type": "Answer",
              text: entry.body ?? "",
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Navbar />

      <main style={{ padding: "40px 24px", maxWidth: 760, margin: "0 auto" }}>
        <p style={{ marginBottom: 14, fontSize: 13 }}>
          <Link href={`/${locale}/guides`} style={{ color: "var(--pink)" }}>
            ← All guides
          </Link>
        </p>

        <h1
          style={{
            fontFamily: "Nunito, sans-serif",
            color: "var(--pink)",
            fontWeight: 900,
            fontSize: "clamp(24px,4vw,36px)",
            marginBottom: 14,
          }}
        >
          {guide.title}
        </h1>

        <p style={{ color: "#666", marginBottom: 28 }}>{guide.intro}</p>

        {guide.sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: 22 }}>
            <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
              {section.heading}
            </h2>
            {section.body && (
              <p style={{ color: "#555", margin: 0 }}>{section.body}</p>
            )}
          </div>
        ))}

        <div className="card" style={{ maxWidth: 480, marginTop: 12 }}>
          <Link
            href={guide.cta.href}
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
            {guide.cta.label}
          </Link>
        </div>
      </main>
    </>
  );
}