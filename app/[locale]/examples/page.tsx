"use client";
import Navbar from "../components/Navbar";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

// ── EXAMPLES REDESIGN (2026-07-17): replaces the old autoplay
// slideshow of single finished-artwork images with a sidebar of
// example photos that drive two BeforeAfterSlider comparisons in the
// main area:
//   1) preview-1800 vs preview-3000  -- resolution/quality difference.
//      Deliberately uses the COLORED PREVIEW at both sizes (not the
//      outline) -- per Mirjam, the 1800-vs-3000 difference reads much
//      more clearly in the colored version than in numbered line art.
//   2) preview-3000 vs outline-3000  -- what you actually get: the
//      colored reference vs the numbered page you paint from.
//
// Each example therefore needs exactly 3 source images, not 4 -- see
// the folder convention below. The sidebar thumbnail reuses preview3000
// (no separate thumbnail file needed -- next/image handles resizing).
//
// ── PUBLIC ASSETS (2026-07-17): these images live in a public GCS
// bucket, not /public -- see next.config.ts's images.remotePatterns.
// Upload triplets to gs://crea-bea-public-assets/examples/<slug>/ using
// exactly these three filenames (1800-preview.png, 3000-preview.png,
// 3000-outline.png) and they're picked up automatically; no code change
// needed beyond adding the slug (with its category) to EXAMPLES below.
//
// ── DESCRIPTION CONSOLIDATION (2026-07-22): every example used to
// carry its own descKey (descFamily, descPet, descHolidayCelebration,
// etc.) -- but every single entry actually pointed at descKey:
// "descFamily", regardless of real category, so Pets/Celebrations/
// Others examples were all showing "Perfect for your favorite family
// photo". Replaced with one templated string (exampleDesc, below) that
// takes the example's own category and can't drift out of sync with
// it again. categoryKey also now goes through t() via CATEGORY_LABELS
// instead of being a raw hardcoded English string -- previously the
// sidebar group headers and the description sentence were English-only
// in every locale.
const GCS_PUBLIC_BASE = "https://storage.googleapis.com/crea-bea-public-assets";

function exampleUrls(slug: string) {
  return {
    preview1800: `${GCS_PUBLIC_BASE}/examples/${slug}/1800-preview.png`,
    preview3000: `${GCS_PUBLIC_BASE}/examples/${slug}/3000-preview.png`,
    outline3000: `${GCS_PUBLIC_BASE}/examples/${slug}/3000-outline.png`,
  };
}

type CategoryKey = "family" | "pets" | "celebrations" | "others";

// Maps each category to its translation key. Values are lowercase --
// the sidebar header's CSS already applies text-transform: uppercase,
// so the same lowercase string also drops naturally into the
// description sentence ("Perfect for your favorite family photo")
// without needing a second, differently-cased key.
const CATEGORY_LABEL_KEY: Record<CategoryKey, string> = {
  family: "categoryFamily",
  pets: "categoryPets",
  celebrations: "categoryCelebrations",
  others: "categoryOthers",
};

type Example = {
  slug: string;
  labelKey: string;
  /** Sidebar grouping AND the source for the description sentence --
   *  order of first appearance in EXAMPLES below determines group
   *  display order. */
  categoryKey: CategoryKey;
  /** width/height of the source photo, e.g. 4/5 for portrait. Defaults to 3/4 if omitted. */
  aspectRatio?: number;
};

// All 16 were generated at Intermediate difficulty with the full
// color palette (per Mirjam, 2026-07-17) -- labelKey is genuinely the
// same across the board (confirmed, not a copy-paste bug like the old
// descKey was). Grouped and ordered into categories per Mirjam, 2026-07-17.
const EXAMPLES: Example[] = [
  { slug: "3GenMen",     labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "Boy",         labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "Family",      labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "BeachCouple", labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "2KidsDog",    labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "Bcouple",     labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "Dadgirl",     labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "Family4",     labelKey: "labelIntermediate", categoryKey: "family" },
  { slug: "CityDog",     labelKey: "labelIntermediate", categoryKey: "pets" },
  { slug: "DogRain",     labelKey: "labelIntermediate", categoryKey: "pets" },
  { slug: "Kitten",      labelKey: "labelIntermediate", categoryKey: "pets" },
  { slug: "60Bday",      labelKey: "labelIntermediate", categoryKey: "celebrations" },
  { slug: "Graduates",   labelKey: "labelIntermediate", categoryKey: "celebrations" },
  { slug: "Xmas",        labelKey: "labelIntermediate", categoryKey: "celebrations" },
  { slug: "Ktemple",     labelKey: "labelIntermediate", categoryKey: "others" },
  { slug: "Mountain",    labelKey: "labelIntermediate", categoryKey: "others" },
];

