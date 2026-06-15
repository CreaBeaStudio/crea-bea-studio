"use client";
import Navbar from "../components/Navbar";
import { useState, useCallback } from "react";

const GUANGNA_COLORS: Record<string, [number,number,number,string]> = {
  "GN-600":[255,255,255,0,"White"],"GN-601":[76,166,218,0,"Sky Blue"],
  "GN-602":[130,194,178,0,"Sage Teal"],"GN-603":[251,234,82,0,"Lemon Yellow"],
  "GN-604":[226,153,61,0,"Amber"],"GN-605":[197,89,72,0,"Brick Red"],
  "GN-606":[207,123,176,0,"Mauve"],"GN-607":[82,61,143,0,"Indigo"],
  "GN-608":[22,58,144,0,"Navy"],"GN-609":[60,135,125,0,"Teal"],
  "GN-610":[174,181,178,0,"Silver"],"GN-611":[20,20,20,0,"Black"],
  "GN-612":[219,161,174,0,"Blush"],"GN-613":[107,68,145,0,"Violet"],
  "GN-614":[152,196,114,0,"Lime Green"],"GN-615":[248,223,75,0,"Gold"],
  "GN-616":[60,135,183,0,"Cornflower"],"GN-617":[40,85,155,0,"Royal Blue"],
  "GN-618":[222,157,87,0,"Sandy"],"GN-619":[193,137,145,0,"Dusty Rose"],
  "GN-620":[149,115,100,0,"Mocha"],"GN-621":[52,120,195,0,"Cerulean"],
  "GN-622":[107,153,135,0,"Eucalyptus"],"GN-623":[181,154,195,0,"Lavender"],
  "GN-624":[242,214,217,0,"Petal"],"GN-625":[240,201,187,0,"Peach"],
  "GN-634":[81,143,67,0,"Forest Green"],"GN-636":[46,106,137,0,"Steel Blue"],
  "GN-637":[162,169,146,0,"Sage"],"GN-638":[197,201,176,0,"Pale Sage"],
  "GN-639":[187,154,131,0,"Tan"],"GN-643":[116,99,77,0,"Khaki"],
  "GN-645":[225,207,169,0,"Cream"],"GN-648":[191,212,114,0,"Yellow Green"],
  "GN-649":[231,166,103,0,"Apricot"],"GN-654":[220,181,167,0,"Champagne"],
  "GN-663":[218,112,60,0,"Tangerine"],"GN-664":[204,55,43,0,"Scarlet"],
  "GN-665":[95,167,86,0,"Grass Green"],"GN-666":[195,76,130,0,"Fuchsia"],
  "GN-667":[221,117,114,0,"Coral"],"GN-668":[81,169,94,0,"Mint Green"],
  "GN-669":[168,206,128,0,"Pistachio"],"GN-671":[174,59,91,0,"Cranberry"],
  "GN-672":[154,78,70,0,"Sienna"],"GN-673":[27,32,127,0,"Midnight"],
  "GN-676":[61,139,70,0,"Emerald"],"GN-678":[50,36,115,0,"Deep Purple"],
  "GN-680":[63,70,74,0,"Charcoal"],"GN-684":[241,204,157,0,"Wheat"],
  "GN-686":[206,206,206,0,"Light Grey"],"GN-687":[101,159,75,0,"Medium Green"],
  "GN-688":[29,66,83,0,"Ocean"],"GN-689":[141,182,221,0,"Baby Blue"],
  "GN-693":[92,113,129,0,"Slate"],"GN-700":[220,227,119,0,"Chartreuse"],
  "GN-701":[249,225,203,0,"Linen"],"GN-702":[241,190,128,0,"Honey"],
  "GN-717":[233,211,181,0,"Buff"],"GN-725":[225,132,54,0,"Orange"],
  "GN-727":[180,205,88,0,"Apple Green"],"GN-728":[59,135,73,0,"Shamrock"],
  "GN-732":[254,247,176,0,"Pastel Yellow"],"GN-737":[154,204,188,0,"Seafoam"],
  "GN-740":[80,164,85,0,"Clover"],"GN-802":[236,180,93,0,"Goldenrod"],
  "GN-819":[140,200,217,0,"Powder Blue"],"GN-820":[100,185,217,0,"Azure"],
  "GN-824":[29,73,138,0,"Cobalt"],"GN-832":[136,77,149,0,"Orchid"],
  "GN-854":[226,152,157,0,"Rose"],"GN-873":[241,209,224,0,"Cotton Candy"],
} as any;

