"use client";

import { useRef } from "react";

export function HeroIllustration() {
  const ref = useRef<HTMLIFrameElement>(null);

  function replay() {
    const iframe = ref.current;
    if (!iframe) return;
    // Reload iframe to restart SVG animations
    const src = iframe.src;
    iframe.src = "";
    iframe.src = src;
  }

  return (
    <iframe
      ref={ref}
      src="/illustrations/hero.svg"
      title="Illustration"
      className="w-full aspect-square border-0"
      style={{ background: "transparent" }}
      onMouseEnter={replay}
    />
  );
}
