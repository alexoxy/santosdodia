import type { Locale } from "./i18n";

export type LocaleCoverage = "complete";

export function localeCoverage(locale: Locale): LocaleCoverage {
  void locale;
  return "complete";
}

export function localeOptionLabel(locale: Locale, label: string) {
  void locale;
  return label;
}

export function localeCoverageNotice(locale: Locale) {
  void locale;
  return "";
}
