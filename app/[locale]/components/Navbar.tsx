"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  // UPDATED (2026-07-23): "Create" is now a dropdown grouping the two
  // paid-generation features (Guangna-by-Number, Swatch Card Creator's
  // paywalled unlock) -- previously "Guangna-by-Number" was a bare
  // top-level link and "Swatch Card Creator" lived under Tools
  // alongside the genuinely free converters. Moving it out of Tools
  // reflects that Tools = free, Create = paid.
  //
  // UPDATED (earlier session): "mysteryDecoder" added as its own
  // top-level link (not nested in the Create dropdown) -- a dedicated
  // page for the Mystery Coloring Page Decoder, placed right after
  // Create since it's another paid product, but standalone per her
  // request. Its label is long ("Mystery Coloring Page Decoder" / FR
  // equivalent) and is allowed to wrap to two lines on desktop -- see
  // the width/whiteSpace override below, applied only to this link.
  //
  // UPDATED (2026-07-29): navbar was getting too long. Added a new
  // "helpCenter" dropdown grouping Examples, Tips & Tricks, and FAQ
  // (informational/support content) -- same pattern as the Tools
  // dropdown. Mystery Decoder and Free Coloring Pages stay top-level
  // (Free Coloring Pages is a conversion/lead-gen page, not a help
  // page, per her call).
  const LINKS = [
    ["home", "/"],
    { labelKey: "create", children: [
      ["createGuangna", "/create"],
      ["swatchCreator", "/swatch-creator"],
    ]},
    ["mysteryDecoder", "/mystery-decoder"],
    { labelKey: "tools", children: [
      ["colorConverter", "/color-converter"],
      ["legendConverter", "/legend-converter"],
      ["languoConverter", "/languo-converter"],
      ["guangnaReference", "/guangna-reference"],
    ]},
    ["freeColoringPages", "/free-coloring-pages"],
    { labelKey: "helpCenter", children: [
      ["examples", "/examples"],
      ["tips", "/tips"],
      ["faq", "/faq"],
    ]},
  ];

  return (
    <>
      <style>{`
        .nav-link:hover { background: var(--cream); }
        .mobile-menu a:hover { background: var(--cream); }
        .tagline-short { display: none; }
        .desktop-links { display: flex; }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px;
          min-width: 220px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          z-index: 200;
          flex-direction: column;
          gap: 4px;
        }
        .dropdown-wrapper:hover .dropdown-menu { display: flex; }
        .dropdown-menu a:hover { background: var(--cream); border-radius: 8px; }
        @media (max-width: 900px) {
          .desktop-links { display: none !important; }
          .hamburger { display: flex !important; }
          .tagline-full { display: none; }
          .tagline-short { display: inline; }
        }
        @media (min-width: 901px) {
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        background: "white",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
          gap: 24,
        }}>
          {/* Logo + tagline */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Image src="/marketing/cat-logo.png" alt="CreaBeaStudio" width={100} height={100}
              style={{ objectFit: "contain", alignSelf: "flex-end", width:"auto" }} />
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14, color: "var(--pink)" }}>♥</span>
              <span className="tagline-full" style={{ fontSize: 18, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>{t("tagline")}</span>
              <span className="tagline-short" style={{ fontSize: 16, color: "var(--pink)", fontWeight: 700, whiteSpace: "nowrap" }}>{t("taglineShort")}</span>
              <span style={{ fontSize: 14, color: "var(--pink)" }}>♥</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="desktop-links" style={{ alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
            {LINKS.map((item: any) => {
              if (item.children) {
                return (
                  <div key={item.labelKey} className="dropdown-wrapper" style={{ position: "relative" }}>
                    <button className="nav-link" style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--ink)", fontSize: 15, fontWeight: 500,
                      padding: "6px 12px", borderRadius: 8, whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      {t(item.labelKey)} <span style={{ fontSize: 11 }}>▾</span>
                    </button>
                    <div className="dropdown-menu">
                      {item.children.map(([labelKey, href]: string[]) => (
                        <Link key={labelKey} href={href} style={{
                          textDecoration: "none", color: "var(--ink)",
                          fontSize: 14, fontWeight: 500, padding: "8px 12px",
                          display: "block", whiteSpace: "nowrap",
                        }}>{t(labelKey)}</Link>
                      ))}
                    </div>
                  </div>
                );
              }
              const isFreePages = item[0] === "freeColoringPages";
              // Long two-line label -- allowed to wrap instead of the
              // usual single-line nowrap treatment every other
              // top-level link uses.
              const isMysteryDecoder = item[0] === "mysteryDecoder";
return (
  <Link key={item[0]} href={item[1]} className="nav-link" style={{
    textDecoration: "none",
    color: isFreePages ? "var(--pink)" : "var(--ink)",
    fontSize: 15,
    fontWeight: isFreePages ? 700 : 500,
    padding: "6px 12px", borderRadius: 8,
    whiteSpace: isMysteryDecoder ? "normal" : "nowrap",
    ...(isMysteryDecoder ? { maxWidth: 120, textAlign: "center", lineHeight: 1.25 } : {}),
  }}>
    {t(item[0])}
  </Link>
);
            })}

            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Email icon */}
            <a href="mailto:hello@creabeastudio.com" title="Contact us" style={{
              textDecoration: "none", color: "var(--ink)",
              padding: "6px 10px", borderRadius: 8, fontSize: 20,
              display: "flex", alignItems: "center",
            }}>
              ✉️
            </a>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            className="hamburger"
            onClick={() => setOpen(!open)}
            style={{
              display: "none", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              gap: 5, background: "none", border: "none",
              cursor: "pointer", padding: 8, borderRadius: 8,
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)", borderRadius: 2,
              transition: "transform 0.2s",
              transform: open ? "rotate(45deg) translate(5px, 5px)" : "none",
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)", borderRadius: 2,
              opacity: open ? 0 : 1, transition: "opacity 0.2s",
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)", borderRadius: 2,
              transition: "transform 0.2s",
              transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="mobile-menu" style={{
          display: open ? "flex" : "none",
          flexDirection: "column",
          borderTop: "1px solid var(--border)",
          paddingBottom: 12,
        }}>
          {LINKS.map((item: any) => {
            if (item.children) {
              return (
                <div key={item.labelKey}>
                  <div style={{ padding: "12px 8px 4px", fontSize: 13, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t(item.labelKey)}
                  </div>
                  {item.children.map(([labelKey, href]: string[]) => (
                    <Link key={labelKey} href={href} onClick={() => setOpen(false)} style={{
                      textDecoration: "none", color: "var(--ink)", fontSize: 16,
                      fontWeight: 500, padding: "10px 16px", display: "block", borderRadius: 8,
                    }}>{t(labelKey)}</Link>
                  ))}
                </div>
              );
            }
            const isFreePagesMobile = item[0] === "freeColoringPages";
return (
  <Link key={item[0]} href={item[1]} onClick={() => setOpen(false)} style={{
    textDecoration: "none",
    color: isFreePagesMobile ? "var(--pink)" : "var(--ink)",
    fontSize: 17,
    fontWeight: isFreePagesMobile ? 700 : 500,
    padding: "12px 8px", borderRadius: 8,
  }}>{t(item[0])}</Link>
);
          })}

          <div style={{ padding: "12px 8px" }}>
            <LanguageSwitcher />
          </div>

          <a href="mailto:hello@creabeastudio.com" style={{
            textDecoration: "none", color: "var(--ink)", fontSize: 17,
            fontWeight: 500, padding: "12px 8px", borderRadius: 8,
          }}>✉️ {t("contactUs")}</a>
        </div>
      </nav>
    </>
  );
}