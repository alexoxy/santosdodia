// Normative corrections over the operational LitCal mirror.
//
// The mirror remains immutable evidence of what the upstream engine returned. These
// corrections express later or higher-authority decisions of the Holy See so that a
// stale upstream response cannot be mistaken for a national-jurisdiction delta.

export const GENERAL_ROMAN_AUTHORITY_CORRECTIONS = Object.freeze([
  Object.freeze({
    id: 'StMaryMagdalene',
    monthDay: '07-22',
    effectiveFromYear: 2016,
    grade: 'FEAST',
    source: 'https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20160610_sanctae-m-magdalenae-decretum_po.html',
    decision: 'The celebration of Saint Mary Magdalene is a feast in the General Roman Calendar.',
  }),
  Object.freeze({
    id: 'StJohnHenryNewman',
    monthDay: '10-09',
    effectiveFromYear: 2026,
    grade: 'optional memorial',
    names: Object.freeze({
      en_US: 'Saint John Henry Newman, Priest and Doctor of the Church',
      pt_PT: 'São João Henrique Newman, presbítero e Doutor da Igreja',
      es_ES: 'San Juan Enrique Newman, presbítero y doctor de la Iglesia',
      fr_FR: "Saint John Henry Newman, prêtre et docteur de l’Église",
      it_IT: 'San Giovanni Enrico Newman, presbitero e dottore della Chiesa',
    }),
    source: 'https://www.vatican.va/content/romancuria/pt/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti/20251109-decreto-iscrizione-newman.html',
    decision: 'Saint John Henry Newman is inscribed as an optional memorial on 9 October in the General Roman Calendar.',
  }),
]);

function text(value) {
  return String(value ?? '').trim();
}

export function applyGeneralRomanAuthorityCorrections(events, { year, locale = 'en_US' } = {}) {
  const calendarYear = Number(year);
  if (!Number.isInteger(calendarYear)) throw new Error(`Invalid General Roman correction year: ${String(year)}`);
  const output = (Array.isArray(events) ? events : []).map((event) => ({ ...event }));

  for (const correction of GENERAL_ROMAN_AUTHORITY_CORRECTIONS) {
    if (calendarYear < correction.effectiveFromYear) continue;
    const dateISO = `${calendarYear}-${correction.monthDay}`;
    let event = output.find((item) => text(item.id) === correction.id && text(item.dateISO).slice(0, 10) === dateISO);

    if (!event && correction.names) {
      event = {
        id: correction.id,
        canonicalEventId: `rc:${correction.id}`,
        dateISO,
        name: correction.names[locale] ?? correction.names.en_US,
        grade: correction.grade,
        locale,
      };
      output.push(event);
    }

    if (!event) continue;
    event.grade = correction.grade;
    event.authorityCorrection = {
      source: correction.source,
      decision: correction.decision,
      effectiveFromYear: correction.effectiveFromYear,
    };
    if (!text(event.name) && correction.names) event.name = correction.names[locale] ?? correction.names.en_US;
  }

  return output.sort((a, b) => text(a.dateISO).localeCompare(text(b.dateISO)) || text(a.id).localeCompare(text(b.id)));
}
