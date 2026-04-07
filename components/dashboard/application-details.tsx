"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type ApplicationDetailsProps = {
  coverLetter: string | null;
  label: string;
};

export function ApplicationDetails({
  coverLetter,
  label,
}: ApplicationDetailsProps) {
  const [open, setOpen] = useState(false);

  if (!coverLetter) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        {label}
      </button>

      {open && (
        <div className="mt-3 animate-fade-in">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {coverLetter}
          </p>
        </div>
      )}
    </div>
  );
}
