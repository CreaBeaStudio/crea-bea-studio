"use client";
import Navbar from "../components/Navbar";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const GUANGNA_COLORS: Record<string, [number, number, number]> = {
  "GN-600":[255,255,255],"GN-601":[76,166,218],"GN-602":[130,194,178],"GN-603":[251,234,82],
  "GN-604":[226,153,61],"GN-605":[197,89,72],"GN-606":[207,123,176],"GN-607":[82,61,143],
  "GN-608":[22,58,144],"GN-609":[60,135,125],"GN-610":[174,181,178],"GN-611":[20,20,20],
  "GN-612":[219,161,174],"GN-613":[107,68,145],"GN-614":[152,196,114],"GN-615":[248,223,75],
  "GN-616":[60,135,183],"GN-617":[40,85,155],"GN-618":[222,157,87],"GN-619":[193,137,145],
  "GN-620":[149,115,100],"GN-621":[52,120,195],"GN-622":[107,153,135],"GN-623":[181,154,195],
  "GN-624":[242,214,217],"GN-625":[240,201,187],"GN-626":[254,252,199],"GN-627":[196,223,198],
  "GN-628":[190,220,240],"GN-629":[174,179,216],"GN-630":[226,202,203],"GN-631":[180,85,60],
  "GN-632":[199,90,51],"GN-633":[124,155,170],"GN-634":[81,143,67],"GN-635":[181,176,209],
  "GN-636":[46,106,137],"GN-637":[162,169,146],"GN-638":[197,201,176],"GN-639":[187,154,131],
  "GN-640":[148,164,99],"GN-641":[157,183,166],"GN-642":[102,109,86],"GN-643":[116,99,77],
  "GN-644":[201,155,81],"GN-645":[225,207,169],"GN-646":[233,232,212],"GN-647":[157,183,80],
  "GN-648":[191,212,114],"GN-649":[231,166,103],"GN-650":[63,143,203],"GN-651":[138,143,199],
  "GN-652":[200,194,115],"GN-653":[89,182,168],"GN-654":[220,181,167],"GN-655":[230,152,186],
  "GN-656":[245,209,129],"GN-657":[132,173,73],"GN-658":[217,172,196],"GN-659":[42,99,174],
  "GN-660":[222,123,166],"GN-661":[223,128,107],"GN-662":[151,193,100],"GN-663":[218,112,60],
  "GN-664":[204,55,43],"GN-665":[95,167,86],"GN-666":[195,76,130],"GN-667":[221,117,114],
  "GN-668":[81,169,94],"GN-669":[168,206,128],"GN-670":[129,152,202],"GN-671":[174,59,91],
  "GN-672":[154,78,70],"GN-673":[27,32,127],"GN-674":[150,69,76],"GN-675":[126,81,104],
  "GN-676":[61,139,70],"GN-677":[238,177,175],"GN-678":[50,36,115],"GN-679":[98,88,92],
  "GN-680":[63,70,74],"GN-681":[133,167,177],"GN-682":[111,145,68],"GN-683":[251,232,201],
  "GN-684":[241,204,157],"GN-685":[141,196,167],"GN-686":[206,206,206],"GN-687":[101,159,75],
  "GN-688":[29,66,83],"GN-689":[141,182,221],"GN-690":[131,161,160],"GN-691":[226,135,125],
  "GN-692":[223,140,141],"GN-693":[92,113,129],"GN-694":[58,111,119],"GN-695":[61,125,133],
  "GN-696":[134,163,141],"GN-697":[79,105,80],"GN-698":[211,199,223],"GN-699":[183,153,191],
  "GN-700":[220,227,119],"GN-701":[249,225,203],"GN-702":[241,190,128],"GN-703":[250,227,224],
  "GN-704":[235,181,177],"GN-705":[149,82,97],"GN-706":[235,246,242],"GN-707":[214,225,200],
  "GN-708":[97,76,54],"GN-709":[82,61,61],"GN-710":[218,95,111],"GN-711":[213,112,125],
  "GN-712":[230,160,192],"GN-713":[205,97,122],"GN-714":[193,69,94],"GN-715":[212,68,75],
  "GN-716":[240,195,197],"GN-717":[233,211,181],"GN-718":[241,220,183],"GN-719":[252,238,216],
  "GN-720":[248,236,217],"GN-721":[250,230,226],"GN-722":[89,182,168],"GN-723":[247,226,234],
  "GN-724":[252,238,216],"GN-725":[225,132,54],"GN-726":[172,58,132],"GN-727":[180,205,88],
  "GN-728":[59,135,73],"GN-729":[225,220,158],"GN-730":[230,241,214],"GN-731":[206,194,161],
  "GN-732":[254,247,176],"GN-733":[252,244,161],"GN-734":[224,193,215],"GN-735":[162,202,127],
  "GN-736":[225,235,238],"GN-737":[154,204,188],"GN-738":[237,225,215],"GN-739":[149,96,125],
  "GN-740":[80,164,85],"GN-741":[142,171,91],"GN-742":[107,109,171],"GN-743":[107,83,155],
  "GN-744":[213,210,231],"GN-745":[152,182,221],"GN-746":[46,68,115],"GN-747":[121,131,151],
  "GN-748":[84,129,149],"GN-749":[81,126,170],"GN-750":[100,130,150],"GN-751":[229,227,216],
  "GN-752":[217,203,208],"GN-753":[210,198,179],"GN-754":[214,191,185],"GN-755":[204,165,151],
  "GN-756":[186,136,123],"GN-757":[177,151,123],"GN-758":[160,133,113],"GN-759":[128,111,106],
  "GN-760":[202,45,37],"GN-761":[220,126,135],"GN-762":[225,144,180],"GN-763":[23,54,99],
  "GN-764":[66,63,112],"GN-765":[252,241,88],"GN-766":[254,251,188],"GN-767":[90,136,159],
  "GN-768":[145,180,186],"GN-769":[122,92,97],"GN-770":[147,122,151],"GN-771":[215,195,198],
  "GN-772":[200,136,154],"GN-773":[161,154,186],"GN-774":[55,98,121],"GN-775":[187,203,177],
  "GN-776":[79,55,64],"GN-777":[253,244,116],"GN-778":[112,48,108],"GN-779":[102,71,82],
  "GN-780":[138,62,60],"GN-781":[159,45,44],"GN-782":[213,72,42],"GN-783":[216,92,48],
  "GN-784":[135,46,44],"GN-785":[191,93,51],"GN-786":[234,171,63],"GN-787":[196,196,88],
  "GN-788":[162,168,109],"GN-789":[91,89,60],"GN-790":[113,120,77],"GN-791":[49,77,55],
  "GN-792":[85,125,109],"GN-793":[138,148,85],"GN-794":[5,136,66],"GN-795":[38,90,64],
  "GN-796":[47,108,65],"GN-797":[45,105,108],"GN-798":[49,113,169],"GN-799":[89,182,168],
  "GN-800":[48,110,116],"GN-801":[242,242,242],"GN-802":[236,180,93],"GN-803":[232,232,232],
  "GN-804":[218,222,220],"GN-805":[162,163,158],"GN-806":[65,87,113],"GN-807":[50,52,58],
  "GN-808":[88,63,88],"GN-809":[219,235,208],"GN-810":[214,198,125],"GN-811":[194,183,117],
  "GN-812":[172,157,96],"GN-813":[195,170,92],"GN-814":[204,168,110],"GN-815":[211,178,86],
  "GN-816":[153,132,55],"GN-817":[191,146,52],"GN-818":[194,223,232],"GN-819":[140,200,217],
  "GN-820":[100,185,217],"GN-821":[206,230,248],"GN-822":[147,205,240],"GN-823":[95,162,199],
  "GN-824":[29,73,138],"GN-825":[216,211,220],"GN-826":[181,177,205],"GN-827":[127,132,169],
  "GN-828":[106,110,171],"GN-829":[206,199,205],"GN-830":[180,195,228],"GN-831":[153,131,159],
  "GN-832":[136,77,149],"GN-833":[161,120,173],"GN-834":[236,206,206],"GN-835":[225,207,214],
  "GN-836":[252,242,246],"GN-837":[247,231,229],"GN-838":[244,215,226],"GN-839":[219,182,184],
  "GN-840":[232,204,207],"GN-841":[190,218,234],"GN-842":[150,200,212],"GN-843":[183,210,207],
  "GN-844":[157,180,179],"GN-845":[92,172,80],"GN-846":[133,186,80],"GN-847":[208,210,92],
  "GN-848":[217,219,187],"GN-849":[161,161,58],"GN-850":[142,199,196],"GN-851":[189,204,184],
  "GN-852":[160,171,78],"GN-853":[224,221,218],"GN-854":[226,152,157],"GN-855":[237,237,125],
  "GN-856":[198,217,132],"GN-857":[136,159,182],"GN-858":[191,198,154],"GN-859":[229,154,123],
  "GN-860":[111,121,124],"GN-861":[186,193,190],"GN-862":[232,222,226],"GN-863":[155,107,65],
  "GN-864":[127,75,52],"GN-865":[128,121,109],"GN-866":[134,105,70],"GN-867":[104,62,42],
  "GN-868":[193,161,104],"GN-869":[156,99,92],"GN-870":[155,143,136],"GN-871":[236,224,191],
  "GN-872":[240,197,204],"GN-873":[241,209,224],"GN-874":[235,220,183],"GN-875":[165,87,55],
  "GN-876":[232,238,162],"GN-877":[253,246,225],"GN-878":[218,237,249],"GN-879":[219,223,245],
  "GN-880":[234,227,237],"GN-881":[250,229,232],"GN-882":[250,234,225],"GN-883":[248,244,231],
  "GN-884":[225,232,233],"GN-885":[179,214,201],"GN-886":[230,239,224],"GN-887":[252,242,212],
  "GN-888":[146,190,221],"GN-889":[119,196,233],"GN-890":[112,177,223],"GN-891":[80,175,232],
  "GN-892":[75,159,196],"GN-893":[65,146,212],"GN-894":[62,140,208],"GN-895":[46,105,180],
  "GN-896":[45,100,152],"GN-897":[28,38,116],"GN-898":[177,203,235],"GN-899":[147,167,215],
  "GN-900":[120,126,179],"GN-901":[65,65,139],"GN-902":[85,52,115],"GN-903":[242,207,219],
  "GN-904":[224,116,162],"GN-905":[219,107,160],"GN-906":[188,74,141],"GN-907":[197,64,104],
  "GN-908":[195,110,139],"GN-909":[190,102,159],"GN-910":[192,81,106],"GN-911":[245,215,189],
  "GN-912":[243,210,191],"GN-913":[225,183,163],"GN-914":[243,211,181],"GN-915":[230,176,150],
  "GN-916":[227,169,127],"GN-917":[242,218,219],"GN-918":[227,183,188],"GN-919":[185,119,121],
  "GN-920":[182,100,97],"GN-921":[184,102,93],"GN-922":[166,82,86],"GN-923":[133,51,66],
  "GN-924":[245,243,232],"GN-925":[227,229,178],"GN-926":[233,217,185],"GN-927":[221,193,159],
  "GN-928":[202,172,126],"GN-929":[238,213,155],"GN-930":[230,156,58],"GN-931":[205,133,64],
  "GN-932":[176,124,65],"GN-933":[252,245,116],"GN-934":[246,209,72],"GN-935":[240,181,63],
  "GN-936":[236,176,93],"GN-937":[225,132,54],"GN-938":[194,196,68],"GN-939":[197,217,89],
  "GN-940":[183,205,177],"GN-941":[64,144,69],"GN-942":[51,118,69],"GN-943":[188,172,88],
  "GN-944":[186,151,50],"GN-945":[101,101,61],"GN-946":[127,116,62],"GN-947":[119,100,66],
  "GN-948":[94,81,56],"GN-949":[228,228,228],"GN-950":[198,198,198],"GN-951":[177,187,190],
  "GN-952":[152,168,179],"GN-953":[136,144,137],"GN-954":[146,174,190],"GN-955":[214,219,210],
  "GN-956":[168,177,162],"GN-957":[182,177,172],"GN-958":[156,134,122],"GN-959":[116,116,116],
  "GN-960":[96,75,53],"GN-961":[124,157,169],"GN-962":[181,154,191],"GN-963":[206,46,40],
  "GN-964":[124,68,39],"GN-965":[191,75,146]
};

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
  { label:"Dual tip: Warm skin",      value:"GN.8109G-12" },
  { label:"Dual tip: Reddish brown",  value:"GN.8109H-12" },
  { label:"Dual tip: White-Gray",     value:"GN.8109I-12" },
  { label:"Dual tip: Tan",            value:"GN.8109J-12" },
  { label:"Dual tip: Pinkish skin",   value:"GN.8109K-12" },
  { label:"Classic Brush: Skin (24F)",value:"GN.8201F-24" },
  { label:"Classic Brush: Skin (12B)",value:"GN.8201B-12" },
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

  // Fetch live FX rates on mount
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
      orderId = data.orderId ?? "";

    } catch (err) {
      console.error("Failed to submit order:", err);
    }

    const filledSets = sets.filter(Boolean);
    const variantId  = LEVEL_TO_VARIANT[level];
    const q = new URLSearchParams({
      variantId,
      email,
      level,
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
      <Navbar />
      <main style={{padding:"40px 24px", maxWidth:1100, margin:"0 auto"}}>
        <h1 style={{fontFamily:"Nunito, sans-serif", color:"var(--pink)", fontWeight:900, fontSize:"clamp(26px,4vw,40px)", marginBottom:6}}>
          Create Your Guangna by Number
        </h1>
        <p style={{color:"#666", marginBottom:8}}>
        Upload your photo, choose your level and Guangna markers, and we’ll take care of the rest. Your finished file will be delivered to your inbox — within 24 hours, often much faster 😁
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

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, marginTop:28}}>

          {/* ── LEFT COLUMN ── */}
          <div style={{display:"flex", flexDirection:"column", gap:22}}>

            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>📸 Upload your photo</h2>
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

            <div className="card">
              <h2 style={{fontWeight:800, fontSize:17, marginBottom:14}}>🎯 Select your level</h2>
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
                          <span style={{
                            fontSize:11, fontWeight:700,
                            background:"var(--pink)", color:"white",
                            borderRadius:20, padding:"2px 8px",
                            letterSpacing:"0.03em",
                          }}>
                            ★ Most Popular
                          </span>
                        )}
                      </div>
                      <div style={{color:"var(--muted)", fontSize:13}}>{l.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* FX Disclaimer */}
              <div style={{
                marginTop:16, padding:"10px 14px",
                background:"#f9f9f9", borderRadius:10,
                borderLeft:"3px solid var(--border)",
              }}>
                <p style={{fontSize:11, color:"#999", margin:0, lineHeight:1.6}}>
                  💱 Prices shown in EUR. Approximate equivalents in USD and GBP are shown for indication only, based on indicative exchange rates. Your bank or card provider may apply different rates and fees.
                </p>
              </div>
            </div>

          </div>

{/* ── RIGHT COLUMN ── */}
<div style={{display:"flex", flexDirection:"column", gap:22}}>

<div className="card">
  <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>🖊️ Your Guangna Marker Sets</h2>
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
          style={{width:"100%", padding:"10px 12px", borderRadius:10,
            border:"2px solid var(--border)", fontSize:14, background:"white", cursor:"pointer", outline:"none"}}>
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

{/* Email box */}
<div className="card">
  <h2 style={{fontWeight:800, fontSize:17, marginBottom:4}}>✉️ Your email</h2>
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

{/* Submit button */}
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
