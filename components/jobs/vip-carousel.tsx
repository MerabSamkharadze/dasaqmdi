"use client";

import { useRef, useEffect, useCallback, Children, cloneElement, isValidElement } from "react";

type VipCarouselProps = {
  children: React.ReactNode;
  speed?: number;
};

export function VipCarousel({ children, speed = 0.5 }: VipCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const momentumRef = useRef<number | null>(null);

  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollStart: 0,
    lastX: 0,
    velocity: 0,
    timestamp: 0,
  });

  // Infinite loop: when scroll reaches cloned section, jump back seamlessly
  const handleInfiniteLoop = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft >= half) {
      el.scrollLeft -= half;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += half;
    }
  }, []);

  // Auto-scroll 60fps
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function tick() {
      if (!pausedRef.current && !dragRef.current.active && el) {
        el.scrollLeft += speed;
        handleInfiniteLoop();
      }
      animationRef.current = requestAnimationFrame(tick);
    }

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed, handleInfiniteLoop]);

  // Momentum decay
  const startMomentum = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    let v = dragRef.current.velocity;

    function decay() {
      if (Math.abs(v) < 0.5 || !el) {
        momentumRef.current = null;
        pausedRef.current = false;
        return;
      }
      el.scrollLeft -= v;
      handleInfiniteLoop();
      v *= 0.95;
      momentumRef.current = requestAnimationFrame(decay);
    }

    if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
    momentumRef.current = requestAnimationFrame(decay);
  }, [handleInfiniteLoop]);

  const stopMomentum = useCallback(() => {
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = scrollRef.current;
      if (!el) return;

      stopMomentum();
      pausedRef.current = true;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";

      dragRef.current = {
        active: true,
        startX: e.clientX,
        scrollStart: el.scrollLeft,
        lastX: e.clientX,
        velocity: 0,
        timestamp: Date.now(),
      };
    },
    [stopMomentum],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const el = scrollRef.current;
    if (!el) return;

    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.scrollStart - dx;
    handleInfiniteLoop();

    const now = Date.now();
    const dt = now - dragRef.current.timestamp;
    if (dt > 0) {
      dragRef.current.velocity = ((e.clientX - dragRef.current.lastX) / dt) * 16;
    }
    dragRef.current.lastX = e.clientX;
    dragRef.current.timestamp = now;
  }, [handleInfiniteLoop]);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const el = scrollRef.current;
    if (el) el.style.cursor = "grab";

    if (Math.abs(dragRef.current.velocity) > 1) {
      startMomentum();
    } else {
      pausedRef.current = false;
    }
  }, [startMomentum]);

  const handleMouseEnter = useCallback(() => {
    if (!dragRef.current.active) pausedRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!dragRef.current.active && !momentumRef.current) pausedRef.current = false;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const dx = Math.abs(dragRef.current.startX - dragRef.current.lastX);
    if (dx > 3) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Clone children for seamless infinite loop
  const items = Children.toArray(children);
  const cloned = items.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, { key: `clone-${i}`, "aria-hidden": true } as Record<string, unknown>)
      : child,
  );

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-hidden pb-2 select-none touch-pan-y [&_*]:!cursor-grab"
      style={{ cursor: "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClickCapture={handleClick}
      onDragStart={handleDragStart}
    >
      {items}
      {cloned}
    </div>
  );
}
