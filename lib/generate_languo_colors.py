#!/usr/bin/env python3
"""
generate_languo_colors.py
─────────────────────────────────────────────
Regenerates the LANGUO_COLORS dict literal for pbn_guangna.py (or
wherever the Python side's Languo matching lives) from the canonical
languo-colors.json -- this is the single source of truth for Languo
color data (sRGB only -- Languo codes have no marker "name" the way
Guangna's do), shared between the Python backend (pbn-webservice) and
the TypeScript frontend (crea-bea-studio).

Unlike Guangna, there's no separate Adobe RGB field here -- Languo's
sRGB values were already derived from Adobe RGB once during the
original data conversion (see lib/languo.ts's header comments), so the
canonical JSON only carries the final sRGB.

Run this, then paste the printed output over the existing
LANGUO_COLORS block, whenever languo-colors.json changes.

Usage: python3 generate_languo_colors.py > languo_colors_output.txt
"""

import json

def main():
    with open("languo-colors.json") as f:
        data = json.load(f)

    print("LANGUO_COLORS = {")
    for code, entry in data.items():
        r, g, b = entry["rgb"]
        glitter = "True" if entry["glitter"] else "False"
        print(f'    "{code}": {{"rgb": ({r}, {g}, {b}), "glitter": {glitter}}},')
    print("}")
    print()
    print("LANGUO_GLITTER_IDS = [code for code, e in LANGUO_COLORS.items() if e[\"glitter\"]]")

if __name__ == "__main__":
    main()
