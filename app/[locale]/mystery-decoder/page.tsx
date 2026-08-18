"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MysteryDecoderPacks from "../components/MysteryDecoderPacks";
import MysteryDecoderCustom from "../components/MysteryDecoderCustom";

// Save as app/[locale]/mystery-decoder/page.tsx
// Adjust the relative import paths above if your route folder is
// nested differently from where components/ sits.
//
// v2 (2026-08-15): added a top-level mode toggle between the existing
// ready-made pack selector (MysteryDecoderPacks -- static PDFs, direct
// LemonSqueezy checkout, no webhook) and the new Custom decoder
// builder (MysteryDecoderCustom -- picks her own owned marker sets,
// live client-side free preview; full-unlock payment flow still a
// stub, see that component's own header comment). Reuses the exact
// same pill-button toggle style MysteryDecoderPacks.tsx already uses
// for its own brand-family step (decoder-family-btn/-row classes),
// just one level up, so the two toggles look visually consistent
// rather than introducing a second competing UI pattern.
//
// v3 (2026-08-15): mode-toggle labels now go through next-intl's t()
// under the EXISTING "mysteryDecoder" namespace (the same one
// MysteryDecoderPacks.tsx already uses) rather than being hardcoded --
// only 2 new keys needed there (modeReadyMadeLabel, modeCustomLabel),
// see the EN snippet in the code comment right above where they're
// used below.
//
// "use client" is required here now (it wasn't before) because this
// page itself holds the toggle's useState -- if your actual page.tsx
// has other server-only logic (metadata exports, etc.) that conflicts
// with "use client", that logic needs to move into a child component
// or a separate layout file; flag it if that's the case and I'll
// restructure.

type Mode = "packs" | "custom";

export default function MysteryDecoderPage() {
  const t = useTranslations("mysteryDecoder");
  const [mode, setMode] = useState<Mode>("packs");

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>
        <style>{`
          .mdp-mode-row {
            display: flex;
            gap: 10px;
            margin-bottom: 28px;
          }
          .mdp-mode-btn {
            padding: 10px 22px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: white;
            font-size: 14px;
            font-weight: 800;
            color: var(--ink);
            cursor: pointer;
          }
          .mdp-mode-btn.active {
            border-color: var(--pink);
            background: var(--pink);
            color: white;
          }
        `}</style>

        {/* NEW translation keys needed under the EXISTING "mysteryDecoder"
            namespace (add alongside its current keys, e.g. selectBrandLabel,
            selectBookLabel, etc.):
              "modeReadyMadeLabel": "Ready-made Decoders",
              "modeCustomLabel": "Build Your Own"
        */}
        <div className="mdp-mode-row">
          <button
            type="button"
            className={`mdp-mode-btn${mode === "packs" ? " active" : ""}`}
            onClick={() => setMode("packs")}
          >
            {t("modeReadyMadeLabel")}
          </button>
          <button
            type="button"
            className={`mdp-mode-btn${mode === "custom" ? " active" : ""}`}
            onClick={() => setMode("custom")}
          >
            {t("modeCustomLabel")}
          </button>
        </div>

        {mode === "packs" ? <MysteryDecoderPacks /> : <MysteryDecoderCustom />}
      </main>
      <Footer />
    </div>
  );
}