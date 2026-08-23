import type { RomanPrincipalDay, RomanSeason } from './roman-liturgical-year';

export type LiturgicalToolLocale = 'en' | 'pt' | 'es' | 'it';

export function normalizeLiturgicalToolLocale(value: string | null | undefined): LiturgicalToolLocale {
  const code = String(value ?? '').trim().toLowerCase().split('-')[0];
  return code === 'pt' || code === 'es' || code === 'it' ? code : 'en';
}

const labels = {
  en: {
    title: 'Liturgical calendar calculator',
    intro: 'Calculate the Roman liturgical year from perennial rules, without an annual external calendar file.',
    eyebrow: 'Perennial rules · API · AI-ready', language: 'Language',
    year: 'Liturgical year', date: 'Date', jurisdiction: 'Jurisdiction', calculate: 'Calculate',
    general: 'General Roman Calendar', portugal: 'Portugal', sundayCycle: 'Sunday cycle', weekdayCycle: 'Weekday cycle',
    season: 'Liturgical season', week: 'Week', principalDay: 'Principal day', keyDates: 'Movable and structural dates',
    machine: 'Machine-readable API', method: 'How this is calculated', subscribe: 'Keep this calendar synced', annualIcs: 'Download this year',
    subscribeBody: 'Subscribe once to a rolling ICS feed that keeps the previous civil year, the current year and the next three years available and advances automatically.',
    cycleChangeNote: 'Changes on the First Sunday of Advent.',
    methodBody: 'The engine calculates Easter, Advent, cycles and dependent dates locally, then applies the selected jurisdiction policy. Annual official calendars are used for validation and change detection, not as a request-time dependency.',
    noPrincipalDay: 'No principal structural celebration on this date.'
  },
  pt: {
    title: 'Calculadora do calendário litúrgico',
    intro: 'Calcule o ano litúrgico romano a partir de regras perenes, sem depender de um ficheiro anual externo.',
    eyebrow: 'Regras perenes · API · preparada para IA', language: 'Idioma',
    year: 'Ano litúrgico', date: 'Data', jurisdiction: 'Jurisdição', calculate: 'Calcular',
    general: 'Calendário Romano Geral', portugal: 'Portugal', sundayCycle: 'Ciclo dominical', weekdayCycle: 'Ciclo ferial',
    season: 'Tempo litúrgico', week: 'Semana', principalDay: 'Dia principal', keyDates: 'Datas móveis e estruturais',
    machine: 'API legível por máquina', method: 'Como é calculado', subscribe: 'Manter este calendário sincronizado', annualIcs: 'Descarregar este ano',
    subscribeBody: 'Subscreva uma vez um feed ICS móvel que mantém disponível o ano civil anterior, o atual e os três seguintes e avança automaticamente.',
    cycleChangeNote: 'Muda no I Domingo do Advento.',
    methodBody: 'O motor calcula localmente a Páscoa, o Advento, os ciclos e as datas dependentes e só depois aplica a política da jurisdição escolhida. Os calendários oficiais anuais servem para validação e deteção de alterações, não como dependência em tempo de pedido.',
    noPrincipalDay: 'Não há uma celebração estrutural principal nesta data.'
  },
  es: {
    title: 'Calculadora del calendario litúrgico',
    intro: 'Calcula el año litúrgico romano a partir de reglas perennes, sin depender de un archivo anual externo.',
    eyebrow: 'Reglas perennes · API · preparada para IA', language: 'Idioma',
    year: 'Año litúrgico', date: 'Fecha', jurisdiction: 'Jurisdicción', calculate: 'Calcular',
    general: 'Calendario Romano General', portugal: 'Portugal', sundayCycle: 'Ciclo dominical', weekdayCycle: 'Ciclo ferial',
    season: 'Tiempo litúrgico', week: 'Semana', principalDay: 'Día principal', keyDates: 'Fechas móviles y estructurales',
    machine: 'API legible por máquina', method: 'Cómo se calcula', subscribe: 'Mantener este calendario sincronizado', annualIcs: 'Descargar este año',
    subscribeBody: 'Suscríbete una vez a un feed ICS móvil que mantiene disponible el año civil anterior, el actual y los tres siguientes y avanza automáticamente.',
    cycleChangeNote: 'Cambia en el I Domingo de Adviento.',
    methodBody: 'El motor calcula localmente Pascua, Adviento, los ciclos y las fechas dependientes y después aplica la política de la jurisdicción elegida. Los calendarios oficiales anuales se usan para validación y detección de cambios, no como dependencia en cada petición.',
    noPrincipalDay: 'No hay una celebración estructural principal en esta fecha.'
  },
  it: {
    title: 'Calcolatore del calendario liturgico',
    intro: 'Calcola l’anno liturgico romano da regole perenni, senza dipendere da un file annuale esterno.',
    eyebrow: 'Regole perenni · API · pronta per l’IA', language: 'Lingua',
    year: 'Anno liturgico', date: 'Data', jurisdiction: 'Giurisdizione', calculate: 'Calcola',
    general: 'Calendario Romano Generale', portugal: 'Portogallo', sundayCycle: 'Ciclo domenicale', weekdayCycle: 'Ciclo feriale',
    season: 'Tempo liturgico', week: 'Settimana', principalDay: 'Giorno principale', keyDates: 'Date mobili e strutturali',
    machine: 'API leggibile dalle macchine', method: 'Come viene calcolato', subscribe: 'Mantieni sincronizzato questo calendario', annualIcs: 'Scarica questo anno',
    subscribeBody: 'Iscriviti una volta a un feed ICS mobile che mantiene disponibile l’anno civile precedente, quello corrente e i tre successivi e avanza automaticamente.',
    cycleChangeNote: 'Cambia nella I Domenica di Avvento.',
    methodBody: 'Il motore calcola localmente Pasqua, Avvento, i cicli e le date dipendenti e poi applica la politica della giurisdizione selezionata. I calendari ufficiali annuali servono per validazione e rilevamento dei cambiamenti, non come dipendenza a ogni richiesta.',
    noPrincipalDay: 'Nessuna celebrazione strutturale principale in questa data.'
  }
} as const;

