"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile, deleteFile, getFilePath } from "@/lib/storage";
import { Upload, X, Loader2 } from "lucide-react";

/**
 * Extract storage path from a public URL or return path as-is for private buckets.
 * Public URLs look like: https://xxx.supabase.co/storage/v1/object/public/avatars/userId/file.png
 * Private paths are already storage paths: userId/resume/file.pdf
 */
function extractStoragePath(urlOrPath: string): string {
  try {
    const url = new URL(urlOrPath);
    // Extract path after /object/public/{bucket}/
    const match = url.pathname.match(/\/object\/public\/[^/]+\/(.+)/);
    return match ? match[1] : urlOrPath;
  } catch {
    // Not a URL — already a storage path
    return urlOrPath;
  }
}

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

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    // Delete old file before uploading new one (prevents storage bloat)
    if (previewUrl) {
      const oldPath = extractStoragePath(previewUrl);
      await deleteFile(bucket, oldPath);
    }

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

  async function handleRemove() {
    // Delete file from storage when user removes it
    if (previewUrl) {
      const oldPath = extractStoragePath(previewUrl);
      await deleteFile(bucket, oldPath);
    }
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
            className="h-20 w-20 rounded-xl border border-border/30 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive/80 p-1 text-destructive-foreground shadow-sm hover:bg-destructive transition-colors duration-200"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {previewUrl && !isImage && (
        <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-muted/40 px-3.5 py-2.5 text-[13px]">
          <span className="truncate flex-1 text-muted-foreground/70">
            {previewUrl.split("/").pop()}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-destructive/60 hover:text-destructive transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5" />
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
          className="gap-2 text-[13px]"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {label}
        </Button>
      </div>

      {error && (
        <p className="text-[11px] text-destructive/80">{error}</p>
      )}
    </div>
  );
}
