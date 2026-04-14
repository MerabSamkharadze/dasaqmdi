"use client";

import { useAuthModal } from "@/lib/hooks/use-auth-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ApplyButtonProps = {
  jobId: string;
  label: string;
  isLoggedIn: boolean;
};

export function ApplyButton({ jobId, label, isLoggedIn }: ApplyButtonProps) {
  const authModal = useAuthModal();

  if (!isLoggedIn) {
    return (
      <Button
        size="lg"
        className="rounded-xl"
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
