import { neon } from "@neondatabase/serverless";
import { resolveFeatureConfigConnectionString } from "./feature-store.js";
import {
  BASELINE_REVIEWER,
  isBaselinePublishedRepository,
} from "../../src/config/project-publication.js";

export const PROJECT_STATUSES = Object.freeze(["pending", "approved", "hidden"]);
export const PROJECT_CATEGORIES = Object.freeze(["frontend", "backend", "data", "ai", "wearable", "other"]);
export const PROJECT_AUDIT_LIMIT = 50;
const CASE_STUDY_FIELDS = Object.freeze({
  summary: 360,
  purpose: 600,
  challenge: 600,
  build: 800,
  engineering: 800,
  outcome: 600,
});

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))].slice(0, 8);
}

function normalizeOptionalText(value, maximum) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maximum) : null;
}

function normalizeHttpsUrl(value) {
  const normalized = normalizeOptionalText(value, 1000);
  if (!normalized) return "";
  try {
    const url = new URL(normalized);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function normalizeMedia(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { coverImageUrl: "", coverImageAlt: "", demoUrl: "" };
  }
  return {
    coverImageUrl: normalizeHttpsUrl(value.coverImageUrl),
    coverImageAlt: normalizeOptionalText(value.coverImageAlt, 180) || "",
    demoUrl: normalizeHttpsUrl(value.demoUrl),
  };
}

function mapProjectRow(row) {
  const generatedPresentation = row.generated_presentation || {};
  const generatedCaseStudy = row.generated_case_study || {};
  const caseStudyOverride = row.case_study_override || null;
  const mediaOverride = row.media_override || null;
  return {
    githubId: String(row.github_id),
    name: row.repository_name,
    repo: row.repository_url,
    homepage: row.homepage_url || "",
    githubDescription: row.github_description || "",
    language: row.primary_language || "",
    topics: row.topics || [],
    githubUpdatedAt: row.github_updated_at || null,
    status: row.publication_status,
    title: row.title_override ?? generatedPresentation.title ?? "",
    description: row.description_override ?? generatedPresentation.description ?? "",
    category: row.category_override ?? generatedPresentation.category ?? "",
    tags: row.tags_override ?? generatedPresentation.tags ?? [],
    evidence: row.extracted_evidence || {},
    caseStudy: caseStudyOverride || generatedCaseStudy,
    caseStudySource: caseStudyOverride ? "owner" : "generated",
    media: mediaOverride || generatedPresentation.media || {},
    mediaSource: mediaOverride ? "owner" : "generated",
    discoveredAt: row.discovered_at,
    reviewedBy: row.reviewed_by || "",
    reviewedAt: row.reviewed_at || null,
    updatedAt: row.updated_at,
  };
}

function normalizeCaseStudy(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    caseStudy: true,
    ...Object.fromEntries(Object.entries(CASE_STUDY_FIELDS).map(([field, maximum]) => [
      field,
      normalizeOptionalText(value[field], maximum) || "",
    ])),
    highlights: normalizeTags(value.highlights),
  };
}

export function normalizeProjectReview(input = {}) {
  const status = PROJECT_STATUSES.includes(input.status) ? input.status : null;
  const category = input.category === "" || input.category == null
    ? null
    : PROJECT_CATEGORIES.includes(input.category) ? input.category : undefined;
  if (!status || category === undefined) return null;

  return {
    status,
    title: normalizeOptionalText(input.title, 120),
    description: normalizeOptionalText(input.description, 600),
    category,
    tags: normalizeTags(input.tags),
    caseStudy: normalizeCaseStudy(input.caseStudy),
    media: normalizeMedia(input.media),
  };
}

