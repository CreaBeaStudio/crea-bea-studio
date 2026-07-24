#!/usr/bin/env python3
"""
generate_guangna_sets.py
─────────────────────────────────────────────
Regenerates the GUANGNA_SETS dict literal for pbn_guangna.py from the
canonical guangna-sets.json -- companion to generate_guangna_colors.py,
same reasoning: this is the single source of truth for which codes
belong to which marker set, shared between the Python backend
(pbn-webservice) and the TypeScript frontend (crea-bea-studio).

Run this, then paste the printed output over the existing GUANGNA_SETS
block in pbn_guangna.py, whenever guangna-sets.json changes.

Usage: python3 generate_guangna_sets.py > guangna_sets_output.txt
"""

import json

def main():
    with open("guangna-sets.json") as f:
        data = json.load(f)

    print("GUANGNA_SETS = {")
    for label, codes in data.items():
        codes_str = ", ".join(f'"{c}"' for c in codes)
        print(f'    "{label}": [{codes_str}],')
    print("}")
    print()
    print("GUANGNA_SET_OPTIONS = list(GUANGNA_SETS.keys())")

if __name__ == "__main__":
    main()
