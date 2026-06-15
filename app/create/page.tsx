"use client";
import Navbar from "../components/Navbar";
import { useState, useRef, useCallback } from "react";

const GUANGNA_COLORS: Record<string, [number, number, number]> = {
  "GN-600":[255,255,255],"GN-601":[76,166,218],"GN-602":[130,194,178],
  "GN-603":[251,234,82],"GN-604":[226,153,61],"GN-605":[197,89,72],
  "GN-606":[207,123,176],"GN-607":[82,61,143],"GN-608":[22,58,144],
  "GN-609":[60,135,125],"GN-610":[174,181,178],"GN-611":[20,20,20],
  "GN-612":[219,161,174],"GN-613":[107,68,145],"GN-614":[152,196,114],
  "GN-615":[248,223,75],"GN-616":[60,135,183],"GN-617":[40,85,155],
  "GN-618":[222,157,87],"GN-619":[193,137,145],"GN-620":[149,115,100],
  "GN-634":[81,143,67],"GN-636":[46,106,137],"GN-637":[162,169,146],
  "GN-638":[197,201,176],"GN-639":[187,154,131],"GN-643":[116,99,77],
  "GN-645":[225,207,169],"GN-648":[191,212,114],"GN-649":[231,166,103],
  "GN-654":[220,181,167],"GN-663":[218,112,60],"GN-664":[204,55,43],
  "GN-665":[95,167,86],"GN-666":[195,76,130],"GN-667":[221,117,114],
  "GN-668":[81,169,94],"GN-669":[168,206,128],"GN-671":[174,59,91],
  "GN-672":[154,78,70],"GN-673":[27,32,127],"GN-676":[61,139,70],
  "GN-678":[50,36,115],"GN-680":[63,70,74],"GN-684":[241,204,157],
  "GN-686":[206,206,206],"GN-687":[101,159,75],"GN-688":[29,66,83],
  "GN-689":[141,182,221],"GN-693":[92,113,129],"GN-700":[220,227,119],
  "GN-701":[249,225,203],"GN-702":[241,190,128],"GN-717":[233,211,181],
  "GN-725":[225,132,54],"GN-727":[180,205,88],"GN-728":[59,135,73],
  "GN-732":[254,247,176],"GN-737":[154,204,188],"GN-740":[80,164,85],
  "GN-802":[236,180,93],"GN-819":[140,200,217],"GN-820":[100,185,217],
  "GN-824":[29,73,138],"GN-832":[136,77,149],"GN-854":[226,152,157],
  "GN-873":[241,209,224],
};

// Ordered from CSV (GN.8101-408 is first)
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
  { label:"Dual tip: Warm skin",     value:"GN.8109G-12" },
  { label:"Dual tip: Reddish brown", value:"GN.8109H-12" },
  { label:"Dual tip: White-Gray",    value:"GN.8109I-12" },
  { label:"Dual tip: Tan",           value:"GN.8109J-12" },
  { label:"Dual tip: Pinkish skin",  value:"GN.8109K-12" },
  { label:"Classic Brush: Skin (24M)",value:"GN.8201M-24"},
  { label:"Classic Brush: Skin (24F)",value:"GN.8201F-24"},
  { label:"Classic Brush: Skin (12B)",value:"GN.8201B-12"},
  { label:"Macaron",                  value:"GN.8201M-24"},
];

const LEVELS = [
  { label:"🌱 Beginner",     value:"15", desc:"15 colours · Simple, bold regions" },
  { label:"🌿 Intermediate", value:"12", desc:"12 colours · Great for portraits" },
  { label:"🌲 Advanced",     value:"36", desc:"36 colours · Maximum detail" },
];

type Status = "idle"|"uploading"|"success"|"error";

function validateGnCode(code: string): boolean {
  const num = parseInt(code.replace(/^GN-?/i,""),10);
  return !isNaN(num) && num >= 600 && num <= 965;
}

