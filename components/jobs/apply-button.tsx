"use client";

import { useAuthModal } from "@/lib/hooks/use-auth-modal";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type ApplyButtonProps = {
  jobId: string;
  label: string;
  isLoggedIn: boolean;
  externalUrl?: string | null;
  externalLabel?: string;
};

export function ApplyButton({ jobId, label, isLoggedIn, externalUrl, externalLabel }: ApplyButtonProps) {
  const authModal = useAuthModal();

  // External job — link to original source
  if (externalUrl) {
    return (
      <Button asChild size="lg" className="rounded-xl gap-2">
        <a href={externalUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          {externalLabel ?? label}
        </a>
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        size="lg"
        className="rounded-xl px-4 sm:px-8 text-[13px] sm:text-sm"
        onClick={() => authModal.open("apply", `/jobs/${jobId}`)}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button asChild size="lg" className="rounded-xl">
      <Link href={`/jobs/${jobId}/apply`}>{label}</Link>
    </Button>
  );
}
