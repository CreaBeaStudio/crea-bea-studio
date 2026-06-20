// app/guides/page.tsx
//
// Hub/index page listing every guide. Purely additive — does not touch
// your homepage, /create, or any existing layout.

import Link from "next/link";
import Navbar from "../components/Navbar"; // one level deep: app/guides/page.tsx -> app/components/Navbar
import { GUIDES_DATA } from "./guidesData";

export const metadata = {
  title: "Paint by Number Guides | CreaBeaStudio",
  description:
    "Tips and how-tos for turning your own photos into custom paint by number artwork, matched to the markers you already own.",
  alternates: { canonical: "/guides" },
};

export default function GuidesHubPage() {
  const guides = Object.entries(GUIDES_DATA);

  return (
    <>
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
          Guides
        </h1>
        <p style={{ color: "#666", marginBottom: 28, maxWidth: 680 }}>
          Tips, walkthroughs, and ideas for turning your own photos into
          custom paint by number artwork.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {guides.map(([slug, guide]) => (
            <Link
              key={slug}
              href={`/guides/${slug}`}
              className="card"
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                maxWidth: 680,
              }}
            >
              <h2 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
                {guide.title}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
