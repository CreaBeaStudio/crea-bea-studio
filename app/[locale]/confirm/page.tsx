"use client";
// Save this file as app/[locale]/confirm/page.tsx
//
// UPDATED (2026-07-27): checkout errors from /api/create-checkout are
// now translated via the shared "apiErrors" namespace using the CODE
// the route returns (see lib/apiErrors.ts), instead of
// `data.error || t("errors.startCheckout")` -- that pattern never
// actually hit the translated fallback since data.error was always a
// truthy English string from the route, so checkout errors showed up
// in English regardless of locale. The client-detected network-failure
// case (caught in the `catch` block, never reached the route at all)
// still uses confirm.errors.generic, since that's not a route response.
//
// UPDATED (2026-07-27, i18n pass): full i18n pass -- every visible
// string now routes through t() under a new "confirm" namespace. Level
// and paper size labels are NOT duplicated here -- they're pulled from
// the existing "create" namespace (create.levels.*, create.paper.*)
// via a second useTranslations("create") call, since /confirm shows
// exactly the same values /create does and they should only be
// translated once, in one place.
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
import { useTranslations } from "next-intl";
import { GUANGNA_BY_NUMBER, toUsdEstimate } from "@/lib/lemonSqueezyPricing";
import type { PaperSize } from "@/lib/lemonSqueezyPricing";
import { isApiErrorCode } from "@/lib/apiErrors";

// Maps level values onto the shared create.levels.* label keys -- see
// create/page.tsx's LEVEL_KEYS, which this mirrors exactly (both pages
// must agree on what these three values mean).
const LEVEL_LABEL_KEYS: Record<string, string> = {
  "15": "levels.beginner",
  "24": "levels.intermediate",
  "36": "levels.advanced",
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
  const t       = useTranslations("confirm");
  // Shared level/paper labels -- same values /create shows, translated
  // once under the "create" namespace rather than duplicated here.
  const tCreate = useTranslations("create");
  const tApiErrors = useTranslations("apiErrors");
  const router  = useRouter();
  const params  = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const PAPER_LABELS: Record<PaperSize, string> = {
    a4: tCreate("paper.a4"),
    letter: tCreate("paper.letter"),
  };

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

  const levelLabel = LEVEL_LABEL_KEYS[levelValue] ? tCreate(LEVEL_LABEL_KEYS[levelValue]) : "—";
  const sets      = setsRaw ? setsRaw.split("|").filter(Boolean) : [];
  const variant   = GUANGNA_BY_NUMBER[paperSize === "letter" ? "us" : "a4"];

  let prevOrders: OrderItem[] = [];
  try { prevOrders = JSON.parse(decodeURIComponent(prevOrdersRaw)); } catch {}

  const thisOrder: OrderItem = {
    photoName,
    level:      levelValue,
    levelLabel,
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
          levelLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(isApiErrorCode(data.error) ? tApiErrors(data.error) : tApiErrors("generic"));
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
      setCheckoutError(t("errors.generic"));
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
  <Image src="/marketing/Guangna_brush.png" alt={t("brushAlt")} width={160} height={110}
    style={{ objectFit:"contain", height:"auto", display:"block", margin:"0 auto" }} />
</div>
          <h1 style={{
            fontFamily:"Nunito, sans-serif", color:"var(--pink)",
            fontWeight:900, fontSize:"clamp(22px,4vw,34px)", marginBottom:8,
          }}>
            {t("pageTitle")}
          </h1>
          <p style={{ color:"#666", fontSize:15 }}>{t("pageSubtitle")}</p>
        </div>

        {/* Previous orders */}
        {prevOrders.length > 0 && (
          <div style={{
            background:"white", border:"2px solid var(--border)",
            borderRadius:16, padding:"18px 22px", marginBottom:16,
          }}>
            <p style={{ fontWeight:700, fontSize:14, color:"#555", marginBottom:10 }}>
              {t("previousOrdersHeading")}
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
            {t("orderNumber", { number: allOrders.length })}
          </p>
          <SummaryRow label={t("summary.photoSubmitted")} value={photoName} />
          <SummaryRow label={t("summary.difficulty")}       value={levelLabel} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <span style={{ color:"var(--muted)", flexShrink:0 }}>{t("summary.paperSize")}</span>
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
          <SummaryRow label={t("summary.markerSets")}   value={sets.length ? sets.join(", ") : t("summary.defaultPalette")} />
          {indPens && <SummaryRow label={t("summary.additionalMarkers")} value={indPens} />}
          <SummaryRow label={t("summary.email")}            value={email} />
          {orderId && (
            <SummaryRow label={t("summary.orderRef")} value={orderId} />
          )}
        </div>

        {/* Grand total */}
        <div style={{
          background:"var(--pink)", borderRadius:14,
          padding:"16px 22px", marginBottom:6,
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ color:"white", fontWeight:700, fontSize:16 }}>
            {allOrders.length > 1 ? t("total.multiple", { count: allOrders.length }) : t("total.single")}
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
            {t("total.estimateNote")}
          </p>
        )}

        <p style={{ fontSize:12.5, color:"var(--muted)", textAlign:"center", marginTop: showUsd ? 0 : 12, marginBottom:24, lineHeight:1.5 }}>
          {t("deliveryNote")}
        </p>

        {checkoutError && (
          <div style={{ background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14, marginBottom:16 }}>
            ⚠️ {checkoutError}
          </div>
        )}

        {checkoutOpened && (
          <div style={{ background:"#F0F7FF", border:"1.5px solid #B8D4F0", borderRadius:12, padding:14, color:"#2c5a8c", fontSize:14, marginBottom:16 }}>
            {t("checkoutOpenedNotice")}
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
            {t("buttons.makeChanges")}
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
            {t("buttons.orderAnother")}
          </button>

          <button onClick={goToCheckout} className="btn-primary"
            disabled={loading}
            style={{ width:"100%", fontSize:16, padding:"16px 24px", borderRadius:14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1 }}>
            {loading ? t("buttons.preparingCheckout") : t("buttons.checkout", { price: variant.price })}
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