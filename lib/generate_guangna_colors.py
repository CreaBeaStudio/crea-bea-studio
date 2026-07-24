#!/usr/bin/env python3
"""
generate_guangna_colors.py
─────────────────────────────────────────────
Regenerates the GUANGNA_COLORS dict literal for pbn_guangna.py from the
canonical guangna-colors.json -- this is the single source of truth for
Guangna color data (name, sRGB, Adobe RGB), shared between the Python
backend (pbn-webservice) and the TypeScript frontend (crea-bea-studio).

Run this, then paste the printed output over the existing GUANGNA_COLORS
block in pbn_guangna.py, whenever guangna-colors.json changes.

Usage: python3 generate_guangna_colors.py > guangna_colors_output.txt
"""

import json
import sys

def main():
    with open("guangna-colors.json") as f:
        data = json.load(f)

    print("GUANGNA_COLORS = {")
    for code, entry in data.items():
        name = entry["name"].replace('"', '\\"')
        sr, sg, sb = entry["srgb"]
        if entry["adobe_rgb"] is None:
            # No authoritative Adobe RGB on record -- do NOT invent one.
            # Using sRGB as a clearly-flagged placeholder so the field
            # still holds a plausible tuple rather than None (which
            # could break code that assumes a 3-tuple), while making it
            # impossible to miss that this one needs a real source value.
            print(f'    "{code}": {{"name": "{name}", "rgb": ({sr}, {sg}, {sb}), '
                  f'"adobe_rgb": ({sr}, {sg}, {sb})}},  # TODO: real Adobe RGB unknown, placeholder = sRGB')
        else:
            ar, ag, ab = entry["adobe_rgb"]
            print(f'    "{code}": {{"name": "{name}", "rgb": ({sr}, {sg}, {sb}), "adobe_rgb": ({ar}, {ag}, {ab})}},')
    print("}")

if __name__ == "__main__":
    main()
