"use client";
import Navbar from "../components/Navbar";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// LemonSqueezy checkout UUIDs per level — LIVE MODE
const LEVEL_TO_CHECKOUT_UUID: Record<string, string> = {
  "15": "5b978c55-d770-4952-845f-57f4d5abbbe0", // Beginner
  "24": "2eef5a5c-5ec2-4885-bbef-73f071e42045", // Intermediate
  "36": "9f2e5dc6-34d0-4118-a292-e16c1c4472ab", // Advanced
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