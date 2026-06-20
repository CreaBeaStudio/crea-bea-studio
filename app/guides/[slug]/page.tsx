// app/guides/[slug]/page.tsx
//
// Individual guide article. Pre-rendered at build time for every key
// in GUIDES_DATA. Add a new guide by adding an entry to guidesData.js —
// no changes needed here.

import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar"; // two levels deep: app/guides/[slug]/page.tsx -> app/components/Navbar
import { GUIDES_DATA } from "../guidesData";

export function generateStaticParams() {
  return Object.keys(GUIDES_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = GUIDES_DATA[slug];

  if (!guide) {
    return {
      title: "Guide | CreaBeaStudio",
      description: "Paint by number guides from CreaBeaStudio.",
    };
  }

  const canonicalPath = `/guides/${slug}`;

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

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = GUIDES_DATA[slug];

  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: `https://creabeastudio.com/guides/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "CreaBeaStudio",
      url: "https://creabeastudio.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <p style={{ color: "#555", margin: 0 }}>{section.body}</p>
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
