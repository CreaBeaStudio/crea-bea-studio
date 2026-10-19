// Languo color data: Art 288 Acrylic + Gel Pens 0.6mm + PLUS Acrylic Gel Pens 1mm
// Bold Tip + Languo x Qimiart Glitter.
//
// rgbToLab/deltaE come from lib/guangna.ts so both directions of the
// Languo<->Guangna converter (and any other Languo color matching) use
// the exact same distance math -- no duplicated/potentially-drifting
// copy of the Lab conversion or Delta E formula here.
import { rgbToLab, deltaE } from "./guangna";
//
// 2026-10-19 sRGB CORRECTION (Gel Pens 0.6mm / PLUS 1mm Bold Tip /
// Languo x Qimiart): a cell-by-cell check against MASTERFILE-ColorCheck.xlsx
// found that these three product lines had been stored with their ADOBE RGB
// values instead of sRGB (the 2026-08-03 merge copied the wrong column).
// Every entry for them below (BH-151 .. SG-36, i.e. all Gel Pen codes, all
// BG- codes and the SG-01..SG-116 glitter codes) now uses the sRGB column of
// MASTERFILE-ColorCheck.xlsx, which was itself verified against a fresh
// Adobe RGB (1998) -> sRGB conversion (all rows agree within 1 unit).
// The Acrylic Brush values (everything before BH-151, plus the MC/SG-xxxG/
// LG/SL/SW/VC blocks) were already sRGB and are unchanged. BG-201/202/203
// keep the PLUS sheet's value (see the 2026-08-03 note below); the extra
// Qimiart rows for those three are the "-L" codes.
//
// Source (Art 288 Acrylic): Languo_288_final_incl_swatch.xlsx (Code + Adobe RGB
// columns only, no color names, no usable embedded swatches).
// Source (Gel Pens 0.6mm, PLUS 1mm Bold Tip, Languo x Qimiart): Update_Languo_ts.xlsx
// (2026-08-03), consolidated by Mirjam from Languo_Gel_06.xlsx and Languo_Addition.xlsx
// with Adobe RGB, sRGB and per-set membership columns already filled in.
// Corrected 2026-10-19 from MASTERFILE-ColorCheck.xlsx (sRGB columns).
//
// IMPORTANT: source files only give Adobe RGB. All values here were converted to
// sRGB using the same Adobe RGB (1998) -> XYZ (D65) -> sRGB pipeline used to build
// lib/guangna.ts's GN_COLORS srgb field -- verified against 15+ known Adobe RGB/sRGB
// pairs from the Guangna master file and from Mirjam's own conversions with zero
// rounding error before being applied here. Skipping this step is what caused the
// original Guangna matching bugs; do not match Languo's raw Adobe RGB values
// directly against GN_COLORS (which are sRGB).
//
// AG-251 correction (2026-07-16): the source file's (260,155,90) was
// confirmed a typo -- the correct Adobe RGB value is (160,155,95).
// Converted through the same Adobe RGB (1998) -> XYZ (D65) -> sRGB
// pipeline as the rest of this file: sRGB (163,156,91).
//
// YE-133 / SG-224 / DS-181 correction (2026-07-18): these three were
// flagged as suspicious exact-duplicate sRGB values during a color-group
// audit. Re-verified against corrected Adobe RGB source values and
// reconverted through the same pipeline:
//   YE-133: Adobe (220,215,95) -> sRGB (223,216,84)
//   SG-224: Adobe (227,217,100) -> sRGB (232,218,90)
//   DS-181: Adobe (225,185,130) -> sRGB (239,186,128) -- was wrongly
//     entered as an exact copy of LC-197's (252,245,230); LC-197 itself
//     was re-checked and confirmed correct as-is.
//
// 2026-08-03 merge (Gel Pens 0.6mm / PLUS 1mm Bold Tip / Languo x Qimiart):
//   - LM-258 (Gel Pens): source Adobe RGB '190. 180, 210' (period instead of
//     comma) -- CONFIRMED by Mirjam as (190,180,210).
//   - GH-165 (Gel Pens): sheet's sRGB (237,133,144) didn't match converting
//     its own Adobe RGB (210,113,141) -> (237,114,143) -- CONFIRMED by
//     Mirjam as a manual-entry typo in the sRGB column; her re-measured
//     sRGB (237,113,144) is within 1 unit of the computed value (rounding
//     only).
//   - GH-161 (Gel Pens): sheet's Adobe RGB (235,197,197) was itself a typo
//     -- Mirjam measured the real value as (235,197,187) (light pinkish
//     color, blue channel off by 10). Recomputed sRGB (248,198,188) matches
//     her independently measured sRGB (249,198,188) within 1 unit.
//   - No code collisions found between the Art 288 Acrylic set, Gel Pens,
//     PLUS, or Languo x Qimiart -- all four product lines use distinct code
//     ranges/prefixes, confirmed programmatically.
//   - PLUS and Languo x Qimiart share the same 144 base "BG-" codes (same
//     product family, different physical formats) -- their Adobe RGB values
//     matched exactly for 140/144 codes (1 more matched after normalizing a
//     missing space) and PLUS's now-resolved single value was used as the
//     source of truth for the remaining 3 (BG-201, BG-202, BG-203).
//   - BG-201 / BG-202 / BG-203: these three codes still have an EXTRA,
//     unresolved duplicate row in Update_Languo_ts.xlsx's 'Qimiart' sheet
//     with a different Adobe RGB value from the one used here (which came
//     from the now-fixed PLUS sheet). The stray duplicate rows were not
//     included. If those extra rows represent a real 4th color, they need
//     a new code -- please check against the supplier/physical set.
//   - The 72 "SG-xx" codes from the Languo x Qimiart sheet are Glitter pens
//     (see LANGUO_GLITTER_IDS below) -- kept in LANGUO_COLORS for reference
//     and for the 'LanguoxQimiart' set, but should be excluded from the
//     Color/Legend/Languo-Guangna converters, the same way Guangna's
//     Metallic markers are excluded there.
//
// 2026-09 Acrylic Brush expansion (432 Set): added 138 new codes bringing
// the Acrylic Brush line from 288 to 432 (426 distinct data rows -- white
// GB-401 and black GB-405 are each listed once here but count 4x in the
// physical 432-marker set, per Mirjam). Breakdown of the 138:
//   - 42 new Metallic codes (MC-001..MC-048, gaps at 003/016-018/021/024/
//     026-028/031/033-034/036-039/041/044-047 -- not every number in the
//     range was used) -- see LANGUO_METALLIC_IDS below. Like Guangna's
//     Metallic markers, these should be excluded from color-matching
//     defaults (see LANGUO_MATCHING_IDS) but remain typeable/ownable.
//   - 48 new Glitter codes -- renamed from the source's SG-420..SG-467 to
//     SG-420G..SG-467G (Mirjam's call) specifically to disambiguate them
//     from the *other two* unrelated things that already used the "SG-"
//     prefix: the pre-existing Acrylic Sage/Forest Green colors
//     (SG-151..159, SG-221..232 -- ordinary matchable colors, NOT
//     glitter) and the Languo x Qimiart Glitter set's own SG-01..SG-116
//     codes (a completely different product line, already numbered 1-116
//     with no letter suffix). The "G" suffix makes a glitter code
//     recognizable on sight regardless of which other SG-prefixed thing
//     is nearby. Added to LANGUO_GLITTER_IDS below.
//   - 48 new ordinary colors across 4 brand-new prefixes (12 each):
//     LG, SL, SW, VC.
//   - Two data-quality issues caught and resolved before merging:
//     CB-901..909 arrived shifted by one position in a 9-way cycle
//     (new-sheet CB-901 held CB-902's real color, etc.) -- confirmed with
//     Mirjam against the physical color chart that the EXISTING values
//     below are correct; the shifted new-sheet values were discarded
//     entirely (CB-910 was unaffected and needed no fix). MC-047's raw
//     value coincidentally matched existing SG-92's color exactly --
//     confirmed as not an error since MC-047 is Metallic and is excluded
//     from color-matching regardless.
//   - See lib/languoSets.ts for the resulting "432 Set" and "384 Set"
//     membership (the 384 Set is a curated subset: 24 of the 42 Metallics
//     and 24 of the 48 new Glitter codes, not a simple range).

