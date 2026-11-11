import evidenceDocument from '../data/editorial-claim-evidence.json';
import type { Locale } from './i18n';
import type { ValidationStatus } from '../data/observances';

export type ClaimEvidenceStatus = 'corroborated' | 'disputed' | 'rejected';
export type ClaimEvidence = {
  observanceId: string;
  claimType: string;
  claimValue: string;
  status: ClaimEvidenceStatus;
  source: {
    name: string;
    url: string;
    kind: 'official' | 'scholarly';
  };
  unresolvedClaims: string[];
};

type EvidenceDocument = {
  schemaVersion: number;
  reviewedAt: string;
  evidence: ClaimEvidence[];
};

const document = evidenceDocument as EvidenceDocument;

export const claimEvidenceReviewedAt = document.reviewedAt;

export function claimEvidenceFor(observanceId: string): ClaimEvidence[] {
  return document.evidence.filter(item => item.observanceId === observanceId);
}

export function unresolvedPatronages(item: ClaimEvidence): string[] {
  return item.unresolvedClaims
    .filter(value => value.startsWith('patronage:'))
    .map(value => value.slice('patronage:'.length));
}

const statusLabels: Record<Locale, Record<ValidationStatus, string>> = {
  en: { verified: 'Verified', 'cross-checked': 'Cross-checked', 'review-required': 'Review required', imported: 'Imported — not reviewed' },
  es: { verified: 'Verificado', 'cross-checked': 'Verificación cruzada', 'review-required': 'Revisión necesaria', imported: 'Importado — sin revisar' },
  pt: { verified: 'Verificado', 'cross-checked': 'Verificação cruzada', 'review-required': 'Revisão necessária', imported: 'Importado — não revisto' },
  fr: { verified: 'Vérifié', 'cross-checked': 'Recoupé', 'review-required': 'Révision nécessaire', imported: 'Importé — non révisé' },
  fil: { verified: 'Naberipika', 'cross-checked': 'Na-cross-check', 'review-required': 'Kailangang suriin', imported: 'Na-import — hindi nasuri' },
  ru: { verified: 'Проверено', 'cross-checked': 'Перекрёстно проверено', 'review-required': 'Требуется проверка', imported: 'Импортировано — не проверено' },
  sw: { verified: 'Imethibitishwa', 'cross-checked': 'Imekaguliwa kwa kulinganisha', 'review-required': 'Inahitaji ukaguzi', imported: 'Imeingizwa — haijakaguliwa' },
  de: { verified: 'Verifiziert', 'cross-checked': 'Gegengeprüft', 'review-required': 'Prüfung erforderlich', imported: 'Importiert — nicht geprüft' },
  it: { verified: 'Verificato', 'cross-checked': 'Verifica incrociata', 'review-required': 'Revisione necessaria', imported: 'Importato — non revisionato' },
  pl: { verified: 'Zweryfikowano', 'cross-checked': 'Zweryfikowano krzyżowo', 'review-required': 'Wymaga weryfikacji', imported: 'Zaimportowano — bez weryfikacji' }
};

export function validationStatusLabel(status: ValidationStatus, locale: Locale): string {
  return statusLabels[locale][status];
}

type ClaimEvidenceCopy = {
  title: string;
  reviewed: string;
  officialSource: string;
  corroborated: string;
  unresolvedTitle: string;
  unresolvedBody: string;
  claimDate: string;
  claimDateAndRank: string;
};

