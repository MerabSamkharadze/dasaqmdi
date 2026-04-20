"use client";

import { useRef, useEffect, useState, useCallback, Children, cloneElement, isValidElement } from "react";

type VipCarouselProps = {
  children: React.ReactNode;
};

export function VipCarousel({ children }: VipCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(35);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const dragRef = useRef({ startX: 0, scrollStart: 0 });

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

  // Touch/drag handlers for manual swipe
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;

    const container = trackRef.current?.parentElement;
    if (!container) return;

    setDragging(true);
    container.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      scrollStart: container.scrollLeft,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const container = trackRef.current?.parentElement;
    if (!container) return;

    const dx = e.clientX - dragRef.current.startX;
    container.scrollLeft = dragRef.current.scrollStart - dx;
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className="overflow-x-auto pt-10 pb-2 scrollbar-none select-none touch-pan-x"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={trackRef}
        className="flex gap-4 w-max"
        style={{
          animation: dragging ? "none" : `vip-scroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {items}
        {cloned}
      </div>
    </div>
  );
}
