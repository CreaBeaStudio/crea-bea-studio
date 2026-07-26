// Shared mapping from the create page's level value ("15"/"24"/"36")
// to the translation key under the "create" namespace's levels.*
// block (levels.beginner / levels.intermediate / levels.advanced).
// Used by create/page.tsx, confirm/page.tsx, and lib/email.ts so all
// three agree on what these three values mean without each keeping
// its own copy to silently drift out of sync -- which is exactly what
// happened to fulfillOrder.ts's old hardcoded LEVEL_TO_LABEL (it still
// had the pre-migration per-difficulty prices baked into the label
// text, e.g. "🌱 Beginner (7€)", after pricing moved to flat A4/US
// Letter pricing on 2026-07-23).
//
// NOTE: create/page.tsx and confirm/page.tsx currently each still keep
// their own local copy of this exact mapping (LEVEL_KEYS /
// LEVEL_LABEL_KEYS) from before this shared file existed -- safe to
// swap those for an import from here next time either file is touched,
// not urgent on its own.
export const LEVEL_LABEL_KEYS: Record<string, string> = {
    "15": "levels.beginner",
    "24": "levels.intermediate",
    "36": "levels.advanced",
  };