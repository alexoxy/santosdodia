import { parseHolySeeBulletinSection } from './holy-see-bulletin';

export type ParserCheck = {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
};

function includesAll(actual: string[], expected: string[]): boolean {
  return expected.every(value => actual.includes(value));
}

export function holySeeParserChecks(): ParserCheck[] {
  const appointment = parseHolySeeBulletinSection({
    heading: 'Appointment of bishop of Rockhampton, Australia',
    body: 'The Holy Father has appointed Bishop Daniel J. Meagher as bishop of the diocese of Rockhampton, Australia.',
    sourceUrl: 'https://press.vatican.va/example/appointment',
    publishedAt: '2026-04-01'
  }, '2026-04-01T12:00:00.000Z');

  const succession = parseHolySeeBulletinSection({
    heading: 'Resignation and Succession of the Bishop of Saint-Jean-Longueuil (Canada)',
    body: 'The Holy Father has accepted the resignation from the pastoral governance of the Diocese of Saint-Jean-Longueuil submitted by H.E. Mons. Claude Hamelin. H.E. Mons. Martin Laliberté, P.M.E., will succeed him.',
    sourceUrl: 'https://press.vatican.va/example/succession',
    publishedAt: '2026-07-11'
  }, '2026-07-11T12:00:00.000Z');

  const administrator = parseHolySeeBulletinSection({
    heading: 'Resignation of bishop and appointment of apostolic administrator sede vacante',
    body: 'The Holy Father has accepted the resignation presented by Bishop Patrick J. Zurek and has appointed Cardinal Daniel N. DiNardo as apostolic administrator sede vacante of the diocese of Amarillo, United States of America.',
    sourceUrl: 'https://press.vatican.va/example/administrator',
    publishedAt: '2026-02-14'
  }, '2026-02-14T12:00:00.000Z');

  return [
    {
      name: 'single episcopal appointment',
      passed: appointment.confidence === 'high' && includesAll(appointment.changeTypes, ['office-appointed']) && appointment.extractedPersonNames.includes('Daniel J. Meagher') && appointment.extractedJurisdictionNames.some(value => value.includes('Rockhampton')),
      expected: 'high-confidence appointment for Daniel J. Meagher in Rockhampton',
      actual: JSON.stringify(appointment)
    },
    {
      name: 'compound resignation and succession',
      passed: includesAll(succession.changeTypes, ['office-ended', 'office-succeeded']) && succession.extractedPersonNames.length >= 2 && succession.status !== 'applied',
      expected: 'compound event with two people retained for reconciliation',
      actual: JSON.stringify(succession)
    },
    {
      name: 'administrator during vacant see',
      passed: includesAll(administrator.changeTypes, ['office-ended', 'administrator-appointed', 'see-vacant']) && administrator.extractedJurisdictionNames.some(value => value.includes('Amarillo')),
      expected: 'resignation, administrator appointment and vacant-see signal',
      actual: JSON.stringify(administrator)
    }
  ];
}

export function holySeeParserHealthy(): boolean {
  return holySeeParserChecks().every(check => check.passed);
}
