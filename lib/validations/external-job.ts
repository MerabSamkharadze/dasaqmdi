import { z } from "zod";

export const externalJobSchema = z.object({
  title: z.string().min(2).max(200),
  title_ka: z.string().optional().default(""),
  description: z.string().min(10),
  description_ka: z.string().optional().default(""),
  requirements: z.string().optional().default(""),
  requirements_ka: z.string().optional().default(""),
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
