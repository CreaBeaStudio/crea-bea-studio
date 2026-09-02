// Shared Guangna color data + matching logic.
// Used by ColorConverter (single color), LegendConverter (multi-swatch legend),
// and LanguoConverter (Languo code -> top-3 Guangna matches).
// Moved here so the 366-color table and matching math only exist in one place.

export const GN_COLORS: Record<string,[number,number,number,string]> = {
  "GN-600":[255,255,255,"White"],"GN-601":[9,169,227,"Sky blue"],"GN-602":[109,196,177,"Lake green"],
  "GN-603":[254,234,23,"Yellow"],"GN-604":[241,148,28,"Orange"],"GN-605":[214,78,70,"Red"],
  "GN-606":[219,118,172,"Rose red"],"GN-607":[86,62,148,"Lilac purple"],"GN-608":[1,61,151,"Royal blue"],
  "GN-609":[0,136,126,"Green"],"GN-610":[171,180,181,"Gray"],"GN-611":[18,20,25,"Black"],
  "GN-612":[234,160,177,"Pink"],"GN-613":[115,67,151,"Grape purple"],"GN-614":[140,198,103,"Emerald green"],
  "GN-615":[255,221,4,"Bright yellow"],"GN-616":[3,139,187,"Dazzle blue"],"GN-617":[16,89,160,"Ink blue"],
  "GN-618":[229,151,71,"Amber"],"GN-619":[204,133,139,"Carmine"],"GN-620":[159,114,101,"Coffee"],
  "GN-621":[2,123,199,"Indigo blue"],"GN-622":[96,152,134,"Pine green"],"GN-623":[182,150,197,"Wisteria"],
  "GN-624":[246,216,216,"Pomelo pink"],"GN-625":[248,199,185,"Cinnamon"],"GN-626":[253,251,199,"Rice white"],
  "GN-627":[186,221,191,"Mint green"],"GN-628":[178,223,242,"Milk blue"],"GN-629":[172,179,216,"Taro purple"],
  "GN-630":[228,202,196,"Bean paste pink"],"GN-631":[194,78,37,"Vermilion"],"GN-632":[217,83,38,"Apple red"],
  "GN-633":[114,158,170,"Haze blue"],"GN-634":[57,149,58,"Forest green"],"GN-635":[185,175,214,"Purple"],
  "GN-636":[0,110,143,"Bicheng blue"],"GN-637":[159,168,143,"Local green"],"GN-638":[200,200,176,"Curious mind"],
  "GN-639":[195,152,127,"Grounded red"],"GN-640":[142,164,89,"Spring green"],"GN-641":[153,187,163,"Celadon"],
  "GN-642":[100,109,86,"Verdant hills green"],"GN-643":[120,99,78,"Russet"],"GN-644":[209,152,65,"Clay colour"],
  "GN-645":[227,207,164,"Medieval yellow"],"GN-646":[234,232,210,"Hummus"],"GN-647":[148,184,58,"Bamboo shoot green"],
  "GN-648":[185,213,100,"Sprout green"],"GN-649":[243,162,90,"Light orange"],"GN-650":[0,144,215,"Blue"],
  "GN-651":[135,145,199,"Violet"],"GN-652":[200,193,102,"Primrose green"],"GN-653":[38,183,170,"Bluish green"],
  "GN-654":[224,179,166,"Flesh color"],"GN-655":[239,147,188,"Rose"],"GN-656":[251,206,114,"Earthy yellow"],
  "GN-657":[119,173,57,"Bishan green"],"GN-658":[226,169,204,"Light pink"],"GN-659":[3,104,182,"Dark blue"],
  "GN-660":[236,115,166,"Heartbeat pink"],"GN-661":[236,122,105,"Vibrant red"],"GN-662":[138,196,87,"Vibrant green"],
  "GN-663":[236,104,22,"Reddish orange"],"GN-664":[223,33,29,"Bright red"],"GN-665":[94,169,86,"Leaf green"],
  "GN-666":[209,65,132,"Purplish red"],"GN-667":[236,111,109,"Thin red"],"GN-668":[26,173,83,"Stone cyan"],
  "GN-669":[159,206,116,"Grass green"],"GN-670":[122,153,205,"Rattan"],"GN-671":[193,48,95,"Wine red"],
  "GN-672":[163,75,64,"Brownish red"],"GN-673":[29,33,133,"Klein blue"],"GN-674":[164,66,79,"Strong brown"],
  "GN-675":[135,80,104,"Sauce purple"],"GN-676":[0,141,63,"Dark green"],"GN-677":[242,172,173,"Peach red"],
  "GN-678":[51,37,123,"Dark purple"],"GN-679":[99,89,92,"Greyish red"],"GN-680":[58,71,77,"Stone gray"],
  "GN-681":[122,168,180,"Group cyan"],"GN-682":[104,149,58,"Bamboo green"],"GN-683":[253,231,197,"Creamy white"],
  "GN-684":[249,201,149,"Apricot yellow"],"GN-685":[124,198,165,"Onion green"],"GN-686":[206,206,206,"Light gray"],
  "GN-687":[82,162,60,"Bright green"],"GN-688":[11,68,86,"Dark cyan"],"GN-689":[133,184,228,"Porcelain blue"],
  "GN-690":[120,163,161,"Green blue"],"GN-691":[238,129,118,"Coral powder"],"GN-692":[239,137,143,"Purple light"],
  "GN-693":[84,116,133,"Blue grey"],"GN-694":[31,116,123,"Soft jade"],"GN-695":[26,128,139,"French green"],
  "GN-696":[129,165,140,"Fruit green"],"GN-697":[72,106,76,"Pine green"],"GN-698":[213,197,224,"Sweat purple"],
  "GN-699":[186,151,192,"Felongrass purple"],"GN-700":[217,227,96,"Cream yellow"],"GN-701":[251,225,198,"Light apricot"],
  "GN-702":[247,187,117,"Pomelo"],"GN-703":[252,226,219,"Ivory orange"],"GN-704":[244,178,172,"Red lips"],
  "GN-705":[161,79,95,"Cornel purple"],"GN-706":[234,244,244,"White cyan"],"GN-707":[210,224,197,"Magnolia"],
  "GN-708":[101,75,50,"Sooty red"],"GN-709":[86,66,58,"Brown black"],"GN-710":[233,82,110,"Changchun"],
  "GN-711":[226,106,126,"Lipstick pink"],"GN-712":[241,158,194,"Fluorescent rose"],"GN-713":[217,88,117,"Nelumbo red"],
  "GN-714":[209,56,92,"Blackish red"],"GN-715":[231,50,68,"Scarlet"],"GN-716":[248,193,197,"Peach pink"],
  "GN-717":[235,209,176,"Shallow camel"],"GN-718":[243,219,175,"Tumeric"],"GN-719":[255,239,213,"Cheese yellow"],
  "GN-720":[247,234,218,"Bean yellow"],"GN-721":[252,229,221,"Water pink"],"GN-722":[20,176,175,"Turquoise blue"],
  "GN-723":[250,224,234,"Sakura"],"GN-724":[254,237,213,"Light beige"],"GN-725":[239,128,14,"Fresh orange"],
  "GN-726":[188,47,139,"Imperial purple"],"GN-727":[170,206,62,"Willow green"],"GN-728":[4,151,83,"Viridity"],
  "GN-729":[225,220,152,"Grey yellow"],"GN-730":[226,240,210,"Jade white"],"GN-731":[211,191,156,"Sand dust"],
  "GN-732":[255,248,166,"Velvet yellow"],"GN-733":[255,240,148,"Light yellow"],"GN-734":[232,190,216,"Pink purple"],
  "GN-735":[151,203,118,"Pea green"],"GN-736":[221,235,244,"Pale white"],"GN-737":[141,205,190,"Bluish green"],
  "GN-738":[239,223,211,"Onyx"],"GN-739":[158,92,128,"Ormosia"],"GN-740":[31,167,80,"Verdant"],
  "GN-741":[132,172,75,"Dull green"],"GN-742":[108,110,179,"Flower purple"],"GN-743":[112,82,158,"Aubergine"],
  "GN-744":[217,208,230,"Lavender"],"GN-745":[143,182,224,"Light rattan"],"GN-746":[39,72,118,"Fotou blue"],
  "GN-747":[117,132,149,"Quetou blue"],"GN-748":[71,128,156,"Tianqing blue"],"GN-749":[65,129,168,"Qingming blue"],
  "GN-750":[94,131,152,"Kongqing blue"],"GN-751":[229,225,212,"Chalky white"],"GN-752":[219,202,208,"Lotus root gray"],
  "GN-753":[213,197,179,"Jade color"],"GN-754":[218,189,183,"Pinkish red"],"GN-755":[212,162,151,"Xianchi red"],
  "GN-756":[194,132,119,"Light red"],"GN-757":[183,152,116,"Chestnut brown"],"GN-758":[171,129,109,"Agilawood"],
  "GN-759":[129,113,104,"Sandstone yellow"],"GN-760":[222,6,23,"Tomato red"],"GN-761":[237,119,136,"Lychee pink"],
  "GN-762":[238,140,182,"Vibrant pink"],"GN-763":[7,55,102,"Ink blue black"],"GN-764":[66,64,116,"Smoke purple black"],
  "GN-765":[255,243,39,"Happy yellow"],"GN-766":[255,249,177,"Jasmine yellow"],"GN-767":[72,141,159,"Cloud blue"],
  "GN-768":[135,179,189,"Mountain blue"],"GN-769":[130,89,96,"Volcanic brown"],"GN-770":[150,121,150,"Grayish purple"],
  "GN-771":[217,195,196,"Milk coffee"],"GN-772":[210,132,154,"Camelia"],"GN-773":[160,153,187,"Vintage purple"],
  "GN-774":[41,99,125,"Navy blue"],"GN-775":[184,207,175,"Spray green"],"GN-776":[81,55,66,"Brownish black"],
  "GN-777":[255,243,85,"Pure yellow"],"GN-778":[121,42,114,"Gentian violet"],"GN-779":[107,70,83,"Black coffee"],
  "GN-780":[148,56,59,"Maroon color"],"GN-781":[180,30,37,"Deep red"],"GN-782":[231,57,24,"Vivid red"],
  "GN-783":[234,82,28,"Orange red"],"GN-784":[149,38,43,"Dull red"],"GN-785":[207,85,36,"Vermilion"],
  "GN-786":[245,166,21,"Yellow orange"],"GN-787":[196,198,64,"Straw yellow"],"GN-788":[160,167,99,"Native yellow"],
  "GN-789":[90,88,63,"Brownish green"],"GN-790":[114,121,70,"Olive green"],"GN-791":[40,80,52,"Black green"],
  "GN-792":[73,127,107,"Old green"],"GN-793":[136,147,78,"Moss green"],"GN-794":[0,137,65,"Turquoise green"],
  "GN-795":[2,91,60,"Dark green"],"GN-796":[4,110,63,"Aquamarine"],"GN-797":[3,106,113,"Dark cyan"],
  "GN-798":[0,116,173,"Dark teal"],"GN-799":[0,152,153,"Peacock green"],"GN-800":[2,117,122,"Deepsea green"],
  "GN-801":[242,240,241,"Feather white"],"GN-802":[247,178,73,"Mango yellow"],"GN-803":[228,234,232,"Light cloud white"],
  "GN-804":[216,221,219,"Pewter"],"GN-805":[158,164,155,"Coal gray"],"GN-806":[58,89,118,"Faded red"],
  "GN-807":[48,53,61,"Cool black"],"GN-808":[94,63,91,"Grayish purple"],"GN-809":[214,234,207,"Hazy green"],
  "GN-810":[218,198,115,"Light grass yellow"],"GN-811":[198,182,103,"Straw yellow"],"GN-812":[173,154,86,"Khaki green / Pale sage green"],
  "GN-813":[200,168,83,"Grass yellow"],"GN-814":[211,167,98,"Sandalwood yellow"],"GN-815":[213,177,68,"Canghuang"],
  "GN-816":[159,130,36,"Dark chartreuse"],"GN-817":[201,144,11,"Juyi yellow"],"GN-818":[183,226,231,"Water blue"],
  "GN-819":[122,203,220,"Crystal blue"],"GN-820":[59,188,220,"Peacock blue"],"GN-821":[198,231,249,"Ice blue"],
  "GN-822":[126,207,243,"Light blue"],"GN-823":[68,160,207,"Lake blue"],"GN-824":[0,74,141,"Midnight blue"],
  "GN-825":[219,210,224,"Purple smoke color"],"GN-826":[183,177,206,"Purple lotus"],"GN-827":[128,132,170,"Greyish purple"],
  "GN-828":[108,110,179,"Aster purple"],"GN-829":[212,196,204,"Sand purple"],"GN-830":[178,196,229,"Smoke purple"],
  "GN-831":[160,129,163,"Dusk purple"],"GN-832":[147,75,152,"Amethyst"],"GN-833":[170,115,175,"Rose purple"],
  "GN-834":[241,204,204,"Peach powder"],"GN-835":[229,207,212,"Satin grey powder"],"GN-836":[253,241,247,"Soft pink"],
  "GN-837":[251,229,230,"Rose pink"],"GN-838":[250,213,229,"Moonlit powder"],"GN-839":[225,178,182,"Moon white"],
  "GN-840":[237,203,200,"Ceramic powder"],"GN-841":[182,218,233,"Hazy blue"],"GN-842":[138,201,216,"Azure"],
  "GN-843":[179,207,209,"Smoke cyan"],"GN-844":[151,180,180,"Cold frost cyan"],"GN-845":[56,175,67,"Emerald green"],
  "GN-846":[117,188,64,"Wood green"],"GN-847":[208,212,60,"Willow yellow"],"GN-848":[220,216,179,"Grey frost green"],
  "GN-849":[162,160,28,"Wasabi green"],"GN-850":[122,202,193,"Turquoise green"],"GN-851":[186,204,182,"Nordic green"],
  "GN-852":[155,169,54,"Khaki green"],"GN-853":[224,222,216,"Rice grey"],"GN-854":[240,147,156,"Fluorescent pink"],
  "GN-855":[239,237,104,"Fluorescent yellow"],"GN-856":[194,217,119,"Fluorescent green"],"GN-857":[126,159,175,"Cement blue"],
  "GN-858":[189,198,149,"Wind chime grey"],"GN-859":[241,149,116,"Fluorescent orange"],"GN-860":[108,123,129,"Graphite ash"],
  "GN-861":[182,194,183,"Mountain ash"],"GN-862":[236,220,224,"Rouge grey"],"GN-863":[166,103,61,"Cinnamon brown"],
  "GN-864":[137,77,45,"Walnut brown"],"GN-865":[131,122,109,"Elegant brown"],"GN-866":[143,104,65,"Ebony palm"],
  "GN-867":[110,60,36,"Caramel brown"],"GN-868":[199,159,90,"Dry leaf brown"],"GN-869":[166,96,90,"Chocolate brown"],
  "GN-870":[157,141,132,"Clay brown"],"GN-871":[237,224,186,"Almond brown"],"GN-872":[247,197,199,"Rouge powder"],
  "GN-873":[246,207,224,"Ballet pink"],"GN-874":[234,221,177,"Light sand yellow"],"GN-875":[178,84,41,"Honey brown"],
  "GN-876":[233,237,152,"Williow bud white"],"GN-877":[253,244,227,"Jasmine white"],"GN-878":[211,237,249,"Ice white"],
  "GN-879":[214,225,243,"Water white"],"GN-880":[234,224,239,"Purple mist white"],"GN-881":[251,229,230,"Makeup white"],
  "GN-882":[253,233,222,"Pink white"],"GN-883":[251,244,228,"Gardenia white"],"GN-884":[223,233,235,"Matte white"],
  "GN-885":[169,216,200,"Lanbai"],"GN-886":[224,239,220,"Snow green white"],"GN-887":[254,243,206,"Snowwhite"],
  "GN-888":[134,191,221,"Azure blue"],"GN-889":[88,196,240,"Cloud blue"],"GN-890":[92,177,229,"Sea wave blue"],
  "GN-891":[2,179,236,"Crystal blue"],"GN-892":[25,164,203,"Sea cyan"],"GN-893":[0,151,217,"Sapphire blue"],
  "GN-894":[0,142,214,"Classic blue"],"GN-895":[6,109,183,"Prusian blue"],"GN-896":[9,101,154,"Aegean Sea blue"],
  "GN-897":[30,38,119,"Nightfall blue"],"GN-898":[167,206,237,"Light ice blue"],"GN-899":[143,168,215,"Indigo purple"],
  "GN-900":[117,126,186,"Agate purple"],"GN-901":[66,65,151,"Cyanoze"],"GN-902":[90,52,120,"Morning glory purple"],
  "GN-903":[248,205,217,"Litmus red"],"GN-904":[235,109,165,"Glow red"],"GN-905":[234,99,160,"Lotus pink"],
  "GN-906":[203,65,145,"Redbud red"],"GN-907":[212,50,107,"Chinese rose red"],"GN-908":[204,103,139,"Magenta red"],
  "GN-909":[202,96,159,"Saffron red"],"GN-910":[204,73,105,"Crimson"],"GN-911":[250,214,180,"Cream orange"],
  "GN-912":[248,204,183,"Pomelo skin"],"GN-913":[236,180,158,"Jade pink"],"GN-914":[249,210,177,"Peach blush"],
  "GN-915":[236,176,144,"Dark skin brown"],"GN-916":[238,165,122,"Crab shell red"],"GN-917":[251,215,215,"Light coral"],
  "GN-918":[232,182,184,"Hawthorn red"],"GN-919":[196,115,122,"Faro red"],"GN-920":[197,94,97,"Sunset glow red"],
  "GN-921":[196,98,87,"Cocoa red"],"GN-922":[180,77,88,"Lava red"],"GN-923":[144,43,65,"Harrier crest"],
  "GN-924":[245,241,230,"Pale white"],"GN-925":[232,225,173,"Soy milk beige"],"GN-926":[232,216,180,"Lotus seed white"],
  "GN-927":[229,191,152,"Wheat hull beige"],"GN-928":[209,169,120,"Hump brown"],"GN-929":[244,210,149,"Almond yellow"],
  "GN-930":[242,152,11,"Ginkgo orange"],"GN-931":[215,129,42,"Suede brown"],"GN-932":[186,122,53,"Coconut brown"],
  "GN-933":[255,243,88,"Lemon yellow"],"GN-934":[253,207,0,"Papaya yellow"],"GN-935":[248,182,0,"Moonlight orange"],
  "GN-936":[247,173,75,"Glazed orange"],"GN-937":[239,127,2,"Vibrant orange"],"GN-938":[191,195,29,"Vanilla green"],
  "GN-939":[194,215,60,"Apple green"],"GN-940":[176,207,174,"Jade green"],"GN-941":[3,145,64,"Algae green"],
  "GN-942":[0,120,63,"Enamel green"],"GN-943":[191,171,71,"Silk yellow"],"GN-944":[195,147,14,"Reed green"],
  "GN-945":[103,101,50,"Dark cyan"],"GN-946":[127,116,54,"Pond green"],"GN-947":[124,100,62,"Turtle shell"],
  "GN-948":[94,82,52,"Palm green"],"GN-949":[228,228,228,"Frost white"],"GN-950":[195,199,192,"Moon shadow grey"],
  "GN-951":[173,187,189,"Cool gray"],"GN-952":[148,169,178,"Warship gray"],"GN-953":[133,145,134,"Smoke gray"],
  "GN-954":[141,173,189,"Crab shell cyan"],"GN-955":[212,219,204,"Sea foam green"],"GN-956":[169,176,161,"Matte gray"],
  "GN-957":[186,177,167,"Seagull gray"],"GN-958":[160,135,123,"Red gray"],"GN-959":[121,117,114,"Wild goose gray"],
  "GN-960":[166,108,50,"Latte brown"],"GN-961":[184,189,173,"Cloud moss"],"GN-962":[173,160,204,"Taro purple"],
  "GN-963":[118,48,51,"Sienna red"],"GN-964":[160,133,90,"Cocoa brown"],"GN-965":[245,174,190,"Cheek red"],

  // --- Metallic Colors (48) ---
  // GN-330 .. GN-377. Same GN- numeric code space as the classic
  // line, so normalizeExtraCode() already resolves these correctly.
  "GN-330":[179,151,61,"Gold"],"GN-331":[195,195,195,"Silver"],"GN-332":[223,177,187,"Rose gold"],
  "GN-333":[209,167,121,"Champagne gold"],"GN-334":[218,191,174,"Flax gold"],"GN-335":[174,121,82,"Coffee gold"],
  "GN-336":[220,138,76,"Coppery"],"GN-337":[223,84,95,"Metal red"],"GN-338":[153,105,163,"Metal purple"],
  "GN-339":[14,177,228,"Metal blue"],"GN-340":[128,191,136,"Green mint"],"GN-341":[63,63,63,"Metal black"],
  "GN-342":[0,161,170,"Metal cyan"],"GN-343":[237,172,197,"Metal pink"],"GN-344":[236,216,214,"Pink white"],
  "GN-345":[144,126,173,"Violet"],"GN-346":[86,191,219,"Sky Blue"],"GN-347":[209,232,233,"Lake blue"],
  "GN-348":[8,169,146,"Turquoise"],"GN-349":[194,218,154,"Sprout green"],"GN-350":[208,184,128,"Milk tea gold"],
  "GN-351":[193,204,92,"Yellow green"],"GN-352":[187,146,152,"Pink brown"],"GN-353":[190,177,182,"Lineseed ash"],
  "GN-354":[233,186,142,"Light orange"],"GN-355":[169,209,199,"Lake green"],"GN-356":[217,231,210,"Light green"],
  "GN-357":[187,201,225,"Light violet"],"GN-358":[193,221,241,"Light blue"],"GN-359":[207,186,212,"Light purple"],
  "GN-360":[217,196,196,"Light pink"],"GN-361":[228,181,189,"Light red"],"GN-362":[238,191,207,"Linen pink"],
  "GN-363":[210,215,187,"Linen green"],"GN-364":[186,186,186,"Metal grey"],"GN-365":[135,139,193,"Royal purple"],
  "GN-366":[0,136,210,"Dark blue"],"GN-367":[186,134,178,"Rose violet"],"GN-368":[107,149,198,"Marine blue"],
  "GN-369":[234,129,37,"Metal Orange"],"GN-370":[216,95,132,"Rose red"],"GN-371":[154,161,113,"Olive gold"],
  "GN-372":[29,154,65,"Dark Green"],"GN-373":[104,186,179,"Peacock blue"],"GN-374":[116,187,83,"Metal Green"],
  "GN-375":[208,57,101,"Carminum"],"GN-376":[113,54,137,"Dark purple"],"GN-377":[62,82,164,"Royal blue"],

  // --- New Colors (74) ---
  // GN-526 .. GN-599, added alongside the Metallic block to form the
  // GN.8101-488 set (366 original + 48 Metallic + 74 new = 488).
  "GN-526":[185,208,102,"Fresh Leaf Green"],"GN-527":[155,187,69,"Jade Wave Green"],"GN-528":[39,77,80,"Forest Layer Green"],
  "GN-529":[117,181,87,"Sprout Leaf Green"],"GN-530":[88,152,65,"Wind fluff green"],"GN-531":[99,175,127,"Cool Summer Green"],
  "GN-532":[39,77,80,"Mountain Green"],"GN-533":[42,93,62,"Deep Forest Green"],"GN-534":[50,71,48,"Light Breeze Green"],
  "GN-535":[72,155,84,"Deep Bush Green"],"GN-536":[133,193,139,"River Sky Green"],"GN-537":[86,142,116,"Breeze Fresh Green"],
  "GN-538":[152,179,197,"Cloud Haven gray"],"GN-539":[45,174,166,"Pale Cyan Green"],"GN-540":[29,87,68,"Jade Emerald Green"],
  "GN-541":[91,100,66,"Layered Emerald Green"],"GN-542":[59,132,149,"Deep bush Green"],"GN-543":[25,63,50,"Pine Needle Green"],
  "GN-544":[140,198,238,"Soft Sky Blue"],"GN-545":[119,196,238,"Deep Azure Blue"],"GN-546":[67,87,104,"Ice Island Blue"],
  "GN-547":[19,56,86,"Mountain Mist Blue"],"GN-548":[153,210,204,"Smoky Azure Blue"],"GN-549":[23,99,147,"Cloud Mist Blue"],
  "GN-550":[75,118,177,"Bright Clear Blu"],"GN-551":[182,213,230,"Deep Abyss Blue"],"GN-552":[55,110,178,"Starry Night Blue"],
  "GN-553":[13,56,111,"Wave Azure Blue"],"GN-554":[32,58,85,"Silent Deep Blue"],"GN-555":[153,210,204,"Start Shine Blue"],
  "GN-556":[153,123,87,"Glazed Amber Brown"],"GN-557":[93,74,57,"Autumn Maple red"],"GN-558":[193,182,165,"Misty Milk Brown"],
  "GN-559":[160,164,111,"Walnut Wood Brown"],"GN-560":[121,91,69,"Brown Sandalwood"],"GN-561":[145,63,59,"Brick Russet Brown"],
  "GN-562":[103,82,77,"Honey Amber Brown"],"GN-563":[104,60,59,"Tea Amber Brown"],"GN-564":[113,88,60,"Copper Brown"],
  "GN-565":[88,42,59,"Natural Earth Brown"],"GN-566":[214,85,80,"Flame Red Orange"],"GN-567":[228,176,84,"Warm Sun Tangerine"],
  "GN-568":[247,185,97,"Persimmon Dyed Orange"],"GN-569":[240,203,39,"Lemon Tide Yellow"],"GN-570":[245,166,65,"Caramel Warm Orange"],
  "GN-571":[225,225,129,"Dawn Glow Yellow"],"GN-572":[136,115,73,"Pure Lemon Yellow"],"GN-573":[241,143,98,"Vemilion Feather Red"],
  "GN-574":[226,152,133,"Peach Tide Pink"],"GN-575":[206,190,186,"Light Pomelo Pink"],"GN-576":[246,173,130,"Apricot Peach Pink"],
  "GN-577":[193,141,188,"Cloud Dream Pink"],"GN-578":[212,175,209,"Crabapple Pink"],"GN-579":[202,84,90,"Grapefruit Mist Pink"],
  "GN-580":[216,143,129,"Hibiscus Red"],"GN-581":[234,100,143,"Grapefruit Mist Pink"],"GN-582":[238,135,147,"Soft Rouge Pink"],
  "GN-583":[131,74,93,"Autumn Maple Red"],"GN-584":[214,157,156,"Soft Mist Pink"],"GN-585":[182,144,130,"Washed Vermillion"],
  "GN-586":[241,173,186,"Dusk Makeup Red"],"GN-587":[233,96,112,"Danxia Red"],"GN-588":[96,52,70,"Summer Solstice Red"],
  "GN-589":[195,76,122,"Crystal Red"],"GN-590":[185,99,92,"Terracotta Glaze Red"],"GN-591":[115,35,50,"Yizheng Classic Red"],
  "GN-592":[129,108,103,"Ginseng Russet Red"],"GN-593":[138,121,182,"Smoky Taro Purple"],"GN-594":[102,109,178,"Smoky Pink Purple"],
  "GN-595":[118,84,159,"Wine Gem Purple"],"GN-596":[134,148,128,"Grey Olive Green"],"GN-597":[204,216,218,"Light Ink Gray"],
  "GN-598":[77,89,95,"Obsidian Mist Grey"],"GN-599":[65,86,95,"Moon Rock Gray"],

  // --- High Gloss 168 (GN.586 line) ---
  "HG-F01":[250,215,168,"F01"],
  "HG-F02":[247,188,133,"F02"],
  "HG-F03":[227,167,118,"F03"],
  "HG-F04":[228,130,67,"F04"],
  "HG-F05":[196,105,58,"F05"],
  "HG-F06":[172,95,48,"F06"],
  "HG-F07":[160,90,54,"F07"],
  "HG-F08":[145,75,54,"F08"],
  "HG-F09":[131,110,63,"F09"],
  "HG-F10":[94,80,54,"F10"],
  "HG-F11":[123,95,85,"F11"],
  "HG-F12":[106,68,57,"F12"],
  "HG-F13":[252,245,224,"F13"],
  "HG-F14":[253,225,194,"F14"],
  "HG-F15":[251,217,176,"F15"],
  "HG-F16":[255,236,180,"F16"],
  "HG-F17":[255,228,164,"F17"],
  "HG-F18":[243,226,212,"F18"],
  "HG-F19":[238,210,179,"F19"],
  "HG-F20":[234,185,149,"F20"],
  "HG-F21":[235,165,134,"F21"],
  "HG-F22":[198,135,104,"F22"],
  "HG-F23":[189,105,95,"F23"],
  "HG-F24":[154,70,60,"F24"],
  "HG-F25":[253,225,211,"F25"],
  "HG-F26":[253,207,187,"F26"],
  "HG-F27":[251,195,174,"F27"],
  "HG-F28":[250,215,205,"F28"],
  "HG-F29":[249,200,184,"F29"],
  "HG-F30":[249,183,165,"F30"],
  "HG-F31":[248,174,143,"F31"],
  "HG-F32":[235,130,125,"F32"],
  "HG-F33":[216,90,100,"F33"],
  "HG-F34":[206,80,90,"F34"],
  "HG-F35":[188,55,60,"F35"],
  "HG-F36":[181,55,81,"F36"],
  "HG-F37":[254,233,228,"F37"],
  "HG-G01":[204,225,152,"G01"],
  "HG-G02":[193,217,116,"G02"],
  "HG-G03":[175,210,137,"G03"],
  "HG-G04":[139,195,101,"G04"],
  "HG-G05":[153,195,91,"G05"],
  "HG-G06":[132,160,77,"G06"],
  "HG-G07":[100,164,82,"G07"],
  "HG-G08":[127,190,133,"G08"],
  "HG-G09":[99,190,99,"G09"],
  "HG-G10":[70,175,81,"G10"],
  "HG-G11":[69,160,77,"G11"],
  "HG-G12":[53,130,67,"G12"],
  "HG-G13":[166,215,205,"G13"],
  "HG-G14":[142,205,195,"G14"],
  "HG-G15":[99,190,169,"G15"],
  "HG-G16":[67,165,149,"G16"],
  "HG-G17":[62,160,137,"G17"],
  "HG-G18":[56,140,124,"G18"],
  "HG-G19":[138,205,189,"G19"],
  "HG-G20":[67,172,120,"G20"],
  "HG-G21":[64,155,134,"G21"],
  "HG-G22":[56,140,135,"G22"],
  "HG-G23":[51,135,109,"G23"],
  "HG-G24":[46,116,110,"G24"],
  "HG-G25":[203,210,153,"G25"],
  "HG-G26":[166,180,102,"G26"],
  "HG-G27":[183,190,112,"G27"],
  "HG-G28":[182,175,86,"G28"],
  "HG-G29":[194,180,65,"G29"],
  "HG-G30":[182,210,174,"G30"],
  "HG-G31":[147,175,128,"G31"],
  "HG-G32":[101,150,93,"G32"],
  "HG-G33":[69,125,73,"G33"],
  "HG-G34":[67,130,73,"G34"],
  "HG-G35":[109,130,78,"G35"],
  "HG-G36":[31,80,59,"G36"],
  "HG-G37":[216,230,152,"G37"],
  "HG-G38":[171,220,210,"G38"],
  "HG-G39":[202,230,214,"G39"],
  "HG-G40":[70,157,139,"G40"],
  "HG-G41":[134,190,52,"G41"],
  "HG-H01":[255,255,255,"H01"],
  "HG-H02":[44,30,30,"H02"],
  "HG-H03":[205,205,207,"H03"],
  "HG-L01":[207,235,255,"L01"],
  "HG-L02":[178,220,246,"L02"],
  "HG-L03":[118,195,232,"L03"],
  "HG-L04":[66,167,230,"L04"],
  "HG-L05":[56,140,213,"L05"],
  "HG-L06":[53,95,158,"L06"],
  "HG-L07":[139,187,229,"L07"],
  "HG-L08":[99,155,212,"L08"],
  "HG-L09":[57,120,188,"L09"],
  "HG-L10":[44,100,173,"L10"],
  "HG-L11":[30,76,157,"L11"],
  "HG-L12":[22,50,128,"L12"],
  "HG-L13":[192,220,230,"L13"],
  "HG-L14":[147,175,196,"L14"],
  "HG-L15":[192,220,225,"L15"],
  "HG-L16":[131,180,201,"L16"],
  "HG-L17":[104,160,176,"L17"],
  "HG-L18":[63,140,161,"L18"],
  "HG-L19":[59,125,146,"L19"],
  "HG-L20":[73,185,216,"L20"],
  "HG-L21":[62,160,182,"L21"],
  "HG-L22":[56,140,177,"L22"],
  "HG-L23":[48,125,156,"L23"],
  "HG-L24":[47,120,130,"L24"],
  "HG-L25":[170,205,242,"L25"],
  "HG-L26":[164,220,251,"L26"],
  "HG-L27":[68,180,232,"L27"],
  "HG-P01":[250,233,243,"P01"],
  "HG-P02":[250,215,231,"P02"],
  "HG-P03":[253,190,216,"P03"],
  "HG-P04":[241,175,201,"P04"],
  "HG-P05":[252,140,187,"P05"],
  "HG-P06":[246,120,167,"P06"],
  "HG-P07":[255,75,148,"P07"],
  "HG-P08":[245,175,196,"P08"],
  "HG-P09":[245,140,171,"P09"],
  "HG-P10":[249,95,142,"P10"],
  "HG-P11":[245,70,153,"P11"],
  "HG-P12":[241,45,113,"P12"],
  "HG-P13":[240,205,221,"P13"],
  "HG-P14":[245,87,150,"P14"],
  "HG-R01":[248,192,192,"R01"],
  "HG-R02":[243,163,163,"R02"],
  "HG-R03":[252,130,127,"R03"],
  "HG-R04":[249,106,115,"R04"],
  "HG-R05":[240,118,108,"R05"],
  "HG-R06":[252,94,84,"R06"],
  "HG-R07":[255,47,52,"R07"],
  "HG-R08":[255,45,55,"R08"],
  "HG-R09":[255,0,26,"R09"],
  "HG-R10":[208,40,40,"R10"],
  "HG-R11":[237,55,89,"R11"],
  "HG-R12":[195,55,107,"R12"],
  "HG-R13":[255,3,26,"R13"],
  "HG-Y01":[250,250,198,"Y01"],
  "HG-Y02":[250,250,146,"Y02"],
  "HG-Y03":[254,240,78,"Y03"],
  "HG-Y04":[253,225,48,"Y04"],
  "HG-Y05":[255,200,47,"Y05"],
  "HG-Y06":[251,176,36,"Y06"],
  "HG-Y07":[254,153,31,"Y07"],
  "HG-Y08":[250,180,84,"Y08"],
  "HG-Y09":[250,145,41,"Y09"],
  "HG-Y10":[247,125,57,"Y10"],
  "HG-Y11":[248,97,15,"Y11"],
  "HG-Y12":[254,76,10,"Y12"],
  "HG-Y13":[229,239,165,"Y13"],
  "HG-Y14":[244,237,204,"Y14"],
  "HG-Y15":[254,240,94,"Y15"],
  "HG-Y16":[255,215,43,"Y16"],
  "HG-Y17":[255,87,72,"Y17"],
  "HG-Z01":[197,190,221,"Z01"],
  "HG-Z02":[146,125,182,"Z02"],
  "HG-Z03":[116,95,163,"Z03"],
  "HG-Z04":[84,70,153,"Z04"],
  "HG-Z05":[176,190,227,"Z05"],
  "HG-Z06":[126,140,203,"Z06"],
  "HG-Z07":[77,98,171,"Z07"],
  "HG-Z08":[75,75,156,"Z08"],
  "HG-Z09":[204,155,197,"Z09"],
  "HG-Z10":[169,120,176,"Z10"],
  "HG-Z11":[143,80,158,"Z11"],
  "HG-Z12":[106,60,133,"Z12"],
  "HG-Z13":[193,200,221,"Z13"],
  "HG-Z14":[235,200,221,"Z14"],
  "HG-Z15":[226,65,154,"Z15"],
  "HG-Z16":[137,95,163,"Z16"],

  // --- High Gloss 288 (GN.586 line, new codes added 2026-08-30) ---
  // 120 new codes extending the existing F/G/H/L/P/Y/Z letter families
  // exactly where each left off (no gaps, no overlaps -- confirmed
  // against the existing 168 codes above before adding these). Together
  // with the 168 existing codes these form the new GN.586-288 set.
  // No R-family codes were added in this batch.
  "HG-G42":[169,217,190,"G42"],"HG-G43":[207,230,197,"G43"],"HG-G44":[179,210,88,"G44"],"HG-G45":[170,206,52,"G45"],"HG-G46":[119,192,4,"G46"],"HG-G47":[14,178,12,"G47"],
  "HG-G48":[91,188,72,"G48"],"HG-G49":[6,174,87,"G49"],"HG-G50":[5,168,35,"G50"],"HG-G51":[3,145,70,"G51"],"HG-G52":[9,99,60,"G52"],"HG-G53":[177,188,63,"G53"],
  "HG-L28":[164,211,227,"L28"],"HG-L29":[124,198,222,"L29"],"HG-L30":[65,172,205,"L30"],"HG-L31":[4,157,202,"L31"],"HG-L32":[0,116,176,"L32"],"HG-L33":[1,95,160,"L33"],
  "HG-L34":[136,201,236,"L34"],"HG-L35":[100,143,199,"L35"],"HG-L36":[39,85,164,"L36"],"HG-L37":[4,95,174,"L37"],"HG-L38":[0,72,156,"L38"],"HG-L39":[3,102,150,"L39"],
  "HG-L44":[225,240,247,"L44"],"HG-F74":[247,240,230,"F74"],"HG-F75":[247,246,229,"F75"],"HG-P15":[247,230,235,"P15"],"HG-P16":[248,231,232,"P16"],"HG-L45":[223,235,235,"L45"],
  "HG-G62":[233,242,211,"G62"],"HG-G63":[226,235,219,"G63"],"HG-L46":[219,231,226,"L46"],"HG-Z29":[238,221,233,"Z29"],"HG-F76":[248,232,225,"F76"],"HG-G64":[234,235,227,"G64"],
  "HG-F38":[238,233,205,"F38"],"HG-F39":[231,220,194,"F39"],"HG-F40":[227,216,182,"F40"],"HG-F41":[211,192,143,"F41"],"HG-F42":[186,166,112,"F42"],"HG-F43":[174,147,109,"F43"],
  "HG-F44":[229,207,198,"F44"],"HG-F45":[217,186,177,"F45"],"HG-F46":[198,182,168,"F46"],"HG-F47":[190,154,142,"F47"],"HG-F48":[120,80,69,"F48"],"HG-F49":[105,68,44,"F49"],
  "HG-F50":[220,166,161,"F50"],"HG-F51":[208,147,157,"F51"],"HG-F52":[196,126,132,"F52"],"HG-F53":[239,165,167,"F53"],"HG-F54":[240,148,143,"F54"],"HG-F55":[180,101,92,"F55"],
  "HG-F56":[183,115,103,"F56"],"HG-F57":[228,120,68,"F57"],"HG-F58":[170,80,63,"F58"],"HG-F59":[230,89,43,"F59"],"HG-F60":[241,49,29,"F60"],"HG-F61":[213,19,31,"F61"],
  "HG-H04":[199,222,231,"H04"],"HG-H05":[167,194,205,"H05"],"HG-H06":[142,171,185,"H06"],"HG-H07":[67,93,105,"H07"],"HG-H08":[46,69,77,"H08"],"HG-H09":[73,62,72,"H09"],
  "HG-H10":[175,186,200,"H10"],"HG-H11":[193,203,204,"H11"],"HG-H12":[179,194,189,"H12"],"HG-H13":[171,189,189,"H13"],"HG-H14":[151,174,169,"H14"],"HG-H15":[121,157,144,"H15"],
  "HG-Y18":[246,230,163,"Y18"],"HG-Y19":[247,219,88,"Y19"],"HG-Y20":[248,214,8,"Y20"],"HG-Y21":[248,200,6,"Y21"],"HG-Y22":[247,222,6,"Y22"],"HG-Y23":[247,237,99,"Y23"],
  "HG-Y24":[247,234,4,"Y24"],"HG-Y25":[247,167,6,"Y25"],"HG-Y26":[245,150,41,"Y26"],"HG-Y27":[248,110,0,"Y27"],"HG-Y28":[247,121,4,"Y28"],"HG-Y29":[234,225,7,"Y29"],
  "HG-Z17":[115,168,213,"Z17"],"HG-Z18":[95,140,190,"Z18"],"HG-Z19":[72,117,178,"Z19"],"HG-Z20":[131,152,203,"Z20"],"HG-Z21":[150,137,191,"Z21"],"HG-Z22":[122,120,185,"Z22"],
  "HG-Z23":[170,133,184,"Z23"],"HG-Z24":[174,97,168,"Z24"],"HG-Z25":[164,78,154,"Z25"],"HG-Z26":[132,60,147,"Z26"],"HG-Z27":[237,102,164,"Z27"],"HG-Z28":[176,41,126,"Z28"],
  "HG-G54":[217,232,198,"G54"],"HG-G55":[157,214,177,"G55"],"HG-G56":[114,180,128,"G56"],"HG-G57":[64,171,118,"G57"],"HG-G58":[8,158,94,"G58"],"HG-G59":[64,127,40,"G59"],
  "HG-L40":[101,195,198,"L40"],"HG-L41":[44,159,156,"L41"],"HG-L42":[7,146,154,"L42"],"HG-L43":[2,129,125,"L43"],"HG-G60":[5,103,71,"G60"],"HG-G61":[36,83,37,"G61"],
  "HG-F62":[247,229,164,"F62"],"HG-F63":[246,221,153,"F63"],"HG-F64":[245,192,93,"F64"],"HG-F65":[246,169,98,"F65"],"HG-F66":[244,147,73,"F66"],"HG-F67":[177,144,0,"F67"],
  "HG-F68":[199,89,39,"F68"],"HG-F69":[220,99,34,"F69"],"HG-F70":[161,141,71,"F70"],"HG-F71":[116,54,46,"F71"],"HG-F72":[158,33,39,"F72"],"HG-F73":[147,42,74,"F73"],
};

