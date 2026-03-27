import { z } from "zod";
import { APPLICATION_STATUSES } from "@/lib/types/enums";

export const applyToJobSchema = z.object({
  job_id: z.string().uuid("Invalid job ID"),
  cover_letter: z.string().max(5000).optional().or(z.literal("")),
  resume_url: z.string().min(1, "Resume is required"),
});

export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;

export const updateApplicationStatusSchema = z.object({
  application_id: z.string().uuid("Invalid application ID"),
  status: z.enum(APPLICATION_STATUSES),
  employer_notes: z.string().max(2000).optional().or(z.literal("")),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
