"use client";

import { useEffect, useState, type ReactNode } from "react";
import CalendarExplorer from "./CalendarExplorer";

export default function CalendarProgressiveExplorer({
  children,
}: {
  children: ReactNode;
}) {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    setInteractive(true);
  }, []);

  return interactive ? <CalendarExplorer /> : <>{children}</>;
}