const seasonLabels: Record<LiturgicalToolLocale, Record<RomanSeason, string>> = {
  en: { advent: 'Advent', christmas: 'Christmas', 'ordinary-time': 'Ordinary Time', lent: 'Lent', easter: 'Easter Time' },
  pt: { advent: 'Advento', christmas: 'Tempo do Natal', 'ordinary-time': 'Tempo Comum', lent: 'Quaresma', easter: 'Tempo Pascal' },
  es: { advent: 'Adviento', christmas: 'Tiempo de Navidad', 'ordinary-time': 'Tiempo Ordinario', lent: 'Cuaresma', easter: 'Tiempo Pascual' },
  it: { advent: 'Avvento', christmas: 'Tempo di Natale', 'ordinary-time': 'Tempo Ordinario', lent: 'Quaresima', easter: 'Tempo di Pasqua' }
};

const principalLabels: Record<LiturgicalToolLocale, Record<RomanPrincipalDay, string>> = {
  en: {
    christmas: 'Christmas', 'holy-family': 'Holy Family of Jesus, Mary and Joseph', epiphany: 'Epiphany of the Lord', 'baptism-of-the-lord': 'Baptism of the Lord',
    'ash-wednesday': 'Ash Wednesday', 'first-sunday-of-lent': 'First Sunday of Lent', 'palm-sunday': 'Palm Sunday',
    'holy-thursday': 'Holy Thursday', 'good-friday': 'Good Friday', 'holy-saturday': 'Holy Saturday',
    'easter-sunday': 'Easter Sunday', ascension: 'Ascension of the Lord', pentecost: 'Pentecost Sunday',
    'trinity-sunday': 'Trinity Sunday', 'corpus-christi': 'Corpus Christi', 'sacred-heart': 'Sacred Heart of Jesus',
    'christ-the-king': 'Christ the King', 'first-sunday-of-advent': 'First Sunday of Advent'
  },
  pt: {
    christmas: 'Natal do Senhor', 'holy-family': 'Sagrada Família de Jesus, Maria e José', epiphany: 'Epifania do Senhor', 'baptism-of-the-lord': 'Batismo do Senhor',
    'ash-wednesday': 'Quarta-feira de Cinzas', 'first-sunday-of-lent': 'I Domingo da Quaresma', 'palm-sunday': 'Domingo de Ramos',
    'holy-thursday': 'Quinta-feira Santa', 'good-friday': 'Sexta-feira Santa', 'holy-saturday': 'Sábado Santo',
    'easter-sunday': 'Domingo de Páscoa', ascension: 'Ascensão do Senhor', pentecost: 'Domingo de Pentecostes',
    'trinity-sunday': 'Santíssima Trindade', 'corpus-christi': 'Santíssimo Corpo e Sangue de Cristo', 'sacred-heart': 'Sagrado Coração de Jesus',
    'christ-the-king': 'Nosso Senhor Jesus Cristo, Rei do Universo', 'first-sunday-of-advent': 'I Domingo do Advento'
  },
  es: {
    christmas: 'Navidad del Señor', 'holy-family': 'Sagrada Familia de Jesús, María y José', epiphany: 'Epifanía del Señor', 'baptism-of-the-lord': 'Bautismo del Señor',
    'ash-wednesday': 'Miércoles de Ceniza', 'first-sunday-of-lent': 'I Domingo de Cuaresma', 'palm-sunday': 'Domingo de Ramos',
    'holy-thursday': 'Jueves Santo', 'good-friday': 'Viernes Santo', 'holy-saturday': 'Sábado Santo',
    'easter-sunday': 'Domingo de Pascua', ascension: 'Ascensión del Señor', pentecost: 'Domingo de Pentecostés',
    'trinity-sunday': 'Santísima Trinidad', 'corpus-christi': 'Corpus Christi', 'sacred-heart': 'Sagrado Corazón de Jesús',
    'christ-the-king': 'Jesucristo, Rey del Universo', 'first-sunday-of-advent': 'I Domingo de Adviento'
  },
  it: {
    christmas: 'Natale del Signore', 'holy-family': 'Santa Famiglia di Gesù, Maria e Giuseppe', epiphany: 'Epifania del Signore', 'baptism-of-the-lord': 'Battesimo del Signore',
    'ash-wednesday': 'Mercoledì delle Ceneri', 'first-sunday-of-lent': 'I Domenica di Quaresima', 'palm-sunday': 'Domenica delle Palme',
    'holy-thursday': 'Giovedì Santo', 'good-friday': 'Venerdì Santo', 'holy-saturday': 'Sabato Santo',
    'easter-sunday': 'Domenica di Pasqua', ascension: 'Ascensione del Signore', pentecost: 'Domenica di Pentecoste',
    'trinity-sunday': 'Santissima Trinità', 'corpus-christi': 'Corpus Domini', 'sacred-heart': 'Sacro Cuore di Gesù',
    'christ-the-king': 'Cristo Re dell’Universo', 'first-sunday-of-advent': 'I Domenica di Avvento'
  }
};

export function liturgicalToolCopy(locale: LiturgicalToolLocale) { return labels[locale]; }
export function localizeRomanSeason(locale: LiturgicalToolLocale, season: RomanSeason) { return seasonLabels[locale][season]; }
export function localizeRomanPrincipalDay(locale: LiturgicalToolLocale, day: RomanPrincipalDay) { return principalLabels[locale][day]; }
