import { createTranslator } from "next-intl";

// ── SERVER-SIDE EMAIL I18N (2026-07-27) ──────────────────────────────
// lib/email.ts runs with no request/React context -- there's no
// NextIntlClientProvider tree to pull from, so useTranslations() isn't
// available here. next-intl's createTranslator() is the documented
// escape hatch for exactly this case: give it a locale + the raw
// messages object + a namespace, get back the same kind of translator
// function useTranslations() would have handed a component.
//
// ASSUMPTION: messages live at messages/<locale>.json at the project
// root, per the standard next-intl convention (matches how the rest of
// this project's i18n has been described). Adjust these import paths
// if your actual layout differs -- Claude hasn't seen the real
// messages/ directory to confirm it.
import en from "@/messages/en.json";
import nl from "@/messages/nl.json";
import de from "@/messages/de.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";

const MESSAGES: Record<string, any> = { en, nl, de, es, fr, it };

// Falls back to English for an unrecognized locale (e.g. old orders
// placed before the `locale` field existed on order.json, or a typo
// somehow reaching here) rather than throwing -- a wrong-language
// delivery email is a much smaller problem than a failed delivery
// email.
export function getEmailTranslator(locale: string, namespace: string) {
  const resolvedLocale = MESSAGES[locale] ? locale : "en";
  return createTranslator({
    locale: resolvedLocale,
    messages: MESSAGES[resolvedLocale],
    namespace,
  });
}