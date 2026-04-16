"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageCropDialogProps = {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspect?: number;
  cropShape?: "rect" | "round";
};

export function ImageCropDialog({
  imageSrc,
  onCropComplete,
  onCancel,
  aspect = 1,
  cropShape = "round",
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const t = useTranslations("common");

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const onCropChange = useCallback((_: unknown, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    image.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.src = imageSrc;
    });

    // Output: 400x400 for avatars, original aspect for others
    const outputSize = aspect === 1 ? 400 : Math.min(croppedAreaPixels.width, 800);
    const outputHeight = aspect === 1 ? 400 : Math.round(outputSize / aspect);

    canvas.width = outputSize;
    canvas.height = outputHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      outputSize,
      outputHeight
    );

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      "image/webp",
      0.85
    );
  }, [croppedAreaPixels, imageSrc, aspect, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-dialog-title"
        className="relative w-full max-w-md mx-4 rounded-xl bg-card shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <p id="crop-dialog-title" className="text-[14px] font-semibold tracking-tight">
            {t("cropImage")}
          </p>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("cancel")}
            className="text-muted-foreground/50 hover:text-foreground transition-colors duration-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative h-72 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropChange}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3">
          <label htmlFor="crop-zoom" className="sr-only">Zoom</label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={zoom}
            className="w-full h-1.5 rounded-full appearance-none bg-muted/60 accent-primary cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
