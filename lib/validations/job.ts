import { z } from "zod";
import { JOB_TYPES, SALARY_CURRENCIES } from "@/lib/types/enums";

const jobFieldsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  title_ka: z.string().max(200).optional().or(z.literal("")),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(10000),
  description_ka: z.string().max(10000).optional().or(z.literal("")),
  requirements: z.string().max(5000).optional().or(z.literal("")),
  requirements_ka: z.string().max(5000).optional().or(z.literal("")),
  category_id: z.coerce.number().int().positive("Please select a category"),
  job_type: z.enum(JOB_TYPES),
  city: z.string().max(100).optional().or(z.literal("")),
  is_remote: z.coerce.boolean().default(false),
  salary_min: z.coerce.number().int().min(0).optional(),
  salary_max: z.coerce.number().int().min(0).optional(),
  salary_currency: z.enum(SALARY_CURRENCIES).default("GEL"),
  application_deadline: z.string().datetime().optional().or(z.literal("")),
});

export const createJobSchema = jobFieldsSchema.refine(
  (data) =>
    !data.salary_min ||
    !data.salary_max ||
    data.salary_min <= data.salary_max,
  {
    message: "Minimum salary cannot exceed maximum",
    path: ["salary_max"],
  },
);

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = jobFieldsSchema.partial();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;