export async function syncProjectCandidates({
  repositories,
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) throw new Error("Project publishing database is not configured");
  const sql = createSql(connectionString);
  for (const repository of repositories) {
    const draft = repository.portfolioDraft || {};
    const presentation = draft.presentation || {};
    const baselinePublished = isBaselinePublishedRepository(repository);
    await sql.query(
      `INSERT INTO portfolio_project_queue (
         github_id, repository_name, repository_url, homepage_url, github_description,
         primary_language, topics, github_updated_at, generated_presentation,
         extracted_evidence, generated_case_study, publication_status, reviewed_by, reviewed_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9::jsonb, $10::jsonb, $11::jsonb,
                 $12, $13, CASE WHEN $13::text IS NULL THEN NULL ELSE NOW() END)
       ON CONFLICT (github_id) DO UPDATE SET
         repository_name = EXCLUDED.repository_name,
         repository_url = EXCLUDED.repository_url,
         homepage_url = EXCLUDED.homepage_url,
         github_description = EXCLUDED.github_description,
         primary_language = EXCLUDED.primary_language,
         topics = EXCLUDED.topics,
         github_updated_at = EXCLUDED.github_updated_at,
         generated_presentation = EXCLUDED.generated_presentation,
         extracted_evidence = EXCLUDED.extracted_evidence,
         generated_case_study = EXCLUDED.generated_case_study`,
      [
        repository.id,
        repository.name,
        repository.html_url,
        repository.homepage || null,
        repository.description || null,
        repository.language || null,
        repository.topics || [],
        repository.updated_at || null,
        JSON.stringify(presentation),
        JSON.stringify(draft.evidence || {}),
        JSON.stringify(draft.caseStudy || {}),
        baselinePublished ? "approved" : "pending",
        baselinePublished ? BASELINE_REVIEWER : null,
      ],
    );
  }
  return repositories.length;
}

export async function readAdminProjectQueue({
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) return { source: "unconfigured", projects: [], audit: [] };
  const sql = createSql(connectionString);
  const [rows, auditRows] = await Promise.all([
    sql.query(
      `SELECT * FROM portfolio_project_queue
       ORDER BY
         CASE publication_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
         github_updated_at DESC NULLS LAST,
         repository_name`,
    ),
    sql.query(
      `SELECT audit.github_id, queue.repository_name, audit.old_status, audit.new_status,
              audit.changed_by, audit.changed_at
       FROM portfolio_project_audit audit
       JOIN portfolio_project_queue queue ON queue.github_id = audit.github_id
       ORDER BY audit.changed_at DESC
       LIMIT $1`,
      [PROJECT_AUDIT_LIMIT],
    ),
  ]);

  return {
    source: "database",
    projects: rows.map(mapProjectRow),
    audit: auditRows.map((row) => ({
      githubId: String(row.github_id),
      name: row.repository_name,
      oldStatus: row.old_status,
      newStatus: row.new_status,
      changedBy: row.changed_by,
      changedAt: row.changed_at,
    })),
  };
}

export async function reviewProjectCandidate({
  githubId,
  review,
  expectedUpdatedAt,
  changedBy,
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) throw new Error("Project publishing database is not configured");
  const sql = createSql(connectionString);
  const rows = await sql.query(
    `WITH current AS MATERIALIZED (
       SELECT publication_status
       FROM portfolio_project_queue
       WHERE github_id = $1
         AND date_trunc('milliseconds', updated_at) = date_trunc('milliseconds', $10::timestamptz)
     ), updated AS (
       UPDATE portfolio_project_queue queue
       SET publication_status = $2,
           title_override = $3,
           description_override = $4,
           category_override = $5,
           tags_override = $6::text[],
           case_study_override = $7::jsonb,
           media_override = $8::jsonb,
           reviewed_by = $9,
           reviewed_at = NOW()
       FROM current
       WHERE queue.github_id = $1
       RETURNING queue.*
     ), audit AS (
       INSERT INTO portfolio_project_audit (github_id, old_status, new_status, changed_by)
       SELECT $1, current.publication_status, $2, $9
       FROM current, updated
       WHERE current.publication_status IS DISTINCT FROM $2
     )
     SELECT * FROM updated`,
    [
      githubId,
      review.status,
      review.title,
      review.description,
      review.category,
      review.tags,
      JSON.stringify(review.caseStudy || {}),
      JSON.stringify(review.media || {}),
      changedBy,
      expectedUpdatedAt,
    ],
  );
  return rows.length ? mapProjectRow(rows[0]) : null;
}

export async function readApprovedProjectRows({
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) return [];
  const sql = createSql(connectionString);
  const rows = await sql.query(
    `SELECT * FROM portfolio_project_queue
     WHERE publication_status = 'approved'
     ORDER BY reviewed_at DESC NULLS LAST, repository_name`,
  );
  return rows.map(mapProjectRow);
}
