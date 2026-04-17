import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { getAllLandingSlugs } from "@/lib/seo-landings";
import type { MetadataRoute } from "next";

const BASE_URL = siteConfig.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Static pages
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/en`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/en/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/companies`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/en/companies`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/salaries`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/en/salaries`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/en/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/en/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Category landing pages
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).flatMap((c) => [
    { url: `${BASE_URL}/jobs?category=${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/en/jobs?category=${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
  ]);

  // Active jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, updated_at")
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  const jobPages: MetadataRoute.Sitemap = (jobs ?? []).flatMap((job) => [
    {
      url: `${BASE_URL}/jobs/${job.id}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/jobs/${job.id}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]);

  // Companies
  const { data: companies } = await supabase
    .from("companies")
    .select("slug, updated_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const companyPages: MetadataRoute.Sitemap = (companies ?? []).flatMap((c) => [
    {
      url: `${BASE_URL}/companies/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/companies/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  // SEO landing pages
  const landingPages: MetadataRoute.Sitemap = getAllLandingSlugs().flatMap((slug) => [
    { url: `${BASE_URL}/jobs/explore/${slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.85 },
    { url: `${BASE_URL}/en/jobs/explore/${slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.85 },
  ]);

  return [...staticPages, ...categoryPages, ...landingPages, ...jobPages, ...companyPages];
}
