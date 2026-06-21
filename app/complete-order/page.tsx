"use client";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const LEVELS: Record<string, { label: string; price: number; priceLabel: string }> = {
  "15": { label: "🌱 Beginner",     price: 7,  priceLabel: "7€"  },
  "24": { label: "🌿 Intermediate", price: 9,  priceLabel: "9€"  },
  "36": { label: "🌲 Advanced",     price: 11, priceLabel: "11€" },
};

function CompleteOrderContent() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
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

  const goToCheckout = async () => {
    setLoading(true);
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
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Please contact hello@creabeastudio.com.");
      setLoading(false);
    }
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
          Your Order is Reserved 🎉
        </h1>
        <p style={{ color:"#666", fontSize:15, marginBottom:32 }}>
        Your order has been successfully reserved.
        We are currently finalizing our payment setup. 
        No action needed for now — we will notify you by email as soon as checkout goes live.
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
