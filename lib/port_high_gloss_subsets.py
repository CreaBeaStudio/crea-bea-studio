"""
Run from inside lib/, next to guangna.ts:
    cd ~/crea-bea-studio/lib
    python3 port_high_gloss_subsets.py

Extracts the 14 High Gloss sub-set membership lists (GN.586A-12
through GN.586N-12, each a curated 12-code subset of the full
168-color set already ported) directly from the real guangna.ts --
no manual retyping of any code lists.

Prints one block: 14 GUANGNA_SETS entries, ready to paste into
pbn_guangna.py's GUANGNA_SETS dict (same dict the big "GN.586-168"
entry already lives in).
"""
import re
import sys

GUANGNA_TS_PATH = "guangna.ts"

with open(GUANGNA_TS_PATH, "r") as f:
    content = f.read()

# Matches "GN.586<letter>-12 (12 colors)": [ ...codes... ]
# re.DOTALL so this still works if the array spans multiple lines.
pattern = re.compile(r'"(GN\.586[A-N]-12 \(12 colors\))":\s*\[([^\]]*)\]', re.DOTALL)
matches = pattern.findall(content)

if not matches:
    print("ERROR: found zero GN.586<letter>-12 set definitions -- check the path,")
    print("or the actual key format may differ slightly from what this regex expects.")
    sys.exit(1)

print(f"# Found {len(matches)} High Gloss sub-sets. Expected 14 (A through N) --")
print(f"# if this doesn't match, some entries used a format this regex missed.\n")

for key, codes_raw in matches:
    codes = re.findall(r'"([^"]+)"', codes_raw)
    codes_str = ", ".join(f'"{c}"' for c in codes)
    print(f'    "{key}": [{codes_str}],  # {len(codes)} codes')
