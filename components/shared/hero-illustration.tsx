"use client";

import { useRef } from "react";

export function HeroIllustration({ src = "/illustrations/hero.svg" }: { src?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  function replay() {
    const iframe = ref.current;
    if (!iframe) return;
    const s = iframe.src;
    iframe.src = "";
    iframe.src = s;
  }

  return (
    <iframe
      ref={ref}
      src={src}
      title="Illustration"
      className="w-full aspect-square border-0"
      style={{ background: "transparent" }}
      onMouseEnter={replay}
    />
  );
}