function hexToRgb(hex: string): [number,number,number]|null {
  const m = hex.replace("#","").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)] : null;
}
function deltaE([r1,g1,b1]:[number,number,number],[r2,g2,b2]:[number,number,number]) {
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
}
function rgbToHex([r,g,b]:[number,number,number]) {
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
}

type InputMode = "hex"|"rgb"|"photo";
type Match = {code:string;name:string;rgb:[number,number,number];dist:number};

function findTopMatches(rgb:[number,number,number], n=5): Match[] {
  return Object.entries(GUANGNA_COLORS).map(([code,vals])=>({
    code, name:(vals as any)[4]||"",
    rgb:[vals[0],vals[1],vals[2]] as [number,number,number],
    dist: deltaE(rgb,[vals[0],vals[1],vals[2]] as [number,number,number])
  })).sort((a,b)=>a.dist-b.dist).slice(0,n);
}

// Dominant color extraction from image using canvas
function getDominantColor(dataUrl: string): Promise<[number,number,number]> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 50;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0,0,size,size).data;
      let r=0,g=0,b=0,count=0;
      for (let i=0;i<data.length;i+=4) {
        if (data[i+3]>128) { r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++; }
      }
      count = count||1;
      resolve([Math.round(r/count),Math.round(g/count),Math.round(b/count)]);
    };
    img.src = dataUrl;
  });
}

