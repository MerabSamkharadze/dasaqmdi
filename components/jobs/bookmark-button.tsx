"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveJobAction, unsaveJobAction } from "@/lib/actions/saved-jobs";
import { useAuthModal } from "@/lib/hooks/use-auth-modal";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  jobId: string;
  isSaved: boolean;
  isLoggedIn?: boolean;
  size?: "sm" | "icon";
};

export function BookmarkButton({ jobId, isSaved: initialSaved, isLoggedIn = true, size = "icon" }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const authModal = useAuthModal();

  async function handleToggle() {
    if (!isLoggedIn) {
      authModal.open("bookmark", `/jobs/${jobId}`);
      return;
    }

    setLoading(true);
    setSaved(!saved);

    const result = saved
      ? await unsaveJobAction(jobId)
      : await saveJobAction(jobId);

    if (result.error) {
      setSaved(saved);
    }
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size={size}
      disabled={loading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      className={cn(
        "h-8 w-8 rounded-xl transition-all duration-200",
        saved
          ? "text-primary hover:text-primary/80"
          : "text-muted-foreground/40 hover:text-muted-foreground"
      )}
    >
      <Bookmark
        className={cn("h-4 w-4", saved && "fill-current")}
      />
      <span className="sr-only">{saved ? "Unsave" : "Save"}</span>
    </Button>
  );
}
