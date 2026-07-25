"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  MARKER_SETS,
  pageMatchesMarkerSet,
  coloringPageThumbUrl,
  type CategoryId,
  type ColoringPage,
  type MarkerSetValue,
} from "@/lib/coloringPages";

type Props = {
  pages: ColoringPage[];
  previewLabel: string;
  downloadButtonLabel: string;
  viewPageLabel: string;
};

// Shared control styling so Categories buttons, the marker-set dropdown,
// and the search input all look like one consistent block instead of
// three different browser-default form elements. These intentionally
// override the site-wide `select, input[type="text"]` rule in
// globals.css (2px border / 14px padding) so everything here matches.
const controlBase: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  fontSize: 14,
  color: "var(--ink)",
  background: "white",
  fontFamily: "inherit",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8,
};

export default function ColoringPagesBrowser({
  pages,
  previewLabel,
  downloadButtonLabel,
  viewPageLabel,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  // Single-select: only one category can be active at a time.
  // Clicking the already-active category clears the selection.
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [markerSet, setMarkerSet] = useState<MarkerSetValue | "">("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectCategory = (id: CategoryId) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setMarkerSet("");
  };

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pages.filter((page) => {
      const matchesCategory =
        !selectedCategory ||
        (page.categories || []).includes(selectedCategory);

      const matchesMarkerSet = !markerSet || pageMatchesMarkerSet(page, markerSet);

      const matchesSearch =
        !q ||
        page.title.toLowerCase().includes(q) ||
        (page.description || "").toLowerCase().includes(q) ||
        (page.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesMarkerSet && matchesSearch;
    });
  }, [pages, searchQuery, selectedCategory, markerSet]);

  const hasActiveFilters =
    selectedCategory !== null || searchQuery.trim().length > 0 || markerSet !== "";

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0) + (markerSet ? 1 : 0);

  const filterPanel = (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ ...sectionLabelStyle, marginBottom: 0 }}>Categories</div>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              fontSize: 12,
              color: "var(--pink)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
          >
            Clear category
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              aria-pressed={active}
              style={{
                ...controlBase,
                textAlign: "left",
                padding: "9px 12px",
                border: "1px solid " + (active ? "var(--pink)" : "var(--border)"),
                background: active ? "var(--pink)" : "white",
                color: active ? "white" : "var(--ink)",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0 16px" }} />

      <label htmlFor="marker-set-filter" style={{ ...sectionLabelStyle, display: "block" }}>
        Your Guangna Set
      </label>
      <select
        id="marker-set-filter"
        value={markerSet}
        onChange={(e) => setMarkerSet(e.target.value as MarkerSetValue | "")}
        autoComplete="off"
        style={{ ...controlBase, cursor: "pointer", marginBottom: 6 }}
      >
        <option value="">Any set</option>
        {MARKER_SETS.map((set) => (
          <option key={set.value} value={set.value}>
            {set.label}-marker set
          </option>
        ))}
      </select>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
        Shows pages that only need colors from your set or smaller.
      </p>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0 16px" }} />

      <div style={sectionLabelStyle}>Search</div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search coloring pages..."
        style={{ ...controlBase, marginBottom: hasActiveFilters ? 16 : 0 }}
      />

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            fontSize: 13,
            color: "var(--pink)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontWeight: 600,
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="coloring-browser">
      {/* Mobile-only toggle button (hidden on desktop via CSS) */}
      <button
        className="coloring-mobile-toggle"
        onClick={() => setMobileFiltersOpen((v) => !v)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 10,
          border: "1px solid var(--border)", background: "white",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          marginBottom: 16, textAlign: "left",
        }}
      >
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Filters {hasActiveFilters ? `(${activeFilterCount})` : ""}</span>
          <span>{mobileFiltersOpen ? "▲" : "▼"}</span>
        </span>
      </button>

      <aside className={`coloring-filters${mobileFiltersOpen ? " open" : ""}`}>
        {filterPanel}
      </aside>

      <div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          {filteredPages.length} {filteredPages.length === 1 ? "page" : "pages"}
        </p>

        {filteredPages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            No coloring pages match your filters.{" "}
            <button
              onClick={clearFilters}
              style={{ color: "var(--pink)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 20,
          }}>
            {filteredPages.map((page) => (
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
                          src={coloringPageThumbUrl(page.exampleImage)}
                          alt={`${page.title} —  Reference`}
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
                          src={coloringPageThumbUrl(page.outlineImage)}
                          alt={`${page.title} — coloring page preview`}
                          style={{
                            width: "100%", aspectRatio: "3 / 4", objectFit: "cover",
                            borderRadius: 10, border: "1px solid var(--border)", display: "block",
                            background: "white",
                          }}
                        />
                        <div style={{ textAlign: "center", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                          {previewLabel}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
