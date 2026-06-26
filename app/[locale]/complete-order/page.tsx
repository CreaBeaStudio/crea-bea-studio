"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { buildPayhipCheckoutUrl } from "../../lib/payhip"; // adjust path if your lib folder is elsewhere

// Flip this in Vercel's Environment Variables when Payhip/Stripe are fully approved.
// NEXT_PUBLIC_PAYHIP_ENABLED=true
const PAYHIP_ENABLED = process.env.NEXT_PUBLIC_PAYHIP_ENABLED === "true";

const LEVELS: Record<string, { label: string; price: number; priceLabel: string }> = {
  "15": { label: "🌱 Beginner",     price: 7,  priceLabel: "7€"  },
  "24": { label: "🌿 Intermediate", price: 9,  priceLabel: "9€"  },
  "36": { label: "🌲 Advanced",     price: 11, priceLabel: "11€" },
};

function CompleteOrderContent() {
  const params = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<"lemonsqueezy" | "payhip" | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const email        = params.get("email")       ?? "";
  const orderId       = params.get("orderId")     ?? "";
  const levelsRaw      = params.get("levels")      ?? "";
  const photoNamesRaw = params.get("photoNames")  ?? "";

  const levels     = levelsRaw.split(",").filter(Boolean);
  const photoNames = photoNamesRaw.split("|").filter(Boolean);

  const items = levels.map((lvl, i) => ({
    level: lvl,
    photoName: photoNames[i] ?? "—",
    ...(LEVELS[lvl] ?? { label: "—", price: 0, priceLabel: "—" }),
  }));

  const grandTotal = items.reduce((acc, i) => acc + i.price, 0);

  const goToLemonSqueezyCheckout = async () => {
    setLoadingProvider("lemonsqueezy");
    setCheckoutError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levels,
          email,
          orderId,
          levelLabel: items.map(i => i.label).join(", "),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error || "Could not start checkout. Please contact hello@creabeastudio.com.");
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Please contact hello@creabeastudio.com.");
      setLoadingProvider(null);
    }
  };

  const goToPayhipCheckout = () => {
    setLoadingProvider("payhip");
    setCheckoutError("");
    const url = buildPayhipCheckoutUrl(levels);
    if (!url) {
      setCheckoutError("This combination isn't set up yet for EUR/GBP payment. Please contact hello@creabeastudio.com or use the USD option.");
      setLoadingProvider(null);
      return;
    }
    window.location.href = url;
  };

  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:560, margin:"0 auto", textAlign:"center" }}>
        <div style={{ marginBottom:12 }}>
          <Image src="/Guangna_brush.png" alt="Guangna brush" width={140} height={96}
            style={{ objectFit:"contain", height:"auto", display:"block", margin:"0 auto" }} />
        </div>

        <h1 style={{
          fontFamily:"Nunito, sans-serif", color:"var(--pink)",
          fontWeight:900, fontSize:"clamp(22px,4vw,34px)", marginBottom:12,
        }}>
          Almost there! 🎉
        </h1>
        <p style={{ color:"#666", fontSize:15, marginBottom:32 }}>
          Review your order below and choose how you'd like to pay.
        </p>

        {orderId && (
          <div style={{
            background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)",
            border:"2px solid var(--border)", borderRadius:16,
            padding:"20px 24px", marginBottom:24, textAlign:"left",
          }}>
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < items.length - 1 ? 16 : 0, paddingBottom: i < items.length - 1 ? 16 : 0, borderBottom: i < items.length - 1 ? "1px solid #f0d0d8" : "none" }}>
                <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>📷 Photo {items.length > 1 ? `#${i+1}` : ""}</p>
                <p style={{ fontWeight:700, marginBottom:8 }}>{item.photoName}</p>
                <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>🎯 Level</p>
                <p style={{ fontWeight:700 }}>{item.label} — {item.priceLabel}</p>
              </div>
            ))}
            <p style={{ fontSize:13, color:"var(--muted)", marginTop:16, marginBottom:4 }}>🔖 Order ref</p>
            <p style={{ fontWeight:700 }}>{orderId}</p>
          </div>
        )}

        {checkoutError && (
          <div style={{ background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14, marginBottom:16 }}>
            ⚠️ {checkoutError}
          </div>
        )}

        {PAYHIP_ENABLED && (
          <p style={{ fontSize:14, color:"var(--muted)", marginBottom:12, fontWeight:700 }}>
            How would you like to pay?
          </p>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:8 }}>
          {PAYHIP_ENABLED && (
            <button
              onClick={goToPayhipCheckout}
              disabled={loadingProvider !== null}
              style={{
                padding:"14px 20px",
                borderRadius:12,
                border:"2px solid var(--pink)",
                background:"white",
                color:"var(--pink)",
                fontWeight:700,
                fontSize:15,
                cursor:"pointer",
              }}
            >
              {loadingProvider === "payhip" ? "Redirecting…" : "🇪🇺🇬🇧 Pay in EUR / GBP"}
            </button>
          )}

          <button
            onClick={goToLemonSqueezyCheckout}
            disabled={loadingProvider !== null}
            style={{
              padding:"14px 20px",
              borderRadius:12,
              border:"none",
              background:"var(--pink)",
              color:"white",
              fontWeight:700,
              fontSize:15,
              cursor:"pointer",
            }}
          >
            {loadingProvider === "lemonsqueezy"
              ? "Redirecting…"
              : PAYHIP_ENABLED
                ? "🌍 Pay in USD"
                : "Continue to Payment"}
          </button>
        </div>

        <p style={{ marginTop:24, fontSize:13, color:"var(--muted)" }}>
          Questions? Email us at <a href="mailto:hello@creabeastudio.com" style={{ color:"var(--pink)" }}>hello@creabeastudio.com</a>
        </p>
      </main>
    </>
  );
}

export default function CompleteOrderPage() {
  return <Suspense><CompleteOrderContent /></Suspense>;
}
