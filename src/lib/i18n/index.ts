import esPR from "./es-PR.json";

export type Locale = "es-PR";

const dictionaries: Record<Locale, Record<string, string>> = {
  "es-PR": esPR as Record<string, string>,
};

let currentLocale: Locale = "es-PR";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, fallback?: string): string {
  const dict = dictionaries[currentLocale] ?? dictionaries["es-PR"];
  return dict[key] ?? fallback ?? key;
}

export { esPR };
