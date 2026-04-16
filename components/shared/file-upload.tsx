"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile, deleteFile, getFilePath } from "@/lib/storage";
import { ImageCropDialog } from "@/components/shared/image-crop-dialog";
import { Upload, X } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Should we show crop dialog for this bucket?
  const enableCrop = bucket === "avatars" || bucket === "company-logos";
  const cropShape = bucket === "avatars" ? "round" as const : "rect" as const;

  async function uploadBlob(blob: Blob, fileName: string) {
    setUploading(true);

    // Delete old file
    if (previewUrl) {
      const oldPath = extractStoragePath(previewUrl);
      await deleteFile(bucket, oldPath);
    }

    const file = new File([blob], fileName, { type: blob.type });
    const path = getFilePath(userId, fileName, prefix);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    // Show crop dialog for images
    if (enableCrop && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setCropSrc(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    // Direct upload for non-image files
    setUploading(true);

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

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    setCropSrc(null);
    const fileName = `${prefix ?? "file"}.webp`;
    uploadBlob(croppedBlob, fileName);
  }, [prefix]);

  const handleCropCancel = useCallback(() => {
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

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
      {/* Crop dialog */}
      {cropSrc && (
        <ImageCropDialog
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={1}
          cropShape={cropShape}
        />
      )}
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
            aria-label="Remove file"
            className="absolute -right-2 -top-2 rounded-full bg-destructive/80 p-1 text-destructive-foreground shadow-sm hover:bg-destructive transition-colors duration-200"
          >
            <X className="h-3 w-3" aria-hidden="true" />
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
            <Spinner />
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
