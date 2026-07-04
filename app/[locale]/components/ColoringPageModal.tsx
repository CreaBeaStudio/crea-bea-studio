"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BeforeAfterSlider from "./BeforeAfterSlider";
import type { ColoringPage } from "@/lib/coloringPages";

type Props = {
  page: ColoringPage;
  isPaid: boolean;
  previewLabel: string;
  downloadButtonLabel: string;
  comingSoonLabel: string;
};

export default function ColoringPageModal({
  page,
  isPaid,
  previewLabel,
  downloadButtonLabel,
  comingSoonLabel,
}: Props) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 20, padding: 28,
          maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={close}
          aria-label="Close preview"
          style={{
            position: "absolute", top: 14, right: 14, width: 32, height: 32,
            borderRadius: "50%", border: "none", background: "var(--cream)",
            cursor: "pointer", fontSize: 18, lineHeight: 1,
          }}
        >
          ×
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "var(--ink)", paddingRight: 30 }}>
          {page.title}
        </h2>
        {page.description && (
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
            {page.description}
          </p>
        )}

        {page.exampleImage && page.outlineImage && (
          <div style={{ marginBottom: 20 }}>
            <BeforeAfterSlider
              beforeImage={`/coloring-pages/thumbs/${page.exampleImage}`}
              afterImage={`/coloring-pages/thumbs/${page.outlineImage}`}
              beforeLabel={"Reference"}
              afterLabel={previewLabel}
              aspectRatio={3 / 4}
            />
          </div>
        )}

        {isPaid ? (
          <div style={{
            textAlign: "center", padding: "14px", borderRadius: 12,
            background: "var(--cream)", color: "var(--muted)", fontSize: 14,
          }}>
            {comingSoonLabel}
          </div>
        ) : (
          <a
            href={`/coloring-pages/${page.fileName}`}
            download
            style={{
              display: "block", textAlign: "center", padding: "12px 20px",
              borderRadius: 12, background: "var(--pink)", color: "white",
              fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}
          >
            {downloadButtonLabel}
          </a>
        )}
      </div>
    </div>
  );
}
