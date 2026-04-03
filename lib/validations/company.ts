import { z } from "zod";
import { EMPLOYEE_COUNTS } from "@/lib/types/enums";

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(200),
  name_ka: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  description_ka: z.string().max(5000).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  address_ka: z.string().max(300).optional().or(z.literal("")),
  employee_count: z.enum(EMPLOYEE_COUNTS).optional(),
  tech_stack: z.array(z.string().max(50)).max(20).optional(),
  why_work_here: z.string().max(3000).optional().or(z.literal("")),
  why_work_here_ka: z.string().max(3000).optional().or(z.literal("")),
  benefits: z.array(z.string().max(100)).max(15).optional(),
  benefits_ka: z.array(z.string().max(100)).max(15).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
