"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/shared/spinner";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminSelectableListProps = {
  items: { id: string; node: React.ReactNode }[];
  onBulkDelete: (ids: string[]) => Promise<{ error: string | null }>;
  translations: {
    selectAll: string;
    deleteSelected: string;
    cancel: string;
    confirmDelete: string;
  };
};

export function AdminSelectableList({
  items,
  onBulkDelete,
  translations: t,
}: AdminSelectableListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allSelected = items.length > 0 && selected.size === items.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  function handleDeleteConfirm() {
    setError(null);
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await onBulkDelete([...selected]);
      if (result.error) {
        setError(result.error);
      } else {
        setSelected(new Set());
      }
    });
  }

  return (
    <div>
      {/* Select all + bulk bar */}
      <div className="flex items-center gap-3 mb-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleAll}
          aria-label={t.selectAll}
        />
        <span className="text-[12px] text-muted-foreground/60">
          {t.selectAll}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Checkbox
              checked={selected.has(item.id)}
              onCheckedChange={() => toggle(item.id)}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">{item.node}</div>
          </div>
        ))}
      </div>

      {/* Sticky bulk action bar */}
      {selected.size > 0 && (
        <div
          className={cn(
            "sticky bottom-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-5 py-3 shadow-lg animate-fade-in",
            isPending && "opacity-60",
          )}
        >
          <span className="text-[13px] font-medium tabular-nums">
            {selected.size} selected
          </span>

          <div className="flex items-center gap-2">
            {error && (
              <span className="text-[11px] text-destructive/80">{error}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="gap-1.5 text-[12px]"
            >
              <X className="h-3 w-3" />
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
              className="gap-1.5 text-[12px]"
            >
              {isPending ? (
                <Spinner />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {t.deleteSelected} ({selected.size})
            </Button>
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.deleteSelected}</AlertDialogTitle>
                <AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t.deleteSelected} ({selected.size})
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
