"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Share2, Check, Copy, Facebook, Linkedin, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/lib/config";

type ShareJobButtonProps = {
  jobUrl: string;
  jobTitle: string;
  variant?: "icon" | "button";
};

export function ShareJobButton({ jobUrl, jobTitle, variant = "icon" }: ShareJobButtonProps) {
  // Use current page URL as fallback if jobUrl is relative
  const fullUrl = jobUrl.startsWith("http") ? jobUrl : (typeof window !== "undefined" ? `${window.location.origin}${jobUrl}` : jobUrl);
  const [copied, setCopied] = useState(false);
  const t = useTranslations("jobs");

  const shareText = `${jobTitle} — ${siteConfig.domain}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(shareText);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: jobTitle, text: shareText, url: fullUrl });
      } catch {
        // User cancelled — ignore
      }
    }
  }

  const socialLinks = [
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "X (Twitter)",
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      label: "WhatsApp",
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Telegram",
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M22.05 1.577c-.393-.016-.784.08-1.117.235-2.093.94-17.648 7.583-19.77 8.5-.39.168-.883.44-.883 1.003 0 .385.22.694.567.867l4.948 1.993 1.79 5.86c.164.48.546.68.96.68.34 0 .625-.14.85-.37l2.56-2.37 4.987 3.74c.38.285.755.43 1.146.43.82 0 1.36-.58 1.5-1.36L23.85 3.147c.2-1.02-.43-1.57-1.3-1.57h-.5zM9.33 13.78l-.81 3.58-1.5-5.31 11.76-7.26L9.33 13.78z" />
        </svg>
      ),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
          </button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px] border-border bg-card text-foreground hover:bg-muted hover:text-foreground">
            <Share2 className="h-3.5 w-3.5" />
            {t("share")}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native share — mobile only (client-side check to avoid hydration mismatch) */}
        <NativeShareItem onShare={handleNativeShare} label={`${t("share")}...`} />

        {/* Copy link */}
        <DropdownMenuItem onClick={handleCopy} className="gap-2 text-[13px] cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? t("linkCopied") : t("copyLink")}
        </DropdownMenuItem>

        {/* Social links */}
        {socialLinks.map(({ label, icon: Icon, href }) => (
          <DropdownMenuItem key={label} asChild className="gap-2 text-[13px] cursor-pointer">
            <a href={href} target="_blank" rel="noopener noreferrer">
              <Icon className="h-4 w-4" />
              {label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Client-only native share check — avoids SSR hydration mismatch
function NativeShareItem({ onShare, label }: { onShare: () => void; label: string }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if ("share" in navigator) setCanShare(true);
  }, []);

  if (!canShare) return null;

  return (
    <>
      <DropdownMenuItem onClick={onShare} className="gap-2 text-[13px] cursor-pointer">
        <Smartphone className="h-4 w-4" />
        {label}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}
