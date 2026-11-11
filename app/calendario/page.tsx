import { permanentRedirect } from "next/navigation";

type LegacyCalendarSearchParams = Record<string, string | string[] | undefined>;

function canonicalCalendarUrl(values: LegacyCalendarSearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return suffix ? `/calendar?${suffix}` : "/calendar";
}

export default async function LegacyCalendarPage({
  searchParams,
}: {
  searchParams: Promise<LegacyCalendarSearchParams>;
}) {
  permanentRedirect(canonicalCalendarUrl(await searchParams));
}
