"use client";

import { useEffect, useState } from "react";

export function HeroIllustration({ src = "/illustrations/hero.svg" }: { src?: string }) {
  const [svg, setSvg] = useState<string>("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvg(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      key={key}
      onMouseEnter={() => setKey((k) => k + 1)}
      className="w-full aspect-square [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
