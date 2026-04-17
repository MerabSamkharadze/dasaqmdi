"use client";

import { useEffect, useRef } from "react";
import { incrementJobViewAction } from "@/lib/actions/jobs";
import { trackViewContent } from "@/lib/tracking/pixel-events";

type ViewTrackerProps = {
  jobId: string;
  jobTitle?: string;
  category?: string;
};

export function ViewTracker({ jobId, jobTitle, category }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementJobViewAction(jobId);
    if (jobTitle) {
      trackViewContent({ jobId, jobTitle, category });
    }
  }, [jobId, jobTitle, category]);

  return null;
}
