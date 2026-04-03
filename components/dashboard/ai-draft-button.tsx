"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, X } from "lucide-react";

type AIDraftButtonProps = {
  onDraftComplete: (text: string) => void;
  language: "en" | "ka" | "both";
};

export function AIDraftButton({ onDraftComplete, language }: AIDraftButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [seniority, setSeniority] = useState("mid");
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!title.trim() || !skills.trim()) return;

    setIsLoading(true);
    setCompletion("");
    setError(null);

    try {
      const response = await fetch("/api/ai/draft-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          seniority,
          language,
        }),
      });

      if (!response.ok) {
        const errorText = response.status === 401
          ? "Authentication required. Please log in again."
          : response.status === 400
            ? "Invalid input. Please check your title and skills."
            : `Generation failed (${response.status}). Please try again.`;
        setError(errorText);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        setError("No response received. Please try again.");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCompletion(fullText);
      }

      if (fullText.length === 0) {
        setError("Empty response received. Please try again.");
        return;
      }

      onDraftComplete(fullText);
    } catch (err) {
      console.error("AI draft generation failed:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [title, skills, seniority, language, onDraftComplete]);

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-[13px] border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/5"
      >
        <Sparkles className="h-3 w-3" />
        Draft with AI
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/8 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium flex items-center gap-1.5 text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary/70" />
          AI Job Description Draft
        </p>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setCompletion(""); }}
          className="text-muted-foreground/40 hover:text-foreground transition-colors duration-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground/70">Job Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="h-8 text-[13px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground/70">Core Skills</Label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js"
            className="h-8 text-[13px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground/70">Seniority</Label>
          <Select value={seniority} onValueChange={setSeniority}>
            <SelectTrigger className="h-8 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior" className="text-[13px]">Junior</SelectItem>
              <SelectItem value="mid" className="text-[13px]">Mid-level</SelectItem>
              <SelectItem value="senior" className="text-[13px]">Senior</SelectItem>
              <SelectItem value="lead" className="text-[13px]">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={handleGenerate}
        disabled={isLoading || !title.trim() || !skills.trim()}
        className="gap-1.5 text-[13px]"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {isLoading ? "Generating..." : "Generate"}
      </Button>

      {error && (
        <p className="text-[12px] text-destructive/80">{error}</p>
      )}

      {completion && (
        <div className="rounded-xl border border-border/60 bg-card p-4 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground font-sans">
            {completion}
          </pre>
        </div>
      )}
    </div>
  );
}