export const GN_366_IDS: string[] = Object.keys(GN_COLORS);

// GN-only subset (excludes High Gloss/HG- codes). Used when the overall
// best match (across GN_366_IDS, which includes HG) turns out to be an
// HG code: HG markers are newer and less commonly owned than the
// classic GN line, so in that case we also compute and show the best
// *regular* GN match as a more-likely-to-be-owned fallback suggestion.
// When the best match is already a GN code, nothing uses this list.
export const GN_ONLY_IDS: string[] = GN_366_IDS.filter(id => !id.startsWith("HG-"));

// The 48 Metallic codes (GN-330 .. GN-377). Kept as an explicit list (not a
// range filter) since the numbers aren't contiguous with the rest of the
// classic-brush code space -- they sit in a gap below GN-526.
export const GN_METALLIC_IDS: string[] = [
      "GN-330","GN-331","GN-332","GN-333","GN-334","GN-335","GN-336","GN-337","GN-338","GN-339",
      "GN-340","GN-341","GN-342","GN-343","GN-344","GN-345","GN-346","GN-347","GN-348","GN-349",
      "GN-350","GN-351","GN-352","GN-353","GN-354","GN-355","GN-356","GN-357","GN-358","GN-359",
      "GN-360","GN-361","GN-362","GN-363","GN-364","GN-365","GN-366","GN-367","GN-368","GN-369",
      "GN-370","GN-371","GN-372","GN-373","GN-374","GN-375","GN-376","GN-377"
];

