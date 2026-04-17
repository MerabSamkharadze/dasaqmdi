"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackJobPosted } from "@/lib/tracking/pixel-events";

export function JobPostedTracker() {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    if (searchParams.get("created") !== "1") return;
    tracked.current = true;
    trackJobPosted();
  }, [searchParams]);

  return null;
}
