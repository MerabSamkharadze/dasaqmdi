"use client";

import { useEffect, useRef } from "react";
import { markApplicationsBatchViewedAction } from "@/lib/actions/applications";

export function MarkViewedOnLoad({ ids }: { ids: string[] }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current || ids.length === 0) return;
    called.current = true;

    // Delay mark-as-viewed so user sees the unread state first
    const timer = setTimeout(() => {
      markApplicationsBatchViewedAction(ids);
    }, 2000);

    return () => clearTimeout(timer);
  }, [ids]);

  return null;
}
