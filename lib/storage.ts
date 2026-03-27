import { createClient } from "@/lib/supabase/client";

type UploadResult = {
  url: string | null;
  error: string | null;
};

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  return { error: error?.message ?? null };
}

/**
 * Generate a unique file path with user ID prefix.
 */
export function getFilePath(
  userId: string,
  fileName: string,
  prefix?: string
): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return prefix
    ? `${userId}/${prefix}/${uniqueName}`
    : `${userId}/${uniqueName}`;
}
