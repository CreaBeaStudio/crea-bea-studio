#!/bin/bash
# Adds the new "coloringPages" translation block + "nav.freeColoringPages"
# label to all 6 locale files, using jq's deep-merge so it can't clobber
# anything else already in those files.
#
# Run this from your project ROOT (the folder that contains "messages/").
# Requires jq: if you don't have it, run `brew install jq` first.
#
#   chmod +x add-coloring-pages-translations.sh
#   ./add-coloring-pages-translations.sh

set -e

if ! command -v jq &> /dev/null; then
  echo "jq is not installed. Run: brew install jq"
  exit 1
fi

if [ ! -d "messages" ]; then
  echo "No 'messages' folder found here — run this from your project root."
  exit 1
fi

merge_locale() {
  local locale="$1"
  local fragment_file="/tmp/_cbs_fragment_${locale}.json"
  local target="messages/${locale}.json"

  if [ ! -f "$target" ]; then
    echo "⚠️  Skipping $locale — messages/${locale}.json not found"
    return
  fi

  cat "$fragment_file" > /tmp/_cbs_check.json
  jq empty /tmp/_cbs_check.json  # fails loudly if the fragment itself is malformed

  jq -s '.[0] * .[1]' "$target" "$fragment_file" > "${target}.tmp"
  mv "${target}.tmp" "$target"
  echo "✅ updated $target"
}

# ── EN ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_en.json << 'EOF'
{
  "nav": { "freeColoringPages": "Free Coloring Pages" },
  "coloringPages": {
    "metaTitle": "Free Coloring Pages | CreaBeaStudio",
    "metaDescription": "Download free printable coloring pages from CreaBeaStudio. New designs added regularly — enjoy, and consider leaving a tip if you'd like to support future pages.",
    "title": "Free Coloring Pages",
    "subtitle": "Download and print these coloring pages for free. If you enjoy them, a small tip helps me keep making more.",
    "backToAll": "Back to all coloring pages",
    "viewPage": "View",
    "comingSoon": "Coming soon",
    "exampleLabel": "Example",
    "previewLabel": "Preview",
    "crossLink": { "text": "Want to turn your own photo into a paint-by-number?", "linkText": "Try the Legend Converter →" },
    "downloadButton": "Download PDF",
    "donate": {
      "text": "Enjoying these free pages? A small tip helps me create more.",
      "button": "Support on Ko-fi"
    }
  }
}
EOF
merge_locale "en"

# ── NL ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_nl.json << 'EOF'
{
  "nav": { "freeColoringPages": "Gratis Kleurplaten" },
  "coloringPages": {
    "metaTitle": "Gratis Kleurplaten | CreaBeaStudio",
    "metaDescription": "Download gratis printbare kleurplaten van CreaBeaStudio. Regelmatig nieuwe ontwerpen — veel plezier, en overweeg een fooi te geven als je toekomstige kleurplaten wilt steunen.",
    "title": "Gratis Kleurplaten",
    "subtitle": "Download en print deze kleurplaten gratis. Vind je ze leuk? Een kleine fooi helpt me om er meer te maken.",
    "backToAll": "Terug naar alle kleurplaten",
    "viewPage": "Bekijk",
    "comingSoon": "Binnenkort beschikbaar",
    "exampleLabel": "Voorbeeld",
    "previewLabel": "Kleurplaat",
    "crossLink": { "text": "Wil je van je eigen foto een paint-by-number maken?", "linkText": "Probeer de Legend Converter →" },
    "downloadButton": "Download PDF",
    "donate": {
      "text": "Geniet je van deze gratis kleurplaten? Een kleine fooi helpt me om er meer te maken.",
      "button": "Steun op Ko-fi"
    }
  }
}
EOF
merge_locale "nl"

# ── DE ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_de.json << 'EOF'
{
  "nav": { "freeColoringPages": "Kostenlose Ausmalbilder" },
  "coloringPages": {
    "metaTitle": "Kostenlose Ausmalbilder | CreaBeaStudio",
    "metaDescription": "Lade kostenlose, druckbare Ausmalbilder von CreaBeaStudio herunter. Regelmäßig neue Designs — viel Freude, und wenn du magst, unterstütze mit einem kleinen Trinkgeld weitere Ausmalbilder.",
    "title": "Kostenlose Ausmalbilder",
    "subtitle": "Lade diese Ausmalbilder kostenlos herunter und drucke sie aus. Gefallen sie dir? Ein kleines Trinkgeld hilft mir, mehr davon zu erstellen.",
    "backToAll": "Zurück zu allen Ausmalbildern",
    "viewPage": "Ansehen",
    "comingSoon": "Demnächst verfügbar",
    "exampleLabel": "Beispiel",
    "previewLabel": "Vorschau",
    "crossLink": { "text": "Möchtest du dein eigenes Foto in ein Paint-by-Number verwandeln?", "linkText": "Legend Converter ausprobieren →" },
    "downloadButton": "PDF herunterladen",
    "donate": {
      "text": "Gefallen dir diese kostenlosen Ausmalbilder? Ein kleines Trinkgeld hilft mir, mehr zu erstellen.",
      "button": "Unterstütze auf Ko-fi"
    }
  }
}
EOF
merge_locale "de"

