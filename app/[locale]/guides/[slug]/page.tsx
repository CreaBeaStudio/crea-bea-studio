// app/guides/[slug]/page.tsx
//
// Individual guide article. Pre-rendered at build time for every key
// in GUIDES_DATA. Add a new guide by adding an entry to guidesData.js —
// no changes needed here.

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar"; // two levels deep: app/guides/[slug]/page.tsx -> app/components/Navbar
import { GUIDES_DATA } from "../guidesData";

type Params = { params: Promise<{ slug: string; locale: string }> };

// Shape of a single guide entry. Declared here (rather than relying on
// TypeScript's inferred type from the plain .js data file) so that
// indexing GUIDES_DATA by a dynamic string (the URL slug) type-checks.
type Guide = {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body?: string }[];
  cta: { href: string; label: string };
};

const guidesData: Record<string, Guide> = GUIDES_DATA;

export function generateStaticParams() {
  return Object.keys(GUIDES_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug, locale } = await params;
  const guide = guidesData[slug];
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
  const guide = guidesData[slug];

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
          <Link href="/guides" style={{ color: "var(--pink)" }}>
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
