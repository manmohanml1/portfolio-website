import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeProjectReview,
  readApprovedProjectRows,
  reviewProjectCandidate,
  syncProjectCandidates,
} from "../api/_lib/project-store.js";
import { BASELINE_PUBLISHED_REPOSITORIES } from "../src/config/project-publication.js";

test("database migration inventory covers every checked-in portfolio repository", () => {
  assert.equal(BASELINE_PUBLISHED_REPOSITORIES.length, 14);
  assert.ok(BASELINE_PUBLISHED_REPOSITORIES.includes("portfolio-website"));
  assert.ok(BASELINE_PUBLISHED_REPOSITORIES.includes("fitness-exercises-app"));
});

test("project review normalization accepts only bounded publication metadata", () => {
  const review = normalizeProjectReview({
    status: "approved", title: " Reviewed ", description: " Useful ", category: "backend",
    tags: ["TypeScript", "AWS", "TypeScript", ""],
  });
  assert.deepEqual(review, {
    status: "approved", title: "Reviewed", description: "Useful", category: "backend",
    tags: ["TypeScript", "AWS"], caseStudy: null,
    media: { coverImageUrl: "", coverImageAlt: "", demoUrl: "" },
  });
  assert.equal(normalizeProjectReview({ status: "public", category: "backend" }), null);
  assert.equal(normalizeProjectReview({ status: "approved", category: "unknown" }), null);
});

test("GitHub synchronization upserts metadata without overwriting publication decisions", async () => {
  let statement;
  let parameters;
  const sql = { query: async (query, values) => { statement = query; parameters = values; return []; } };
  const count = await syncProjectCandidates({
    connectionString: "postgres://configured",
    createSql: () => sql,
    repositories: [{
      id: 7, name: "project", html_url: "https://github.com/manmohanml1/project", homepage: "",
      description: "Description", language: "TypeScript", topics: ["portfolio-showcase"],
      updated_at: "2026-08-09T12:00:00.000Z",
    }],
  });
  assert.equal(count, 1);
  assert.match(statement, /ON CONFLICT \(github_id\) DO UPDATE/);
  assert.doesNotMatch(statement, /publication_status\s*=\s*EXCLUDED/);
  assert.match(statement, /extracted_evidence = EXCLUDED\.extracted_evidence/);
  assert.match(statement, /generated_presentation = EXCLUDED\.generated_presentation/);
  assert.doesNotMatch(statement, /title_override = EXCLUDED/);
  assert.equal(parameters[11], "pending");
  assert.equal(parameters[12], null);
});

test("known checked-in projects enter the queue as an already-published baseline", async () => {
  let parameters;
  await syncProjectCandidates({
    connectionString: "postgres://configured",
    createSql: () => ({ query: async (_query, values) => { parameters = values; return []; } }),
    repositories: [{
      id: 8,
      name: "glass-tube",
      html_url: "https://github.com/manmohanml1/glass-tube",
      topics: ["portfolio-showcase"],
    }],
  });
  assert.equal(parameters[11], "approved");
  assert.equal(parameters[12], "portfolio-baseline");
});

test("project reviews use optimistic versions and append publication audit changes", async () => {
  let statement;
  let parameters;
  const sql = { query: async (query, values) => {
    statement = query; parameters = values;
    return [{
      github_id: 7, repository_name: "project", repository_url: "https://github.com/manmohanml1/project",
      topics: [], publication_status: "approved", title_override: "Project", tags_override: [],
      updated_at: "2026-08-09T12:01:00.000Z",
    }];
  } };
  const project = await reviewProjectCandidate({
    connectionString: "postgres://configured", createSql: () => sql, githubId: "7",
    review: {
      status: "approved", title: "Project", description: null, category: null, tags: [],
      caseStudy: { caseStudy: true, summary: "Evidence-backed draft", highlights: ["API"] },
      media: {
        coverImageUrl: "https://raw.githubusercontent.com/manmohanml1/project/main/preview.png",
        coverImageAlt: "Project API preview",
        demoUrl: "https://www.youtube.com/watch?v=example",
      },
    },
    expectedUpdatedAt: "2026-08-09T12:00:00.000Z", changedBy: "owner@example.com",
  });
  assert.equal(project.status, "approved");
  assert.match(statement, /portfolio_project_audit/);
  assert.match(statement, /date_trunc\('milliseconds', updated_at\)/);
  assert.match(statement, /case_study_override = \$7::jsonb/);
  assert.match(statement, /media_override = \$8::jsonb/);
  assert.equal(parameters[8], "owner@example.com");
  assert.match(parameters[7], /preview\.png/);
});

test("public store query selects only approved projects", async () => {
  let statement;
  const projects = await readApprovedProjectRows({
    connectionString: "postgres://configured",
    createSql: () => ({ query: async (query) => { statement = query; return []; } }),
  });
  assert.deepEqual(projects, []);
  assert.match(statement, /publication_status = 'approved'/);
});