export const LANGUO_COLORS: Record<string,[number,number,number]> = {
  "MC-001":[211,175,152],"MC-002":[182,166,117],"MC-004":[203,204,97],"MC-005":[129,165,54],"MC-006":[119,182,142],"MC-007":[62,187,162],
  "MC-008":[55,150,65],"MC-009":[14,135,130],"MC-010":[13,127,165],"MC-011":[52,94,150],"MC-012":[138,181,189],"MC-013":[207,163,193],
  "MC-014":[217,121,64],"MC-015":[231,100,103],"MC-017":[140,92,142],"MC-018":[120,70,103],"MC-019":[62,63,120],"MC-020":[80,80,80],
  "MC-021":[118,95,88],"MC-022":[128,84,82],"MC-023":[133,112,88],"MC-025":[173,161,112],"MC-026":[210,186,97],"MC-028":[200,134,53],
  "MC-029":[201,161,109],"MC-030":[103,80,52],"MC-031":[106,99,97],"MC-032":[146,74,92],"MC-034":[188,130,136],"MC-035":[175,160,150],
  "MC-036":[164,157,141],"MC-037":[176,183,119],"MC-039":[167,184,48],"MC-040":[85,183,92],"MC-041":[12,140,100],"MC-042":[118,176,138],
  "MC-043":[120,163,153],"MC-044":[70,140,170],"MC-045":[100,77,112],"MC-046":[138,128,170],"MC-047":[170,145,165],"MC-048":[178,168,182],
  "GB-401":[255,255,255],"BR-702":[228,221,211],"BR-706":[179,151,125],"CB-906":[109,74,68],"RY-09":[160,100,84],"RY-07":[156,52,52],
  "RY-06":[232,51,45],"RY-05":[234,90,61],"YE-126":[240,131,51],"RY-03":[250,191,93],"RY-02":[254,240,0],"RY-01":[255,250,188],
  "SG-221":[190,226,226],"PC-233":[248,221,231],"BL-261":[135,156,203],"GB-403":[186,186,186],"GB-404":[141,141,141],"GB-405":[54,46,46],
  "CB-902":[41,84,90],"GR-109":[72,121,94],"GR-108":[9,141,120],"GR-106":[129,181,123],"GR-105":[163,191,122],"GR-104":[219,226,136],
  "HC-603":[195,216,103],"GR-103":[175,211,180],"GR-101":[234,240,230],"SG-222":[155,206,196],"PC-234":[241,201,206],"BL-262":[85,100,148],
  "PU-302":[204,177,207],"PU-304":[112,105,174],"PU-305":[95,74,143],"CB-908":[66,74,133],"BL-209":[71,79,143],"BL-208":[76,116,163],
  "BL-206":[90,172,208],"BL-205":[138,206,242],"BL-204":[195,231,251],"BL-203":[105,201,201],"BL-202":[144,211,216],"BL-201":[215,236,231],
  "SG-223":[177,201,184],"PC-235":[252,206,206],"BL-263":[123,95,106],"PC-802":[244,191,217],"HC-139":[241,126,163],"PU-308":[233,100,158],
  "PC-807":[199,90,111],"PU-306":[146,79,154],"CS-509":[223,177,161],"CS-508":[243,172,182],"CS-507":[242,177,156],"CS-506":[248,221,206],
  "CS-143":[246,206,196],"CS-503":[252,245,230],"CS-501":[250,250,250],"SG-224":[232,218,90],"PC-236":[204,177,192],"BL-264":[97,90,106],
  "PU-301":[234,221,236],"LC-116":[236,121,142],"LC-118":[212,121,105],"LC-112":[236,151,130],"LC-114":[221,41,47],"LC-113":[228,95,78],
  "RY-04":[242,151,108],"YE-125":[248,177,0],"YE-127":[212,172,78],"HC-608":[218,191,122],"YE-129":[236,216,120],"HC-134":[254,240,17],
  "SG-225":[211,225,129],"PC-237":[218,161,177],"BL-265":[66,74,101],"HC-609":[201,201,201],"HC-131":[133,201,191],"GR-107":[93,156,108],
  "CB-903":[87,95,78],"BL-207":[51,84,138],"PC-809":[136,63,91],"CB-904":[93,79,101],"CB-909":[87,95,116],"CB-905":[118,90,100],
  "PC-805":[205,90,148],"LC-119":[187,90,100],"BR-705":[185,151,119],"SG-226":[144,196,93],"PC-238":[240,161,198],"BL-266":[36,90,133],
  "BR-704":[231,191,160],"CS-149":[191,131,126],"RY-08":[131,57,52],"BR-709":[102,74,68],"BR-707":[149,95,78],"GB-406":[135,121,115],
  "HC-135":[246,161,31],"YE-128":[205,191,105],"YE-124":[254,201,12],"YE-122":[247,240,112],"YE-121":[252,245,167],"CS-141":[255,250,134],
  "SG-227":[113,191,149],"PC-239":[219,116,147],"BL-267":[49,100,132],"GB-402":[221,221,221],"GR-102":[222,236,220],"CB-901":[55,105,100],
  "PC-806":[225,86,129],"PU-303":[165,131,183],"PU-307":[194,84,154],"PC-804":[238,141,167],"HC-607":[242,177,182],"HC-136":[241,156,193],
  "CS-147":[238,191,186],"LC-111":[248,201,191],"CS-145":[246,226,185],"SG-228":[81,181,100],"PC-240":[227,100,122],"BL-268":[17,121,163],
  "PC-814":[220,141,147],"LC-117":[221,136,147],"LC-115":[237,172,187],"HC-601":[246,206,206],"CS-146":[251,211,211],"PC-801":[251,231,231],
  "PC-810":[251,231,236],"PU-310":[241,221,231],"CS-144":[249,236,225],"CS-502":[250,234,234],"CS-505":[255,236,215],"BR-701":[254,240,220],
  "SG-229":[111,181,83],"PC-241":[170,79,117],"YE-136":[228,156,40],"HC-606":[242,177,118],"CS-511":[246,186,122],"YE-135":[251,211,120],
  "YE-134":[254,221,125],"YE-123":[253,226,55],"HC-602":[247,240,100],"YE-132":[242,236,152],"YE-130":[255,250,204],"YE-131":[247,240,199],
  "CS-510":[254,240,205],"CS-142":[254,240,215],"SG-230":[108,161,66],"PC-242":[163,84,84],"PC-816":[175,141,147],"GB-407":[173,167,161],
  "GB-411":[177,177,182],"CS-148":[200,167,161],"BR-703":[215,201,186],"BR-711":[203,196,170],"GB-408":[218,211,196],"BR-712":[231,211,191],
  "GB-409":[231,231,221],"GB-410":[221,221,216],"CS-504":[253,226,195],"BR-710":[240,240,220],"SG-231":[45,136,69],"PC-243":[220,105,89],
  "CB-907":[81,74,68],"CB-910":[90,90,67],"SG-159":[0,90,61],"SG-158":[82,105,72],"SG-157":[114,121,71],"SG-154":[142,156,102],
  "GR-112":[119,156,91],"GR-111":[163,206,121],"HC-132":[170,206,104],"HC-133":[229,236,118],"YE-133":[223,216,84],"GR-110":[240,240,189],
  "SG-232":[95,126,70],"PC-244":[247,181,166],"DB-163":[158,186,186],"DB-164":[142,186,181],"DB-165":[111,156,156],"GR-114":[0,161,161],
  "DB-166":[9,141,141],"GR-115":[17,121,105],"GR-113":[0,161,119],"SG-156":[116,161,130],"SG-155":[118,172,140],"SG-153":[160,196,138],
  "SG-152":[192,206,170],"SG-151":[217,231,184],"AG-256":[163,116,59],"AG-248":[190,156,141],"DB-169":[43,95,116],"DB-167":[37,121,131],
  "DB-168":[37,110,132],"BL-214":[0,135,162],"BL-213":[21,151,193],"BL-212":[19,110,184],"BL-211":[37,141,203],"BL-210":[0,161,233],
  "HC-604":[119,196,232],"HC-138":[135,211,242],"DB-162":[163,206,222],"DB-161":[174,217,216],"AG-255":[127,141,131],"AG-247":[225,191,171],
  "RY-10":[239,100,36],"RY-12":[205,90,43],"RY-11":[234,90,78],"RY-13":[184,68,57],"RY-14":[150,46,46],"PC-808":[176,84,111],
  "PC-815":[162,90,117],"PC-813":[193,90,122],"PC-812":[231,116,168],"PC-803":[243,172,192],"PC-811":[240,161,193],"PU-309":[246,186,212],
  "AG-254":[146,146,103],"AG-246":[234,221,206],"BR-713":[220,167,107],"BR-714":[172,131,98],"BR-715":[137,116,83],"BR-708":[116,95,78],
  "GB-412":[86,79,79],"PU-315":[120,46,123],"PU-314":[126,105,169],"HC-605":[156,156,203],"PU-312":[191,191,222],"HC-137":[212,158,200],
  "PU-313":[192,172,192],"PU-311":[231,231,241],"AG-253":[157,136,87],"AG-245":[230,216,216],"DS-184":[149,82,82],"DS-189":[102,95,78],
  "DS-188":[133,105,89],"DS-187":[162,121,94],"DS-183":[162,121,82],"DS-182":[193,146,105],"RY-15":[220,110,60],"DS-185":[192,126,104],
  "DS-186":[205,151,119],"DS-181":[239,186,128],"LC-197":[252,245,230],"LC-196":[255,236,231],"AG-252":[129,136,75],"BL-257":[235,235,235],
  "DB-1611":[147,177,182],"AG-176":[147,161,140],"YE-1212":[180,167,124],"YE-1211":[205,191,133],"YE-1210":[233,226,174],"AG-179":[172,151,134],
  "AG-178":[199,172,156],"AG-177":[203,196,181],"LC-1110":[230,216,211],"LC-199":[245,245,240],"LC-198":[250,250,230],"LC-191":[255,255,230],
  "AG-251":[163,156,91],"BL-258":[228,221,226],"AG-171":[211,211,211],"AG-172":[189,196,196],"AG-173":[192,206,206],"DB-1610":[142,172,197],
  "DB-1612":[114,165,182],"GR-1010":[113,167,182],"GR-1013":[87,186,160],"AG-175":[157,172,145],"AG-174":[182,196,176],"GR-1011":[180,201,104],
  "GR-1012":[199,206,138],"LC-192":[238,245,225],"AG-250":[197,177,134],"BL-259":[194,201,232],"PC-817":[243,172,202],"PC-818":[224,74,122],
  "PU-319":[127,79,133],"BL-215":[27,136,204],"PU-320":[100,100,137],"PU-318":[154,161,187],"PU-321":[169,177,192],"PU-317":[187,187,208],
  "PU-316":[215,201,222],"LC-195":[247,240,246],"LC-194":[232,245,250],"LC-193":[238,245,240],"AG-249":[228,201,138],"BL-260":[172,172,208],
  "BH-151":[55,105,105],"BH-152":[101,116,121],"BH-153":[131,131,120],"BH-154":[135,121,137],"BH-155":[154,133,144],"BH-156":[145,110,100],
  "BH-157":[128,121,110],"BH-158":[110,110,132],"BH-159":[110,110,127],"CH-161":[248,201,191],"CH-162":[242,151,130],"CH-163":[228,95,78],
  "CH-164":[226,46,46],"CH-165":[236,118,144],"CH-166":[102,170,188],"CH-167":[226,151,159],"CH-168":[205,126,115],"CH-169":[180,95,106],
  "DB-181":[109,196,212],"DB-182":[136,196,68],"DB-183":[188,216,57],"DB-184":[254,240,0],"DB-185":[252,206,8],"DB-186":[227,161,198],
  "DB-187":[193,177,212],"DB-188":[135,198,242],"DB-189":[232,52,138],"DC-201":[255,255,230],"DC-202":[238,245,245],"DC-203":[236,245,238],
  "DC-204":[230,243,253],"DC-205":[248,239,246],"DC-206":[253,236,231],"DC-207":[252,245,230],"DC-208":[254,248,230],"DC-209":[245,245,240],
  "FS-191":[250,240,230],"FS-192":[246,234,210],"FS-193":[241,221,190],"FS-194":[255,236,236],"FS-195":[251,211,191],"FS-196":[248,201,201],
  "FS-197":[228,181,176],"FS-198":[199,172,161],"FS-199":[185,131,117],"FS-601":[251,238,245],"FS-602":[251,231,231],"FS-603":[253,242,229],
  "FS-604":[251,231,205],"FS-605":[249,236,220],"FS-606":[248,219,204],"FS-607":[247,181,161],"FS-608":[240,158,177],"FS-609":[202,161,140],
  "GF-401":[243,146,178],"GF-402":[246,161,124],"GF-403":[254,240,100],"GF-404":[183,211,115],"GF-405":[144,211,247],"GF-406":[151,110,174],
  "GF-407":[241,181,192],"GF-408":[135,156,213],"GF-409":[125,110,179],"GH-161":[249,198,188],"GH-162":[241,149,125],"GH-163":[233,87,73],
  "GH-164":[224,23,28],"GH-165":[237,113,144],"GH-166":[243,169,189],"GH-167":[226,150,157],"GH-168":[205,123,112],"GH-169":[178,87,96],
  "GJ-211":[204,211,211],"GJ-212":[189,196,196],"GJ-213":[185,206,206],"GJ-214":[182,196,176],"GJ-215":[157,172,143],"GJ-216":[149,156,141],
  "GJ-217":[201,191,178],"GJ-218":[199,172,158],"GJ-219":[172,151,141],"HL-701":[214,238,241],"HL-702":[178,221,231],"HL-703":[102,181,197],
  "HL-704":[186,226,251],"HL-705":[131,191,232],"HL-706":[93,144,203],"HL-707":[28,74,128],"HL-708":[88,110,168],"HL-709":[47,63,144],
  "HN-901":[254,250,188],"HN-902":[255,239,0],"HN-903":[248,201,0],"HN-904":[243,144,30],"HN-905":[234,90,61],"HN-906":[232,52,46],
  "HN-907":[159,49,49],"HN-908":[130,63,51],"HN-909":[156,90,61],"JY-141":[203,203,203],"JY-143":[228,201,149],"LM-251":[244,231,244],
  "LM-252":[223,216,236],"LM-253":[210,196,227],"LM-254":[211,211,232],"LM-255":[184,191,227],"LM-256":[183,183,217],"LM-257":[184,175,207],
  "LM-258":[195,181,212],"LM-259":[170,156,198],"MB-101":[87,95,106],"MB-102":[66,151,162],"MB-103":[67,161,135],"MB-104":[58,79,90],
  "MB-105":[180,167,151],"MB-106":[143,116,99],"MB-107":[147,126,99],"MB-108":[110,68,68],"MB-109":[123,82,93],"MF-301":[74,90,117],
  "MF-302":[103,191,191],"MF-303":[86,141,103],"MF-304":[125,159,119],"MF-305":[198,167,105],"MF-306":[196,151,119],"MF-307":[169,116,88],
  "MF-308":[164,79,90],"MF-309":[135,68,74],"MH-221":[239,186,128],"MH-222":[187,146,103],"MH-223":[162,121,82],"MH-224":[145,84,84],
  "MH-225":[193,123,104],"MH-226":[201,151,116],"MH-227":[162,121,88],"MH-228":[133,105,89],"MH-229":[103,92,78],"ML-131":[244,231,215],
  "ML-132":[228,221,211],"ML-133":[217,196,165],"ML-134":[210,177,139],"ML-135":[188,141,109],"ML-136":[143,116,94],"ML-137":[133,81,50],
  "ML-138":[93,79,68],"ML-139":[68,46,37],"MS-241":[217,231,184],"MS-242":[192,206,170],"MS-243":[160,196,138],"MS-244":[142,156,97],
  "MS-245":[118,172,140],"MS-246":[121,161,130],"MS-247":[116,121,73],"MS-248":[90,105,78],"MS-249":[8,95,61],"MT-01":[153,181,207],
  "MT-02":[165,216,236],"MT-03":[147,206,154],"MT-04":[205,226,174],"MT-05":[231,231,147],"MT-06":[230,216,169],"MT-07":[228,181,150],
  "MT-08":[241,181,195],"MT-09":[223,177,212],"MY-201":[119,141,162],"MY-202":[103,191,197],"MY-203":[170,206,154],"MY-204":[141,201,154],
  "MY-205":[222,218,144],"MY-206":[230,196,144],"MY-207":[220,156,124],"MY-208":[229,126,121],"MY-209":[210,156,177],"MZ-501":[195,181,217],
  "MZ-502":[169,139,188],"MZ-503":[151,114,173],"MZ-504":[125,110,176],"MZ-505":[95,95,158],"MZ-506":[156,90,159],"MZ-507":[173,126,183],
  "MZ-508":[201,141,188],"MZ-509":[223,196,222],"SD-271":[250,250,199],"SD-272":[236,236,163],"SD-273":[195,216,120],"SD-274":[215,229,125],
  "SD-275":[197,211,103],"SD-276":[187,201,92],"SD-277":[180,201,92],"SD-278":[126,167,91],"SD-279":[140,161,96],"SM-111":[255,255,255],
  "SM-112":[240,240,240],"SM-113":[201,201,201],"SM-114":[161,161,161],"SM-115":[116,116,116],"SM-116":[95,95,95],"SM-117":[46,46,46],
  "TF-121":[249,218,224],"TF-122":[247,181,207],"TF-123":[241,126,168],"TF-124":[231,95,153],"TF-125":[192,74,133],"TF-126":[220,57,112],
  "TF-127":[196,68,101],"TF-128":[138,46,80],"TF-129":[102,41,64],"WH-171":[252,245,165],"WH-172":[247,240,112],"WH-173":[253,224,54],
  "WH-174":[254,201,0],"WH-175":[248,178,2],"WH-176":[240,131,51],"WH-177":[212,172,78],"WH-178":[212,191,105],"WH-179":[233,206,127],
  "YL-231":[173,216,211],"YL-232":[161,209,221],"YL-233":[158,186,186],"YL-234":[142,186,181],"YL-235":[108,161,156],"YL-236":[9,141,141],
  "YL-237":[44,116,126],"YL-238":[29,116,137],"YL-239":[43,95,116],"ZG-261":[209,100,78],"ZG-262":[195,74,57],"ZG-263":[196,68,51],
  "ZG-264":[203,57,52],"ZG-265":[183,74,85],"ZG-266":[184,68,68],"ZG-267":[174,52,52],"ZG-268":[161,63,63],"ZG-269":[125,52,52],
  "ZS-801":[234,240,230],"ZS-802":[210,231,210],"ZS-803":[173,216,180],"ZS-804":[217,231,130],"ZS-805":[166,191,122],"ZS-806":[127,184,123],
  "ZS-807":[97,151,108],"ZS-808":[9,141,114],"ZS-809":[77,100,84],"BG-902":[254,240,115],"BG-903":[253,211,120],"BG-904":[237,143,98],
  "BG-906":[231,63,63],"BG-907":[149,57,57],"BG-909":[173,100,84],"BG-801":[238,245,230],"BG-803":[190,226,203],"BG-804":[212,226,119],
  "BG-805":[181,214,103],"BG-807":[78,161,126],"BG-809":[80,136,104],"BG-701":[203,231,231],"BG-702":[119,196,212],"BG-704":[195,231,251],
  "BG-705":[103,191,222],"BG-707":[66,95,138],"BG-709":[41,57,107],"BG-501":[197,177,207],"BG-502":[206,146,188],"BG-503":[146,116,175],
  "BG-505":[101,116,168],"BG-506":[179,100,163],"BG-508":[224,121,173],"BG-601":[252,245,245],"BG-602":[251,231,221],"BG-603":[255,245,230],
  "BG-604":[253,226,200],"BG-606":[253,216,190],"BG-609":[215,159,238],"BG-111":[254,254,254],"BG-112":[240,240,240],"BG-113":[202,205,207],
  "BG-114":[149,156,162],"BG-116":[101,104,106],"BG-117":[44,44,47],"BG-121":[249,216,216],"BG-122":[242,208,224],"BG-124":[241,156,188],
  "BG-125":[218,95,155],"BG-126":[237,116,147],"BG-128":[192,95,132],"BG-161":[245,167,161],"BG-162":[238,141,131],"BG-164":[210,41,47],
  "BG-166":[236,121,137],"BG-167":[209,100,106],"BG-169":[193,90,100],"BG-132":[247,240,230],"BG-133":[234,221,200],"BG-135":[215,181,145],
  "BG-136":[149,118,94],"BG-137":[181,121,99],"BG-139":[107,79,56],"BG-171":[253,249,167],"BG-173":[254,228,89],"BG-175":[246,184,88],
  "BG-176":[246,161,66],"BG-177":[226,189,94],"BG-178":[218,191,75],"BG-181":[99,196,191],"BG-183":[217,231,130],"BG-184":[255,236,118],
  "BG-185":[241,156,97],"BG-187":[185,172,208],"BG-189":[237,136,175],"BG-151":[55,105,100],"BG-152":[41,84,95],"BG-154":[93,79,101],
  "BG-155":[118,90,100],"BG-157":[92,84,73],"BG-158":[44,52,78],"BG-191":[250,240,227],"BG-192":[254,240,210],"BG-193":[241,221,180],
  "BG-196":[248,201,207],"BG-197":[234,181,187],"BG-199":[221,161,146],"BG-03":[167,213,176],"BG-204":[133,196,142],"BG-203":[150,191,97],
  "BG-304":[135,172,101],"BG-303":[96,177,123],"BG-104":[85,100,72],"BG-02":[195,231,241],"BG-202":[113,191,191],"BG-102":[88,143,167],
  "BG-201":[152,167,182],"BG-301":[60,84,115],"BG-101":[67,70,85],"BG-402":[243,175,143],"BG-403":[242,236,231],"BG-404":[194,219,114],
  "BG-405":[144,211,247],"BG-407":[239,146,169],"BG-409":[164,136,183],"BG-201-L":[255,253,230],"BG-202-L":[236,245,225],"BG-203-L":[239,239,246],
  "BG-205":[247,240,249],"BG-206":[255,239,232],"BG-209":[252,252,246],"BG-211":[208,211,213],"BG-213":[189,203,206],"BG-214":[182,196,176],
  "BG-215":[157,172,143],"BG-217":[201,191,178],"BG-219":[166,148,133],"BG-221":[238,191,117],"BG-222":[187,146,103],"BG-225":[193,123,104],
  "BG-226":[202,136,85],"BG-227":[164,110,77],"BG-229":[109,95,73],"BG-232":[165,208,218],"BG-233":[158,186,186],"BG-234":[142,186,186],
  "BG-236":[20,144,144],"BG-237":[64,131,142],"BG-238":[43,121,142],"BG-241":[217,231,184],"BG-242":[193,208,170],"BG-243":[160,196,133],
  "BG-245":[118,172,140],"BG-248":[90,121,77],"BG-249":[47,93,75],"BG-251":[244,231,241],"BG-252":[223,216,236],"BG-256":[183,184,220],
  "BG-257":[186,174,207],"BG-258":[199,179,214],"BG-259":[165,151,193],"BG-261":[233,106,73],"BG-262":[197,84,67],"BG-263":[195,73,53],
  "BG-265":[207,74,96],"BG-267":[180,52,52],"BG-269":[126,46,52],"BG-271":[219,233,149],"BG-272":[207,221,125],"BG-273":[152,196,81],
  "BG-275":[177,201,86],"BG-276":[176,188,82],"BG-278":[104,167,84],"SG-01":[240,212,206],"SG-02":[248,201,201],"SG-03":[207,167,208],
  "SG-04":[188,216,231],"SG-05":[200,228,228],"SG-06":[247,240,157],"SG-81":[231,231,236],"SG-82":[208,208,208],"SG-83":[232,216,231],
  "SG-84":[248,221,216],"SG-85":[204,218,236],"SG-86":[236,216,198],"SG-21":[251,211,211],"SG-22":[247,181,207],"SG-23":[237,146,167],
  "SG-24":[218,121,105],"SG-25":[196,66,85],"SG-26":[170,79,85],"SG-111":[216,234,195],"SG-112":[196,229,249],"SG-113":[238,211,232],
  "SG-114":[248,201,212],"SG-115":[249,236,112],"SG-116":[247,214,180],"SG-71":[250,191,139],"SG-72":[242,186,66],"SG-73":[240,161,91],
  "SG-74":[229,126,74],"SG-75":[165,105,94],"SG-76":[131,110,89],"SG-11":[226,105,163],"SG-12":[217,177,212],"SG-13":[183,226,241],
  "SG-14":[103,110,179],"SG-15":[61,177,177],"SG-16":[169,116,83],"SG-61":[221,221,136],"SG-62":[175,196,116],"SG-63":[167,181,83],
  "SG-64":[132,161,91],"SG-65":[106,121,77],"SG-66":[128,121,77],"SG-51":[178,221,208],"SG-52":[102,181,117],"SG-53":[124,201,181],
  "SG-54":[52,181,166],"SG-55":[65,189,189],"SG-56":[71,146,141],"SG-91":[139,153,185],"SG-92":[180,146,167],"SG-93":[203,196,144],
  "SG-94":[161,161,172],"SG-95":[132,146,146],"SG-96":[165,151,135],"SG-41":[168,211,226],"SG-42":[81,181,222],"SG-43":[45,181,197],
  "SG-44":[72,126,194],"SG-45":[63,95,169],"SG-46":[82,90,159],"SG-101":[103,110,174],"SG-102":[126,105,174],"SG-103":[82,90,164],
  "SG-104":[112,84,138],"SG-105":[175,90,159],"SG-106":[171,74,106],"SG-31":[232,46,123],"SG-32":[245,146,62],"SG-33":[249,236,88],
  "SG-34":[158,201,67],"SG-35":[53,161,213],"SG-36":[96,110,174],
  "SG-420G":[200,195,100],"SG-421G":[200,176,63],"SG-422G":[200,150,85],"SG-423G":[166,120,57],"SG-424G":[230,145,85],"SG-425G":[190,125,95],
  "SG-426G":[175,112,76],"SG-427G":[190,118,134],"SG-428G":[205,95,100],"SG-429G":[187,86,93],"SG-430G":[155,103,77],"SG-431G":[142,113,88],
  "SG-432G":[191,193,191],"SG-433G":[200,210,130],"SG-434G":[150,184,102],"SG-435G":[108,170,107],"SG-436G":[87,167,147],"SG-437G":[90,122,99],
  "SG-438G":[55,146,155],"SG-439G":[69,120,156],"SG-440G":[114,184,208],"SG-441G":[46,162,208],"SG-442G":[65,130,175],"SG-443G":[85,120,175],
  "SG-444G":[220,135,180],"SG-445G":[240,130,170],"SG-446G":[195,160,202],"SG-447G":[225,163,186],"SG-448G":[205,155,193],"SG-449G":[190,110,160],
  "SG-450G":[160,121,162],"SG-451G":[140,104,168],"SG-452G":[122,95,161],"SG-453G":[80,80,150],"SG-454G":[120,115,113],"SG-455G":[90,90,80],
  "SG-456G":[250,219,207],"SG-457G":[250,210,210],"SG-458G":[245,190,190],"SG-459G":[238,200,151],"SG-460G":[215,205,120],"SG-461G":[225,220,110],
  "SG-462G":[180,195,145],"SG-463G":[190,218,196],"SG-464G":[162,203,225],"SG-465G":[196,183,200],"SG-466G":[195,185,155],"SG-467G":[150,140,127],
  "LG-330":[205,205,140],"LG-331":[200,215,155],"LG-332":[190,215,100],"LG-333":[163,204,118],"LG-334":[193,198,98],"LG-335":[169,195,176],
  "LG-336":[115,142,76],"LG-337":[90,132,87],"LG-338":[70,176,110],"LG-339":[131,170,155],"LG-340":[73,107,83],"LG-341":[80,95,65],
  "SL-342":[80,180,195],"SL-343":[55,162,224],"SL-344":[67,120,183],"SL-345":[78,80,153],"SL-346":[90,120,165],"SL-347":[145,120,177],
  "SL-348":[127,126,187],"SL-349":[143,155,206],"SL-350":[166,171,211],"SL-351":[167,173,188],"SL-352":[153,188,209],"SL-353":[185,225,247],
  "SW-269":[255,243,236],"SW-270":[250,218,206],"SW-271":[250,219,223],"SW-272":[245,222,234],"SW-273":[255,230,197],"SW-274":[205,231,203],
  "SW-275":[214,234,218],"SW-276":[216,236,231],"SW-277":[224,220,179],"SW-278":[241,240,208],"SW-279":[255,251,186],"SW-280":[188,209,190],
  "VC-281":[205,170,80],"VC-282":[238,125,86],"VC-283":[203,69,69],"VC-284":[172,120,95],"VC-285":[185,107,113],"VC-286":[65,135,130],
  "VC-287":[60,102,105],"VC-288":[100,71,75],"VC-289":[135,122,112],"VC-290":[160,130,148],"VC-291":[130,144,124],"VC-292":[187,167,150],
};

