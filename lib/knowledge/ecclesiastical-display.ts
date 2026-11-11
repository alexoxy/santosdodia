import type { Locale } from '../i18n';

const officeLabels: Record<string, Partial<Record<Locale, string>>> = {
  'pope-bishop-of-rome': { en: 'Pope and Bishop of Rome', pt: 'Papa e Bispo de Roma', es: 'Papa y Obispo de Roma', fr: 'Pape et évêque de Rome' },
  'diocesan-bishop': { en: 'Diocesan bishop', pt: 'Bispo diocesano', es: 'Obispo diocesano', fr: 'Évêque diocésain' },
  'primate-metropolitan': { en: 'Primate and metropolitan', pt: 'Primaz e metropolita', es: 'Primado y metropolitano', fr: 'Primat et métropolite' },
  'supreme-patriarch-catholicos': { en: 'Supreme Patriarch and Catholicos', pt: 'Patriarca Supremo e Catholicos', es: 'Patriarca Supremo y Catolicós', fr: 'Patriarche suprême et Catholicos' },
  'pope-of-alexandria-patriarch': { en: 'Pope of Alexandria and Patriarch', pt: 'Papa de Alexandria e Patriarca', es: 'Papa de Alejandría y Patriarca', fr: 'Pape d’Alexandrie et Patriarche' },
  bishop: { en: 'Bishop', pt: 'Bispo', es: 'Obispo', fr: 'Évêque' },
  archbishop: { en: 'Archbishop', pt: 'Arcebispo', es: 'Arzobispo', fr: 'Archevêque' },
  patriarch: { en: 'Patriarch', pt: 'Patriarca', es: 'Patriarca', fr: 'Patriarche' },
  'apostolic-administrator': { en: 'Apostolic administrator', pt: 'Administrador apostólico', es: 'Administrador apostólico', fr: 'Administrateur apostolique' }
};