// GN_ONLY_IDS minus the Metallic codes. This is the pool matching tools
// (Color Converter, Legend Converter, Languo Converter, Mystery Decoder,
// PBN generation) should search against by default: metallic markers
// aren't a realistic "closest match" suggestion for an arbitrary photo
// color, so they're excluded here and only surfaced when a customer
// explicitly picks the Metallic set or types a metallic code into
// "My Markers".
export const GN_MATCHING_IDS: string[] = GN_ONLY_IDS.filter(id => !GN_METALLIC_IDS.includes(id));

// Same idea as GN_MATCHING_IDS, but keeps HG- codes in the pool. Use this
// (instead of GN_366_IDS) for an *unrestricted* "best match across
// everything" search that should still be able to surface an HG code
// (e.g. ColorConverter's un-set-restricted match, which then separately
// computes a GN_MATCHING_IDS fallback if the result IS an HG code) --
// GN_MATCHING_IDS itself excludes HG entirely, so it's the wrong pool
// for that first, unrestricted lookup.
export const GN_ALL_MATCHING_IDS: string[] = GN_366_IDS.filter(id => !GN_METALLIC_IDS.includes(id));

export const GUANGNA_SETS: Record<string,string[]> = {
  "GN.8101-12 (12 colors)":["GN-600","GN-601","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-611","GN-614","GN-620"],
  "GN.8101-24 (24 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-634","GN-655"],
  "GN.8101-36 (36 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-626","GN-627","GN-628","GN-634","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658"],
  "GN.8101-48 (48 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-626","GN-627","GN-628","GN-629","GN-634","GN-635","GN-646","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658","GN-663","GN-664","GN-665","GN-668","GN-671","GN-672","GN-673","GN-681","GN-684"],
  "GN.8101-60 (60 colors)":["GN-627","GN-614","GN-668","GN-602","GN-609","GN-622","GN-648","GN-669","GN-665","GN-634","GN-676","GN-646","GN-645","GN-652","GN-637","GN-683","GN-684","GN-618","GN-643","GN-626","GN-656","GN-603","GN-615","GN-625","GN-649","GN-604","GN-663","GN-630","GN-654","GN-619","GN-672","GN-620","GN-667","GN-605","GN-664","GN-624","GN-658","GN-612","GN-655","GN-606","GN-671","GN-635","GN-623","GN-613","GN-629","GN-670","GN-651","GN-607","GN-628","GN-601","GN-650","GN-616","GN-617","GN-608","GN-673","GN-681","GN-600","GN-686","GN-610","GN-611"],
  "GN.8101-72 (72 colors)":["GN-627","GN-685","GN-614","GN-668","GN-602","GN-609","GN-622","GN-648","GN-669","GN-665","GN-682","GN-634","GN-676","GN-646","GN-645","GN-652","GN-638","GN-637","GN-683","GN-684","GN-644","GN-618","GN-639","GN-643","GN-626","GN-656","GN-603","GN-615","GN-625","GN-649","GN-604","GN-663","GN-630","GN-654","GN-619","GN-674","GN-672","GN-620","GN-667","GN-605","GN-664","GN-624","GN-658","GN-612","GN-655","GN-606","GN-666","GN-671","GN-635","GN-623","GN-613","GN-675","GN-629","GN-670","GN-651","GN-607","GN-678","GN-628","GN-601","GN-650","GN-616","GN-617","GN-608","GN-673","GN-681","GN-633","GN-600","GN-686","GN-610","GN-679","GN-680","GN-611"],
  "GN.8101-100 (100 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-633","GN-634","GN-635","GN-637","GN-638","GN-639","GN-643","GN-644","GN-645","GN-646","GN-648","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-697","GN-700","GN-702","GN-703","GN-704","GN-706","GN-717","GN-719","GN-723","GN-729","GN-730","GN-732","GN-734","GN-736","GN-737","GN-740","GN-744","GN-745","GN-802","GN-819","GN-820","GN-822","GN-824", "GN-827","GN-853"],
  "GN.8101-120 (120 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-633","GN-634","GN-635","GN-637","GN-638","GN-639","GN-643","GN-644","GN-645","GN-646","GN-648","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-693","GN-694","GN-695","GN-696","GN-697","GN-700","GN-701","GN-702","GN-703","GN-704","GN-706","GN-707","GN-717","GN-719","GN-723","GN-725","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-802","GN-819","GN-820","GN-822","GN-823","GN-824","GN-832","GN-853"],
  "GN.8101-168 (168 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-633","GN-634","GN-635","GN-637","GN-638","GN-639","GN-643","GN-644","GN-645","GN-646","GN-648","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658","GN-659","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-693","GN-694","GN-695","GN-696","GN-697","GN-700","GN-701","GN-702","GN-703","GN-704","GN-706","GN-707","GN-712","GN-717","GN-719","GN-723","GN-725","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-802","GN-809","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-832","GN-833","GN-836","GN-853","GN-854","GN-855","GN-856","GN-859","GN-869","GN-872","GN-873"],
  "GN.8101-240 (240 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639","GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649","GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659","GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699","GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709","GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-719","GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749","GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809","GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-832","GN-833","GN-836","GN-837","GN-853","GN-854","GN-855","GN-856","GN-859","GN-869","GN-872","GN-873"],
  "GN.8101-288 (288 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639","GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649","GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659","GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699","GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709","GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-718","GN-719","GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749","GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809","GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-829","GN-830","GN-831","GN-832","GN-833","GN-834","GN-835","GN-836","GN-837","GN-838","GN-839","GN-840","GN-841","GN-842","GN-843","GN-844","GN-845","GN-846","GN-847","GN-848","GN-849","GN-850","GN-851","GN-852","GN-853","GN-854","GN-855","GN-856","GN-857","GN-858","GN-859","GN-860","GN-861","GN-862","GN-863","GN-864","GN-865","GN-866","GN-867","GN-868","GN-869","GN-870","GN-871","GN-872","GN-873","GN-874","GN-875","GN-876","GN-877","GN-878","GN-879","GN-880","GN-881","GN-882","GN-883","GN-884","GN-885","GN-886","GN-887"],
  "GN.8101-360 (360 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639","GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649","GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659","GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699","GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709","GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-718","GN-719","GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749","GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809","GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-829","GN-830","GN-831","GN-832","GN-833","GN-834","GN-835","GN-836","GN-837","GN-838","GN-839","GN-840","GN-841","GN-842","GN-843","GN-844","GN-845","GN-846","GN-847","GN-848","GN-849","GN-850","GN-851","GN-852","GN-853","GN-854","GN-855","GN-856","GN-857","GN-858","GN-859","GN-860","GN-861","GN-862","GN-863","GN-864","GN-865","GN-866","GN-867","GN-868","GN-869","GN-870","GN-871","GN-872","GN-873","GN-874","GN-875","GN-876","GN-877","GN-878","GN-879","GN-880","GN-881","GN-882","GN-883","GN-884","GN-885","GN-886","GN-887","GN-888","GN-889","GN-890","GN-891","GN-892","GN-893","GN-894","GN-895","GN-896","GN-897","GN-898","GN-899","GN-900","GN-901","GN-902","GN-903","GN-904","GN-905","GN-906","GN-907","GN-908","GN-909","GN-910","GN-911","GN-912","GN-913","GN-914","GN-915","GN-916","GN-917","GN-918","GN-919","GN-920","GN-921","GN-922","GN-923","GN-924","GN-925","GN-926","GN-927","GN-928","GN-929","GN-930","GN-931","GN-932","GN-933","GN-934","GN-935","GN-936","GN-937","GN-938","GN-939","GN-940","GN-941","GN-942","GN-943","GN-944","GN-945","GN-946","GN-947","GN-948","GN-949","GN-950","GN-951","GN-952","GN-953","GN-954","GN-955","GN-956","GN-957","GN-958","GN-959"],
  "GN.8101-366 (366 colors)": [
    "GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609",
    "GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619",
    "GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629",
    "GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639",
    "GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649",
    "GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659",
    "GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669",
    "GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679",
    "GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689",
    "GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699",
    "GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709",
    "GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-718","GN-719",
    "GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729",
    "GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739",
    "GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749",
    "GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759",
    "GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769",
    "GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779",
    "GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789",
    "GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799",
    "GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809",
    "GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819",
    "GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-829",
    "GN-830","GN-831","GN-832","GN-833","GN-834","GN-835","GN-836","GN-837","GN-838","GN-839",
    "GN-840","GN-841","GN-842","GN-843","GN-844","GN-845","GN-846","GN-847","GN-848","GN-849",
    "GN-850","GN-851","GN-852","GN-853","GN-854","GN-855","GN-856","GN-857","GN-858","GN-859",
    "GN-860","GN-861","GN-862","GN-863","GN-864","GN-865","GN-866","GN-867","GN-868","GN-869",
    "GN-870","GN-871","GN-872","GN-873","GN-874","GN-875","GN-876","GN-877","GN-878","GN-879",
    "GN-880","GN-881","GN-882","GN-883","GN-884","GN-885","GN-886","GN-887","GN-888","GN-889",
    "GN-890","GN-891","GN-892","GN-893","GN-894","GN-895","GN-896","GN-897","GN-898","GN-899",
    "GN-900","GN-901","GN-902","GN-903","GN-904","GN-905","GN-906","GN-907","GN-908","GN-909",
    "GN-910","GN-911","GN-912","GN-913","GN-914","GN-915","GN-916","GN-917","GN-918","GN-919",
    "GN-920","GN-921","GN-922","GN-923","GN-924","GN-925","GN-926","GN-927","GN-928","GN-929",
    "GN-930","GN-931","GN-932","GN-933","GN-934","GN-935","GN-936","GN-937","GN-938","GN-939",
    "GN-940","GN-941","GN-942","GN-943","GN-944","GN-945","GN-946","GN-947","GN-948","GN-949",
    "GN-950","GN-951","GN-952","GN-953","GN-954","GN-955","GN-956","GN-957","GN-958","GN-959",
    "GN-960","GN-961","GN-962","GN-963","GN-964","GN-965"
  ],
  "GN.8101-408 (360 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639","GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649","GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659","GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699","GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709","GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-718","GN-719","GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749","GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809","GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-829","GN-830","GN-831","GN-832","GN-833","GN-834","GN-835","GN-836","GN-837","GN-838","GN-839","GN-840","GN-841","GN-842","GN-843","GN-844","GN-845","GN-846","GN-847","GN-848","GN-849","GN-850","GN-851","GN-852","GN-853","GN-854","GN-855","GN-856","GN-857","GN-858","GN-859","GN-860","GN-861","GN-862","GN-863","GN-864","GN-865","GN-866","GN-867","GN-868","GN-869","GN-870","GN-871","GN-872","GN-873","GN-874","GN-875","GN-876","GN-877","GN-878","GN-879","GN-880","GN-881","GN-882","GN-883","GN-884","GN-885","GN-886","GN-887","GN-888","GN-889","GN-890","GN-891","GN-892","GN-893","GN-894","GN-895","GN-896","GN-897","GN-898","GN-899","GN-900","GN-901","GN-902","GN-903","GN-904","GN-905","GN-906","GN-907","GN-908","GN-909","GN-910","GN-911","GN-912","GN-913","GN-914","GN-915","GN-916","GN-917","GN-918","GN-919","GN-920","GN-921","GN-922","GN-923","GN-924","GN-925","GN-926","GN-927","GN-928","GN-929","GN-930","GN-931","GN-932","GN-933","GN-934","GN-935","GN-936","GN-937","GN-938","GN-939","GN-940","GN-941","GN-942","GN-943","GN-944","GN-945","GN-946","GN-947","GN-948","GN-949","GN-950","GN-951","GN-952","GN-953","GN-954","GN-955","GN-956","GN-957","GN-958","GN-959"],
  // GN.8101-488: the current full Classic Brush palette (366 original codes + the
  // 48 Metallic codes + the 74 new 526-599 codes). Computed from GN_ONLY_IDS
  // (all non-HG entries in GN_COLORS) rather than hardcoded, so it always tracks
  // whatever GN_COLORS actually contains.
  "GN.8101-488 (488 colors)": GN_ONLY_IDS,
  "GN.8102-36 (36 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-606","GN-608","GN-609","GN-611","GN-618","GN-623","GN-628","GN-634","GN-635","GN-639","GN-648","GN-649","GN-655","GN-656","GN-658","GN-664","GN-667","GN-672","GN-674","GN-686","GN-687","GN-704","GN-725","GN-732","GN-734","GN-737","GN-739","GN-740","GN-742","GN-822","GN-832"],
  "GN.8106-30 (60 colors)":["GN-600","GN-601","GN-602","GN-606","GN-607","GN-608","GN-611","GN-618","GN-648","GN-649","GN-650","GN-652","GN-655","GN-656","GN-659","GN-664","GN-665","GN-666","GN-670","GN-672","GN-673","GN-676","GN-678","GN-680","GN-682","GN-686","GN-687","GN-691","GN-702","GN-704","GN-712","GN-725","GN-732","GN-733","GN-734","GN-735","GN-741","GN-743","GN-744","GN-745","GN-777","GN-780","GN-781","GN-782","GN-784","GN-786","GN-787","GN-794","GN-795","GN-796","GN-799","GN-802","GN-818","GN-819","GN-821","GN-822","GN-832","GN-833","GN-872","GN-873"],
  "GN.8106-84 (168 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-633","GN-634","GN-635","GN-637","GN-638","GN-639","GN-643","GN-644","GN-645","GN-646","GN-648","GN-649","GN-650","GN-651","GN-652","GN-654","GN-655","GN-656","GN-658","GN-659","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-678","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-693","GN-694","GN-695","GN-696","GN-697","GN-700","GN-701","GN-702","GN-703","GN-704","GN-706","GN-707","GN-712","GN-717","GN-719","GN-723","GN-725","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-802","GN-809","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-832","GN-833","GN-836","GN-839","GN-853","GN-854","GN-855","GN-856","GN-869","GN-872","GN-873","GN-879"],
  "GN.8106-60 (120 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-610","GN-611","GN-612","GN-614","GN-615","GN-617","GN-618","GN-623","GN-624","GN-625","GN-627","GN-628","GN-629","GN-630","GN-634","GN-635","GN-637","GN-639","GN-641","GN-643","GN-644","GN-645","GN-648","GN-649","GN-650","GN-652","GN-655","GN-656","GN-658","GN-659","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-672","GN-673","GN-676","GN-678","GN-680","GN-681","GN-683","GN-684","GN-685","GN-686","GN-687","GN-689","GN-691","GN-693","GN-697","GN-700","GN-701","GN-702","GN-703","GN-704","GN-706","GN-707","GN-712","GN-719","GN-723","GN-725","GN-727","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-738","GN-739","GN-740","GN-741","GN-743","GN-744","GN-745","GN-772","GN-776","GN-777","GN-779","GN-780","GN-781","GN-782","GN-784","GN-785","GN-786","GN-787","GN-789","GN-790","GN-791","GN-794","GN-795","GN-796","GN-799","GN-802","GN-818","GN-819","GN-821","GN-822","GN-824","GN-832","GN-833","GN-836","GN-839","GN-854","GN-855","GN-856","GN-872","GN-873"],
  "GN.8109-240 (240 colors)":["GN-600","GN-601","GN-602","GN-603","GN-604","GN-605","GN-606","GN-607","GN-608","GN-609","GN-610","GN-611","GN-612","GN-613","GN-614","GN-615","GN-616","GN-617","GN-618","GN-619","GN-620","GN-621","GN-622","GN-623","GN-624","GN-625","GN-626","GN-627","GN-628","GN-629","GN-630","GN-631","GN-632","GN-633","GN-634","GN-635","GN-636","GN-637","GN-638","GN-639","GN-640","GN-641","GN-642","GN-643","GN-644","GN-645","GN-646","GN-647","GN-648","GN-649","GN-650","GN-651","GN-652","GN-653","GN-654","GN-655","GN-656","GN-657","GN-658","GN-659","GN-660","GN-661","GN-662","GN-663","GN-664","GN-665","GN-666","GN-667","GN-668","GN-669","GN-670","GN-671","GN-672","GN-673","GN-674","GN-675","GN-676","GN-677","GN-678","GN-679","GN-680","GN-681","GN-682","GN-683","GN-684","GN-685","GN-686","GN-687","GN-688","GN-689","GN-690","GN-691","GN-692","GN-693","GN-694","GN-695","GN-696","GN-697","GN-698","GN-699","GN-700","GN-701","GN-702","GN-703","GN-704","GN-705","GN-706","GN-707","GN-708","GN-709","GN-710","GN-711","GN-712","GN-713","GN-714","GN-715","GN-716","GN-717","GN-719","GN-720","GN-721","GN-722","GN-723","GN-724","GN-725","GN-726","GN-727","GN-728","GN-729","GN-730","GN-731","GN-732","GN-733","GN-734","GN-735","GN-736","GN-737","GN-738","GN-739","GN-740","GN-741","GN-742","GN-743","GN-744","GN-745","GN-746","GN-747","GN-748","GN-749","GN-750","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-760","GN-761","GN-762","GN-763","GN-764","GN-765","GN-766","GN-767","GN-768","GN-769","GN-770","GN-771","GN-772","GN-773","GN-774","GN-775","GN-776","GN-777","GN-778","GN-779","GN-780","GN-781","GN-782","GN-783","GN-784","GN-785","GN-786","GN-787","GN-788","GN-789","GN-790","GN-791","GN-792","GN-793","GN-794","GN-795","GN-796","GN-797","GN-798","GN-799","GN-800","GN-801","GN-802","GN-803","GN-804","GN-805","GN-806","GN-807","GN-808","GN-809","GN-810","GN-811","GN-812","GN-813","GN-814","GN-815","GN-816","GN-817","GN-818","GN-819","GN-820","GN-821","GN-822","GN-823","GN-824","GN-825","GN-826","GN-827","GN-828","GN-832","GN-833","GN-836","GN-838","GN-853","GN-854","GN-855","GN-856","GN-859","GN-869","GN-872","GN-873"],
  "GN.8109-72 (72 colors)":["GN-600","GN-611","GN-619","GN-620","GN-624","GN-625","GN-630","GN-638","GN-639","GN-643","GN-644","GN-645","GN-646","GN-654","GN-656","GN-667","GN-672","GN-683","GN-684","GN-686","GN-691","GN-701","GN-703","GN-704","GN-708","GN-709","GN-717","GN-718","GN-719","GN-720","GN-721","GN-724","GN-731","GN-738","GN-751","GN-752","GN-753","GN-754","GN-755","GN-756","GN-757","GN-758","GN-759","GN-769","GN-770","GN-771","GN-776","GN-779","GN-780","GN-801","GN-802","GN-805","GN-808","GN-837","GN-840","GN-862","GN-863","GN-864","GN-865","GN-866","GN-867","GN-868","GN-869","GN-870","GN-871","GN-872","GN-874","GN-875","GN-881","GN-882","GN-883","GN-887"],
  "GN.8109A-12 (12 colors)":["GN-601","GN-608","GN-616","GN-636","GN-650","GN-659","GN-688","GN-818","GN-819","GN-820","GN-821","GN-822"],
  "GN.8109B-12 (12 colors)":["GN-606","GN-612","GN-655","GN-658","GN-660","GN-666","GN-712","GN-723","GN-726","GN-762","GN-836","GN-873"],
  "GN.8109C-12 (12 colors)":["GN-614","GN-634","GN-648","GN-657","GN-668","GN-669","GN-687","GN-700","GN-727","GN-728","GN-740","GN-794"],
  "GN.8109D-12 (12 colors)":["GN-605","GN-664","GN-674","GN-677","GN-713","GN-714","GN-716","GN-760","GN-761","GN-781","GN-783","GN-784"],
  "GN.8109E-12 (12 colors)":["GN-607","GN-623","GN-635","GN-651","GN-678","GN-734","GN-742","GN-743","GN-744","GN-778","GN-832","GN-833"],
  "GN.8109F-12 (12 colors)":["GN-603","GN-604","GN-615","GN-632","GN-649","GN-702","GN-725","GN-765","GN-766","GN-777","GN-783","GN-786"],
  "GN.8109G-12 (12 colors)":["GN-656","GN-683","GN-684","GN-701","GN-717","GN-718","GN-719","GN-720","GN-724","GN-732","GN-733","GN-802"],
  "GN.8109H-12 (12 colors)":["GN-619","GN-620","GN-630","GN-654","GN-672","GN-754","GN-755","GN-756","GN-769","GN-779","GN-780","GN-869"],
  "GN.8109I-12 (12 colors)":["GN-600","GN-610","GN-611","GN-679","GN-680","GN-686","GN-801","GN-803","GN-804","GN-805","GN-807","GN-853"],
  "GN.8109J-12 (12 colors)":["GN-618","GN-639","GN-643","GN-644","GN-645","GN-708","GN-731","GN-738","GN-757","GN-758","GN-776","GN-814"],
  "GN.8109K-12 (12 colors)":["GN-624","GN-625","GN-667","GN-691","GN-692","GN-703","GN-704","GN-710","GN-711","GN-721","GN-837","GN-872"],
  "GN.8201B-12 (12 colors)":["GN-624","GN-625","GN-677","GN-691","GN-692","GN-703","GN-704","GN-716","GN-721","GN-761","GN-837","GN-872"],
  "GN.8201F-24 (24 colors)":["GN-618","GN-624","GN-625","GN-626","GN-639","GN-644","GN-654","GN-656","GN-658","GN-667","GN-672","GN-683","GN-684","GN-701","GN-703","GN-704","GN-716","GN-717","GN-718","GN-719","GN-720","GN-721","GN-723","GN-724"],
  "GN.8201M-24 (24 colors)":["GN-627","GN-628","GN-635","GN-646","GN-648","GN-649","GN-655","GN-669","GN-700","GN-702","GN-704","GN-706","GN-717","GN-723","GN-729","GN-730","GN-732","GN-733","GN-736","GN-737","GN-738","GN-744","GN-745","GN-822"],

  // --- Metallic Colors (48) ---
  // GN-330 .. GN-377. Same GN- numeric code space as the classic line
  // (normalizeExtraCode() already handles these with no changes needed).
  "GN.8301-Metallic (48 colors)": GN_METALLIC_IDS,

  // --- High Gloss 168 (GN.586 line) ---
  "GN.586-168 (168 colors)":["HG-F01","HG-F02","HG-F03","HG-F04","HG-F05","HG-F06","HG-F07","HG-F08","HG-F09","HG-F10","HG-F11","HG-F12","HG-F13","HG-F14","HG-F15","HG-F16","HG-F17","HG-F18","HG-F19","HG-F20","HG-F21","HG-F22","HG-F23","HG-F24","HG-F25","HG-F26","HG-F27","HG-F28","HG-F29","HG-F30","HG-F31","HG-F32","HG-F33","HG-F34","HG-F35","HG-F36","HG-F37","HG-G01","HG-G02","HG-G03","HG-G04","HG-G05","HG-G06","HG-G07","HG-G08","HG-G09","HG-G10","HG-G11","HG-G12","HG-G13","HG-G14","HG-G15","HG-G16","HG-G17","HG-G18","HG-G19","HG-G20","HG-G21","HG-G22","HG-G23","HG-G24","HG-G25","HG-G26","HG-G27","HG-G28","HG-G29","HG-G30","HG-G31","HG-G32","HG-G33","HG-G34","HG-G35","HG-G36","HG-G37","HG-G38","HG-G39","HG-G40","HG-G41","HG-H01","HG-H02","HG-H03","HG-L01","HG-L02","HG-L03","HG-L04","HG-L05","HG-L06","HG-L07","HG-L08","HG-L09","HG-L10","HG-L11","HG-L12","HG-L13","HG-L14","HG-L15","HG-L16","HG-L17","HG-L18","HG-L19","HG-L20","HG-L21","HG-L22","HG-L23","HG-L24","HG-L25","HG-L26","HG-L27","HG-P01","HG-P02","HG-P03","HG-P04","HG-P05","HG-P06","HG-P07","HG-P08","HG-P09","HG-P10","HG-P11","HG-P12","HG-P13","HG-P14","HG-R01","HG-R02","HG-R03","HG-R04","HG-R05","HG-R06","HG-R07","HG-R08","HG-R09","HG-R10","HG-R11","HG-R12","HG-R13","HG-Y01","HG-Y02","HG-Y03","HG-Y04","HG-Y05","HG-Y06","HG-Y07","HG-Y08","HG-Y09","HG-Y10","HG-Y11","HG-Y12","HG-Y13","HG-Y14","HG-Y15","HG-Y16","HG-Y17","HG-Z01","HG-Z02","HG-Z03","HG-Z04","HG-Z05","HG-Z06","HG-Z07","HG-Z08","HG-Z09","HG-Z10","HG-Z11","HG-Z12","HG-Z13","HG-Z14","HG-Z15","HG-Z16"],
  // GN.586-288: the full High Gloss line (168 original + 120 new codes
  // added 2026-08-30). Computed from GN_COLORS directly (all HG- keys)
  // rather than hardcoded, mirroring the GN.8101-488 pattern -- always
  // tracks whatever GN_COLORS actually contains.
  "GN.586-288 (288 colors)": Object.keys(GN_COLORS).filter(id => id.startsWith("HG-")),
  "GN.586O-12 (12 colors)":["HG-L28","HG-L29","HG-L30","HG-L31","HG-L32","HG-L33","HG-L34","HG-L35","HG-L36","HG-L37","HG-L38","HG-L39"],
  "GN.586P-12 (12 colors)":["HG-Z17","HG-Z18","HG-Z19","HG-Z20","HG-Z21","HG-Z22","HG-Z23","HG-Z24","HG-Z25","HG-Z26","HG-Z27","HG-Z28"],
  "GN.586Q-12 (12 colors)":["HG-F50","HG-F51","HG-F52","HG-F53","HG-F54","HG-F55","HG-F56","HG-F57","HG-F58","HG-F59","HG-F60","HG-F61"],
  "GN.586R-12 (12 colors)":["HG-F62","HG-F63","HG-F64","HG-F65","HG-F66","HG-F67","HG-F68","HG-F69","HG-F70","HG-F71","HG-F72","HG-F73"],
  "GN.586S-12 (12 colors)":["HG-F38","HG-F39","HG-F40","HG-F41","HG-F42","HG-F43","HG-F44","HG-F45","HG-F46","HG-F47","HG-F48","HG-F49"],
  "GN.586T-12 (12 colors)":["HG-G54","HG-G55","HG-G56","HG-G57","HG-G58","HG-G59","HG-L40","HG-L41","HG-L42","HG-L43","HG-G60","HG-G61"],
  "GN.586U-12 (12 colors)":["HG-G42","HG-G43","HG-G44","HG-G45","HG-G46","HG-G47","HG-G48","HG-G49","HG-G50","HG-G51","HG-G52","HG-G53"],
  "GN.586V-12 (12 colors)":["HG-Y18","HG-Y19","HG-Y20","HG-Y21","HG-Y22","HG-Y23","HG-Y24","HG-Y25","HG-Y26","HG-Y27","HG-Y28","HG-Y29"],
  "GN.586W-12 (12 colors)":["HG-H04","HG-H05","HG-H06","HG-H07","HG-H08","HG-H09","HG-H10","HG-H11","HG-H12","HG-H13","HG-H14","HG-H15"],
  "GN.586X-12 (12 colors)":["HG-L44","HG-F74","HG-F75","HG-P15","HG-P16","HG-L45","HG-G62","HG-G63","HG-L46","HG-Z29","HG-F76","HG-G64"],
  "GN.586A-12 (12 colors)":["HG-G40","HG-G41","HG-H01","HG-H02","HG-L27","HG-P14","HG-R13","HG-Y15","HG-Y16","HG-Y17","HG-Z15","HG-Z16"],
  "GN.586B-12 (12 colors)":["HG-F37","HG-G37","HG-G38","HG-G39","HG-H03","HG-L25","HG-L26","HG-P13","HG-Y13","HG-Y14","HG-Z13","HG-Z14"],
  "GN.586C-12 (12 colors)":["HG-L01","HG-L02","HG-L03","HG-L04","HG-L05","HG-L06","HG-L07","HG-L08","HG-L09","HG-L10","HG-L11","HG-L12"],
  "GN.586D-12 (12 colors)":["HG-L13","HG-L14","HG-L15","HG-L16","HG-L17","HG-L18","HG-L19","HG-L20","HG-L21","HG-L22","HG-L23","HG-L24"],
  "GN.586E-12 (12 colors)":["HG-G01","HG-G02","HG-G03","HG-G04","HG-G05","HG-G06","HG-G07","HG-G08","HG-G09","HG-G10","HG-G11","HG-G12"],
  "GN.586F-12 (12 colors)":["HG-G13","HG-G14","HG-G15","HG-G16","HG-G17","HG-G18","HG-G19","HG-G20","HG-G21","HG-G22","HG-G23","HG-G24"],
  "GN.586G-12 (12 colors)":["HG-G25","HG-G26","HG-G27","HG-G28","HG-G29","HG-G30","HG-G31","HG-G32","HG-G33","HG-G34","HG-G35","HG-G36"],
  "GN.586H-12 (12 colors)":["HG-P01","HG-P02","HG-P03","HG-P04","HG-P05","HG-P06","HG-P07","HG-P08","HG-P09","HG-P10","HG-P11","HG-P12"],
  "GN.586I-12 (12 colors)":["HG-R01","HG-R02","HG-R03","HG-R04","HG-R05","HG-R06","HG-R07","HG-R08","HG-R09","HG-R10","HG-R11","HG-R12"],
  "GN.586J-12 (12 colors)":["HG-Y01","HG-Y02","HG-Y03","HG-Y04","HG-Y05","HG-Y06","HG-Y07","HG-Y08","HG-Y09","HG-Y10","HG-Y11","HG-Y12"],
  "GN.586K-12 (12 colors)":["HG-Z01","HG-Z02","HG-Z03","HG-Z04","HG-Z05","HG-Z06","HG-Z07","HG-Z08","HG-Z09","HG-Z10","HG-Z11","HG-Z12"],
  "GN.586L-12 (12 colors)":["HG-F01","HG-F02","HG-F03","HG-F04","HG-F05","HG-F06","HG-F07","HG-F08","HG-F09","HG-F10","HG-F11","HG-F12"],
  "GN.586M-12 (12 colors)":["HG-F13","HG-F14","HG-F15","HG-F16","HG-F17","HG-F18","HG-F19","HG-F20","HG-F21","HG-F22","HG-F23","HG-F24"],
  "GN.586N-12 (12 colors)":["HG-F25","HG-F26","HG-F27","HG-F28","HG-F29","HG-F30","HG-F31","HG-F32","HG-F33","HG-F34","HG-F35","HG-F36"],
};

