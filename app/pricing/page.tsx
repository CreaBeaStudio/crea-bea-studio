"use client";
import Navbar from "../components/Navbar";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// LemonSqueezy checkout UUIDs per level
const LEVEL_TO_CHECKOUT_UUID: Record<string, string> = {
  "15": "7306ab5e-63cd-437e-a651-dec75cb55026", // Beginner
  "24": "faeed499-4436-4638-8aca-87c8cbe81acd", // Intermediate
  "36": "9e440091-97a9-4fff-983c-ed21467b0465", // Advanced
};

function PricingContent() {
  const params = useSearchParams();
  const level   = params.get("level") ?? "";
  const email   = params.get("email") ?? "";

  const STORE_SLUG = "creabeastudio";
  const checkoutUuid = LEVEL_TO_CHECKOUT_UUID[level] ?? "";

  const checkoutUrl = checkoutUuid
    ? `https://${STORE_SLUG}.lemonsqueezy.com/checkout/buy/${checkoutUuid}${
        email ? `?checkout[email]=${encodeURIComponent(email)}` : ""
      }`
    : "";

  useEffect(() => {
    if (!checkoutUrl) return;
    const timer = setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [checkoutUrl]);

  return (
    <>
      <Navbar />
      <main style={{ padding: "80px 24px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>

        <h1 style={{
          fontFamily: "Nunito, sans-serif",
          color: "var(--pink)",
          fontWeight: 900,
          fontSize: "clamp(24px, 4vw, 36px)",
          marginBottom: 16,
        }}>
          Thank you for your order!
        </h1>

        <p style={{ color: "#666", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          You will be redirected to Lemon Squeezy to complete your payment shortly…
        </p>

        {/* Animated dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 12, height: 12,
              borderRadius: "50%",
              background: "var(--pink)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {checkoutUrl && (
          <p style={{ marginTop: 32, fontSize: 13, color: "var(--muted)" }}>
            Not redirected?{" "}
            <a href={checkoutUrl} style={{ color: "var(--pink)", fontWeight: 700 }}>
              Click here
            </a>
          </p>
        )}

        {!checkoutUrl && (
          <p style={{ marginTop: 32, fontSize: 13, color: "#c62828" }}>
            ⚠️ Could not find checkout link for the selected level. Please go back and try again, or contact us at hello@creabeastudio.com.
          </p>
        )}
      </main>
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
