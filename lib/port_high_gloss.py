"""
Run this from INSIDE lib/ (so guangna.ts is right next to it):
    cd ~/crea-bea-studio/lib
    python3 port_high_gloss.py

Reads the REAL lib/guangna.ts file directly and mechanically converts
every "HG-Xnn":[r,g,b,"code"] entry (any letter series -- F, G, H, L,
P, R, Y, Z, confirmed via a real grep, not just HG-F) into
pbn_guangna.py's dict format -- no manual retyping of any RGB value.

Prints two blocks:
  1. GUANGNA_COLORS entries -- paste into pbn_guangna.py's
     GUANGNA_COLORS dict
  2. ONE new GUANGNA_SETS entry -- "GN.586-168 (168 colors)": [...] --
     paste into pbn_guangna.py's GUANGNA_SETS dict

NOTE: the set is named "...168 (168 colors)" in the existing frontend
label, but the REAL number of HG- entries in guangna.ts may not be
exactly 168 (a real grep found 185 total HG- matches, across several
letter series) -- this script ports whatever the ACTUAL entries are,
using the real label string as-is (since that's what the frontend
already sends and the backend must match byte-for-byte), regardless
of whether the true count matches the "168" in the label's own text.
That's a pre-existing cosmetic naming detail, not something this
script tries to correct -- worth a look later if you want the label
itself to reflect the real count.

NOTE on "name"/"adobe_rgb": guangna.ts's array format has no
descriptive name or separate Adobe RGB value, so this generates
placeholder names ("High Gloss F01" etc) and reuses rgb for
adobe_rgb. Fine to hand-edit names afterward if you want nicer ones.
"""
import re
import sys

GUANGNA_TS_PATH = "guangna.ts"  # run this script from inside lib/, next to guangna.ts

with open(GUANGNA_TS_PATH, "r") as f:
    content = f.read()

# Matches "HG-<letters><digits>":[r,g,b,"suffix"] -- any letter series,
# not just F. Confirmed via a real grep that F/G/H/L/P/R/Y/Z all exist.
pattern = re.compile(r'"(HG-[A-Za-z]+\d+)":\[(\d+),(\d+),(\d+),"([^"]+)"\]')
matches = pattern.findall(content)

if not matches:
    print(f"ERROR: found zero HG- entries in {GUANGNA_TS_PATH} -- check the path is correct")
    print("(run this script from inside lib/, next to guangna.ts)")
    sys.exit(1)

print(f"# Found {len(matches)} High Gloss entries (across all letter series).")
print(f"# Real grep count of any '\\\"HG-' match was 185 -- if this number is")
print(f"# noticeably lower than that, some entries used a format this regex")
print(f"# didn't anticipate; paste this script's count back for a check.\n")

print("# ============================================================")
print("# 1. Paste these into pbn_guangna.py's GUANGNA_COLORS dict:")
print("# ============================================================")
for code, r, g, b, suffix in matches:
    print(f'    "{code}": {{"name": "High Gloss {suffix}", "rgb": ({r}, {g}, {b}), "adobe_rgb": ({r}, {g}, {b})}},')

print()
print("# ============================================================")
print("# 2. Paste this ONE line into pbn_guangna.py's GUANGNA_SETS dict:")
print("# ============================================================")
codes_list = ", ".join(f'"{code}"' for code, *_ in matches)
print(f'    "GN.586-168 (168 colors)": [{codes_list}],')