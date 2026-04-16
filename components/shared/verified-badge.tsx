import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  className?: string;
  size?: "sm" | "md";
};

export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  const px = size === "md" ? 18 : 14;
  const uid = `vb-${px}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-300 hover:animate-[heartbeat_0.6s_ease-in-out]", className)}
      aria-label="Verified"
    >
      {/* 8-point star / seal */}
      <path
        d="M12 1l2.7 3.3L18.4 3l.6 4.3L23 8.7l-2.4 3.6L23 15.9l-4 1.4-.6 4.3-3.7-1.3L12 23l-2.7-2.7-3.7 1.3-.6-4.3-4-1.4 2.4-3.6L1 8.7l4-1.4.6-4.3 3.7 1.3L12 1Z"
        fill={`url(#${uid}-fill)`}
        stroke={`url(#${uid}-stroke)`}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M8.5 12.5l2.2 2.2 4.8-4.8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`${uid}-fill`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4bf7a" />
          <stop offset="0.5" stopColor="#C7AE6A" />
          <stop offset="1" stopColor="#a08940" />
        </linearGradient>
        <linearGradient id={`${uid}-stroke`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0d08a" />
          <stop offset="1" stopColor="#8a7535" />
        </linearGradient>
      </defs>
    </svg>
  );
}
