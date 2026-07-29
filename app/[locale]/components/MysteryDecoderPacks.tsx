"use client";

// TEMPORARY MAINTENANCE VERSION (2026-07-29) -- swapped in to take the
// Mystery Decoder page offline immediately after finding errors in the
// downloadable PDFs (some extended symbols render blank/incorrect).
// No free-preview links, no checkout links, no purchasable content is
// rendered here at all -- nothing a customer could buy or download by
// mistake while this is up.
//
// TO RESTORE: once the PDF bugs are confirmed fixed and re-uploaded to
// the GCS bucket, swap this file back for the real MysteryDecoderPacks.tsx
// (keep a copy of the real one under a different filename before
// overwriting with this, so you don't lose it).

export default function MysteryDecoderPacks() {
  return (
    <div style={{ maxWidth: 640, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
      <h1
        style={{
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: "var(--pink)",
          marginBottom: 14,
        }}
      >
        Mystery Decoder — Back Soon
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--ink)" }}>
      The secret is almost out... 🤫
    We are putting the finishing touches on something special. Want to be the first to know when we launch?

    Bookmark this page and stay tuned!
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", marginTop: 18 }}>
       Interested? Email us
        at{" "}
        <a href="mailto:hello@creabeastudio.com" style={{ color: "var(--pink)", fontWeight: 600 }}>
          hello@creabeastudio.com
        </a>{" "}

      </p>
    </div>
  );
}