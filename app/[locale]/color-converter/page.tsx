"use client";
import Image from "next/image"
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useCallback, useId } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  GN_COLORS, GN_ALL_MATCHING_IDS, GN_MATCHING_IDS, GUANGNA_SETS, SET_OPTIONS,
  findClosest, hexToRgb, rgbToHex, normalizeExtraCode,
  type MatchResult,
} from "@/lib/guangna";
import {
  LANGUO_NON_GLITTER_IDS, findClosestLanguoN, normalizeLanguoExtraCode,
  type LanguoMatchResult,
} from "@/lib/languo";
import { LANGUO_SETS, LANGUO_SET_OPTIONS } from "@/lib/languoSets";

type SimpleMatch = { code: string; name?: string; rgb: [number, number, number] };
type BrandCode = { brand: "guangna" | "languo"; code: string };

function normalizeCombinedCode(token: string): BrandCode | null {
  const g = normalizeExtraCode(token);
  if (g) return { brand: "guangna", code: g };
  const l = normalizeLanguoExtraCode(token);
  if (l) return { brand: "languo", code: l };
  return null;
}

function Swatch({ rgb, size=64 }: { rgb:[number,number,number]; size?:number }) {
  const hex = rgbToHex(rgb);
  return (
    <div style={{width:size,height:size,borderRadius:10,flexShrink:0,background:hex,border:"2px solid rgba(0,0,0,0.1)"}}/>
  );
}

