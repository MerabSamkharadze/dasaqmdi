import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  /** Overlay content (heading, subtitle, CTA) — rendered on top of the image */
  children?: React.ReactNode;
  /** Height class — default "h-[420px] sm:h-[480px]" */
  heightClass?: string;
  /** Overlay darkness — default "bg-foreground/40" */
  overlayClass?: string;
  className?: string;
  /** Priority loading for above-the-fold hero — default true */
  priority?: boolean;
}

export function OptimizedHeroImage({
  src,
  alt,
  children,
  heightClass = "h-[420px] sm:h-[480px]",
  overlayClass = "bg-foreground/40",
  className,
  priority = true,
}: OptimizedHeroImageProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden rounded-2xl group",
        heightClass,
        className
      )}
    >
      {/* Image — fills container, auto AVIF/WebP via next/image */}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        quality={80}
      />

      {/* Gradient overlay for text legibility */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          overlayClass
        )}
      />

      {/* Content overlay */}
      {children && (
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {children}
        </div>
      )}
    </section>
  );
}
