export const BASELINE_PUBLISHED_REPOSITORIES = Object.freeze([
  "autonomous-travel-guide-mrbd",
  "checkmate-glass-mrbd",
  "fitness-exercises-app",
  "glass-search-meta-display",
  "glass-tube",
  "langchain-project-1",
  "leetcode-practice",
  "movies-api",
  "novel-browser-glass",
  "opengl_glut_game",
  "portfolio-website",
  "scalable-data-processing-system-for-high-volume-workloads",
  "software-engineering-design-patterns",
  "typescript-practice",
]);

export const BASELINE_REVIEWER = "portfolio-baseline";

export function isBaselinePublishedRepository(repository) {
  const name = String(repository?.name || "").trim().toLowerCase();
  return BASELINE_PUBLISHED_REPOSITORIES.includes(name);
}