export default function CreatePage() {
  const [photo, setPhoto]         = useState<File|null>(null);
  const [photoUrl, setPhotoUrl]   = useState("");
  const [email, setEmail]         = useState("");
  const [level, setLevel]         = useState("12");
  const [sets, setSets]           = useState(["GN-8101-408","","",""]);
  const [individualPens, setIndividualPens] = useState("");
  const [indPenError, setIndPenError]       = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [orderId, setOrderId]     = useState("");
  const [errorMsg, setErrorMsg]   = useState("");
  const [progress, setProgress]   = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhoto(file); setPhotoUrl(URL.createObjectURL(file)); setStatus("idle");
  };
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) handleFile(f);
  },[]);

  const updateSet = (idx: number, val: string) => {
    setSets(prev => prev.map((s,i) => i===idx ? val : s));
  };

  // Options for set N: exclude values already selected in earlier sets
  const optionsFor = (idx: number) => {
    const taken = new Set(sets.slice(0,idx).filter(Boolean));
    return MARKER_SETS.filter(s => !taken.has(s.value));
  };

  const validateIndPens = (val: string) => {
    setIndividualPens(val);
    if (!val.trim()) { setIndPenError(""); return; }
    const codes = val.split(/[,\s]+/).filter(Boolean);
    const invalid = codes.filter(c => !validateGnCode(c));
    if (invalid.length > 0) {
      setIndPenError(`Invalid code(s): ${invalid.join(", ")}. Must be 3-digit numbers between 600 and 965.`);
    } else { setIndPenError(""); }
  };

  const handleSubmit = async () => {
    if (!photo||!email||indPenError) return;
    setStatus("uploading"); setProgress(20); setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("image",photo); fd.append("email",email); fd.append("level",level);
      const selectedSets = sets.filter(Boolean);
      if (selectedSets.length) fd.append("marker_sets",selectedSets.join(","));
      const indCodes = individualPens.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
      if (indCodes.length) fd.append("pens",indCodes.join(","));
      setProgress(50);
      const res = await fetch("/api/submit-order",{method:"POST",body:fd});
      setProgress(90);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||"Submission failed");
      setOrderId(json.orderId); setStatus("success"); setProgress(100);
    } catch(e:unknown) {
      setErrorMsg((e as Error).message||"Something went wrong."); setStatus("error");
    }
  };

  const canSubmit = photo && email && !indPenError && status!=="uploading";

  if (status==="success") {
    return (
      <>
        <Navbar />
        <main style={{padding:"80px 24px",maxWidth:600,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:72,marginBottom:24}}>🎉</div>
          <h1 style={{fontFamily:"Nunito, sans-serif",fontWeight:900,fontSize:36,marginBottom:12}}>Order received!</h1>
          <p style={{fontSize:18,color:"#555",marginBottom:8,lineHeight:1.7}}>
            Your photo is on its way to us. We'll process your Guangna by Number and send the finished file to:
          </p>
          <div style={{background:"var(--cream)",border:"2px solid var(--border)",borderRadius:14,padding:"16px 24px",margin:"20px 0",fontWeight:700,fontSize:18,color:"var(--pink)"}}>{email}</div>
          <p style={{color:"var(--muted)",fontSize:14,marginBottom:32}}>Order ID: <strong>{orderId}</strong> · Turnaround: usually within 24 hours</p>
          <button className="btn-outline" onClick={()=>{setStatus("idle");setPhoto(null);setPhotoUrl("");setEmail("");}}>
            Submit another photo
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{padding:"40px 24px",maxWidth:1100,margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif",fontWeight:900,fontSize:"clamp(26px,4vw,40px)",marginBottom:6}}>
          Create Your Guangna by Number
        </h1>
        <p style={{color:"#666",marginBottom:8}}>
          Upload your photo and choose your level and Guangna markers. We'll process it and email you the finished file — usually within 24 hours.
        </p>

        {status==="uploading" && (
          <div style={{margin:"16px 0",background:"var(--border)",borderRadius:8,height:8,overflow:"hidden"}}>
            <div style={{width:`${progress}%`,height:"100%",background:"var(--pink)",transition:"width 0.4s",borderRadius:8}}/>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28,marginTop:28}}>

          {/* ── LEFT COLUMN ── */}
          <div style={{display:"flex",flexDirection:"column",gap:22}}>

            {/* Photo upload */}
            <div className="card">
              <h2 style={{fontWeight:800,fontSize:17,marginBottom:14}}>📸 Upload your photo</h2>
              <div onDrop={onDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}
                style={{
                  border:`2.5px dashed ${photoUrl?"var(--pink)":"var(--border)"}`,
                  borderRadius:14,minHeight:200,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",
                  background:photoUrl?"transparent":"var(--cream)",transition:"border-color 0.15s",
                }}>
                {photoUrl
                  ? <img src={photoUrl} alt="Preview" style={{width:"100%",height:200,objectFit:"cover",borderRadius:12,display:"block"}}/>
                  : <>
                      <div style={{fontSize:44,marginBottom:8}}>🖼️</div>
                      <p style={{fontWeight:600,fontSize:15,marginBottom:4}}>Drop photo here</p>
                      <p style={{color:"var(--muted)",fontSize:13}}>or click to browse · JPG, PNG, HEIC</p>
                    </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>{const f=e.target.files?.[0]; if(f) handleFile(f);}}/>
              {photo && (
                <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <p style={{fontSize:13,color:"var(--muted)"}}>✓ {photo.name}</p>
                  <button onClick={()=>{setPhoto(null);setPhotoUrl("");}}
                    style={{fontSize:12,color:"var(--pink)",background:"none",border:"none",cursor:"pointer"}}>Remove</button>
                </div>
              )}
            </div>

            {/* Level — moved below upload photo */}
            <div className="card">
              <h2 style={{fontWeight:800,fontSize:17,marginBottom:14}}>🎯 Select your level</h2>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {LEVELS.map(l=>(
                  <label key={l.value} style={{
                    display:"flex",alignItems:"center",gap:14,cursor:"pointer",
                    padding:"12px 16px",borderRadius:12,
                    border:`2px solid ${level===l.value?"var(--pink)":"var(--border)"}`,
                    background:level===l.value?"#FFF0F3":"white",transition:"all 0.15s"
                  }}>
                    <input type="radio" name="level" value={l.value}
                      checked={level===l.value} onChange={()=>setLevel(l.value)}
                      style={{accentColor:"var(--pink)"}}/>
                    <div>
                      <div style={{fontWeight:700,fontSize:15}}>{l.label}</div>
                      <div style={{color:"var(--muted)",fontSize:13}}>{l.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="card">
              <h2 style={{fontWeight:800,fontSize:17,marginBottom:6}}>✉️ Your email</h2>
              <p style={{color:"var(--muted)",fontSize:13,marginBottom:12}}>We'll send your finished file here.</p>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{display:"flex",flexDirection:"column",gap:22}}>

            {/* Marker Sets */}
            <div className="card">
              <h2 style={{fontWeight:800,fontSize:17,marginBottom:4}}>🖊️ Your Guangna Marker Sets</h2>
              <p style={{color:"var(--muted)",fontSize:13,marginBottom:14}}>
                Select the sets you own — we'll build the palette from your markers.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {sets.map((val,idx)=>(
                  <div key={idx}>
                    <label style={{fontSize:13,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>
                      {idx===0?"Set 1":`Set ${idx+1} (optional)`}
                    </label>
                    <select value={val} onChange={e=>updateSet(idx,e.target.value)}
                      style={{width:"100%",padding:"10px 12px",borderRadius:10,
                        border:"2px solid var(--border)",fontSize:14,background:"white",cursor:"pointer",outline:"none"}}>
                      {idx>0 && <option value="">— None —</option>}
                      {optionsFor(idx).map(s=>(
                        <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Individual codes */}
              <div style={{marginTop:18}}>
                <h3 style={{fontWeight:700,fontSize:15,marginBottom:4}}>Additional Marker Codes</h3>
                <p style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>
                  Add your individual markers — GN codes (3-digit, comma or space separated). Metallic pens not included.
                </p>
                <textarea value={individualPens} onChange={e=>validateIndPens(e.target.value)}
                  placeholder="e.g. 603, 648, 712" rows={2}
                  style={{resize:"vertical",border:indPenError?"2px solid #c62828":"2px solid var(--border)"}}/>
                {indPenError && <p style={{fontSize:12,color:"#c62828",marginTop:4}}>⚠️ {indPenError}</p>}
              </div>
            </div>

            {/* Summary */}
            <div style={{background:"linear-gradient(135deg,#FFF0F3,#FDF6F0)",border:"2px solid var(--border)",borderRadius:16,padding:20}}>
              <h3 style={{fontWeight:800,fontSize:15,marginBottom:12}}>📋 Order summary</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:14}}>
                <Row label="Photo" value={photo?`✓ ${photo.name}`:"—"}/>
                <Row label="Email" value={email||"—"}/>
                <Row label="Level" value={LEVELS.find(l=>l.value===level)?.label||"—"}/>
                <Row label="Marker sets" value={sets.filter(Boolean).length?`${sets.filter(Boolean).length} selected`:"Default palette"}/>
                <Row label="Turnaround" value="Within 24 hours"/>
              </div>
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={!canSubmit}
              style={{width:"100%",fontSize:17,padding:"16px",opacity:canSubmit?1:0.5}}>
              {status==="uploading"?`⏳ Uploading… ${progress}%`:"✨ Submit my order"}
            </button>

            {!photo && <p style={{textAlign:"center",fontSize:13,color:"var(--muted)",marginTop:-12}}>← Upload a photo to get started</p>}
            {!email&&photo && <p style={{textAlign:"center",fontSize:13,color:"var(--muted)",marginTop:-12}}>← Add your email so we can send the file</p>}
            {status==="error" && (
              <div style={{background:"#FFF0F0",border:"1.5px solid var(--pink)",borderRadius:12,padding:14,color:"#c62828",fontSize:14}}>
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Row({label,value}:{label:string;value:string}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
      <span style={{color:"var(--muted)"}}>{label}</span>
      <span style={{fontWeight:600,textAlign:"right",maxWidth:"60%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value}</span>
    </div>
  );
}
