import { getSaintBiographyRecord } from "../data/saint-biographies";
import { isSaintBiographyIndexable } from "./editorial-profile-quality";
import type { Locale } from "./i18n";

/**
 * Return a public saint/person profile path only when the canonical identity has
 * substantive, indexable editorial content in the requested locale.
 *
 * An observance existing in the calendar is not sufficient evidence that it is
 * a standalone Person page. Feasts, Marian titles, collective commemorations
 * and thin/unreviewed records remain attached to their observance/date surface.
 */
export function publicSaintProfilePath(observanceId: string, locale: Locale) {
  const biography = getSaintBiographyRecord(observanceId);
  if (!biography || !isSaintBiographyIndexable(biography, locale)) return null;
  return `/saint/${encodeURIComponent(observanceId)}`;
}
