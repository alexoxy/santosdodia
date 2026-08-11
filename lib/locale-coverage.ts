import { PUBLIC_LOCALES, type Locale } from "./i18n";

export type LocaleCoverage = "complete" | "internal-review";

export function localeCoverage(locale: Locale): LocaleCoverage {
  return (PUBLIC_LOCALES as readonly string[]).includes(locale) ? "complete" : "internal-review";
}

export function localeOptionLabel(locale: Locale, label: string) {
  return localeCoverage(locale) === "complete" ? label : `${label} — review`;
}

const notices:Partial<Record<Locale,string>>={
 de:'Deutsch wird erst wieder öffentlich angeboten, wenn alle Produktoberflächen vollständig geprüft sind.',
 pl:'Język polski zostanie ponownie udostępniony publicznie po pełnej weryfikacji wszystkich powierzchni produktu.',
 ru:'Русский язык снова появится в публичном выборе после полной проверки всех разделов продукта.',
 fil:'Ibabalik ang Filipino sa pampublikong pagpili kapag kumpleto na ang pagsusuri ng lahat ng bahagi ng produkto.',
 sw:'Kiswahili kitarudishwa kwenye chaguo la umma baada ya ukaguzi kamili wa sehemu zote za bidhaa.'
};
export function localeCoverageNotice(locale: Locale) {
  return notices[locale]??"";
}