export const SET_OPTIONS = [
  { label: "Classic brush-488", key: "GN.8101-488 (488 colors)" },
  { label: "Classic brush-408", key: "GN.8101-408 (360 colors)" },
  { label: "Classic brush-366", key: "GN.8101-366 (366 colors)" },
  { label: "Classic brush-360", key: "GN.8101-360 (360 colors)" },
  { label: "Classic brush-288", key: "GN.8101-288 (288 colors)" },
  { label: "Classic brush-240", key: "GN.8101-240 (240 colors)" },
  { label: "Classic brush-168", key: "GN.8101-168 (168 colors)" },
  { label: "Classic brush-120", key: "GN.8101-120 (120 colors)" },
  { label: "Classic brush-100", key: "GN.8101-100 (100 colors)" },
  { label: "Classic brush-72",  key: "GN.8101-72 (72 colors)"  },
  { label: "Classic brush-60",  key: "GN.8101-60 (60 colors)"  },
  { label: "Classic brush-48",  key: "GN.8101-48 (48 colors)"  },
  { label: "Classic brush-36",  key: "GN.8101-36 (36 colors)"  },
  { label: "Classic brush-24",  key: "GN.8101-24 (24 colors)"  },
  { label: "Classic brush-12",  key: "GN.8101-12 (12 colors)"  },
  { label: "Classic Brush: Skin (24F)", key: "GN.8201F-24 (24 colors)" },
  { label: "Dual tip: 240",     key: "GN.8109-240 (240 colors)" },
  { label: "Dual tip: 72",      key: "GN.8109-72 (72 colors)"  },
  { label: "Dual tip: 36",      key: "GN.8102-36 (36 colors)"  },
  { label: "Dual colors 84/168",key: "GN.8106-84 (168 colors)" },
  { label: "Dual colors 60/120",key: "GN.8106-60 (120 colors)" },
  { label: "Dual colors 30/60", key: "GN.8106-30 (60 colors)"  },
  { label: "Dual tip: Blue",    key: "GN.8109A-12 (12 colors)" },
  { label: "Dual tip: Pink",    key: "GN.8109B-12 (12 colors)" },
  { label: "Dual tip: Green",   key: "GN.8109C-12 (12 colors)" },
  { label: "Dual tip: Red",     key: "GN.8109D-12 (12 colors)" },
  { label: "Dual tip: Purple",  key: "GN.8109E-12 (12 colors)" },
  { label: "Dual tip: Yellow",  key: "GN.8109F-12 (12 colors)" },
  { label: "Dual tip: Warm skin",     key: "GN.8109G-12 (12 colors)" },
  { label: "Dual tip: Reddish brown", key: "GN.8109H-12 (12 colors)" },
  { label: "Dual tip: White-Gray",    key: "GN.8109I-12 (12 colors)" },
  { label: "Dual tip: Pinkish skin",  key: "GN.8109K-12 (12 colors)" },
  { label: "Classic Brush: Skin (12B)", key: "GN.8201B-12 (12 colors)"  },
  { label: "Macaron",           key: "GN.8201M-24 (24 colors)"    },

  // --- Metallic Colors (48) ---
  { label: "Metallic Colors",   key: "GN.8301-Metallic (48 colors)" },

  // --- High Gloss 168 (GN.586 line) ---
  { label: "High Gloss-288", key: "GN.586-288 (288 colors)" },
  { label: "High Gloss-168", key: "GN.586-168 (168 colors)" },
  { label: "High Gloss A: Fluorescent", key: "GN.586A-12 (12 colors)" },
  { label: "High Gloss B: Macaron", key: "GN.586B-12 (12 colors)" },
  { label: "High Gloss C: Marine Blue", key: "GN.586C-12 (12 colors)" },
  { label: "High Gloss D: Grayish/Cyan", key: "GN.586D-12 (12 colors)" },
  { label: "High Gloss E: Grass Green", key: "GN.586E-12 (12 colors)" },
  { label: "High Gloss F: Bluish Green", key: "GN.586F-12 (12 colors)" },
  { label: "High Gloss G: Grayish Green", key: "GN.586G-12 (12 colors)" },
  { label: "High Gloss H: Peach Pink", key: "GN.586H-12 (12 colors)" },
  { label: "High Gloss I: Fiery Red", key: "GN.586I-12 (12 colors)" },
  { label: "High Gloss J: Orange Yellow", key: "GN.586J-12 (12 colors)" },
  { label: "High Gloss K: Purple Lotus", key: "GN.586K-12 (12 colors)" },
  { label: "High Gloss L: Brown", key: "GN.586L-12 (12 colors)" },
  { label: "High Gloss M: Light Skin", key: "GN.586M-12 (12 colors)" },
  { label: "High Gloss N: Warm Skin", key: "GN.586N-12 (12 colors)" },
  { label: "High Gloss O: Misty Deep Blue", key: "GN.586O-12 (12 colors)" },
  { label: "High Gloss P: Twilight Lilac Purple", key: "GN.586P-12 (12 colors)" },
  { label: "High Gloss Q: Vermilion Terracotta", key: "GN.586Q-12 (12 colors)" },
  { label: "High Gloss R: Clay Oat Earth", key: "GN.586R-12 (12 colors)" },
  { label: "High Gloss S: Autumn Forest Brown", key: "GN.586S-12 (12 colors)" },
  { label: "High Gloss T: Pine & Sea Teal", key: "GN.586T-12 (12 colors)" },
  { label: "High Gloss U: Spring Bamboo Green", key: "GN.586U-12 (12 colors)" },
  { label: "High Gloss V: Golden Tangerine Glow", key: "GN.586V-12 (12 colors)" },
  { label: "High Gloss W: Cloudy Twilight Grey", key: "GN.586W-12 (12 colors)" },
  { label: "High Gloss X: Natural Soft Glow", key: "GN.586X-12 (12 colors)" },
];