function ProtectedSwatch({ rgb, size=64 }: { rgb:[number,number,number]; size?:number }) {
  const filterId = useId();
  const hex = rgbToHex(rgb);
  return (
    <div style={{position:"relative",width:size,height:size,borderRadius:10,overflow:"hidden",flexShrink:0,border:"2px solid rgba(0,0,0,0.1)"}}>
      <div style={{position:"absolute",inset:0,background:hex}}/>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.18,pointerEvents:"none",userSelect:"none"}} xmlns="http://www.w3.org/2000/svg">
        <filter id={filterId}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`}/>
      </svg>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 60%)",pointerEvents:"none"}}/>
    </div>
  );
}

function getDominantColor(dataUrl:string): Promise<[number,number,number]> {
  return new Promise(resolve=>{
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size=80; canvas.width=size; canvas.height=size;
      const ctx=canvas.getContext("2d")!;
      ctx.drawImage(img,0,0,size,size);
      const data=ctx.getImageData(0,0,size,size).data;
      let r=0,g=0,b=0,count=0;
      for(let i=0;i<data.length;i+=4){
        if(data[i+3]>128){r+=data[i];g+=data[i+1];b+=data[i+2];count++;}
      }
      count=count||1;
      resolve([Math.round(r/count),Math.round(g/count),Math.round(b/count)]);
    };
    img.src=dataUrl;
  });
}

function BrandResultPanel({
  brandName, full, fallback, owned, hasOwned,
  orderHref, orderNoticeKey, affiliateDisclosure, t,
}: {
  brandName: string;
  full: SimpleMatch;
  fallback?: SimpleMatch | null;
  owned: SimpleMatch | null;
  hasOwned: boolean;
  orderHref: string;
  orderNoticeKey: string;
  affiliateDisclosure?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const isHG = full.code.startsWith("HG-");
  const matchesOwned = !!owned && owned.code === full.code;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="card" style={{border:"2px solid var(--pink)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontWeight:800,fontSize:16}}>{t("results.bestMatch")}</span>
          <span style={{background:"var(--pink)",color:"white",borderRadius:10,padding:"2px 8px",fontSize:14,fontWeight:700}}>{brandName}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <ProtectedSwatch rgb={full.rgb} size={72}/>
          <div>
            <div style={{fontWeight:900,fontSize:22,letterSpacing:"-0.5px"}}>{full.code}</div>
            {full.name && <div style={{color:"#555",fontSize:14,marginTop:2}}>{full.name}</div>}
          </div>
        </div>
        <p style={{fontSize:11,color:"var(--muted)",marginTop:10,lineHeight:1.5}}>
          {t("results.screenDisclaimer")}
        </p>
        {isHG && (
          <p style={{fontSize:11,color:"var(--muted)",marginTop:4,fontStyle:"italic"}}>
            ✨ HG = High Gloss marker set.
          </p>
        )}
        {fallback && (
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,padding:"8px 12px",borderRadius:8,background:"var(--cream)"}}>
            <ProtectedSwatch rgb={fallback.rgb} size={36}/>
            <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.4,margin:0}}>
              {t("results.gnFallbackNotice", {code: fallback.code, name: fallback.name ??""})}
            </p>
          </div>
        )}
        {hasOwned && owned && !matchesOwned && (
          <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"#fff7f9",border:"1px solid var(--pink)",fontSize:13,color:"var(--muted)"}}>
            {affiliateDisclosure ? (
              <>
                <p style={{margin:"0 0 8px 0"}}>💡 {t(orderNoticeKey as any, {code: full.code} as any)}</p>
                <p style={{fontSize:11,fontStyle:"italic",margin:"0 0 4px 0"}}>{affiliateDisclosure}</p>
                <a href={orderHref} target="_blank" rel="noopener noreferrer sponsored" style={{color:"var(--pink)",fontWeight:700}}>
                  {t("results.orderPrompt")}
                </a>
              </>
            ) : (
              <>
                💡 {t(orderNoticeKey as any, {code: full.code} as any)}{" "}
                <a href={orderHref} target="_blank" rel="noopener noreferrer" style={{color:"var(--pink)",fontWeight:700}}>
                  {t("results.orderPrompt")}
                </a>
              </>
            )}
          </div>
        )}
      </div>

      {hasOwned && owned && (
        <div className="card" style={{border: matchesOwned ? "2px solid #4caf50" : "2px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontWeight:800,fontSize:16}}>{t("results.bestMatchOwned")}</span>
            {matchesOwned
              ? <span style={{background:"#4caf50",color:"white",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700}}>{t("results.youHaveIt")}</span>
              : <span style={{background:"#888",color:"white",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700}}>{t("results.fromYourSet")}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <ProtectedSwatch rgb={owned.rgb} size={72}/>
            <div>
              <div style={{fontWeight:900,fontSize:22,letterSpacing:"-0.5px"}}>{owned.code}</div>
              {owned.name && <div style={{color:"#555",fontSize:14,marginTop:2}}>{owned.name}</div>}
            </div>
          </div>
          {owned.code.startsWith("HG-") && (
            <p style={{fontSize:11,color:"var(--muted)",marginTop:8,fontStyle:"italic"}}>
              ✨ HG = High Gloss marker set.
            </p>
          )}
        </div>
      )}

      {hasOwned && !owned && (
        <div className="card" style={{opacity:0.6,textAlign:"center",padding:24}}>
          <p style={{fontSize:13}}>{t("results.noOwnedMatch")}</p>
        </div>
      )}
    </div>
  );
}

type InputMode = "hex"|"rgb"|"photo";

export default function ColorConverter() {
  const t = useTranslations("ColorConverter");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [mode,setMode]             = useState<InputMode>("hex");

  const [hexInput,setHexInput]     = useState("#ff6b6b");
  const [rInput,setRInput]         = useState("255");
  const [gInput,setGInput]         = useState("107");
  const [bInput,setBInput]         = useState("107");
  const [photoDataUrl,setPhotoDataUrl] = useState<string|null>(null);
  const [photoName,setPhotoName]   = useState("");
  const [dominantRgb,setDominantRgb] = useState<[number,number,number]|null>(null);
  const [searching,setSearching]   = useState(false);

  const [mySetsGuangna,setMySetsGuangna] = useState<string[]>([]);
  const [mySetsLanguo,setMySetsLanguo]   = useState<string[]>([]);
  const [myExtraCodes,setMyExtraCodes]   = useState("");

  const [bestFullGuangna,setBestFullGuangna]             = useState<MatchResult|null>(null);
  const [bestFullGuangnaFallback,setBestFullGuangnaFallback] = useState<MatchResult|null>(null);
  const [bestOwnedGuangna,setBestOwnedGuangna]           = useState<MatchResult|null>(null);
  const [hasOwnedGuangna,setHasOwnedGuangna]             = useState(false);

  const [bestFullLanguo,setBestFullLanguo] = useState<LanguoMatchResult|null>(null);
  const [bestOwnedLanguo,setBestOwnedLanguo] = useState<LanguoMatchResult|null>(null);
  const [hasOwnedLanguo,setHasOwnedLanguo] = useState(false);

  const clearResults = () => {
    setBestFullGuangna(null);
    setBestFullGuangnaFallback(null);
    setBestOwnedGuangna(null);
    setHasOwnedGuangna(false);
    setBestFullLanguo(null);
    setBestOwnedLanguo(null);
    setHasOwnedLanguo(false);
  };

  const toggleGuangnaSet = (value: string) => {
    setMySetsGuangna(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };
  const toggleLanguoSet = (value: string) => {
    setMySetsLanguo(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handlePhotoFile = useCallback((file:File)=>{
    const reader=new FileReader();
    reader.onload=e=>{setPhotoDataUrl(e.target?.result as string);setPhotoName(file.name);clearResults();setDominantRgb(null);};
    reader.readAsDataURL(file);
  },[]);

  const onDrop = useCallback((e:React.DragEvent)=>{
    e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) handlePhotoFile(f);
  },[handlePhotoFile]);

  const currentRgb: [number,number,number] = mode==="hex"
    ? (hexToRgb(hexInput)||[0,0,0])
    : mode==="rgb"
      ? [parseInt(rInput)||0,parseInt(gInput)||0,parseInt(bInput)||0]
      : dominantRgb||[0,0,0];

  const getOwnedGuangnaIds = (): string[] => {
    const ids: string[] = [];
    for (const setKey of mySetsGuangna) {
      const setIds = GUANGNA_SETS[setKey];
      if (setIds) for (const id of setIds) if (!ids.includes(id)) ids.push(id);
    }
    for (const tok of myExtraCodes.split(/[\s,;]+/)) {
      const bc = normalizeCombinedCode(tok);
      if (bc && bc.brand === "guangna" && !ids.includes(bc.code)) ids.push(bc.code);
    }
    return ids;
  };
  const getOwnedLanguoIds = (): string[] => {
    const ids: string[] = [];
    for (const setKey of mySetsLanguo) {
      const setIds = LANGUO_SETS[setKey]?.codes;
      if (setIds) for (const id of setIds) if (!ids.includes(id)) ids.push(id);
    }
    for (const tok of myExtraCodes.split(/[\s,;]+/)) {
      const bc = normalizeCombinedCode(tok);
      if (bc && bc.brand === "languo" && !ids.includes(bc.code)) ids.push(bc.code);
    }
    return ids;
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      let rgb: [number,number,number];
      if (mode==="photo" && photoDataUrl) {
        rgb = await getDominantColor(photoDataUrl);
        setDominantRgb(rgb);
      } else if (mode==="hex") {
        rgb = hexToRgb(hexInput)||[0,0,0];
      } else {
        rgb = [parseInt(rInput)||0,parseInt(gInput)||0,parseInt(bInput)||0];
      }

      const fullG = findClosest(rgb, GN_ALL_MATCHING_IDS);
      setBestFullGuangna(fullG);
      setBestFullGuangnaFallback(fullG.code.startsWith("HG-") ? findClosest(rgb, GN_MATCHING_IDS) : null);
      const ownedGIds = getOwnedGuangnaIds();
      if (ownedGIds.length > 0) {
        setBestOwnedGuangna(findClosest(rgb, ownedGIds));
        setHasOwnedGuangna(true);
      } else {
        setBestOwnedGuangna(null);
        setHasOwnedGuangna(false);
      }

      const fullL = findClosestLanguoN(rgb, LANGUO_NON_GLITTER_IDS, 1)[0] ?? null;
      setBestFullLanguo(fullL);
      const ownedLIds = getOwnedLanguoIds();
      if (ownedLIds.length > 0) {
        setBestOwnedLanguo(findClosestLanguoN(rgb, ownedLIds, 1)[0] ?? null);
        setHasOwnedLanguo(true);
      } else {
        setBestOwnedLanguo(null);
        setHasOwnedLanguo(false);
      }
    } finally { setSearching(false); }
  };

  const hasAnyResult = !!bestFullGuangna || !!bestFullLanguo;

  return (
    <>
      <style>{`
        .converter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        @media (max-width: 768px) { .converter-grid { grid-template-columns: 1fr; } }
        .marker-set-list {
          max-height: 180px;
          overflow-y: auto;
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 6px;
        }
        .marker-set-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }
        .marker-set-row:hover {
          background: #FFF0F3;
        }
      `}</style>
      <Navbar/>
      <main style={{padding:"40px 24px",maxWidth:960,margin:"0 auto"}}>
        <div style={{marginBottom:12}}>
          <Image src="/marketing/Guangna_brush.png" alt="Guangna brush" width={120} height={84} style={{objectFit:"contain",height:"auto"}} />
        </div>
        <h1 style={{fontFamily:"Nunito, sans-serif",color:"var(--pink)",fontWeight:900,fontSize:"clamp(26px,4vw,40px)",marginBottom:8}}>
          {t("title")}
        </h1>
        <p style={{color:"#666",marginBottom:12}}>
          {t("subtitle")}
        </p>

        <p style={{ fontSize: 13, marginBottom: 16 }}>
          {t("crossLink.text")}{" "}
          <a href={`/${locale}/legend-converter`} style={{ color: "var(--pink)", fontWeight: 700 }}>
            {t("crossLink.linkText")}
          </a>
        </p>

        <div style={{
          background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "var(--muted)", marginBottom: 36, lineHeight: 1.5,
        }}>
          💡 {t("disclaimer")}
        </div>

        <div className="converter-grid">

          <div style={{display:"flex",flexDirection:"column",gap:20}}>

            <div className="card">
              <h3 style={{fontWeight:800,fontSize:15,marginBottom:4}}>{t("myMarkers.heading")} <span style={{fontWeight:400,fontSize:12,color:"var(--muted)"}}>{t("myMarkers.optional")}</span></h3>
              <p style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>{t("myMarkers.description")}</p>

              <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{tc("brands.guangna")}</div>
              <div className="marker-set-list">
                {SET_OPTIONS.map(s => (
                  <label key={s.key} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={mySetsGuangna.includes(s.key)}
                      onChange={()=>toggleGuangnaSet(s.key)}
                      style={{accentColor:"var(--pink)"}}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
              {mySetsGuangna.length > 0 && (
                <p style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{tc("setsSelected", { count: mySetsGuangna.length })}</p>
              )}
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 14px" }}>{t("myMarkers.metallicNote")}</p>

              <div style={{fontWeight:700,fontSize:13,marginBottom:6,paddingTop:8,borderTop:"1px solid var(--border)"}}>{tc("brands.languo")}</div>
              <div className="marker-set-list">
                {LANGUO_SET_OPTIONS.map(s => (
                  <label key={s.key} className="marker-set-row">
                    <input
                      type="checkbox"
                      checked={mySetsLanguo.includes(s.key)}
                      onChange={()=>toggleLanguoSet(s.key)}
                      style={{accentColor:"var(--pink)"}}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
              {mySetsLanguo.length > 0 && (
                <p style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{tc("setsSelected", { count: mySetsLanguo.length })}</p>
              )}
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "6px 0 14px" }}>{t("myMarkers.glitterNote")}</p>

              <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>{t("myMarkers.extraCodesLabel")} <span style={{fontWeight:400,color:"var(--muted)"}}>{t("myMarkers.extraCodesHint")}</span></label>
              <input type="text" value={myExtraCodes} onChange={e=>setMyExtraCodes(e.target.value)}
                placeholder={t("myMarkers.extraCodesPlaceholder")} style={{width:"100%"}}/>
            </div>

            <div className="card">
              <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
                {(["hex","rgb","photo"] as InputMode[]).map(m=>(
                  <button key={m} onClick={()=>{setMode(m);clearResults();}} style={{
                    padding:"8px 18px",borderRadius:20,border:"2px solid var(--pink)",
                    background:mode===m?"var(--pink)":"white",
                    color:mode===m?"white":"var(--pink)",
                    fontWeight:700,cursor:"pointer",fontSize:13,textTransform:"uppercase"
                  }}>{m==="photo"?t("modes.photo"):t(`modes.${m}`)}</button>
                ))}
              </div>

              {mode==="hex" && (
                <div>
                  <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>{t("hex.label")}</label>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <input type="color" value={hexInput} onChange={e=>setHexInput(e.target.value)}
                      style={{width:48,height:48,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
                    <input type="text" value={hexInput} onChange={e=>setHexInput(e.target.value)} placeholder="#ff6b6b" style={{flex:1}}/>
                  </div>
                </div>
              )}

              {mode==="rgb" && (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {([["r",rInput,setRInput],["g",gInput,setGInput],["b",bInput,setBInput]] as [string,string,(v:string)=>void][]).map(([key,val,setter])=>(
                    <div key={key}>
                      <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>{t(`rgb.${key}Label`)}</label>
                      <input type="number" min="0" max="255" value={val} onChange={e=>setter(e.target.value)}/>
                    </div>
                  ))}
                </div>
              )}

              {mode==="photo" && (
                <div>
                  <div style={{
                    background: "var(--cream)", borderRadius: 10, padding: "10px 14px",
                    fontSize: 14, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5,
                  }}>
                    💡 {t("photo.lightingTip")}
                  </div>
                  <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
                    onClick={()=>document.getElementById("photoInput")?.click()}
                    style={{
                      border:`2.5px dashed ${photoDataUrl?"var(--pink)":"var(--border)"}`,
                      borderRadius:14,minHeight:150,display:"flex",flexDirection:"column",
                      alignItems:"center",justifyContent:"center",cursor:"pointer",
                      background:photoDataUrl?"white":"var(--cream)",overflow:"hidden",
                    }}>
                    {photoDataUrl
                      ? <img src={photoDataUrl} alt="Uploaded" style={{width:"100%",height:150,objectFit:"cover",borderRadius:10}}/>
                      : <><div style={{fontSize:36,marginBottom:8}}>📸</div>
                          <p style={{fontWeight:600,fontSize:14}}>{t("photo.dropHint")}</p>
                          <p style={{color:"var(--muted)",fontSize:12}}>{t("photo.fileTypes")}</p></>
                    }
                  </div>
                  <input id="photoInput" type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{const f=e.target.files?.[0];if(f) handlePhotoFile(f);}}/>
                  {photoName && <p style={{fontSize:12,color:"var(--muted)",marginTop:6}}>{t("photo.fileSelected", {fileName: photoName})}</p>}
                  {dominantRgb && (
                    <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"var(--cream)",display:"flex",alignItems:"center",gap:12}}>
    <Swatch rgb={dominantRgb} size={36}/>
    <div style={{fontSize:13}}>
      <div style={{fontWeight:700}}>{t("photo.dominantColorExtracted")}</div>
    </div>
  </div>
)}
                </div>
              )}

              {mode!=="photo" && (
                <div style={{marginTop:20,padding:16,borderRadius:12,background:"var(--cream)",display:"flex",alignItems:"center",gap:16}}>
                  <Swatch rgb={currentRgb} size={56}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{t("yourColour")}</div>
                    <div style={{color:"var(--muted)",fontSize:13}}>{rgbToHex(currentRgb)} · rgb({currentRgb.join(", ")})</div>
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={handleSearch}
                disabled={searching||(mode==="photo"&&!photoDataUrl)}
                style={{width:"100%",marginTop:20,opacity:(searching||(mode==="photo"&&!photoDataUrl))?0.6:1}}>
                {searching?t("searching"):t("searchButton")}
              </button>
            </div>
          </div>

          <div>
            <h2 style={{fontWeight:800,fontSize:17,marginBottom:16}}>{t("results.heading")}</h2>

            {!hasAnyResult ? (
              <div className="card" style={{textAlign:"center",opacity:0.5,padding:40}}>
                <div style={{fontSize:48,marginBottom:8}}>🎨</div>
                <p>{t("results.emptyPrompt")}</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:28}}>
                {bestFullGuangna && (
                  <div>
                    <h3 style={{fontWeight:800,fontSize:15,marginBottom:10,color:"var(--pink)"}}>{tc("brands.guangna")}</h3>
                    <BrandResultPanel
                      brandName={tc("brands.guangna")}
                      full={bestFullGuangna}
                      fallback={bestFullGuangnaFallback}
                      owned={bestOwnedGuangna}
                      hasOwned={hasOwnedGuangna}
                      orderHref="https://www.guangna.eu"
                      orderNoticeKey="results.notInSetNotice"
                      t={t}
                    />
                  </div>
                )}

                {bestFullLanguo && (
                  <div>
                    <h3 style={{fontWeight:800,fontSize:15,marginBottom:10,color:"var(--pink)"}}>{tc("brands.languo")}</h3>
                    <BrandResultPanel
                      brandName={tc("brands.languo")}
                      full={bestFullLanguo}
                      owned={bestOwnedLanguo}
                      hasOwned={hasOwnedLanguo}
                      orderHref="https://languoart.com/?ref=creabeastudio"
                      orderNoticeKey="results.notInSetNoticeLanguo"
                      affiliateDisclosure={t("results.languoAffiliateDisclosure")}
                      t={t}
                    />
                  </div>
                )}

                <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{t("donate.text")}</p>
                  <a href="https://ko-fi.com/creabeastudio" target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-block", padding: "10px 22px", borderRadius: 20,
                      background: "var(--pink)", color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none",
                    }}>
                    {t("donate.button")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}