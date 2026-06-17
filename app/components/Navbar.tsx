"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const LINKS = [
  ["Home", "/"],
  ["Create", "/create"],
  ["Guangna Color Converter", "/color-converter"],
  ["Examples", "/examples"],
  ["Tips & Tricks", "/tips"],
  ["FAQ", "/faq"],
  ["Check out", "/pricing"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-links a:hover {
          background: var(--cream);
        }
        .mobile-menu a:hover {
          background: var(--cream);
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .nav-tagline { display: none !important; }
        }
        @media (min-width: 769px) {
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
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Image src="/cat-logo.png" alt="CreaBeaStudio" width={100} height={100}
              style={{ objectFit: "contain", alignSelf: "flex-end" }} />
            <span className="nav-tagline" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14, color: "var(--pink)" }}>♥</span>
              <span style={{ fontSize: 22, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>Color Your Memories</span>
              <span style={{ fontSize: 14, color: "var(--pink)" }}>♥</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links" style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
            {LINKS.map(([label, href]) => (
              <Link key={label} href={href} style={{
                textDecoration: "none", color: "var(--ink)", fontSize: 15,
                fontWeight: 500, padding: "6px 8px", borderRadius: 8, whiteSpace: "nowrap"
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Hamburger button */}
          <button
            className="hamburger"
            onClick={() => setOpen(!open)}
            style={{
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)",
              borderRadius: 2,
              transition: "transform 0.2s",
              transform: open ? "rotate(45deg) translate(5px, 5px)" : "none",
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)",
              borderRadius: 2,
              opacity: open ? 0 : 1,
              transition: "opacity 0.2s",
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: "var(--ink)",
              borderRadius: 2,
              transition: "transform 0.2s",
              transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className="mobile-menu" style={{
          display: open ? "flex" : "none",
          flexDirection: "column",
          borderTop: "1px solid var(--border)",
          paddingBottom: 12,
        }}>
          {LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                textDecoration: "none",
                color: "var(--ink)",
                fontSize: 17,
                fontWeight: 500,
                padding: "12px 8px",
                borderRadius: 8,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