// Metallic codes (Acrylic Brush line, added 2026-09). Like Guangna's
// Metallic markers, these should be excluded from color-matching
// defaults (see LANGUO_MATCHING_IDS) but remain typeable/ownable via
// normalizeLanguoExtraCode -- a customer who owns them can still enter
// them as "extra codes", they just won't be auto-suggested.
// MC-001..MC-048: the 42 new Metallic codes from the 2026-09 Acrylic
// Brush expansion (see the file header comment above). Also includes
// HC-608 and HC-609 -- these are NOT part of that batch and keep their
// original "Dopamine Series A" HC- prefix, but they're actually Gold
// and Silver metallic-finish pens (confirmed against the source data's
// own "(Gold)"/"(Silver)" labels), so they get the same treatment as
// every other Metallic code here despite the different-looking prefix.
export const LANGUO_METALLIC_IDS: string[] = [
  "MC-001", "MC-002", "MC-004", "MC-005", "MC-006", "MC-007", "MC-008", "MC-009",
  "MC-010", "MC-011", "MC-012", "MC-013", "MC-014", "MC-015", "MC-017", "MC-018",
  "MC-019", "MC-020", "MC-021", "MC-022", "MC-023", "MC-025", "MC-026", "MC-028",
  "MC-029", "MC-030", "MC-031", "MC-032", "MC-034", "MC-035", "MC-036", "MC-037",
  "MC-039", "MC-040", "MC-041", "MC-042", "MC-043", "MC-044", "MC-045", "MC-046",
  "MC-047", "MC-048",
  "HC-608", "HC-609"
];