export default function Examples() {
  const t = useTranslations("examples");
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => setSelected(i => (i - 1 + EXAMPLES.length) % EXAMPLES.length), []);
  const next = useCallback(() => setSelected(i => (i + 1) % EXAMPLES.length), []);

  // Left/right arrow keys step through the sidebar selection -- same
  // keyboard affordance the old slideshow had, now driving example
  // choice instead of autoplay.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Groups EXAMPLES by category, preserving first-appearance order for
  // both the groups themselves and the items within each group -- so
  // reordering categories is just a matter of reordering EXAMPLES above,
  // no separate ordering config to keep in sync.
  const groups = useMemo(() => {
    const map = new Map<CategoryKey, { example: Example; index: number }[]>();
    EXAMPLES.forEach((example, index) => {
      const list = map.get(example.categoryKey) ?? [];
      list.push({ example, index });
      map.set(example.categoryKey, list);
    });
    return Array.from(map.entries());
  }, []);

  const ex = EXAMPLES[selected];
  const exUrls = exampleUrls(ex.slug);
  const aspect = ex.aspectRatio ?? 3 / 4;
  const categoryLabel = t(CATEGORY_LABEL_KEY[ex.categoryKey]);

  return (
    <>
      <style>{`
        .examples-grid {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 28px;
          margin-top: 28px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .examples-grid {
            grid-template-columns: 1fr;
          }
        }
        .examples-sidebar {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        @media (max-width: 768px) {
          .examples-sidebar {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 6px;
            gap: 20px;
          }
        }
        .examples-group-label {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .examples-group-thumbs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .examples-group-thumbs {
            flex-direction: row;
          }
        }
        .examples-thumb {
          padding: 3px;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          background: none;
          flex-shrink: 0;
        }
        .examples-thumb:hover {
          border-color: var(--border);
        }
        .examples-thumb.active {
          border-color: var(--pink);
        }
        .examples-slider-wrap {
          max-width: 420px;
        }
      `}</style>
      <Navbar />
      <main style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Nunito, sans-serif", color:"var(--pink)", fontWeight: 900, fontSize: "clamp(28px,4vw,44px)", marginBottom: 16 }}>
            📸 {t("title")}
          </h1>
          <p style={{ color: "#666", fontSize: 17, maxWidth: 560, margin: "0 auto 8px" }}>
            {t("subtitle")}
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13, maxWidth: 560, margin: "0 auto 24px" }}>
            All examples below were generated using our default settings and the full Guangna color palette.
          </p>
          <div style={{
            background: "linear-gradient(135deg,#FFF0F3,#FDF6F0)",
            border: "2px solid var(--pink)",
            borderRadius: 16,
            padding: "20px 28px",
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: "var(--pink)", marginBottom: 6 }}>
              🎁 {t("giftTitle")}
            </p>
            <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
              {t("giftText")}
            </p>
          </div>
        </div>

        <div className="examples-grid">
          {/* ── Sidebar: pick an example photo, grouped by category ── */}
          <div className="examples-sidebar">
            {groups.map(([categoryKey, items]) => (
              <div key={categoryKey}>
                <div className="examples-group-label">{t(CATEGORY_LABEL_KEY[categoryKey])}</div>
                <div className="examples-group-thumbs">
                  {items.map(({ example, index }) => (
                    <button
                      key={example.slug}
                      onClick={() => setSelected(index)}
                      className={`examples-thumb${index === selected ? " active" : ""}`}
                      aria-label={`${t(CATEGORY_LABEL_KEY[categoryKey])} — ${t(example.labelKey)}`}
                    >
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden" }}>
                        <Image src={exampleUrls(example.slug).preview3000} alt={`${t(CATEGORY_LABEL_KEY[categoryKey])} example`} fill sizes="64px" style={{ objectFit: "cover" }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Main: two stacked comparisons for the selected example ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{categoryLabel} · {t(ex.labelKey)}</div>
                <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{t("exampleDesc", { category: categoryLabel })}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={prev} aria-label={t("previousExample")} style={{
                  width: 36, height: 36, borderRadius: "50%", background: "white",
                  border: "2px solid var(--border)", cursor: "pointer", fontSize: 18,
                }}>‹</button>
                <button onClick={next} aria-label={t("nextExample")} style={{
                  width: 36, height: 36, borderRadius: "50%", background: "white",
                  border: "2px solid var(--border)", cursor: "pointer", fontSize: 18,
                }}>›</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)", marginBottom: 8 }}>
                  🔍 Preview quality: 1800px vs 3000px
                </p>
                <div className="examples-slider-wrap">
                  <BeforeAfterSlider
                    key={`${ex.slug}-res`}
                    beforeImage={exUrls.preview1800}
                    afterImage={exUrls.preview3000}
                    beforeLabel="1800px (free preview)"
                    afterLabel="3000px (purchased file)"
                    aspectRatio={aspect}
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                  Your free preview is generated at a lower resolution for speed. The file you receive
                  after ordering is generated fresh at full resolution, with sharper lines and richer detail.
                </p>
              </div>

              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)", marginBottom: 8 }}>
                  🎨 What you get: colored preview vs numbered outline
                </p>
                <div className="examples-slider-wrap">
                  <BeforeAfterSlider
                    key={`${ex.slug}-type`}
                    beforeImage={exUrls.preview3000}
                    afterImage={exUrls.outline3000}
                    beforeLabel="Colored preview"
                    afterLabel="Numbered outline"
                    aspectRatio={aspect}
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                  You paint from the numbered outline -- the colored preview is your reference for
                  which marker goes where.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/create" className="btn-primary" style={{ display: "inline-flex", fontSize: 17, padding: "16px 40px" }}>
            {t("createCta")}
          </Link>
        </div>
      </main>
    </>
  );
}