export type MatchResult = { code: string; name: string; rgb: [number, number, number] };

export function rgbToLab([r, g, b]: [number, number, number]): [number, number, number] {
  const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lr = lin(r), lg = lin(g), lb = lin(b);
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = (lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750) / 1.0;
  const z = (lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041) / 1.08883;
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function deltaE(lab1: [number, number, number], lab2: [number, number, number]) {
  return Math.sqrt((lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2);
}

export function findClosest(rgb: [number, number, number], ids: string[]): MatchResult {
  const labT = rgbToLab(rgb);
  let bestId = "", bestD = Infinity;
  for (const id of ids) {
    const c = GN_COLORS[id];
    if (!c) continue;
    const d = deltaE(labT, rgbToLab([c[0], c[1], c[2]]));
    if (d < bestD) { bestD = d; bestId = id; }
  }
  const c = GN_COLORS[bestId];
  return { code: bestId, name: c[3], rgb: [c[0], c[1], c[2]] };
}

// Returns the n closest Guangna matches to rgb, sorted nearest-first.
// Used by LanguoConverter to show the top 3 candidates instead of a
// single best guess -- useful when the true best match is a judgment
// call between two or three close options, which happens often when
// matching across different marker brands' color ranges.
export function findClosestN(rgb: [number, number, number], ids: string[], n: number): MatchResult[] {
  const labT = rgbToLab(rgb);
  const scored: { id: string; d: number }[] = [];
  for (const id of ids) {
    const c = GN_COLORS[id];
    if (!c) continue;
    const d = deltaE(labT, rgbToLab([c[0], c[1], c[2]]));
    scored.push({ id, d });
  }
  scored.sort((a, b) => a.d - b.d);
  return scored.slice(0, n).map(({ id }) => {
    const c = GN_COLORS[id];
    return { code: id, name: c[3], rgb: [c[0], c[1], c[2]] as [number, number, number] };
  });
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

export function rgbToHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

// Normalizes a free-typed "extra marker code" token to its GN_COLORS
// key, or null if it doesn't match either code family or isn't a real
// entry. Handles both code namespaces:
//   - Classic-brush codes: digits only, with or without a "GN-" prefix
//     ("605", "GN-605", "gn605" all resolve to "GN-605")
//   - High Gloss codes: one letter + 2 digits, with or without an
//     "HG-" prefix ("F01", "HG-F01", "hg-f01" all resolve to "HG-F01")
// Shared by every "My Markers" extra-codes free-text input across the
// converter pages, so the same parsing rules apply everywhere rather
// than each page re-implementing (and potentially drifting from) its
// own regex.
export function normalizeExtraCode(token: string): string | null {
  const t = token.trim().toUpperCase();
  if (!t) return null;
  const withoutGN = t.replace(/^GN-?/, "");
  const withoutHG = t.replace(/^HG-?/, "");
  let id: string | null = null;
  if (/^\d+$/.test(withoutGN)) {
    id = `GN-${withoutGN}`;
  } else if (/^[A-Z]\d{2}$/.test(withoutHG)) {
    id = `HG-${withoutHG}`;
  }
  return id && GN_COLORS[id] ? id : null;
}