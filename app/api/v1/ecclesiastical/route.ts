import { CHURCHES } from '../../../../data/knowledge/churches';
import { JURISDICTIONS } from '../../../../data/knowledge/jurisdictions';
import {
  ECCLESIASTICAL_ASSERTIONS,
  ECCLESIASTICAL_OFFICES,
  officeHolder
} from '../../../../data/knowledge/ecclesiastical-state';
import { localeFromAcceptLanguage, normalizeLocale } from '../../../../lib/i18n';
import {
  churchPath,
  jurisdictionPath,
  localizedFieldValue,
  personPath
} from '../../../../lib/knowledge/routes';

export const dynamic = 'force-dynamic';

type EntitySelection = 'all' | 'churches' | 'jurisdictions' | 'leaders';

function selection(value: string | null): EntitySelection {
  return value === 'churches' || value === 'jurisdictions' || value === 'leaders' ? value : 'all';
}

function assertionTitle(officeId: string): string | undefined {
  const assertion = ECCLESIASTICAL_ASSERTIONS.find(item => item.subjectId === officeId && item.field === 'active-office');
  if (!assertion || typeof assertion.value !== 'object' || assertion.value === null || !('title' in assertion.value)) return undefined;
  const title = assertion.value.title;
  return typeof title === 'string' ? title : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get('locale');
  const locale = localeParam ? normalizeLocale(localeParam) : localeFromAcceptLanguage(request.headers.get('accept-language'));
  const entity = selection(url.searchParams.get('entity'));
  const churchId = url.searchParams.get('church');
  const countryCode = url.searchParams.get('country')?.trim().toUpperCase();

  const churches = CHURCHES.filter(church => !churchId || church.id === churchId);
  const churchIds = new Set(churches.map(church => church.id));
  const jurisdictions = JURISDICTIONS.filter(jurisdiction => {
    if (churchId && !churchIds.has(jurisdiction.churchId)) return false;
    if (!countryCode) return true;
    return jurisdiction.geography.some(place => place.level === 'global' || (place.level === 'country' && place.code === countryCode));
  });
  const jurisdictionIds = new Set(jurisdictions.map(jurisdiction => jurisdiction.id));
  const activeOffices = ECCLESIASTICAL_OFFICES.filter(office => office.status === 'active' && jurisdictionIds.has(office.jurisdictionId));

  const payload = {
    meta: {
      locale,
      entity,
      church: churchId ?? null,
      country: countryCode ?? null,
      generatedAt: new Date().toISOString(),
      access: 'free',
      runtimeExternalDependency: false
    },
    counts: {
      churches: churches.length,
      jurisdictions: jurisdictions.length,
      activeLeaders: activeOffices.length
    },
    data: {
      churches: entity === 'all' || entity === 'churches' ? churches.map(church => ({
        id: church.id,
        name: localizedFieldValue(church.name, locale),
        family: church.family,
        tradition: church.tradition,
        calendarSystems: church.calendarSystems,
        path: churchPath(church),
        sourceIds: church.sourceIds
      })) : undefined,
      jurisdictions: entity === 'all' || entity === 'jurisdictions' ? jurisdictions.map(jurisdiction => ({
        id: jurisdiction.id,
        churchId: jurisdiction.churchId,
        parentJurisdictionId: jurisdiction.parentJurisdictionId ?? null,
        name: localizedFieldValue(jurisdiction.name, locale),
        level: jurisdiction.level,
        geography: jurisdiction.geography,
        path: jurisdictionPath(jurisdiction),
        sourceIds: jurisdiction.sourceIds
      })) : undefined,
      leaders: entity === 'all' || entity === 'leaders' ? activeOffices.flatMap(office => {
        const person = officeHolder(office);
        if (!person) return [];
        return [{
          personId: person.id,
          name: localizedFieldValue(person.name, locale),
          churchIds: person.churchIds,
          officeId: office.id,
          officeType: office.officeType,
          title: assertionTitle(office.id) ?? office.officeType,
          jurisdictionId: office.jurisdictionId,
          appointedAt: office.appointedAt ?? null,
          installedAt: office.installedAt ?? null,
          path: personPath(person),
          sourceIds: office.sourceIds
        }];
      }) : undefined
    }
  };

  return Response.json(payload, {
    headers: {
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
      'content-language': locale,
      'x-robots-tag': 'index, follow, max-snippet:-1'
    }
  });
}
