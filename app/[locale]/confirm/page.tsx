"use client";
// Save this file as app/[locale]/confirm/page.tsx
//
// UPDATED (2026-07-24):
//  - Paper size is no longer chosen here -- it's picked on /create
//    (Step 4) and arrives via the `paperSize` URL param. This page now
//    just displays it (read-only); to change it, the customer goes
//    "back to make changes" to /create. goBack()/orderAnother() both
//    carry paperSize forward so it round-trips correctly either way.
//  - USD estimate is now only shown for US Letter -- A4 shows the Euro
//    price alone, since two prices next to each other read as
//    confusing when the customer isn't paying in USD anyway. US Letter
//    still shows USD large/prominent with EUR as the small actual-
//    charge reference underneath, since that's the currency a US
//    Letter buyer is thinking in.
//
// UPDATED (2026-07-23):
//  - Pricing is now flat by paper size (A4/US Letter) instead of by
//    difficulty tier -- difficulty is still customer-selected and
//    still drives generation, but no longer affects price. See
//    lib/lemonSqueezyPricing.ts's GUANGNA_BY_NUMBER for the two prices.
//  - Payhip removed -- per the earlier decision to consolidate on
//    LemonSqueezy only (full global Merchant of Record vs Payhip's
//    EU/UK-only VAT coverage). The USD/EUR dual-currency button pair is
//    gone along with it; LemonSqueezy handles currency itself.
//  - Cart bundling (multiple photos in one checkout) isn't supported
//    yet -- create-checkout returns a friendly error if you try to
//    check out with more than one order in the cart. The "order
//    another" flow is left in place below (so nothing breaks for
//    someone using it), it'll just surface that message at checkout
//    for now.
import Image from "next/image";
import Navbar from "../components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { GUANGNA_BY_NUMBER, toUsdEstimate } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";

const LEVELS: Record<string, { label: string }> = {
  "15": { label: "🌱 Beginner" },
  "24": { label: "🌿 Intermediate" },
  "36": { label: "🌲 Advanced" },
};

const PAPER_LABELS: Record<PaperSize, string> = {
  a4: "A4",
  letter: "US Letter",
};

type OrderItem = {
  photoName: string;
  level: string;
  levelLabel: string;
  paperSize: PaperSize;
  priceLabel: string;
  sets: string[];
  indPens: string;
};

function ConfirmContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const email        = params.get("email")        ?? "";
  const levelValue   = params.get("level")        ?? "24";
  const photoName    = params.get("photoName")    ?? "—";
  const setsRaw      = params.get("sets")         ?? "";
  const indPens      = params.get("indPens")      ?? "";
  const orderId      = params.get("orderId")      ?? "";
  const prevOrdersRaw = params.get("prevOrders")  ?? "[]";
  // Chosen on /create (Step 4) now -- this page only displays it.
  const paperSizeParam = params.get("paperSize");
  const paperSize: PaperSize = paperSizeParam === "letter" ? "letter" : "a4";
  const showUsd = paperSize === "letter";

  const levelInfo = LEVELS[levelValue] ?? { label: "—" };
  const sets      = setsRaw ? setsRaw.split("|").filter(Boolean) : [];
  const variant   = GUANGNA_BY_NUMBER[paperSize === "letter" ? "us" : "a4"];

  let prevOrders: OrderItem[] = [];
  try { prevOrders = JSON.parse(decodeURIComponent(prevOrdersRaw)); } catch {}

  const thisOrder: OrderItem = {
    photoName,
    level:      levelValue,
    levelLabel: levelInfo.label,
    paperSize,
    priceLabel: variant.price,
    sets,
    indPens,
  };
  const allOrders  = [...prevOrders, thisOrder];

  const goToCheckout = async () => {
    setLoading(true);
    setCheckoutError("");
    setCheckoutOpened(false);
    // Opened synchronously, before the await below -- browsers only
    // reliably allow window.open() when it's called directly inside a
    // click handler, not after an awaited async gap (which the fetch
    // below is). Opening a blank tab now and pointing it at the real
    // checkout URL once we have it avoids the popup blocker without
    // needing the customer to leave this page.
    // NOTE (2026-07-24 fix): deliberately NOT passing "noopener" here --
    // when that flag is set, window.open() returns null in every modern
    // browser, which meant checkoutWindow was always null below, always
    // fell into the "popup blocked" fallback, and redirected the
    // CURRENT tab instead -- while the visibly-opened blank tab just sat
    // there with nothing ever pointed at it. The brief window.opener
    // link this leaves is a non-issue: the tab navigates to
    // LemonSqueezy (a different origin) immediately after, and browsers
    // sever the opener reference on cross-origin navigation anyway.
    const checkoutWindow = window.open("", "_blank");
    try {
      const allLevels = allOrders.map(o => o.level);
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levels: allLevels,
          paperSize,
          email,
          orderId,
          levelLabel: levelInfo.label,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error || "Could not start checkout. Please try again or contact hello@creabeastudio.com.");
        setLoading(false);
        checkoutWindow?.close();
        return;
      }
      if (checkoutWindow) {
        checkoutWindow.location.href = data.url;
        setCheckoutOpened(true);
        setLoading(false);
      } else {
        // Popup blocked despite the synchronous open attempt (some
        // browsers/extensions block ALL window.open calls regardless of
        // timing) -- fall back to redirecting this tab so checkout still
        // works, just without the new-tab convenience.
        window.location.href = data.url;
      }
    } catch (e) {
      setCheckoutError("Something went wrong. Please try again or contact hello@creabeastudio.com.");
      setLoading(false);
      checkoutWindow?.close();
    }
  };

  const goBack = () => {
    const q = new URLSearchParams({
      email, level: levelValue, sets: setsRaw, indPens, paperSize,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    router.push(`/create?${q.toString()}`);
  };

  const orderAnother = () => {
    const q = new URLSearchParams({
      email, sets: setsRaw, indPens, paperSize,
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
  <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={160} height={110}
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
                <span>#{i+1} · {o.photoName} · {o.levelLabel} · {PAPER_LABELS[o.paperSize]}</span>
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
          <SummaryRow label="🎯 Difficulty"       value={levelInfo.label} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <span style={{ color:"var(--muted)", flexShrink:0 }}>📄 Paper size</span>
            <span style={{ textAlign:"right" }}>
              <div style={{ fontWeight:600, color:"#333" }}>{PAPER_LABELS[paperSize]}</div>
              {showUsd ? (
                <>
                  <div style={{ fontWeight:900, fontSize:18, color:"#333", lineHeight:1.3 }}>
                    {toUsdEstimate(variant.price)}
                  </div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>≈ {variant.price}</div>
                </>
              ) : (
                <div style={{ fontWeight:900, fontSize:18, color:"#333", lineHeight:1.3 }}>
                  {variant.price}
                </div>
              )}
            </span>
          </div>
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
          padding:"16px 22px", marginBottom:6,
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ color:"white", fontWeight:700, fontSize:16 }}>
            🧾 {allOrders.length > 1 ? `Total for ${allOrders.length} orders` : "Total"}
          </span>
          {showUsd ? (
            <span style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
              <span style={{ color:"white", fontWeight:900, fontSize:28, lineHeight:1.1 }}>
                {toUsdEstimate(variant.price)}
              </span>
              <span style={{ color:"white", fontWeight:500, fontSize:12, opacity:0.85 }}>
                ≈ {variant.price}
              </span>
            </span>
          ) : (
            <span style={{ color:"white", fontWeight:900, fontSize:26 }}>
              {variant.price}
            </span>
          )}
        </div>
        {showUsd && (
          <p style={{ fontSize:11, color:"var(--muted)", textAlign:"center", marginBottom:12 }}>
            estimate only, depends on the current exchange rate.
          </p>
        )}

        <p style={{ fontSize:12.5, color:"var(--muted)", textAlign:"center", marginTop: showUsd ? 0 : 12, marginBottom:24, lineHeight:1.5 }}>
          📦 Once your order is complete, your files will be available to download for 30 days.
          Missed the window? Just email hello@creabeastudio.com and we'll send you a fresh link.
        </p>

        {checkoutError && (
          <div style={{ background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14, marginBottom:16 }}>
            ⚠️ {checkoutError}
          </div>
        )}

        {checkoutOpened && (
          <div style={{ background:"#F0F7FF", border:"1.5px solid #B8D4F0", borderRadius:12, padding:14, color:"#2c5a8c", fontSize:14, marginBottom:16 }}>
            🔗 Checkout opened in a new tab — complete your payment there. This page will still be here if you need it.
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          <button onClick={goBack}
            disabled={loading}
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

          <button onClick={orderAnother}
            disabled={loading}
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

          <button onClick={goToCheckout} className="btn-primary"
            disabled={loading}
            style={{ width:"100%", fontSize:16, padding:"16px 24px", borderRadius:14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1 }}>
            {loading ? "⏳ Preparing checkout…" : `🔒 Proceed to Payment — ${variant.price}`}
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
