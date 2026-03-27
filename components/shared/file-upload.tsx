"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile, getFilePath } from "@/lib/storage";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  bucket: string;
  userId: string;
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  label: string;
  prefix?: string;
};

export function FileUpload({
  bucket,
  userId,
  accept = "image/*",
  maxSizeMB = 5,
  currentUrl,
  onUploadComplete,
  onRemove,
  label,
  prefix,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    const path = getFilePath(userId, file.name, prefix);
    const result = await uploadFile(bucket, path, file);

    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.url) {
      setPreviewUrl(result.url);
      onUploadComplete(result.url);
    }
  }

  function handleRemove() {
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  }

  const isImage = accept.includes("image");

  return (
    <div className="space-y-3">
      {previewUrl && isImage && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-20 w-20 rounded-xl border border-border/60 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {previewUrl && !isImage && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm">
          <span className="truncate flex-1 text-muted-foreground">
            {previewUrl.split("/").pop()}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-${bucket}-${prefix}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn("gap-2")}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {label}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
