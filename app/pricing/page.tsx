"use client";
import Navbar from "../components/Navbar";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const params = useSearchParams();
  const variantId = params.get("variantId") ?? "";
  const email = params.get("email") ?? "";

  const STORE_SLUG = "creabeastudio";

  useEffect(() => {
    if (!variantId) return;
    const checkoutUrl = `https://${STORE_SLUG}.lemonsqueezy.com/checkout/buy/${variantId}${
      email ? `?checkout[email]=${encodeURIComponent(email)}` : ""
    }`;
    const timer = setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [variantId, email]);

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

        {variantId && (
          <p style={{ marginTop: 32, fontSize: 13, color: "var(--muted)" }}>
            Not redirected?{" "}
            <a
              href={`https://${STORE_SLUG}.lemonsqueezy.com/checkout/buy/${variantId}${
                email ? `?checkout[email]=${encodeURIComponent(email)}` : ""
              }`}
              style={{ color: "var(--pink)", fontWeight: 700 }}
            >
              Click here
            </a>
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
