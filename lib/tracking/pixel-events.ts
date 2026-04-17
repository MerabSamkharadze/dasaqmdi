function fbq(action: string, event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (params) {
    window.fbq(action as "track", event, params);
  } else {
    window.fbq(action as "track", event);
  }
}

/** Standard: user views a job listing */
export function trackViewContent(data: {
  jobId: string;
  jobTitle: string;
  category?: string;
}) {
  fbq("track", "ViewContent", {
    content_name: data.jobTitle,
    content_category: data.category,
    content_ids: [data.jobId],
    content_type: "job",
  });
}

/** Standard: user completes registration */
export function trackRegistration(role: string) {
  fbq("track", "CompleteRegistration", {
    content_name: role,
    status: "complete",
  });
}

/** Standard: user submits a job application */
export function trackLead(data: {
  jobId: string;
  jobTitle: string;
  category?: string;
}) {
  fbq("track", "Lead", {
    content_name: data.jobTitle,
    content_category: data.category,
    content_ids: [data.jobId],
    content_type: "job",
  });
}

/** Custom: employer publishes a job */
export function trackJobPosted() {
  fbq("trackCustom", "JobPosted", {
    content_type: "job",
  });
}
