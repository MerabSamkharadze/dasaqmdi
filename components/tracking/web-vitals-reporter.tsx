"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Core Web Vitals budget thresholds — Lighthouse "Good" rating boundaries.
 * Metrics above these thresholds trigger a console.warn in all environments,
 * plus a window event that production observers (Sentry, Vercel, etc.) can
 * hook into without requiring a separate endpoint.
 */
const BUDGETS = {
  LCP: 2500, // Largest Contentful Paint — ms
  INP: 200,  // Interaction to Next Paint — ms
  CLS: 0.1,  // Cumulative Layout Shift — score
  TTFB: 800, // Time to First Byte — ms
  FCP: 1800, // First Contentful Paint — ms
} as const;

type WebVitalName = keyof typeof BUDGETS;

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const name = metric.name as WebVitalName;
    const budget = BUDGETS[name];
    if (budget === undefined) return;

    const exceeded = metric.value > budget;

    // Structured log so it's filterable in Vercel logs + browser devtools
    const payload = {
      metric: name,
      value: Math.round(metric.value),
      rating: metric.rating, // "good" | "needs-improvement" | "poor"
      budget,
      exceeded,
      id: metric.id,
      path: window.location.pathname,
    };

    if (exceeded) {
      // eslint-disable-next-line no-console
      console.warn("[WebVitals]", payload);
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[WebVitals]", payload);
    }

    // Fire a custom DOM event so external observers (e.g. Sentry, analytics)
    // can subscribe without modifying this file.
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("web-vital", { detail: payload }));
    }
  });

  return null;
}
