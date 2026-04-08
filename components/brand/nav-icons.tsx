/** Custom colorful nav icons using the warm brand palette */

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
};

export function JobsIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      {/* Briefcase body */}
      <rect x="2" y="7" width="20" height="13" rx="2.5" fill="#725252" />
      <rect x="2" y="7" width="20" height="5" rx="2.5" fill="#543d3d" />
      {/* Handle */}
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" stroke="#362828" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center clasp */}
      <rect x="10" y="10" width="4" height="3" rx="0.75" fill="#f5ebb4" />
    </svg>
  );
}

export function CompaniesIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      {/* Main building */}
      <rect x="4" y="6" width="10" height="15" rx="1.5" fill="#543d3d" />
      {/* Right wing */}
      <rect x="14" y="10" width="6" height="11" rx="1.5" fill="#725252" />
      {/* Windows */}
      <rect x="6.5" y="8.5" width="2" height="2" rx="0.5" fill="#f5ebb4" />
      <rect x="10" y="8.5" width="2" height="2" rx="0.5" fill="#f5ebb4" />
      <rect x="6.5" y="12.5" width="2" height="2" rx="0.5" fill="#f5ebb4" />
      <rect x="10" y="12.5" width="2" height="2" rx="0.5" fill="#f5ebb4" />
      <rect x="16" y="12.5" width="2" height="2" rx="0.5" fill="#f5ebb4" />
      {/* Door */}
      <rect x="8.5" y="17" width="3" height="4" rx="0.75" fill="#362828" />
      {/* Roof accent */}
      <rect x="4" y="5" width="10" height="1.5" rx="0.75" fill="#362828" />
    </svg>
  );
}

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      {/* Globe circle */}
      <circle cx="12" cy="12" r="9.5" fill="#725252" />
      {/* Meridian */}
      <ellipse cx="12" cy="12" rx="4.5" ry="9.5" fill="none" stroke="#fbf7e1" strokeWidth="1.2" />
      {/* Equator */}
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#fbf7e1" strokeWidth="1.2" />
      {/* Latitude lines */}
      <line x1="4" y1="7.5" x2="20" y2="7.5" stroke="#fbf7e1" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="4" y1="16.5" x2="20" y2="16.5" stroke="#fbf7e1" strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Highlight */}
      <circle cx="8.5" cy="8" r="2.5" fill="#543d3d" fillOpacity="0.4" />
    </svg>
  );
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      <circle cx="12" cy="12" r="4.5" fill="#f5ebb4" stroke="#725252" strokeWidth="1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="12" y1="4" x2="12" y2="2"
          stroke="#725252" strokeWidth="1.5" strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
        fill="#f5ebb4" stroke="#725252" strokeWidth="1" strokeLinejoin="round"
      />
    </svg>
  );
}

export function LaptopIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      {/* Screen */}
      <rect x="3.5" y="3" width="17" height="12" rx="2" fill="none" stroke="#725252" strokeWidth="1.2" />
      {/* Screen shine */}
      <rect x="5" y="4.5" width="14" height="9" rx="1" fill="#f5ebb4" fillOpacity="0.25" />
      {/* Base */}
      <path d="M7 19h10" stroke="#725252" strokeWidth="1.5" strokeLinecap="round" />
      {/* Stand */}
      <path d="M10 15v4M14 15v4" stroke="#725252" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function SalariesIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} className={className}>
      {/* Bar 1 - short */}
      <rect x="3" y="14" width="4" height="7" rx="1" fill="#725252" />
      {/* Bar 2 - medium */}
      <rect x="10" y="9" width="4" height="12" rx="1" fill="#543d3d" />
      {/* Bar 3 - tall */}
      <rect x="17" y="4" width="4" height="17" rx="1" fill="#362828" />
      {/* Trend line */}
      <path d="M5 13 L12 8 L19 3.5" stroke="#f5ebb4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot accents */}
      <circle cx="5" cy="13" r="1.5" fill="#f5ebb4" />
      <circle cx="12" cy="8" r="1.5" fill="#f5ebb4" />
      <circle cx="19" cy="3.5" r="1.5" fill="#f5ebb4" />
    </svg>
  );
}
