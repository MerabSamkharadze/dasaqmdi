"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
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
  language: "en" | "ka";
};

export function AIDraftButton({ onDraftComplete, language }: AIDraftButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [seniority, setSeniority] = useState("mid");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/draft-job",
    body: {
      title,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      seniority,
      language,
    },
    onFinish: (_prompt, result) => {
      onDraftComplete(result);
      setIsOpen(false);
    },
  });

  function handleGenerate() {
    if (!title.trim() || !skills.trim()) return;
    complete("");
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-[13px]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Draft with AI
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Job Description Draft
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-[12px]">Job Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="h-8 text-[13px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Core Skills</Label>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js"
            className="h-8 text-[13px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Seniority</Label>
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
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {isLoading ? "Generating..." : "Generate"}
      </Button>

      {completion && (
        <div className="rounded-lg border border-border/30 bg-card p-4 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground font-sans">
            {completion}
          </pre>
        </div>
      )}
    </div>
  );
}
