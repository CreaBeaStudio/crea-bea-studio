import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'nl', 'fr', 'de', 'it', 'es'] as const;
export const defaultLocale = 'en';

// Deep-merges `overrides` on top of `base`, key by key. Any key present
// in `base` (English) but missing from `overrides` (the active locale)
// is kept from `base` -- this is what makes a missing translation show
// the English text instead of next-intl's raw "namespace.key" fallback
// string (e.g. the "nav.mysteryDecoder" bug from 2026-07-29).
function deepMergeMessages(
  base: Record<string, any>,
  overrides: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...base };

  for (const key of Object.keys(overrides)) {
    const baseValue = base[key];
    const overrideValue = overrides[key];

    if (
      baseValue &&
      overrideValue &&
      typeof baseValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = deepMergeMessages(baseValue, overrideValue);
    } else {
      // Primitive, array, or a type mismatch between base/override --
      // the locale's own value wins as long as it isn't empty.
      result[key] = overrideValue;
    }
  }

  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  const englishMessages = (await import('./messages/en.json')).default;

  // English has nothing to merge against itself.
  if (locale === 'en') {
    return { locale, messages: englishMessages };
  }

  const localeMessages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMergeMessages(englishMessages, localeMessages)
  };
});