# ── FR ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_fr.json << 'EOF'
{
  "nav": { "freeColoringPages": "Coloriages Gratuits" },
  "coloringPages": {
    "metaTitle": "Coloriages Gratuits | CreaBeaStudio",
    "metaDescription": "Téléchargez des coloriages imprimables gratuits de CreaBeaStudio. De nouveaux designs régulièrement — profitez-en, et envisagez un petit pourboire pour soutenir de futurs coloriages.",
    "title": "Coloriages Gratuits",
    "subtitle": "Téléchargez et imprimez ces coloriages gratuitement. Vous les aimez ? Un petit pourboire m'aide à en créer davantage.",
    "backToAll": "Retour à tous les coloriages",
    "viewPage": "Voir",
    "comingSoon": "Bientôt disponible",
    "exampleLabel": "Exemple",
    "previewLabel": "Aperçu",
    "crossLink": { "text": "Envie de transformer votre propre photo en peinture par numéros ?", "linkText": "Essayez le Legend Converter →" },
    "downloadButton": "Télécharger le PDF",
    "donate": {
      "text": "Vous aimez ces coloriages gratuits ? Un petit pourboire m'aide à en créer davantage.",
      "button": "Soutenir sur Ko-fi"
    }
  }
}
EOF
merge_locale "fr"

# ── IT ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_it.json << 'EOF'
{
  "nav": { "freeColoringPages": "Disegni Gratis" },
  "coloringPages": {
    "metaTitle": "Disegni da Colorare Gratis | CreaBeaStudio",
    "metaDescription": "Scarica disegni da colorare gratuiti e stampabili di CreaBeaStudio. Nuovi design regolarmente — buon divertimento, e se vuoi, lascia una piccola mancia per sostenere nuovi disegni.",
    "title": "Disegni da Colorare Gratis",
    "subtitle": "Scarica e stampa questi disegni da colorare gratuitamente. Ti piacciono? Una piccola mancia mi aiuta a crearne altri.",
    "backToAll": "Torna a tutti i disegni",
    "viewPage": "Visualizza",
    "comingSoon": "Prossimamente",
    "exampleLabel": "Esempio",
    "previewLabel": "Anteprima",
    "crossLink": { "text": "Vuoi trasformare la tua foto in un dipinto per numeri?", "linkText": "Prova il Legend Converter →" },
    "downloadButton": "Scarica PDF",
    "donate": {
      "text": "Ti piacciono questi disegni gratuiti? Una piccola mancia mi aiuta a crearne altri.",
      "button": "Sostienimi su Ko-fi"
    }
  }
}
EOF
merge_locale "it"

# ── ES ──────────────────────────────────────────────────────────
cat > /tmp/_cbs_fragment_es.json << 'EOF'
{
  "nav": { "freeColoringPages": "Páginas Gratis" },
  "coloringPages": {
    "metaTitle": "Páginas para Colorear Gratis | CreaBeaStudio",
    "metaDescription": "Descarga páginas para colorear gratuitas e imprimibles de CreaBeaStudio. Nuevos diseños con regularidad — disfrútalos, y si quieres, deja una propina para apoyar futuros diseños.",
    "title": "Páginas para Colorear Gratis",
    "subtitle": "Descarga e imprime estas páginas para colorear gratis. ¿Te gustan? Una pequeña propina me ayuda a crear más.",
    "backToAll": "Volver a todas las páginas",
    "viewPage": "Ver",
    "comingSoon": "Próximamente",
    "exampleLabel": "Ejemplo",
    "previewLabel": "Vista previa",
    "crossLink": { "text": "¿Quieres convertir tu propia foto en una pintura por números?", "linkText": "Prueba el Legend Converter →" },
    "downloadButton": "Descargar PDF",
    "donate": {
      "text": "¿Disfrutas de estas páginas gratuitas? Una pequeña propina me ayuda a crear más.",
      "button": "Apóyame en Ko-fi"
    }
  }
}
EOF
merge_locale "es"

rm -f /tmp/_cbs_fragment_*.json /tmp/_cbs_check.json
echo ""
echo "Done. Diff your messages/*.json files to confirm before committing."