export const claimEvidenceUi: Record<Locale, ClaimEvidenceCopy> = {
  en: {
    title: 'Editorial verification', reviewed: 'Reviewed', officialSource: 'Institutional source',
    corroborated: 'This specific claim is corroborated by the institutional source below.',
    unresolvedTitle: 'Related claims still under review',
    unresolvedBody: 'The source below confirms the observance claim, but does not by itself verify these patronages:',
    claimDate: 'Observance identity and date', claimDateAndRank: 'Observance identity, date and local rank'
  },
  es: {
    title: 'Verificación editorial', reviewed: 'Revisado', officialSource: 'Fuente institucional',
    corroborated: 'Esta afirmación concreta está corroborada por la fuente institucional indicada.',
    unresolvedTitle: 'Afirmaciones relacionadas aún en revisión',
    unresolvedBody: 'La fuente confirma la celebración, pero por sí sola no verifica estos patronazgos:',
    claimDate: 'Identidad y fecha de la celebración', claimDateAndRank: 'Identidad, fecha y rango local de la celebración'
  },
  pt: {
    title: 'Verificação editorial', reviewed: 'Revisto', officialSource: 'Fonte institucional',
    corroborated: 'Esta alegação concreta é corroborada pela fonte institucional indicada.',
    unresolvedTitle: 'Alegações relacionadas ainda em revisão',
    unresolvedBody: 'A fonte confirma a celebração, mas não comprova, por si só, estes padroados:',
    claimDate: 'Identidade e data da celebração', claimDateAndRank: 'Identidade, data e grau litúrgico local'
  },
  fr: {
    title: 'Vérification éditoriale', reviewed: 'Révisé', officialSource: 'Source institutionnelle',
    corroborated: 'Cette affirmation précise est corroborée par la source institutionnelle indiquée.',
    unresolvedTitle: 'Affirmations associées encore en révision',
    unresolvedBody: 'La source confirme la célébration, mais ne vérifie pas à elle seule ces patronages :',
    claimDate: 'Identité et date de la célébration', claimDateAndRank: 'Identité, date et rang liturgique local'
  },
  fil: {
    title: 'Editoryal na beripikasyon', reviewed: 'Sinuri', officialSource: 'Institusyonal na sanggunian',
    corroborated: 'Ang tiyak na pahayag na ito ay pinatutunayan ng institusyonal na sanggunian.',
    unresolvedTitle: 'Kaugnay na pahayag na sinusuri pa',
    unresolvedBody: 'Pinatutunayan ng sanggunian ang pagdiriwang, ngunit hindi nito mag-isang pinatutunayan ang mga patronaheng ito:',
    claimDate: 'Pagkakakilanlan at petsa ng pagdiriwang', claimDateAndRank: 'Pagkakakilanlan, petsa at lokal na ranggo'
  },
  ru: {
    title: 'Редакционная проверка', reviewed: 'Проверено', officialSource: 'Институциональный источник',
    corroborated: 'Это конкретное утверждение подтверждается указанным институциональным источником.',
    unresolvedTitle: 'Связанные утверждения ещё проверяются',
    unresolvedBody: 'Источник подтверждает празднование, но сам по себе не подтверждает эти покровительства:',
    claimDate: 'Идентичность и дата празднования', claimDateAndRank: 'Идентичность, дата и местный литургический ранг'
  },
  sw: {
    title: 'Uthibitishaji wa uhariri', reviewed: 'Imekaguliwa', officialSource: 'Chanzo cha taasisi',
    corroborated: 'Dai hili maalumu linathibitishwa na chanzo cha taasisi kilichoonyeshwa.',
    unresolvedTitle: 'Madai yanayohusiana bado yanakaguliwa',
    unresolvedBody: 'Chanzo kinathibitisha maadhimisho, lakini hakithibitishi peke yake ulinzi huu:',
    claimDate: 'Utambulisho na tarehe ya maadhimisho', claimDateAndRank: 'Utambulisho, tarehe na daraja la eneo'
  },
  de: {
    title: 'Redaktionelle Prüfung', reviewed: 'Geprüft', officialSource: 'Institutionelle Quelle',
    corroborated: 'Diese konkrete Aussage wird durch die angegebene institutionelle Quelle bestätigt.',
    unresolvedTitle: 'Verwandte Aussagen noch in Prüfung',
    unresolvedBody: 'Die Quelle bestätigt den Gedenktag, belegt für sich allein jedoch nicht diese Patronate:',
    claimDate: 'Identität und Datum des Gedenktags', claimDateAndRank: 'Identität, Datum und lokaler liturgischer Rang'
  },
  it: {
    title: 'Verifica editoriale', reviewed: 'Revisionato', officialSource: 'Fonte istituzionale',
    corroborated: 'Questa specifica affermazione è corroborata dalla fonte istituzionale indicata.',
    unresolvedTitle: 'Affermazioni correlate ancora in revisione',
    unresolvedBody: 'La fonte conferma la celebrazione, ma da sola non verifica questi patronati:',
    claimDate: 'Identità e data della celebrazione', claimDateAndRank: 'Identità, data e grado liturgico locale'
  },
  pl: {
    title: 'Weryfikacja redakcyjna', reviewed: 'Sprawdzono', officialSource: 'Źródło instytucjonalne',
    corroborated: 'To konkretne twierdzenie jest potwierdzone przez wskazane źródło instytucjonalne.',
    unresolvedTitle: 'Powiązane twierdzenia nadal w weryfikacji',
    unresolvedBody: 'Źródło potwierdza obchód, ale samo nie potwierdza tych patronatów:',
    claimDate: 'Tożsamość i data obchodu', claimDateAndRank: 'Tożsamość, data i lokalna ranga liturgiczna'
  }
};

export function claimTypeLabel(claimType: string, locale: Locale): string {
  const copy = claimEvidenceUi[locale];
  return claimType === 'observance-name-date-and-local-rank' ? copy.claimDateAndRank : copy.claimDate;
}
