#!/bin/bash
set -e

FILES=("cat-logo.png" "detail-adv.png" "detail-beginner.png" "detail-int.png" "Dog_Legend4.png" "GN_Palette_landscape.png" "Guangna_brush.png" "guangna-marker.png" "logo-full.png")

for f in "${FILES[@]}"; do
  if [ -f "public/$f" ]; then
    git mv "public/$f" "public/marketing/$f"
    echo "Moved $f"
  else
    echo "Skipped $f (not found at public/ root)"
  fi
done

if [ -f "public/5_Options.jpeg" ]; then
  git mv "public/5_Options.jpeg" "public/marketing/5_Options.jpeg"
  echo "Moved 5_Options.jpeg"
fi

sed -i '' 's#/Guangna_brush\.png#/marketing/Guangna_brush.png#g' \
  "app/[locale]/free-coloring-pages/page.tsx" \
  "app/[locale]/confirm/page.tsx" \
  "app/[locale]/color-converter/page.tsx" \
  "app/[locale]/legend-converter/page.tsx" \
  "app/[locale]/page.tsx"

sed -i '' 's#/cat-logo\.png#/marketing/cat-logo.png#g' "app/[locale]/components/Navbar.tsx"

sed -i '' 's#/logo-full\.png#/marketing/logo-full.png#g' \
  "app/[locale]/legend-converter/page.tsx" \
  "app/[locale]/page.tsx"

sed -i '' \
  -e 's#/detail-beginner\.png#/marketing/detail-beginner.png#g' \
  -e 's#/detail-int\.png#/marketing/detail-int.png#g' \
  -e 's#/detail-adv\.png#/marketing/detail-adv.png#g' \
  -e 's#/guangna-marker\.png#/marketing/guangna-marker.png#g' \
  -e 's#/Dog_Legend4\.png#/marketing/Dog_Legend4.png#g' \
  -e 's#/GN_Palette_landscape\.png#/marketing/GN_Palette_landscape.png#g' \
  "app/[locale]/page.tsx"

echo "Done. Verifying no old references remain:"
grep -rn 'src="/cat-logo\|src="/detail-adv\|src="/detail-int\|src="/detail-beginner\|src="/Dog_Legend4\|src="/5_Options\|src="/GN_Palette_landscape\|src="/Guangna_brush\|src="/guangna-marker\|src="/logo-full' app lib || echo "Clean — no old references left."
