interface LogoProps {
  /** "full" = icon + wordmark, "icon" = symbol only */
  variant?: "full" | "icon";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={className}
      >
        {/* Abstract mark: briefcase silhouette with upward-arrow/check accent */}
        <rect
          x="3"
          y="9"
          width="22"
          height="15"
          rx="3"
          className="stroke-foreground"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Handle */}
        <path
          d="M10 9V7a4 4 0 0 1 8 0v2"
          className="stroke-foreground"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Check/growth accent — Indigo */}
        <path
          d="M9.5 17l3 3 6.5-7"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      {/* Symbol */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="9"
          width="22"
          height="15"
          rx="3"
          className="stroke-foreground"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M10 9V7a4 4 0 0 1 8 0v2"
          className="stroke-foreground"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M9.5 17l3 3 6.5-7"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-base font-semibold tracking-tight text-foreground">
        დასაქმდი
      </span>
    </span>
  );
}
