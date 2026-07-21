"use client";
import Lottie from "lottie-react";
import catAnimation from "./walking_cat_footprints.json";

// Cute loading animation shown while /api/generate-preview is in flight
// (roughly 15-30s). Purely decorative and client-side -- has zero effect
// on actual generation time, which happens entirely server-side on
// Cloud Run. To swap the animation later, just replace
// walking_cat_footprints.json with a different Lottie export (same
// filename, or update the import below) -- lottie-react reads the
// JSON directly, no build step needed.
//
// Reverted to natural square aspect (2026-07-17, per Mirjam) -- the
// source animation is a square (512x512) composition. The previous
// full-width stretch (preserveAspectRatio: "none", 2026-07-16)
// distorted the paw shapes horizontally to fill the wider card; this
// instead renders it at its natural aspect ratio, sized down and
// centered under the button rather than spanning the full card width.
export default function LoadingCat() {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 140, height: 140 }}>
        <Lottie
          animationData={catAnimation}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