// Glitter pens (from the Languo x Qimiart Glitter set, plus the 48 new
// Acrylic Brush glitter codes added 2026-09, renamed with a trailing
// "G" to disambiguate them from the unrelated Sage/Forest Green SG-1xx/
// SG-2xx codes and from this same list's own SG-01..SG-116 range) --
// these should be excluded from all color-matching converters (Color
// Converter, Legend Converter, Languo-Guangna Converter), the same way
// Guangna's Metallic markers are excluded, since glitter finish isn't
// meaningfully comparable by RGB color distance.
export const LANGUO_GLITTER_IDS: string[] = ["SG-01", "SG-02", "SG-03", "SG-04", "SG-05", "SG-06", "SG-11", "SG-12", "SG-13", "SG-14", "SG-15", "SG-16", "SG-21", "SG-22", "SG-23", "SG-24", "SG-25", "SG-26", "SG-31", "SG-32", "SG-33", "SG-34", "SG-35", "SG-36", "SG-41", "SG-42", "SG-43", "SG-44", "SG-45", "SG-46", "SG-51", "SG-52", "SG-53", "SG-54", "SG-55", "SG-56", "SG-61", "SG-62", "SG-63", "SG-64", "SG-65", "SG-66", "SG-71", "SG-72", "SG-73", "SG-74", "SG-75", "SG-76", "SG-81", "SG-82", "SG-83", "SG-84", "SG-85", "SG-86", "SG-91", "SG-92", "SG-93", "SG-94", "SG-95", "SG-96", "SG-101", "SG-102", "SG-103", "SG-104", "SG-105", "SG-106", "SG-111", "SG-112", "SG-113", "SG-114", "SG-115", "SG-116",
  "SG-420G", "SG-421G", "SG-422G", "SG-423G", "SG-424G", "SG-425G", "SG-426G", "SG-427G",
  "SG-428G", "SG-429G", "SG-430G", "SG-431G", "SG-432G", "SG-433G", "SG-434G", "SG-435G",
  "SG-436G", "SG-437G", "SG-438G", "SG-439G", "SG-440G", "SG-441G", "SG-442G", "SG-443G",
  "SG-444G", "SG-445G", "SG-446G", "SG-447G", "SG-448G", "SG-449G", "SG-450G", "SG-451G",
  "SG-452G", "SG-453G", "SG-454G", "SG-455G", "SG-456G", "SG-457G", "SG-458G", "SG-459G",
  "SG-460G", "SG-461G", "SG-462G", "SG-463G", "SG-464G", "SG-465G", "SG-466G", "SG-467G"
];

