import {
  copticToGregorian,
  ethiopianToGregorian,
  gregorianEaster,
  orthodoxEaster,
  resolveDateRule,
  toISODate
} from './calendar-engine';

export type CalendarCheck = {
  id: string;
  expected: string;
  actual?: string;
  passed: boolean;
};

function directCheck(id: string, expected: string, actual: string): CalendarCheck {
  return { id, expected, actual, passed: expected === actual };
}

export function calendarEngineChecks(): CalendarCheck[] {
  const armenianEaster = resolveDateRule({
    type: 'relative',
    calendar: 'armenian',
    variant: 'armenian-mother-see',
    anchor: 'armenian-easter',
    offsetDays: 0
  }, 2026);
  const armenianCross = resolveDateRule({
    type: 'relative',
    calendar: 'armenian',
    variant: 'armenian-mother-see',
    anchor: 'armenian-easter',
    offsetDays: 28
  }, 2026);
  const armenianAscension = resolveDateRule({
    type: 'relative',
    calendar: 'armenian',
    variant: 'armenian-mother-see',
    anchor: 'armenian-easter',
    offsetDays: 39
  }, 2026);

  return [
    directCheck('gregorian-easter-2026', '2026-04-05', toISODate(gregorianEaster(2026))),
    directCheck('orthodox-coptic-easter-2026', '2026-04-12', toISODate(orthodoxEaster(2026))),
    directCheck('coptic-nativity-2026', '2026-01-07', toISODate(copticToGregorian(1742, 4, 29))),
    directCheck('coptic-new-year-2026', '2026-09-11', toISODate(copticToGregorian(1743, 1, 1))),
    directCheck('ethiopian-nativity-2026', '2026-01-07', toISODate(ethiopianToGregorian(2018, 4, 29))),
    directCheck('ethiopian-new-year-2026', '2026-09-11', toISODate(ethiopianToGregorian(2019, 1, 1))),
    directCheck('armenian-easter-2026', '2026-04-05', armenianEaster.dateISO ?? ''),
    directCheck('armenian-apparition-cross-2026', '2026-05-03', armenianCross.dateISO ?? ''),
    directCheck('armenian-ascension-2026', '2026-05-14', armenianAscension.dateISO ?? '')
  ];
}

export function calendarEngineHealthy(): boolean {
  return calendarEngineChecks().every(check => check.passed);
}
