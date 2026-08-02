import type { Metadata } from 'next';
import LeadersExplorer, { type LeaderDirectoryRow } from '../components/LeadersExplorer';
import { ECCLESIASTICAL_OFFICES, ECCLESIASTICAL_PEOPLE } from '../../data/knowledge/ecclesiastical-state';
import { jurisdictionById } from '../../data/knowledge/jurisdictions';
import { churchById } from '../../data/knowledge/churches';
import { officeLabel } from '../../lib/knowledge/ecclesiastical-display';
import { localizedFieldValue, personPath } from '../../lib/knowledge/routes';
import { serverLocale } from '../../lib/server-locale';
import { SITE_ORIGIN } from '../../lib/site';

export const dynamic = 'force-dynamic';

const copy = {
  en: { title: 'Christian leaders and current office holders', intro: 'Explore current ecclesiastical leadership by Church, country and region. Each role retains its sources and review date.', eyebrow: 'Churches · countries · regions', directory: 'Source-traceable directory' },
  pt: { title: 'Líderes cristãos e titulares atuais', intro: 'Explore a liderança eclesial atual por Igreja, país e região. Cada cargo conserva as respetivas fontes e data de revisão.', eyebrow: 'Igrejas · países · regiões', directory: 'Diretório com fontes rastreáveis' },
  es: { title: 'Líderes cristianos y titulares actuales', intro: 'Explore el liderazgo eclesiástico actual por Iglesia, país y región. Cada cargo conserva sus fuentes y fecha de revisión.', eyebrow: 'Iglesias · países · regiones', directory: 'Directorio con fuentes trazables' },
  fr: { title: 'Responsables chrétiens et titulaires actuels', intro: 'Explorez les responsables ecclésiaux par Église, pays et région. Chaque fonction conserve ses sources et sa date de révision.', eyebrow: 'Églises · pays · régions', directory: 'Répertoire aux sources traçables' }
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  return { title: text.title, description: text.intro, alternates: { canonical: '/leaders' } };
}

export default async function LeadersPage() {
  const locale = await serverLocale();
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const rows: LeaderDirectoryRow[] = ECCLESIASTICAL_PEOPLE.map(person => {
    const offices = ECCLESIASTICAL_OFFICES.filter(office => office.personId === person.id && office.status === 'active').map(office => {
      const jurisdiction = jurisdictionById(office.jurisdictionId);
      const church = jurisdiction ? churchById(jurisdiction.churchId) : undefined;
      const country = jurisdiction?.geography.find(scope => scope.level === 'country');
      const subdivision = jurisdiction?.geography.find(scope => scope.level === 'subdivision');
      const parent = jurisdiction?.parentJurisdictionId ? jurisdictionById(jurisdiction.parentJurisdictionId) : undefined;
      return {
        id: office.id,
        title: officeLabel(office.officeType, locale),
        jurisdictionName: jurisdiction ? localizedFieldValue(jurisdiction.name, locale) : '',
        churchId: church?.id ?? 'church:unknown',
        churchName: church ? localizedFieldValue(church.name, locale) : '',
        tradition: church?.tradition,
        countryCode: country?.code,
        countryName: country?.code ? regionNames.of(country.code) ?? country.code : undefined,
        regionCode: subdivision?.code ?? (parent?.level === 'province' ? parent.id : undefined),
        regionName: parent?.level === 'province' ? localizedFieldValue(parent.name, locale) : subdivision ? localizedFieldValue(jurisdiction!.name, locale) : undefined
      };
    });
    return { id: person.id, name: localizedFieldValue(person.name, locale), href: personPath(person), offices };
  }).filter(row => row.offices.length);

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: text.title,
    url: `${SITE_ORIGIN}/leaders`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: rows.map((row, index) => ({
        '@type': 'ListItem', position: index + 1, url: `${SITE_ORIGIN}${row.href}`,
        item: { '@type': 'Person', name: row.name }
      }))
    }
  };

  return <div className="page-stack">
    <section className="page-hero compact-hero"><div><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.intro}</p></div><div className="hero-symbol" aria-hidden="true">✦</div></section>
    <div className="section-heading compact"><div><span className="eyebrow">{text.directory}</span><h2>{rows.length}</h2></div></div>
    <LeadersExplorer rows={rows} locale={locale}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
  </div>;
}
