"use client";
import Image from "next/image"
import Navbar from "../components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const LEVELS: Record<string, { label: string; price: number; priceLabel: string }> = {
  "15": { label: "🌱 Beginner",     price: 7,  priceLabel: "7€"  },
  "24": { label: "🌿 Intermediate", price: 9,  priceLabel: "9€"  },
  "36": { label: "🌲 Advanced",     price: 11, priceLabel: "11€" },
};

type OrderItem = {
  photoName: string;
  level: string;
  levelLabel: string;
  price: number;
  priceLabel: string;
  sets: string[];
  indPens: string;
};

function ConfirmContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const email        = params.get("email")        ?? "";
  const levelValue   = params.get("level")        ?? "24";
  const photoName    = params.get("photoName")    ?? "—";
  const setsRaw      = params.get("sets")         ?? "";
  const indPens      = params.get("indPens")      ?? "";
  const orderId      = params.get("orderId")      ?? "";
  const prevOrdersRaw = params.get("prevOrders")  ?? "[]";

  const levelInfo = LEVELS[levelValue] ?? { label: "—", price: 0, priceLabel: "—" };
  const sets      = setsRaw ? setsRaw.split("|").filter(Boolean) : [];

  let prevOrders: OrderItem[] = [];
  try { prevOrders = JSON.parse(decodeURIComponent(prevOrdersRaw)); } catch {}

  const thisOrder: OrderItem = {
    photoName,
    level:      levelValue,
    levelLabel: levelInfo.label,
    price:      levelInfo.price,
    priceLabel: levelInfo.priceLabel,
    sets,
    indPens,
  };
  const allOrders  = [...prevOrders, thisOrder];
  const grandTotal = allOrders.reduce((acc, o) => acc + o.price, 0);

  const goToCheckout = async () => {
    setLoading(true);
    setCheckoutError("");
    try {
      const allLevels = allOrders.map(o => o.level);
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levels: allLevels,
          email,
          orderId,
          levelLabel: levelInfo.label,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError("Could not start checkout. Please try again or contact hello@creabeastudio.com.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setCheckoutError("Something went wrong. Please try again or contact hello@creabeastudio.com.");
      setLoading(false);
    }
  };

  const goBack = () => {
    const q = new URLSearchParams({
      email, level: levelValue, sets: setsRaw, indPens,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    router.push(`/create?${q.toString()}`);
  };

  const orderAnother = () => {
    const q = new URLSearchParams({
      email, sets: setsRaw, indPens,
      prevOrders: encodeURIComponent(JSON.stringify(allOrders)),
    });
    router.push(`/create?${q.toString()}`);
  };

  return (
    <>
      <Navbar />
      <main style={{ padding:"60px 24px", maxWidth:640, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ marginBottom:12 }}>
  <Image src="/Guangna_brush.png" alt="Guangna brush" width={160} height={110}
    style={{ objectFit:"contain", height:"auto", display:"block", margin:"0 auto" }} />
</div>
          <h1 style={{
            fontFamily:"Nunito, sans-serif", color:"var(--pink)",
            fontWeight:900, fontSize:"clamp(22px,4vw,34px)", marginBottom:8,
          }}>
            Is everything correct?
          </h1>
          <p style={{ color:"#666", fontSize:15 }}>Please review your order before proceeding.</p>
        </div>

        {/* Previous orders */}
        {prevOrders.length > 0 && (
          <div style={{
            background:"white", border:"2px solid var(--border)",
            borderRadius:16, padding:"18px 22px", marginBottom:16,
          }}>
            <p style={{ fontWeight:700, fontSize:14, color:"#555", marginBottom:10 }}>
              🛒 Previous orders in your cart:
            </p>
            {prevOrders.map((o, i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between",
                fontSize:13, color:"#666", padding:"4px 0",
                borderBottom: i < prevOrders.length - 1 ? "1px solid #f0f0f0" : "none",
              }}>
                <span>#{i+1} · {o.photoName} · {o.levelLabel}</span>
                <span style={{ fontWeight:600 }}>{o.priceLabel}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current order summary */}
        <div style={{
          background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)",
          border:"2px solid var(--border)", borderRadius:18,
          padding:"24px 28px", marginBottom:16,
          display:"flex", flexDirection:"column", gap:14, fontSize:15,
        }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--pink)", margin:0 }}>
            📦 Order #{allOrders.length}:
          </p>
          <SummaryRow label="📷 Photo submitted" value={photoName} />
          <SummaryRow label="🎯 Level"           value={`${levelInfo.label} — ${levelInfo.priceLabel}`} />
          <SummaryRow label="🖊️ Marker set(s)"   value={sets.length ? sets.join(", ") : "Default palette"} />
          {indPens && <SummaryRow label="➕ Additional markers" value={indPens} />}
          <SummaryRow label="✉️ Email"            value={email} />
          {orderId && (
            <SummaryRow label="🔖 Order ref" value={orderId} />
          )}
        </div>

        {/* Grand total */}
        <div style={{
          background:"var(--pink)", borderRadius:14,
          padding:"16px 22px", marginBottom:24,
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ color:"white", fontWeight:700, fontSize:16 }}>
            🧾 {allOrders.length > 1 ? `Total for ${allOrders.length} orders` : "Total"}
          </span>
          <span style={{ color:"white", fontWeight:900, fontSize:22 }}>{grandTotal}€</span>
        </div>

        {checkoutError && (
          <div style={{ background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14, marginBottom:16 }}>
            ⚠️ {checkoutError}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <button onClick={goToCheckout} className="btn-primary" disabled={loading}
            style={{ width:"100%", fontSize:16, padding:"16px 24px", borderRadius:14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "⏳ Preparing checkout…" : `🔒 Proceed to Payment — ${grandTotal}€`}
          </button>

          <button onClick={orderAnother}
            style={{
              width:"100%", fontSize:16, padding:"16px 24px", borderRadius:14,
              border:"2px solid var(--pink)", background:"white", color:"var(--pink)",
              fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FFF0F3")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}
          >
            🖼️ Order another Guangna by Number
          </button>

          <button onClick={goBack}
            style={{
              width:"100%", fontSize:15, padding:"14px 24px", borderRadius:14,
              border:"2px solid var(--border)", background:"white", color:"#666",
              fontWeight:600, cursor:"pointer", fontFamily:"Nunito, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9f9f9")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}
          >
            ✏️ No, I want to make changes
          </button>
        </div>
      </main>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
      <span style={{ color:"var(--muted)", flexShrink:0 }}>{label}</span>
      <span style={{ fontWeight:600, color:"#333", textAlign:"right", maxWidth:"60%", wordBreak:"break-word" }}>
        {value}
      </span>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmContent /></Suspense>;
}