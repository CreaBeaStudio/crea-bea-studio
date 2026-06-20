"use client";
import Navbar from "../components/Navbar";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MARKER_SETS = [
  { label:"Classic brush-408", value:"GN-8101-408" },
  { label:"Classic brush-366", value:"GN-8101-366" },
  { label:"Classic brush-360", value:"GN-8101-360" },
  { label:"Classic brush-288", value:"GN-8101-288" },
  { label:"Classic brush-240", value:"GN-8101-240" },
  { label:"Classic brush-168", value:"GN-8101-168" },
  { label:"Classic brush-120", value:"GN-8101-120" },
  { label:"Classic brush-100", value:"GN-8101-100" },
  { label:"Classic brush-72",  value:"GN-8101-72"  },
  { label:"Classic brush-60",  value:"GN-8101-60"  },
  { label:"Classic brush-48",  value:"GN-8101-48"  },
  { label:"Classic brush-36",  value:"GN-8101-36"  },
  { label:"Classic brush-24",  value:"GN-8101-24"  },
  { label:"Classic brush-12",  value:"GN-8101-12"  },
  { label:"Classic Brush: Skin (24F)",value:"GN.8201F-24" },
  { label:"Classic Brush: Skin (12B)",value:"GN.8201B-12" },
  { label:"Dual tip: 240",     value:"GN.8109-240" },
  { label:"Dual tip: 72",      value:"GN.8109-72"  },
  { label:"Dual tip: 36",      value:"GN.8102-36"  },
  { label:"Dual colors 84/168",value:"GN.8106-84"  },
  { label:"Dual colors 60/120",value:"GN.8106-60"  },
  { label:"Dual colors 30/60", value:"GN.8106-30"  },
  { label:"Dual tip: Blue",    value:"GN.8109A-12" },
  { label:"Dual tip: Pink",    value:"GN.8109B-12" },
  { label:"Dual tip: Green",   value:"GN.8109C-12" },
  { label:"Dual tip: Red",     value:"GN.8109D-12" },
  { label:"Dual tip: Purple",  value:"GN.8109E-12" },
  { label:"Dual tip: Yellow",  value:"GN.8109F-12" },
  { label:"Dual tip: Warm skin",      value:"GN.8109G-12" },
  { label:"Dual tip: Reddish brown",  value:"GN.8109H-12" },
  { label:"Dual tip: White-Gray",     value:"GN.8109I-12" },
  { label:"Dual tip: Tan",            value:"GN.8109J-12" },
  { label:"Dual tip: Pinkish skin",   value:"GN.8109K-12" },
  { label:"Macaron",                  value:"GN.8201M-24" },
];

const LEVELS = [
  { label:"🌱 Beginner",     value:"15", price:7,  priceLabel:"7 €",  desc:"Fewer colors, larger areas." },
  { label:"🌿 Intermediate", value:"24", price:9,  priceLabel:"9 €",  desc:"Balanced mix of effort and detail.", popular:true },
  { label:"🌲 Advanced",     value:"36", price:11, priceLabel:"11 €", desc:"Wide color range, detailed." },
];

const DEFAULT_LEVEL = "24";

const LEVEL_TO_VARIANT: Record<string, string> = {
  "15": "1797148",
  "24": "1797163",
  "36": "1797167",
};

type OrderItem = {
  photoName:  string;
  level:      string;
  levelLabel: string;
  price:      number;
  priceLabel: string;
  sets:       string[];
  indPens:    string;
};

function validateGnCode(code: string): boolean {
  const num = parseInt(code.replace(/^GN-?/i, ""), 10);
  return !isNaN(num) && num >= 600 && num <= 965;
}

function FxTag({ eur, usd, gbp }: { eur: number; usd: number | null; gbp: number | null }) {
  if (!usd || !gbp) return null;
  return (
    <span style={{ fontSize: 11, color: "#999", fontWeight: 400, marginLeft: 6 }}>
      ≈ ${(eur * usd).toFixed(0)} / £{(eur * gbp).toFixed(0)}
    </span>
  );
}

function CreateInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [photo, setPhoto]           = useState<File|null>(null);
  const [photoUrl, setPhotoUrl]     = useState("");
  const [email, setEmail]           = useState("");
  const [level, setLevel]           = useState(DEFAULT_LEVEL);
  const [sets, setSets]             = useState(["GN-8101-408","","",""]);
  const [individualPens, setIndividualPens] = useState("");
  const [indPenError, setIndPenError]       = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [prevOrders, setPrevOrders] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [usdRate, setUsdRate]       = useState<number | null>(null);
  const [gbpRate, setGbpRate]       = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pEmail      = params.get("email");
    const pLevel      = params.get("level");
    const pSets       = params.get("sets");
    const pIndPens    = params.get("indPens");
    const pPrevOrders = params.get("prevOrders");
    if (pEmail)   setEmail(pEmail);
    setLevel(pLevel && pLevel !== "reset" ? pLevel : DEFAULT_LEVEL);
    if (pSets)    setSets(pSets.split("|").concat(["","",""]).slice(0,4));
    if (pIndPens) setIndividualPens(pIndPens);
    if (pPrevOrders) {
      try { setPrevOrders(JSON.parse(decodeURIComponent(pPrevOrders))); } catch {}
    }
  }, []);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/EUR")
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          setUsdRate(data.rates.USD * 1.05);
          setGbpRate(data.rates.GBP * 1.05);
        }
      })
      .catch(() => {});
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const updateSet = (idx: number, val: string) => {
    setSets(prev => prev.map((s, i) => i === idx ? val : s));
  };

  const optionsFor = (idx: number) => {
    const taken = new Set(sets.slice(0, idx).filter(Boolean));
    return MARKER_SETS.filter(s => !taken.has(s.value));
  };

  const validateIndPens = (val: string) => {
    setIndividualPens(val);
    if (!val.trim()) { setIndPenError(""); return; }
    const codes = val.split(/[,\s]+/).filter(Boolean);
    const invalid = codes.filter(c => !validateGnCode(c));
    if (invalid.length > 0) {
      setIndPenError(`Invalid code(s): ${invalid.join(", ")}. Must be 3-digit numbers between 600 and 965.`);
    } else {
      setIndPenError("");
    }
  };

  const currentLevelInfo = LEVELS.find(l => l.value === level)!;

  const handleSubmit = async () => {
    if (!photo || !email || indPenError) return;
    setSubmitting(true);
    setErrorMsg("");
    let orderId = "";
    try {
      const levelInfo  = LEVELS.find(l => l.value === level)!;
      const filledSets = sets.filter(Boolean);
      const thisOrder: OrderItem = {
        photoName:  photo.name,
        level,
        levelLabel: levelInfo.label,
        price:      levelInfo.price,
        priceLabel: levelInfo.priceLabel,
        sets:       filledSets,
        indPens:    individualPens,
      };
      const allOrders  = [...prevOrders, thisOrder];
      const grandTotal = allOrders.reduce((acc, o) => acc + o.price, 0);
      const formData = new FormData();
      formData.append("image",      photo);
      formData.append("email",      email);
      formData.append("level",      level);
      formData.append("sets",       filledSets.join(", "));
      formData.append("indPens",    individualPens);
      formData.append("allOrders",  JSON.stringify(allOrders));
      formData.append("grandTotal", String(grandTotal));
      const res  = await fetch("/api/submit-order", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.orderId) {
        setErrorMsg(data.error || "Something went wrong submitting your order. Please try again or contact hello@creabeastudio.com.");
        setSubmitting(false);
        return;
      }
      orderId = data.orderId;
    } catch (err) {
      console.error("Failed to submit order:", err);
      setErrorMsg("Something went wrong submitting your order. Please try again or contact hello@creabeastudio.com.");
      setSubmitting(false);
      return;
    }
    const filledSets = sets.filter(Boolean);
    const q = new URLSearchParams({
      email, level,
      photoName:  photo!.name,
      sets:       filledSets.join("|"),
      indPens:    individualPens,
      orderId,
      prevOrders: encodeURIComponent(JSON.stringify(prevOrders)),
    });
    setSubmitting(false);
    router.push(`/confirm?${q.toString()}`);
  };

  const canSubmit  = photo && email && !indPenError;
  const totalSoFar = prevOrders.reduce((acc, o) => acc + o.price, 0);

  return (
    <>
      <style>{`
        .create-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-top: 28px;
        }
        @media (max-width: 768px) {
          .create-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Navbar />
      <main style={{padding:"40px 24px", maxWidth:1100, margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(26px,4vw,40px)", marginBottom:6}}>
          Create Your Guangna by Number
        </h1>
        <p style={{color:"#666", marginBottom:8}}>
          Upload your photo, choose your level and Guangna markers, and we'll take care of the rest. Your finished file will be delivered to your inbox — within 24 hours, often much faster 😁
        </p>

        {prevOrders.length > 0 && (
          <div style={{background:"#FFF0F3", border:"2px solid var(--pink)", borderRadius:14, padding:"14px 18px", marginTop:16, marginBottom:4}}>
            <p style={{fontWeight:700, fontSize:14, color:"var(--pink)", marginBottom:8}}>
              🛒 You have {prevOrders.length} order{prevOrders.length > 1 ? "s" : ""} in your cart — total so far: <strong>{totalSoFar}€</strong>
            </p>
            {prevOrders.map((o, i) => (
              <p key={i} style={{fontSize:13, color:"#555", margin:"2px 0"}}>
                #{i+1} · {o.photoName} · {o.levelLabel} · {o.priceLabel}
              </p>
            ))}
          </div>
        )}

        <div className="create-grid">

          {/* ── LEFT COLUMN ── */}
          <div style={{display:"flex", flexDirection:"column", gap:22}}>

            {/* Step 1: Photo */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>Step 1: 📸 Upload your photo</h2>
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                style={{
                  border:`2.5px dashed ${photoUrl ? "var(--pink)" : "var(--border)"}`,
                  borderRadius:14,
                  minHeight: photoUrl ? 0 : 200,
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  cursor:"pointer", overflow:"hidden",
                  background: photoUrl ? "transparent" : "var(--cream)",
                  transition:"border-color 0.15s",
                }}
              >
                {photoUrl
                  ? <img src={photoUrl} alt="Preview"
                      style={{width:"100%", height:"auto", maxHeight:500, objectFit:"contain", borderRadius:12, display:"block"}}/>
                  : <>
                      <div style={{fontSize:44, marginBottom:8}}>🖼️</div>
                      <p style={{fontWeight:600, fontSize:15, marginBottom:4}}>Drop photo here</p>
                      <p style={{color:"var(--muted)", fontSize:13}}>or click to browse · JPG, PNG, HEIC</p>
                    </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              {photo && (
                <div style={{marginTop:8, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                  <p style={{fontSize:13, color:"var(--muted)"}}>✓ {photo.name}</p>
                  <button onClick={() => { setPhoto(null); setPhotoUrl(""); }}
                    style={{fontSize:12, color:"var(--pink)", background:"none", border:"none", cursor:"pointer"}}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Level */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>Step 2: 🎯 Select your level</h2>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {LEVELS.map(l => (
                  <label key={l.value} style={{
                    display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                    padding:"12px 16px", borderRadius:12,
                    border:`2px solid ${level === l.value ? "var(--pink)" : "var(--border)"}`,
                    background: level === l.value ? "#FFF0F3" : "white",
                    transition:"all 0.15s", position:"relative",
                  }}>
                    <input type="radio" name="level" value={l.value}
                      checked={level === l.value} onChange={() => setLevel(l.value)}
                      style={{accentColor:"var(--pink)"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                        {l.label} — {l.priceLabel}
                        <FxTag eur={l.price} usd={usdRate} gbp={gbpRate} />
                        {l.popular && (
                          <span style={{fontSize:11, fontWeight:700, background:"var(--pink)", color:"white", borderRadius:20, padding:"2px 8px", letterSpacing:"0.03em"}}>
                            ★ Most Popular
                          </span>
                        )}
                      </div>
                      <div style={{color:"var(--muted)", fontSize:13}}>{l.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{marginTop:16, padding:"10px 14px", background:"#f9f9f9", borderRadius:10, borderLeft:"3px solid var(--border)"}}>
                <p style={{fontSize:11, color:"#999", margin:0, lineHeight:1.6}}>
                  💱 Prices shown in EUR. Approximate equivalents in USD and GBP are shown for indication only, based on indicative exchange rates. Your bank or card provider may apply different rates and fees.
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{display:"flex", flexDirection:"column", gap:22}}>

            {/* Step 3: Markers */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>Step 3: 🖊️ Your Guangna Marker Sets</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:14}}>
                Select the sets you own — we'll build the palette from your markers.
              </p>
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                {sets.map((val, idx) => (
                  <div key={idx}>
                    <label style={{fontSize:13, fontWeight:600, color:"#555", display:"block", marginBottom:4}}>
                      {idx === 0 ? "Set 1" : `Set ${idx+1} (optional)`}
                    </label>
                    <select value={val} onChange={e => updateSet(idx, e.target.value)}
                      style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"2px solid var(--border)", fontSize:14, background:"white", cursor:"pointer", outline:"none"}}>
                      {idx > 0 && <option value="">— None —</option>}
                      {optionsFor(idx).map(s => (
                        <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{marginTop:18}}>
                <h3 style={{fontWeight:700, fontSize:15, marginBottom:4}}>Additional Marker Codes</h3>
                <p style={{fontSize:12, color:"var(--muted)", marginBottom:8}}>
                  Add your individual markers — GN codes (3-digit, comma or space separated). Metallic pens not included.
                </p>
                <textarea
                  value={individualPens}
                  onChange={e => validateIndPens(e.target.value)}
                  placeholder="e.g. 603, 648, 712"
                  rows={2}
                  style={{resize:"vertical", border: indPenError ? "2px solid #c62828" : "2px solid var(--border)"}}
                />
                {indPenError && <p style={{fontSize:12, color:"#c62828", marginTop:4}}>⚠️ {indPenError}</p>}
              </div>
            </div>

            {/* Step 4: Email */}
            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>Step 4: ✉️ Your email</h2>
              <p style={{color:"var(--muted)", fontSize:13, marginBottom:12}}>Your finished file will be sent straight to your email.</p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>

            {/* Order summary */}
            <div style={{background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)", border:"2px solid var(--border)", borderRadius:16, padding:20}}>
              <h3 style={{fontWeight:800, fontSize:15, marginBottom:12}}>📋 Order summary</h3>
              <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:14}}>
                <Row label="Photo"       value={photo ? `✓ ${photo.name}` : "—"}/>
                <Row label="Level"       value={currentLevelInfo ? `${currentLevelInfo.label} — ${currentLevelInfo.priceLabel}` : "—"}/>
                <Row label="Marker sets" value={sets.filter(Boolean).length ? `${sets.filter(Boolean).length} selected` : "Default palette"}/>
                <Row label="Turnaround"  value="Within 24 hours"/>
                {prevOrders.length > 0 && (
                  <>
                    <div style={{borderTop:"1.5px solid var(--border)", margin:"4px 0"}}/>
                    <Row label={`Previous orders (${prevOrders.length})`} value={`${totalSoFar}€`}/>
                    <Row label="This order" value={currentLevelInfo ? currentLevelInfo.priceLabel : "—"}/>
                    <div style={{borderTop:"1.5px solid var(--pink)", margin:"4px 0"}}/>
                    <Row label="🧾 New total" value={`${totalSoFar + (currentLevelInfo?.price ?? 0)}€`} highlight/>
                  </>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{width:"100%", fontSize:17, padding:"16px", opacity:(canSubmit && !submitting) ? 1 : 0.5}}
            >
              {submitting ? "⏳ Sending your order…" : canSubmit ? "✨ Submit my order →" : "✨ Submit my order"}
            </button>
            
            {!photo && (
              <p style={{textAlign:"center", fontSize:13, color:"var(--muted)", marginTop:-12}}>
                Upload a photo to get started
              </p>
            )}
            {!email && photo && (
              <p style={{textAlign:"center", fontSize:13, color:"var(--muted)", marginTop:-12}}>
                Add your email to continue
              </p>
            )}
            {errorMsg && (
              <div style={{background:"#FFF0F0", border:"1.5px solid var(--pink)", borderRadius:12, padding:14, color:"#c62828", fontSize:14}}>
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreateInner />
    </Suspense>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
      <span style={{color: highlight ? "var(--pink)" : "var(--muted)", fontWeight: highlight ? 700 : 400}}>
        {label}
      </span>
      <span style={{
        fontWeight: highlight ? 800 : 600,
        fontSize: highlight ? 15 : 14,
        color: highlight ? "var(--pink)" : "#333",
        textAlign:"right", maxWidth:"60%",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
      }}>
        {value}
      </span>
    </div>
  );
}
