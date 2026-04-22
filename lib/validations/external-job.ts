import { z } from "zod";

/**
 * External jobs are scraped from external boards (jobs.ge, hr.ge, etc.) and
 * exist in a single source language. Admin picks which language the content
 * is in; bilingual *_ka columns stay NULL for external jobs. The `localized()`
 * helper falls back to whichever column has content, so KA users viewing an
 * EN-source job still see the English text (and vice versa).
 */
export const externalJobSchema = z.object({
  source_language: z.enum(["ka", "en"]).default("ka"),
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  requirements: z.string().optional().default(""),
  category_id: z.string().min(1, "Category required"),
  job_type: z.string().default("full-time"),
  city: z.string().optional().default(""),
  salary_min: z.coerce.number().optional(),
  salary_max: z.coerce.number().optional(),
  salary_currency: z.string().default("GEL"),
  tags: z.string().optional().default(""),
  external_url: z.string().url("Valid URL required"),
  external_source: z.string().min(1, "Source name required"),
});
