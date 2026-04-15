"use client";

import { useCallback, useEffect, useState } from "react";

export function HeroIllustration({ src = "/illustrations/hero.svg" }: { src?: string }) {
  const [svg, setSvg] = useState<string>("");
  const [key, setKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(src, { cache: "no-store" });
      const text = await res.text();
      setSvg(text);
      setKey((k) => k + 1);
    } catch {
      // ignore — fallback is empty placeholder
    }
  }, [src]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div
      key={key}
      onMouseEnter={load}
      className="w-full aspect-square [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