export default function ColorConverter() {
  const [mode, setMode]           = useState<InputMode>("hex");
  const [hexInput, setHexInput]   = useState("#ff6b6b");
  const [rInput, setRInput]       = useState("255");
  const [gInput, setGInput]       = useState("107");
  const [bInput, setBInput]       = useState("107");
  const [photoDataUrl, setPhotoDataUrl] = useState<string|null>(null);
  const [photoName, setPhotoName] = useState("");
  const [matches, setMatches]     = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [dominantRgb, setDominantRgb] = useState<[number,number,number]|null>(null);

  const handlePhotoFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => { setPhotoDataUrl(e.target?.result as string); setPhotoName(file.name); setMatches([]); setDominantRgb(null); };
    reader.readAsDataURL(file);
  },[]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) handlePhotoFile(f);
  },[handlePhotoFile]);

  const currentRgb: [number,number,number] = mode==="hex"
    ? (hexToRgb(hexInput)||[0,0,0])
    : mode==="rgb"
      ? [parseInt(rInput)||0, parseInt(gInput)||0, parseInt(bInput)||0]
      : dominantRgb||[0,0,0];

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
      setMatches(findTopMatches(rgb));
    } finally { setSearching(false); }
  };

  return (
    <>
      <Navbar />
      <main style={{padding:"40px 24px",maxWidth:900,margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif",fontWeight:900,fontSize:"clamp(26px,4vw,40px)",marginBottom:8}}>
          🎨 Guangna Colour Converter
        </h1>
        <p style={{color:"#666",marginBottom:36}}>
          Enter any colour and find the closest Guangna marker in your collection.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
          {/* Input panel */}
          <div className="card">
            {/* Mode tabs */}
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {(["hex","rgb","photo"] as InputMode[]).map(m=>(
                <button key={m} onClick={()=>{setMode(m);setMatches([]);}} style={{
                  padding:"8px 18px",borderRadius:20,border:"2px solid var(--pink)",
                  background:mode===m?"var(--pink)":"white",
                  color:mode===m?"white":"var(--pink)",
                  fontWeight:700,cursor:"pointer",fontSize:13,textTransform:"uppercase"
                }}>{m==="photo"?"📸 Photo":m.toUpperCase()}</button>
              ))}
            </div>

            {mode==="hex" && (
              <div>
                <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:6}}>Hex Colour</label>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <input type="color" value={hexInput} onChange={e=>setHexInput(e.target.value)}
                    style={{width:48,height:48,border:"none",borderRadius:8,cursor:"pointer",padding:0}}/>
                  <input type="text" value={hexInput} onChange={e=>setHexInput(e.target.value)} placeholder="#ff6b6b" style={{flex:1}}/>
                </div>
              </div>
            )}

            {mode==="rgb" && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[["R",rInput,setRInput],["G",gInput,setGInput],["B",bInput,setBInput]].map(([label,val,setter])=>(
                  <div key={label as string}>
                    <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>{label as string} (0–255)</label>
                    <input type="number" min="0" max="255" value={val as string}
                      onChange={e=>(setter as (v:string)=>void)(e.target.value)}/>
                  </div>
                ))}
              </div>
            )}

            {mode==="photo" && (
              <div>
                <div onDrop={onDrop} onDragOver={e=>e.preventDefault()}
                  onClick={()=>document.getElementById("photoInput")?.click()}
                  style={{
                    border:`2.5px dashed ${photoDataUrl?"var(--pink)":"var(--border)"}`,
                    borderRadius:14,minHeight:160,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",cursor:"pointer",
                    background:photoDataUrl?"white":"var(--cream)",overflow:"hidden",
                  }}>
                  {photoDataUrl
                    ? <img src={photoDataUrl} alt="Uploaded" style={{width:"100%",height:160,objectFit:"cover",borderRadius:10}}/>
                    : <>
                        <div style={{fontSize:36,marginBottom:8}}>📸</div>
                        <p style={{fontWeight:600,fontSize:14}}>Drop photo or click to browse</p>
                        <p style={{color:"var(--muted)",fontSize:12}}>JPG, PNG</p>
                      </>
                  }
                </div>
                <input id="photoInput" type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files?.[0]; if(f) handlePhotoFile(f);}}/>
                {photoName && <p style={{fontSize:12,color:"var(--muted)",marginTop:6}}>✓ {photoName}</p>}
                {dominantRgb && (
                  <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"var(--cream)",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:8,background:`rgb(${dominantRgb.join(",")})`,border:"2px solid rgba(0,0,0,0.1)"}}/>
                    <div style={{fontSize:13}}>
                      <div style={{fontWeight:700}}>Dominant colour extracted</div>
                      <div style={{color:"var(--muted)"}}>{rgbToHex(dominantRgb)} · rgb({dominantRgb.join(", ")})</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode!=="photo" && (
              <div style={{marginTop:20,padding:16,borderRadius:12,background:"var(--cream)",display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:56,height:56,borderRadius:10,background:`rgb(${currentRgb.join(",")})`,border:"2px solid rgba(0,0,0,0.1)"}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>Your colour</div>
                  <div style={{color:"var(--muted)",fontSize:13}}>{rgbToHex(currentRgb)} · rgb({currentRgb.join(", ")})</div>
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={handleSearch} disabled={searching||(!photoDataUrl&&mode==="photo")}
              style={{width:"100%",marginTop:20,opacity:(searching||(!photoDataUrl&&mode==="photo"))?0.6:1}}>
              {searching?"🔍 Searching…":"Find closest Guangna markers →"}
            </button>
          </div>

          {/* Results panel */}
          <div>
            <h2 style={{fontWeight:800,fontSize:17,marginBottom:16}}>Top matches</h2>
            {matches.length===0 ? (
              <div className="card" style={{textAlign:"center",opacity:0.5,padding:40}}>
                <div style={{fontSize:48,marginBottom:8}}>🔍</div>
                <p>Enter a colour and click Search</p>
              </div>
            ) : matches.map((m,i)=>(
              <div key={m.code} className="card" style={{
                display:"flex",alignItems:"center",gap:16,marginBottom:12,position:"relative",
                border:i===0?"2px solid var(--pink)":"2px solid transparent"
              }}>
                {i===0 && <span style={{
                  position:"absolute",top:8,right:12,
                  background:"var(--pink)",color:"white",
                  borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700
                }}>Best match</span>}
                <div style={{width:48,height:48,borderRadius:10,flexShrink:0,background:`rgb(${m.rgb.join(",")})`,border:"2px solid rgba(0,0,0,0.1)"}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:16}}>{m.code}</div>
                  <div style={{color:"#666",fontSize:13}}>{m.name} · {rgbToHex(m.rgb)}</div>
                </div>
                <div style={{color:"var(--muted)",fontSize:12,textAlign:"right"}}>ΔE {m.dist.toFixed(1)}</div>
              </div>
            ))}
            {matches.length>0 && (
              <p style={{fontSize:12,color:"var(--muted)",marginTop:8,lineHeight:1.5}}>
                ⚠️ Colors on screen may vary from the actual marker color.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
