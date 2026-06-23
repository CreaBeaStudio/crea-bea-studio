"use client";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

const EXAMPLES = [
  { photo: "/example-family-15.png", labelKey: "labelBeginner", descKey: "descFamilyCelebration" },
  { photo: "/example-city-dog-24.png", labelKey: "labelIntermediate", descKey: "descPet" },
  { photo: "/example-beach-couple-36.png", labelKey: "labelAdvanced", descKey: "descHolidayCelebration" },
  { photo: "/example-kitten-15.png", labelKey: "labelBeginner", descKey: "descPet" },
  { photo: "/example-col-couple-24.png", labelKey: "labelIntermediate", descKey: "descFamilyCelebration" },
  { photo: "/example-dog-rain-15.png", labelKey: "labelBeginner", descKey: "descPet" },
  { photo: "/example-wedding-24.png", labelKey: "labelIntermediate", descKey: "descFamilyCelebration" },
  { photo: "/example-fieldflower-24.png", labelKey: "labelIntermediate", descKey: "descNatureHoliday" },
  { photo: "/example-graduate-24.png", labelKey: "labelIntermediate", descKey: "descCelebration" },
  { photo: "/example-3kids-36.png", labelKey: "labelAdvanced", descKey: "descFamily" },
  { photo: "/example-ktemple-36.png", labelKey: "labelAdvanced", descKey: "descHoliday" },
  { photo: "/example-boy-15.png", labelKey: "labelBeginner", descKey: "descFamily" },
  { photo: "/example-bday-36.png", labelKey: "labelAdvanced", descKey: "descCelebrationFamily" },
  { photo: "/example-mountain-15.png", labelKey: "labelBeginner", descKey: "descHoliday" },
  { photo: "/example-girl-24.png", labelKey: "labelIntermediate", descKey: "descFamily" },
  { photo: "/example-poppy-36.png", labelKey: "labelAdvanced", descKey: "descNatureHoliday" },
  { photo: "/example-xmas-15.png", labelKey: "labelBeginner", descKey: "descHolidayCelebration" },
  { photo: "/example-babyhand-36.png", labelKey: "labelAdvanced", descKey: "descFamilyCelebration" },
];

const AUTOPLAY_INTERVAL = 4000;

export default function Examples() {
  const t = useTranslations("examples");
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const prev = useCallback(() => setCurrent(c => (c - 1 + EXAMPLES.length) % EXAMPLES.length), []);
  const next = useCallback(() => setCurrent(c => (c + 1) % EXAMPLES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(t);
  }, [paused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { setPaused(true); prev(); }
      if (e.key === "ArrowRight") { setPaused(true); next(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const ex = EXAMPLES[current];

  return (
    <>
      <Navbar />
      <main style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color:"var(--pink)", fontWeight: 900, fontSize: "clamp(28px,4vw,44px)", marginBottom: 16 }}>
          📸 {t("title")}
        </h1>
        <p style={{ color: "#666", fontSize: 17, maxWidth: 560, margin: "0 auto 48px" }}>
          {t("subtitle")}
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
        {/* ── Slideshow ── */}
        <div
          style={{ position: "relative", maxWidth: 600, margin: "0 auto 48px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div style={{
            background: "white",
            borderRadius: 24,
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}>
          <div style={{ lineHeight: 0 }}>
            <Image
              src={ex.photo}
              alt={t(ex.labelKey)}
              width={0}
              height={0}
              sizes="820px"
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </div>

            {/* Caption + dot indicators */}
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{t(ex.labelKey)}</div>
                <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{t(ex.descKey)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {EXAMPLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPaused(true); setCurrent(i); }}
                    aria-label={t("goToExample", { number: i + 1 })}
                    style={{
                      width: i === current ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: "none",
                      background: i === current ? "var(--pink, #e85d8a)" : "#ddd",
                      cursor: "pointer",
                      padding: 0,
                      transition: "width 0.25s, background 0.2s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Arrow: Previous */}
          <button
            onClick={() => { setPaused(true); prev(); }}
            aria-label={t("previousExample")}
            style={{
              position: "absolute", left: -20, top: "40%", transform: "translateY(-50%)",
              width: 44, height: 44, borderRadius: "50%",
              background: "white", border: "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#444", lineHeight: 1, zIndex: 10,
            }}
          >
            ‹
          </button>

          {/* Arrow: Next */}
          <button
            onClick={() => { setPaused(true); next(); }}
            aria-label={t("nextExample")}
            style={{
              position: "absolute", right: -20, top: "40%", transform: "translateY(-50%)",
              width: 44, height: 44, borderRadius: "50%",
              background: "white", border: "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#444", lineHeight: 1, zIndex: 10,
            }}
          >
            ›
          </button>
        </div>

        <Link href="/create" className="btn-primary" style={{ display: "inline-flex", fontSize: 17, padding: "16px 40px" }}>
          {t("createCta")}
        </Link>
      </main>
    </>
  );
}