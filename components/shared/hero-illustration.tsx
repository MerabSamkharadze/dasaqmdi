/**
 * Static SVG illustration usable from both server + client components.
 * Uses a plain <img> tag because:
 *   1. `next/image` requires `dangerouslyAllowSVG: true` in next.config
 *   2. SVGs are already vector — no optimization benefit from next/image
 *   3. This component is imported from client components (login-form),
 *      so it cannot use Node-only APIs (fs/path)
 *
 * `loading="eager"` + `fetchPriority="high"` signals this is LCP content
 * and should bypass lazy-loading heuristics.
 */
export function HeroIllustration({
  src = "/illustrations/hero.svg",
  priority = true,
}: {
  src?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className="w-full h-auto aspect-square"
    />
  );
}
