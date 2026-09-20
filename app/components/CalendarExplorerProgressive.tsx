"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Observance } from "../../data/observances";
import type { Locale } from "../../lib/i18n";
import CalendarExplorer from "./CalendarExplorer";
import type { ChurchPreference } from "./LanguageProvider";

export default function CalendarExplorerProgressive({
  children,
  initialItems,
  initialYear,
  initialMonth,
  initialLocale,
  initialChurch,
  initialRegion,
}: {
  children: ReactNode;
  initialItems: Observance[];
  initialYear: number;
  initialMonth: number;
  initialLocale: Locale;
  initialChurch: ChurchPreference;
  initialRegion: string;
}) {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    setInteractive(true);
  }, []);

  return interactive ? (
    <CalendarExplorer
      initialItems={initialItems}
      initialYear={initialYear}
      initialMonth={initialMonth}
      initialLocale={initialLocale}
      initialChurch={initialChurch}
      initialRegion={initialRegion}
    />
  ) : (
    <>{children}</>
  );
}
