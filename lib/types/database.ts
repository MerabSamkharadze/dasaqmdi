// This file mirrors the Supabase schema.
// Replace with auto-generated types via: supabase gen types typescript --project-id <id>

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "seeker" | "employer" | "admin";
          full_name: string | null;
          full_name_ka: string | null;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          bio: string | null;
          bio_ka: string | null;
          skills: string[];
          experience_years: number | null;
          resume_url: string | null;
          preferred_language: "ka" | "en";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "seeker" | "employer" | "admin";
          full_name?: string | null;
          full_name_ka?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          bio?: string | null;
          bio_ka?: string | null;
          skills?: string[];
          experience_years?: number | null;
          resume_url?: string | null;
          preferred_language?: "ka" | "en";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "seeker" | "employer" | "admin";
          full_name?: string | null;
          full_name_ka?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          bio?: string | null;
          bio_ka?: string | null;
          skills?: string[];
          experience_years?: number | null;
          resume_url?: string | null;
          preferred_language?: "ka" | "en";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name_en: string;
          name_ka: string;
        };
        Insert: {
          id?: number;
          slug: string;
          name_en: string;
          name_ka: string;
        };
        Update: {
          id?: number;
          slug?: string;
          name_en?: string;
          name_ka?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          name_ka: string | null;
          slug: string;
          description: string | null;
          description_ka: string | null;
          logo_url: string | null;
          website: string | null;
          city: string | null;
          address: string | null;
          address_ka: string | null;
          employee_count: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          name_ka?: string | null;
          slug: string;
          description?: string | null;
          description_ka?: string | null;
          logo_url?: string | null;
          website?: string | null;
          city?: string | null;
          address?: string | null;
          address_ka?: string | null;
          employee_count?: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          name_ka?: string | null;
          slug?: string;
          description?: string | null;
          description_ka?: string | null;
          logo_url?: string | null;
          website?: string | null;
          city?: string | null;
          address?: string | null;
          address_ka?: string | null;
          employee_count?: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          posted_by: string;
          category_id: number;
          title: string;
          title_ka: string | null;
          description: string;
          description_ka: string | null;
          requirements: string | null;
          requirements_ka: string | null;
          job_type: "full-time" | "part-time" | "contract" | "internship" | "remote";
          city: string | null;
          is_remote: boolean;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: "GEL" | "USD" | "EUR";
          status: "draft" | "active" | "closed" | "archived";
          application_deadline: string | null;
          expires_at: string;
          tags: string[];
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          posted_by: string;
          category_id: number;
          title: string;
          title_ka?: string | null;
          description: string;
          description_ka?: string | null;
          requirements?: string | null;
          requirements_ka?: string | null;
          job_type: "full-time" | "part-time" | "contract" | "internship" | "remote";
          city?: string | null;
          is_remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: "GEL" | "USD" | "EUR";
          status?: "draft" | "active" | "closed" | "archived";
          application_deadline?: string | null;
          expires_at?: string;
          tags?: string[];
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          posted_by?: string;
          category_id?: number;
          title?: string;
          title_ka?: string | null;
          description?: string;
          description_ka?: string | null;
          requirements?: string | null;
          requirements_ka?: string | null;
          job_type?: "full-time" | "part-time" | "contract" | "internship" | "remote";
          city?: string | null;
          is_remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: "GEL" | "USD" | "EUR";
          status?: "draft" | "active" | "closed" | "archived";
          application_deadline?: string | null;
          expires_at?: string;
          tags?: string[];
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          applicant_id: string;
          cover_letter: string | null;
          resume_url: string;
          status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
          employer_notes: string | null;
          is_viewed: boolean;
          viewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          applicant_id: string;
          cover_letter?: string | null;
          resume_url: string;
          status?: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
          employer_notes?: string | null;
          is_viewed?: boolean;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          applicant_id?: string;
          cover_letter?: string | null;
          resume_url?: string;
          status?: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
          employer_notes?: string | null;
          is_viewed?: boolean;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      job_type: "full-time" | "part-time" | "contract" | "internship" | "remote";
      job_status: "draft" | "active" | "closed" | "archived";
      application_status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
    };
  };
};
