import { createClient } from "@/lib/supabase/client";

type UploadResult = {
  url: string | null;
  error: string | null;
};

// H4 FIX: Whitelist of allowed storage buckets (must match Supabase bucket names)
const ALLOWED_BUCKETS = ["avatars", "resumes", "logos"] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

// H4 FIX: Allowed file extensions per bucket
const ALLOWED_EXTENSIONS: Record<AllowedBucket, string[]> = {
  avatars: ["jpg", "jpeg", "png", "webp"],
  resumes: ["pdf", "doc", "docx"],
  logos: ["jpg", "jpeg", "png", "webp", "svg"],
};

// H4 FIX: Max file sizes per bucket (in bytes)
const MAX_FILE_SIZES: Record<AllowedBucket, number> = {
  avatars: 5 * 1024 * 1024,       // 5MB
  resumes: 10 * 1024 * 1024,      // 10MB
  logos: 5 * 1024 * 1024,         // 5MB
};

// H4 FIX: Validate bucket name against whitelist
function isAllowedBucket(bucket: string): bucket is AllowedBucket {
  return (ALLOWED_BUCKETS as readonly string[]).includes(bucket);
}

// H4 FIX: Sanitize path to prevent traversal attacks
function sanitizePath(path: string): string | null {
  // Block path traversal sequences
  if (path.includes("..") || path.includes("//") || path.startsWith("/")) {
    return null;
  }
  // Only allow alphanumeric, hyphens, underscores, dots, and forward slashes
  if (!/^[\w\-./]+$/.test(path)) {
    return null;
  }
  return path;
}

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<UploadResult> {
  // H4 FIX: Validate bucket
  if (!isAllowedBucket(bucket)) {
    return { url: null, error: `Invalid storage bucket: ${bucket}` };
  }

  // H4 FIX: Validate path
  const safePath = sanitizePath(path);
  if (!safePath) {
    return { url: null, error: "Invalid file path" };
  }

  // H4 FIX: Validate file extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS[bucket].includes(ext)) {
    return {
      url: null,
      error: `File type .${ext ?? "unknown"} not allowed for ${bucket}. Allowed: ${ALLOWED_EXTENSIONS[bucket].join(", ")}`,
    };
  }

  // H4 FIX: Validate file size
  if (file.size > MAX_FILE_SIZES[bucket]) {
    const maxMB = MAX_FILE_SIZES[bucket] / (1024 * 1024);
    return { url: null, error: `File too large. Maximum size: ${maxMB}MB` };
  }

  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(safePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(safePath);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  // H4 FIX: Validate bucket
  if (!isAllowedBucket(bucket)) {
    return { error: `Invalid storage bucket: ${bucket}` };
  }

  // H4 FIX: Validate path
  const safePath = sanitizePath(path);
  if (!safePath) {
    return { error: "Invalid file path" };
  }

  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([safePath]);

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
  // H4 FIX: Sanitize userId and prefix to prevent path injection
  const safeUserId = userId.replace(/[^\w\-]/g, "");
  const safePrefix = prefix?.replace(/[^\w\-]/g, "");

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  // H4 FIX: Use crypto-safe random when available, fallback to timestamp + Math.random
  const random = typeof crypto !== "undefined"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  const uniqueName = `${Date.now()}-${random}.${ext}`;

  return safePrefix
    ? `${safeUserId}/${safePrefix}/${uniqueName}`
    : `${safeUserId}/${uniqueName}`;
}
