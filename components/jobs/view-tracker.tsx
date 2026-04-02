"use client";

import { useEffect, useRef } from "react";
import { incrementJobViewAction } from "@/lib/actions/jobs";

export function ViewTracker({ jobId }: { jobId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementJobViewAction(jobId);
  }, [jobId]);

  return null;
}
