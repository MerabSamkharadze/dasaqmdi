"use client";

import { useEffect, useState } from "react";

/**
 * Renders an illustration SVG. Starts with a plain `<img>` placeholder for
 * fast first paint (good LCP), then hydrates into an inlined SVG so that
 * CSS-class-based animations inside the SVG (freepik pattern:
 * `svg.animated .element { animation: ... }`) run in the page DOM.
 *
 * Plain `<img>`-rendered SVGs don't run class-triggered animations because
 * the SVG lives in its own sandboxed document and our page CSS/JS can't
 * reach in. Inlining is the only way to make freepik illustrations animate.
 */
export function HeroIllustration({
  src = "/illustrations/hero.svg",
}: {
  src?: string;
}) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        // Freepik SVGs animate only when `.animated` class is on the root
        // <svg> element. Add it now so animations fire on hydration.
        const withAnimated = text.replace(
          /<svg\b([^>]*?)(\s+class="([^"]*)")?([^>]*)>/,
          (_, pre, _classAttr, existing, post) => {
            const classes = existing ? `${existing} animated` : "animated";
            return `<svg${pre} class="${classes}"${post}>`;
          },
        );
        setSvg(withAnimated);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!svg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="w-full h-auto aspect-square"
      />
    );
  }

  return (
    <div
      className="w-full aspect-square [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
