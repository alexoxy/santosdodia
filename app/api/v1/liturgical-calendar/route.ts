import { NextRequest } from 'next/server';
import {
  calculateRomanLiturgicalYear,
  liturgicalYearForDate,
  romanDateContext,
  romanPolicyForJurisdiction
} from '../../../../lib/knowledge/roman-liturgical-year';
import {
  localizeRomanPrincipalDay,
  localizeRomanSeason,
  normalizeLiturgicalToolLocale
} from '../../../../lib/knowledge/liturgical-calendar-localization';

function validYear(value: string | null): number | null {
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1584 && year <= 4099 ? year : null;
}

function validDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  if (year < 1583 || year > 4099) return null;
  return value;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = normalizeLiturgicalToolLocale(params.get('locale'));
  const church = params.get('church') ?? 'roman-catholic';
  if (church !== 'roman-catholic') {
    return Response.json({ error: 'Only the Roman Catholic kernel is public in v1.' }, { status: 400 });
  }

  let policy;
  try {
    policy = romanPolicyForJurisdiction(params.get('jurisdiction') ?? params.get('country') ?? 'PT');
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unsupported jurisdiction.' }, { status: 400 });
  }

  const date = validDate(params.get('date'));
  const requestedYear = validYear(params.get('year'));
  if (params.has('date') && !date) return Response.json({ error: 'Invalid date. Use YYYY-MM-DD between 1583 and 4099.' }, { status: 400 });
  if (params.has('year') && !requestedYear) return Response.json({ error: 'Invalid liturgical year. Use an integer between 1584 and 4099.' }, { status: 400 });

  const liturgicalYear = requestedYear ?? (date ? liturgicalYearForDate(date) : new Date().getUTCFullYear());
  const year = calculateRomanLiturgicalYear(liturgicalYear, policy);
  const dateContext = date ? romanDateContext(date, policy) : null;

  const localized = {
    keyDates: Object.fromEntries(Object.entries(year.keyDates).map(([key, value]) => [key, {
      date: value,
      label: localizeRomanPrincipalDay(locale, key as keyof typeof year.keyDates)
    }])),
    date: dateContext ? {
      ...dateContext,
      seasonLabel: localizeRomanSeason(locale, dateContext.season),
      principalDayLabel: dateContext.principalDay ? localizeRomanPrincipalDay(locale, dateContext.principalDay) : null
    } : null
  };

  return Response.json({
    data: {
      churchId: policy.churchId,
      jurisdictionId: policy.jurisdictionId,
      calendarSystem: policy.calendarSystem,
      liturgicalYear: year,
      dateContext,
      localized
    },
    meta: {
      engine: 'santosdia-roman-liturgical-year',
      engineVersion: '1.0',
      locale,
      autonomousAnnualCalculation: true,
      requestTimeExternalDependency: false,
      supportedYearRange: { min: 1584, max: 4099 },
      cycleRules: {
        sunday: 'A/B/C by liturgical year; the new cycle starts on the First Sunday of Advent.',
        weekday: 'I in odd civil years; II in even civil years.'
      },
      dayBoundary: 'This endpoint calculates civil-date context. Sundays and solemnities may begin liturgically with First Vespers on the preceding evening.',
      authority: policy.authority
    }
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
