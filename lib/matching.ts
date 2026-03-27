/**
 * Smart Matching Engine
 *
 * Compares a seeker's skills[] with a job's tags[] via array intersection.
 * Score = (matched_tags / total_job_tags) * 100
 *
 * Returns 0 if job has no tags or seeker has no skills.
 */

export type MatchResult = {
  score: number; // 0-100
  matchedSkills: string[];
  totalJobTags: number;
};

/**
 * Calculate match score between a seeker's skills and a job's tags.
 * Case-insensitive comparison.
 */
export function calculateMatch(
  seekerSkills: string[],
  jobTags: string[]
): MatchResult {
  if (!jobTags.length || !seekerSkills.length) {
    return { score: 0, matchedSkills: [], totalJobTags: jobTags.length };
  }

  const normalizedSkills = new Set(
    seekerSkills.map((s) => s.toLowerCase().trim())
  );

  const matchedSkills: string[] = [];

  for (const tag of jobTags) {
    if (normalizedSkills.has(tag.toLowerCase().trim())) {
      matchedSkills.push(tag);
    }
  }

  const score = Math.round((matchedSkills.length / jobTags.length) * 100);

  return {
    score,
    matchedSkills,
    totalJobTags: jobTags.length,
  };
}

/**
 * Batch-calculate match scores for multiple jobs.
 * Returns a Map<jobId, MatchResult>.
 */
export function calculateMatchScores(
  seekerSkills: string[],
  jobs: Array<{ id: string; tags: string[] }>
): Map<string, MatchResult> {
  const results = new Map<string, MatchResult>();

  for (const job of jobs) {
    results.set(job.id, calculateMatch(seekerSkills, job.tags));
  }

  return results;
}
