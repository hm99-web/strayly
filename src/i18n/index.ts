import en from './en.json';
import hi from './hi.json';

/**
 * Minimal i18n foundation. Screens currently use English strings directly;
 * migrate them to t() keys as translations are completed (post-MVP).
 * Swap for i18next + expo-localization when plural/interpolation needs grow.
 */
export type TranslationKey = keyof typeof en;
export type Locale = 'en' | 'hi';

const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = { en, hi };

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: TranslationKey): string {
  return dictionaries[currentLocale][key] ?? en[key] ?? key;
}
