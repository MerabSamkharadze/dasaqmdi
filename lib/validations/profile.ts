import { z } from "zod";
import { LOCALES } from "@/lib/types/enums";

export const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional().or(z.literal("")),
  full_name_ka: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  bio_ka: z.string().max(2000).optional().or(z.literal("")),
  skills: z.array(z.string().max(50)).max(20).default([]),
  experience_years: z.coerce.number().int().min(0).max(50).optional(),
  preferred_language: z.enum(LOCALES).default("ka"),
  avatar_url: z.string().max(500).optional().or(z.literal("")),
  resume_url: z.string().max(500).optional().or(z.literal("")),
  is_public: z.boolean().default(true),
  email_digest: z.boolean().default(true),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
