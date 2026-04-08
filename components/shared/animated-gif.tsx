"use client";

import { useRef } from "react";

export function AnimatedGif({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      width={380}
      height={380}
      className={className}
      onMouseEnter={() => {
        const img = ref.current;
        if (!img) return;
        const s = img.src;
        img.src = "";
        img.src = s;
      }}
    />
  );
}