const pageCopy = {
  en: {
    currentLeadership: 'Current leadership', officeSince: 'In office since', installed: 'Installed or enthroned',
    churchAndTerritory: 'Church and territory', jurisdictionContext: 'Jurisdiction context', childJurisdictions: 'Child jurisdictions',
    structure: 'Structure', openJurisdiction: 'Open jurisdiction', openChurch: 'Open Church profile', allChurches: 'All Churches',
    calendars: 'Calendar systems', datesRepresented: 'How dates are represented', jurisdictions: 'Jurisdictions',
    noLeadership: 'No current office holder has yet been published for this record.',
    traditionAndCalendar: 'Christian tradition and calendar family represented by this jurisdiction.',
    canonicalLevel: 'Canonical level represented by this record.',
    geographicScope: 'Geographic scope used to determine which local celebrations apply.',
    modelledChildren: 'Direct child jurisdictions currently modelled.',
    active: 'Active', officialWebsite: 'Official website',
    churchProfileIntro: 'Calendars, jurisdictions and celebrations connected with this Christian Church or tradition.',
    calendarEngineDescription: 'Fixed and movable celebrations are resolved by the calendar engine associated with this tradition.',
    jurisdictionDirectoryPending: 'Jurisdiction records are being added from official Church directories.'
  },
  pt: {
    currentLeadership: 'Liderança atual', officeSince: 'No cargo desde', installed: 'Instalado ou entronizado',
    churchAndTerritory: 'Igreja e território', jurisdictionContext: 'Contexto da jurisdição', childJurisdictions: 'Jurisdições dependentes',
    structure: 'Estrutura', openJurisdiction: 'Abrir jurisdição', openChurch: 'Abrir perfil da Igreja', allChurches: 'Todas as Igrejas',
    calendars: 'Sistemas de calendário', datesRepresented: 'Como as datas são representadas', jurisdictions: 'Jurisdições',
    noLeadership: 'Ainda não foi publicado um titular atual para este registo.',
    traditionAndCalendar: 'Tradição cristã e família de calendários representadas por esta jurisdição.',
    canonicalLevel: 'Nível canónico representado por este registo.',
    geographicScope: 'Âmbito geográfico usado para determinar quais as celebrações locais aplicáveis.',
    modelledChildren: 'Jurisdições diretamente dependentes atualmente modeladas.',
    active: 'Ativo', officialWebsite: 'Site oficial',
    churchProfileIntro: 'Calendários, jurisdições e celebrações ligadas a esta Igreja ou tradição cristã.',
    calendarEngineDescription: 'As celebrações fixas e móveis são resolvidas pelo motor de calendário associado a esta tradição.',
    jurisdictionDirectoryPending: 'As jurisdições estão a ser acrescentadas a partir dos diretórios oficiais das Igrejas.'
  },
  es: {
    currentLeadership: 'Liderazgo actual', officeSince: 'En el cargo desde', installed: 'Instalado o entronizado',
    churchAndTerritory: 'Iglesia y territorio', jurisdictionContext: 'Contexto de la jurisdicción', childJurisdictions: 'Jurisdicciones dependientes',
    structure: 'Estructura', openJurisdiction: 'Abrir jurisdicción', openChurch: 'Abrir perfil de la Iglesia', allChurches: 'Todas las Iglesias',
    calendars: 'Sistemas de calendario', datesRepresented: 'Cómo se representan las fechas', jurisdictions: 'Jurisdicciones',
    noLeadership: 'Todavía no se ha publicado un titular actual para este registro.',
    traditionAndCalendar: 'Tradición cristiana y familia de calendarios representadas por esta jurisdicción.',
    canonicalLevel: 'Nivel canónico representado por este registro.',
    geographicScope: 'Ámbito geográfico utilizado para determinar qué celebraciones locales corresponden.',
    modelledChildren: 'Jurisdicciones dependientes directas actualmente modeladas.',
    active: 'Activo', officialWebsite: 'Sitio oficial',
    churchProfileIntro: 'Calendarios, jurisdicciones y celebraciones vinculadas a esta Iglesia o tradición cristiana.',
    calendarEngineDescription: 'Las celebraciones fijas y móviles son resueltas por el motor de calendario asociado a esta tradición.',
    jurisdictionDirectoryPending: 'Las jurisdicciones se están incorporando desde los directorios oficiales de las Iglesias.'
  },
  fr: {
    currentLeadership: 'Direction actuelle', officeSince: 'En fonction depuis', installed: 'Installé ou intronisé',
    churchAndTerritory: 'Église et territoire', jurisdictionContext: 'Contexte de la juridiction', childJurisdictions: 'Juridictions dépendantes',
    structure: 'Structure', openJurisdiction: 'Ouvrir la juridiction', openChurch: 'Ouvrir le profil de l’Église', allChurches: 'Toutes les Églises',
    calendars: 'Systèmes calendaires', datesRepresented: 'Comment les dates sont représentées', jurisdictions: 'Juridictions',
    noLeadership: 'Aucun titulaire actuel n’a encore été publié pour cette entrée.',
    traditionAndCalendar: 'Tradition chrétienne et famille calendaire représentées par cette juridiction.',
    canonicalLevel: 'Niveau canonique représenté par cette entrée.',
    geographicScope: 'Périmètre géographique utilisé pour déterminer les célébrations locales applicables.',
    modelledChildren: 'Juridictions directement dépendantes actuellement modélisées.',
    active: 'Actif', officialWebsite: 'Site officiel',
    churchProfileIntro: 'Calendriers, juridictions et célébrations liés à cette Église ou tradition chrétienne.',
    calendarEngineDescription: 'Les célébrations fixes et mobiles sont résolues par le moteur calendaire associé à cette tradition.',
    jurisdictionDirectoryPending: 'Les juridictions sont ajoutées à partir des annuaires officiels des Églises.'
  }
} as const;

export function officeLabel(officeType: string, locale: Locale): string {
  return officeLabels[officeType]?.[locale] ?? officeLabels[officeType]?.en ?? officeType.replaceAll('-', ' ');
}

export function ecclesiasticalPageCopy(locale: Locale) {
  return pageCopy[locale as keyof typeof pageCopy] ?? pageCopy.en;
}
