import type { Database } from "./database";

// ── Row types (what comes back from Supabase) ──
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

// ── Insert types ──
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];

// ── Update types ──
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

// ── Joined types (for Server Components) ──
export type JobWithCompany = Job & {
  company: Pick<Company, "id" | "name" | "name_ka" | "slug" | "logo_url">;
  category: Pick<Category, "id" | "slug" | "name_en" | "name_ka">;
};

export type ApplicationWithJob = Application & {
  job: Pick<Job, "id" | "title" | "title_ka" | "status" | "application_deadline"> & {
    company: Pick<Company, "name" | "name_ka" | "logo_url">;
  };
};

export type ApplicationWithApplicant = Application & {
  applicant: Pick<
    Profile,
    "id" | "full_name" | "full_name_ka" | "avatar_url" | "skills" | "experience_years"
  >;
};

// ── Search params ──
export type JobSearchParams = {
  q?: string;
  category?: string;
  city?: string;
  type?: Job["job_type"];
  page?: number;
};

// ── Action result ──
export type ActionResult<T = null> = {
  error: string | null;
  data?: T;
};

// ── Re-exports ──
export type { Database } from "./database";
export type {
  UserRole,
  JobType,
  JobStatus,
  ApplicationStatus,
  SalaryCurrency,
  EmployeeCount,
  Locale,
} from "./enums";
