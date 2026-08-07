#!/usr/bin/env python3
"""
generate_languo_sets.py
─────────────────────────────────────────────
Regenerates the LANGUO_SETS dict literal (and a companion LANGUO_SET_LINES
dict, mapping each set label to which Languo product line it belongs to
-- "paint" | "gel" | "plus" | "qimiart") for the Python side, from the
canonical languo-sets.json -- companion to generate_languo_colors.py,
same reasoning: single source of truth shared between pbn-webservice
and crea-bea-studio.

LANGUO_SET_LINES is new (Guangna has no equivalent, since Guangna is a
single product line) -- it's what the multi-brand generation logic uses
to pick "the biggest set the customer doesn't already have" per line,
per Mirjam's branching rules (owns Guangna only -> Guangna 366 + upsell;
owns Languo-anything only -> biggest matching Languo line + upsell;
owns both -> both, skipping any line where they already have the
biggest set; owns neither -> natural only, no guide).

Run this, then paste the printed output over the existing LANGUO_SETS /
LANGUO_SET_LINES blocks, whenever languo-sets.json changes.

Usage: python3 generate_languo_sets.py > languo_sets_output.txt
"""

import json

def main():
    with open("languo-sets.json") as f:
        data = json.load(f)

    print("LANGUO_SETS = {")
    for label, entry in data.items():
        codes_str = ", ".join(f'"{c}"' for c in entry["codes"])
        print(f'    "{label}": [{codes_str}],')
    print("}")
    print()
    print("LANGUO_SET_LINES = {")
    for label, entry in data.items():
        print(f'    "{label}": "{entry["line"]}",')
    print("}")
    print()
    print("LANGUO_SET_OPTIONS = list(LANGUO_SETS.keys())")

if __name__ == "__main__":
    main()
