export const ROLLING_PAST_CIVIL_YEARS = 1 as const;
export const ROLLING_FUTURE_CIVIL_YEARS = 3 as const;
export const ROLLING_OPERATIONAL_TIMEZONE = 'UTC' as const;

function boundedNonNegativeInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 20) {
    throw new RangeError(`${name} must be an integer between 0 and 20.`);
  }
  return value;
}

export function rollingCivilYearWindow(
  civilYear: number,
  pastYears = ROLLING_PAST_CIVIL_YEARS,
  futureYears = ROLLING_FUTURE_CIVIL_YEARS,
): number[] {
  if (!Number.isInteger(civilYear) || civilYear < 1 || civilYear > 9999) {
    throw new RangeError('civilYear must be an integer between 1 and 9999.');
  }
  const past = boundedNonNegativeInteger(pastYears, 'pastYears');
  const future = boundedNonNegativeInteger(futureYears, 'futureYears');
  return Array.from({ length: past + future + 1 }, (_, index) => civilYear - past + index);
}

export function rollingCivilYearWindowForUtcInstant(
  instant: Date | string | number = new Date(),
): number[] {
  const date = instant instanceof Date ? new Date(instant.getTime()) : new Date(instant);
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid instant.');
  return rollingCivilYearWindow(date.getUTCFullYear());
}
