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
    noLeadership: 'No current office holder has yet been published for this record.'
  },
  pt: {
    currentLeadership: 'Liderança atual', officeSince: 'No cargo desde', installed: 'Instalado ou entronizado',
    churchAndTerritory: 'Igreja e território', jurisdictionContext: 'Contexto da jurisdição', childJurisdictions: 'Jurisdições dependentes',
    structure: 'Estrutura', openJurisdiction: 'Abrir jurisdição', openChurch: 'Abrir perfil da Igreja', allChurches: 'Todas as Igrejas',
    calendars: 'Sistemas de calendário', datesRepresented: 'Como as datas são representadas', jurisdictions: 'Jurisdições',
    noLeadership: 'Ainda não foi publicado um titular atual para este registo.'
  },
  es: {
    currentLeadership: 'Liderazgo actual', officeSince: 'En el cargo desde', installed: 'Instalado o entronizado',
    churchAndTerritory: 'Iglesia y territorio', jurisdictionContext: 'Contexto de la jurisdicción', childJurisdictions: 'Jurisdicciones dependientes',
    structure: 'Estructura', openJurisdiction: 'Abrir jurisdicción', openChurch: 'Abrir perfil de la Iglesia', allChurches: 'Todas las Iglesias',
    calendars: 'Sistemas de calendario', datesRepresented: 'Cómo se representan las fechas', jurisdictions: 'Jurisdicciones',
    noLeadership: 'Todavía no se ha publicado un titular actual para este registro.'
  },
  fr: {
    currentLeadership: 'Direction actuelle', officeSince: 'En fonction depuis', installed: 'Installé ou intronisé',
    churchAndTerritory: 'Église et territoire', jurisdictionContext: 'Contexte de la juridiction', childJurisdictions: 'Juridictions dépendantes',
    structure: 'Structure', openJurisdiction: 'Ouvrir la juridiction', openChurch: 'Ouvrir le profil de l’Église', allChurches: 'Toutes les Églises',
    calendars: 'Systèmes calendaires', datesRepresented: 'Comment les dates sont représentées', jurisdictions: 'Juridictions',
    noLeadership: 'Aucun titulaire actuel n’a encore été publié pour cette entrée.'
  }
} as const;

export function officeLabel(officeType: string, locale: Locale): string {
  return officeLabels[officeType]?.[locale] ?? officeLabels[officeType]?.en ?? officeType.replaceAll('-', ' ');
}

export function ecclesiasticalPageCopy(locale: Locale) {
  return pageCopy[locale as keyof typeof pageCopy] ?? pageCopy.en;
}
