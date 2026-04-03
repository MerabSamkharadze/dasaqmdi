"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type ShareButtonProps = {
  url: string;
  label: string;
  copiedLabel: string;
};

export function ShareButton({ url, label, copiedLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-primary" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" />
          {label}
        </>
      )}
    </button>
  );
}
