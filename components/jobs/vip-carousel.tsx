"use client";

import { useRef, useEffect, useState, Children, cloneElement, isValidElement } from "react";

type VipCarouselProps = {
  children: React.ReactNode;
  speed?: number;
};

export function VipCarousel({ children, speed = 35 }: VipCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(speed);
  const [paused, setPaused] = useState(false);

  const items = Children.toArray(children);
  const cloned = items.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, { key: `clone-${i}`, "aria-hidden": true } as Record<string, unknown>)
      : child,
  );

  // Calculate animation duration based on content width
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Wider content = longer duration for consistent speed
    const contentWidth = track.scrollWidth / 2;
    const pxPerSecond = 50;
    setDuration(contentWidth / pxPerSecond);
  }, [items.length]);

  // Listen for card hover pause
  useEffect(() => {
    function onCardPause(e: Event) {
      setPaused((e as CustomEvent).detail);
    }
    window.addEventListener("vip-carousel-pause", onCardPause);
    return () => window.removeEventListener("vip-carousel-pause", onCardPause);
  }, []);

  return (
    <div className="overflow-hidden pt-10 pb-2">
      <div
        ref={trackRef}
        className="flex gap-4 w-max"
        style={{
          animation: `vip-scroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {items}
        {cloned}
      </div>
    </div>
  );
}
