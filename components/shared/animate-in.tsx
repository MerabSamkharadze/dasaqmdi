"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface AnimateInProps {
  children: React.ReactNode;
  /** Animation direction — default "up" */
  direction?: Direction;
  /** Delay in ms — default 0 */
  delay?: number;
  /** Duration class — default "duration-500" */
  duration?: string;
  /** Trigger once or every time in viewport — default true */
  once?: boolean;
  className?: string;
}

const TRANSLATE: Record<Direction, string> = {
  up: "translate-y-4",
  down: "-translate-y-4",
  left: "translate-x-4",
  right: "-translate-x-4",
  none: "",
};

export function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  duration = "duration-500",
  once = true,
  className,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip animation entirely if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        duration,
        visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${TRANSLATE[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
