#!/usr/bin/env bash
# Run from your repo root: bash audit-footers.sh
#
# Lists every app/[locale]/**/page.tsx and tells you which bucket it's in:
#   HAS FOOTER   -- contains an inline <footer> block (like the one you
#                   pasted) -- replace that block with <Footer />
#   NO FOOTER    -- has no <footer> tag at all -- add <Footer /> as a
#                   sibling right after </main>
#
# This only reports; it doesn't edit anything, since a blind find/replace
# across JSX is too easy to get subtly wrong (different indentation,
# already-partial edits, etc). Use it as a checklist.

echo "Scanning app/[locale] for page.tsx files..."
echo

find app -path "*/\[locale\]/*page.tsx" | sort | while read -r file; do
  if grep -q "<footer" "$file"; then
    echo "HAS FOOTER   $file"
  else
    echo "NO FOOTER    $file"
  fi
done

echo
echo "For HAS FOOTER files: replace the whole <footer>...</footer> block"
echo "  with <Footer /> (and add: import Footer from \"<path-to-Footer>\";)"
echo "For NO FOOTER files: add <Footer /> as a sibling immediately after"
echo "  the closing </main> tag (not nested inside it)."