// Sorted ascending so any UI that lists Languo codes (e.g. the
// autocomplete on /languo-converter) shows them in a predictable order
// instead of source-file/object-insertion order. localeCompare with
// numeric:true so "AG-251" sorts after "AG-9" the way a human expects,
// not as a plain string compare.
export const LANGUO_IDS: string[] = Object.keys(LANGUO_COLORS).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
);

// Same ordering as LANGUO_IDS but with the Glitter pens removed -- use this
// (not LANGUO_IDS) for any converter's autocomplete/lookup, matching the
// Guangna converters' exclusion of Metallic markers.
export const LANGUO_NON_GLITTER_IDS: string[] = LANGUO_IDS.filter(
  (id) => !LANGUO_GLITTER_IDS.includes(id)
);

// LANGUO_NON_GLITTER_IDS minus Metallic codes too. This is the pool
// converters should search by default (mirrors Guangna's
// GN_MATCHING_IDS = GN_ONLY_IDS minus GN_METALLIC_IDS): Metallic finish
// isn't a realistic "closest match" suggestion for an arbitrary photo
// color, so it's excluded here and only surfaced when a customer
// explicitly owns/types a Metallic code. Same policy as Guangna's
// Metallic markers: excluded from this unrestricted default pool, but
// still matchable within a customer's own owned-set search -- callers
// should NOT filter an owned-codes pool through this list, only use it
// for the no-selection/unrestricted default.
export const LANGUO_MATCHING_IDS: string[] = LANGUO_NON_GLITTER_IDS.filter(
  (id) => !LANGUO_METALLIC_IDS.includes(id)
);

