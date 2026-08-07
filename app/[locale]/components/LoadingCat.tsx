"use client";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import catAnimation from "./walking_cat_footprints.json";
import catScratches from "./Cat_scratches.json";
import pawsAnimation from "./paws.json";

// UPDATED (2026-08-06, per Mirjam): generation now regularly runs
// 30-50s+ (single 3000px branch, no resolution cut -- her call: real
// paying customers will wait a realistic minute for a genuinely
// convincing preview, so the fix is making the WAIT better, not
// shorter). Previously a single looping animation; now rotates
// through three, each with its own caption, so a long wait feels
// dynamic rather than static. Purely decorative/client-side, zero
// effect on actual generation time (server-side on Cloud Run).
//
// To add/swap an animation: drop the .json file in this same folder,
// import it above, and add one entry to ANIMATIONS below -- everything
// else (rotation, captions, sizing) is automatic.
const ANIMATIONS = [
  { data: catAnimation, caption: "Following the paw prints to your preview..." },
  { data: catScratches, caption: "Sharpening every little outline..." },
  { data: pawsAnimation, caption: "Chasing down the perfect colors..." },
];

// How long each animation gets before rotating to the next. At 9s x 3
// animations, a full cycle takes ~27s -- roughly matching a typical
// single-brand generation; a longer cross-brand wait just sees the
// cycle repeat, which is fine (each animation still loops smoothly
// within its own slot rather than looking stuck).
const ROTATE_INTERVAL_MS = 9000;

export default function LoadingCat() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % ANIMATIONS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const current = ANIMATIONS[index];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* key={index} forces a clean remount per animation switch --
            without it, lottie-react tries to diff between two
            different JSON sources instead of restarting fresh. */}
        <Lottie
          key={index}
          animationData={current.data}
          loop
          autoplay
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
      <p style={{
        fontSize: 12.5, color: "var(--muted)", fontWeight: 600,
        textAlign: "center", minHeight: 18, transition: "opacity 0.3s",
      }}>
        {current.caption}
      </p>
    </div>
  );
}