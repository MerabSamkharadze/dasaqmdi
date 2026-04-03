export const USER_ROLES = ["seeker", "employer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["draft", "active", "closed", "archived"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SALARY_CURRENCIES = ["GEL", "USD", "EUR"] as const;
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];

export const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
export type EmployeeCount = (typeof EMPLOYEE_COUNTS)[number];

export const SUBSCRIPTION_PLANS = ["free", "pro", "verified"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = ["active", "cancelled", "past_due", "expired"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const LOCALES = ["ka", "en"] as const;
export type Locale = (typeof LOCALES)[number];