export type LanguoMatchResult = { code: string; rgb: [number, number, number] };

// Returns the n closest Languo matches to rgb, sorted nearest-first,
// searching only `ids`. Mirrors lib/guangna.ts's findClosestN, but
// Languo codes have no marker "name" the way GN_COLORS entries do, so
// LanguoMatchResult only carries code + rgb.
// Callers are responsible for excluding Glitter pens from `ids` when
// that's wanted (pass LANGUO_NON_GLITTER_IDS for the unrestricted
// search, or an owned-codes list that itself should never contain
// Glitter codes -- see normalizeLanguoExtraCode below, which already
// refuses to resolve Glitter codes for exactly this reason).
export function findClosestLanguoN(rgb: [number, number, number], ids: string[], n: number): LanguoMatchResult[] {
  const labT = rgbToLab(rgb);
  const scored: { id: string; d: number }[] = [];
  for (const id of ids) {
    const c = LANGUO_COLORS[id];
    if (!c) continue;
    const d = deltaE(labT, rgbToLab(c));
    scored.push({ id, d });
  }
  scored.sort((a, b) => a.d - b.d);
  return scored.slice(0, n).map(({ id }) => ({ code: id, rgb: LANGUO_COLORS[id] }));
}

// Normalizes a free-typed "extra Languo code" token to its LANGUO_COLORS
// key, or null if it doesn't resolve to a real entry at all. Languo
// codes are always a 2-letter prefix + hyphen + 1-4 digits ("BR-702",
// "AG-171", "DB-1610"), optionally followed by a trailing "G" for the
// new Acrylic Brush glitter codes ("SG-420G") -- the hyphen is optional
// in the typed token ("br702" also resolves to "BR-702").
//
// Glitter and Metallic codes ARE recognized here (no "invalid code"
// error) -- a customer typing "SG-420" (without the G) is auto-
// corrected to "SG-420G", the code's real stored id, rather than being
// told it doesn't exist. This function's job is purely "does this
// token refer to a real code" -- it does NOT decide whether that code
// is usable for color matching. That exclusion (both Glitter and
// Metallic finish aren't meaningfully comparable by RGB distance, and
// unlike Guangna's Metallic markers, Languo's are excluded even from a
// customer's own owned-set matching, not just the unrestricted default
// search) happens downstream via LANGUO_MATCHING_IDS -- callers building
// an owned-codes pool for matching must filter through that, not rely
// on this function to have already excluded anything.
export function normalizeLanguoExtraCode(token: string): string | null {
  const t = token.trim().toUpperCase().replace(/\s+/g, "");
  if (!t) return null;
  const m = t.match(/^([A-Z]{2})-?(\d{1,4})(G)?$/);
  if (!m) return null;
  const base = `${m[1]}-${m[2]}`;
  const id = m[3] ? `${base}G` : base;
  if (LANGUO_COLORS[id]) return id;
  // Bare token ("SG-420") didn't resolve directly -- check whether it's
  // actually one of the new glitter codes, which are stored with a
  // trailing "G" specifically to disambiguate them from unrelated
  // codes sharing the same prefix (see LANGUO_GLITTER_IDS above).
  if (!m[3] && LANGUO_COLORS[`${base}G`]) return `${base}G`;
  return null;
}
