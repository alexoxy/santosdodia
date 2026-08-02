import type { Locale } from '../i18n';
import type { Observance as LegacyObservance, Tradition } from '../../data/observances';
import type { LocalizedField, Observance as KnowledgeObservance, TranslationQuality } from './model';

const CHURCH_IDS: Record<Tradition, string> = {
  'roman-catholic': 'church:roman-catholic',
  'greek-orthodox': 'church:greek-orthodox',
  'eastern-orthodox': 'church:eastern-orthodox',
  anglican: 'church:anglican',
  'coptic-orthodox': 'church:coptic-orthodox',
  'armenian-apostolic': 'church:armenian-apostolic',
  'ethiopian-orthodox': 'church:ethiopian-orthodox',
  'syriac-orthodox': 'church:syriac-orthodox'
};

function translationQuality(item: LegacyObservance): TranslationQuality {
  if (item.translationStatus === 'official-name') return 'official';
  if (item.translationStatus === 'editorial') return 'editorial';
  if (item.translationStatus === 'assisted') return 'verified-machine-assisted';
  return 'source-only';
}

function localizedName(item: LegacyObservance): LocalizedField {
  const quality = Object.fromEntries(
    Object.keys(item.names).map(locale => [locale, translationQuality(item)])
  ) as Partial<Record<Locale, TranslationQuality>>;
  return { values: item.names, quality, sourceIds: item.sourceIds };
}

function scopeFor(item: LegacyObservance): KnowledgeObservance['scope'] {
  const countries = item.countries?.filter(Boolean) ?? [];
  const specificCountries = countries.filter(country => country !== 'GLOBAL');
  if (!specificCountries.length) return { kind: 'universal-in-church' };
  return {
    kind: 'geographic',
    geography: specificCountries.map(code => ({ level: 'country' as const, code }))
  };
}

export function adaptLegacyObservance(item: LegacyObservance): KnowledgeObservance[] {
  return item.traditions.map(tradition => ({
    id: `observance:${item.id}:${tradition}`,
    subjectIds: [`person:${item.id}`],
    churchId: CHURCH_IDS[tradition],
    calendarId: `calendar:${tradition}`,
    name: localizedName(item),
    // Legacy month/day values are already Gregorian civil dates. The legacy
    // calendarSystem field describes the ecclesial calendar context, not the
    // coordinate system in which month/day were stored.
    dateRule: {
      type: 'fixed',
      calendar: 'gregorian',
      month: item.month,
      day: item.day
    },
    scope: scopeFor(item),
    sourceIds: item.sourceIds,
    validFrom: undefined,
    validUntil: undefined
  }));
}

export function adaptLegacyObservances(items: LegacyObservance[]): KnowledgeObservance[] {
  return items.flatMap(adaptLegacyObservance);
}
