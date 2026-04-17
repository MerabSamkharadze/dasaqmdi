"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackRegistration } from "@/lib/tracking/pixel-events";

export function RegistrationTracker() {
  const searchParams = useSearchParams();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    if (searchParams.get("registered") !== "1") return;
    tracked.current = true;
    trackRegistration("user");
  }, [searchParams]);

  return null;
}
