import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FEATURE_FLAG_KEYS } from "../src/config/feature-defaults.js";

const migration = await readFile(
  new URL("../db/migrations/001_create_feature_config.sql", import.meta.url),
  "utf8",
);
const seed = await readFile(
  new URL("../db/seeds/001_feature_flags.sql", import.meta.url),
  "utf8",
);
const visitorCustomizationMigration = await readFile(
  new URL("../db/migrations/002_add_visitor_customization_flag.sql", import.meta.url),
  "utf8",
);
const projectPublishingMigration = await readFile(
  new URL("../db/migrations/003_create_project_publishing_queue.sql", import.meta.url),
  "utf8",
);
const projectEvidenceMigration = await readFile(
  new URL("../db/migrations/004_add_project_evidence_drafts.sql", import.meta.url),
  "utf8",
);
const curatedProjectBaselineMigration = await readFile(
  new URL("../db/migrations/005_publish_curated_project_baseline.sql", import.meta.url),
  "utf8",
);

test("migration creates environment-scoped flags and automatic audit history", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS feature_flags/);
  assert.match(migration, /UNIQUE \(key, environment\)/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS feature_audit/);
  assert.match(migration, /CREATE TRIGGER feature_flags_audit_trigger/);
  assert.match(migration, /development.*staging.*production/s);
});

test("seed includes every registered key and all three environments", () => {
  FEATURE_FLAG_KEYS.forEach((key) => assert.match(seed, new RegExp(key.replaceAll(".", "\\."))));
  for (const environment of ["development", "staging", "production"]) {
    assert.match(seed, new RegExp(`\\('${environment}'\\)`));
  }
  assert.match(seed, /ON CONFLICT \(key, environment\) DO NOTHING/);
});

test("visitor customization can be added idempotently to an existing configuration database", () => {
  assert.match(visitorCustomizationMigration, /features\.visitorCustomization\.enabled/);
  assert.match(visitorCustomizationMigration, /development.*staging.*production/s);
  assert.match(visitorCustomizationMigration, /ON CONFLICT \(key, environment\) DO NOTHING/);
});

test("project publishing migration separates moderation state and audit history", () => {
  assert.match(projectPublishingMigration, /CREATE TABLE IF NOT EXISTS portfolio_project_queue/);
  assert.match(projectPublishingMigration, /pending.*approved.*hidden/s);
  assert.match(projectPublishingMigration, /CREATE TABLE IF NOT EXISTS portfolio_project_audit/);
  assert.match(projectPublishingMigration, /title_override/);
  assert.match(projectPublishingMigration, /description_override/);
  assert.match(projectPublishingMigration, /CREATE TRIGGER portfolio_project_updated_at/);
});

test("project evidence migration stores extracted signals separately from owner edits", () => {
  assert.match(projectEvidenceMigration, /generated_presentation JSONB/);
  assert.match(projectEvidenceMigration, /extracted_evidence JSONB/);
  assert.match(projectEvidenceMigration, /generated_case_study JSONB/);
  assert.match(projectEvidenceMigration, /case_study_override JSONB/);
  assert.match(projectEvidenceMigration, /media_override JSONB/);
  assert.match(projectEvidenceMigration, /USING GIN \(extracted_evidence\)/);
});

test("curated project migration publishes only untouched baseline records with audit history", () => {
  assert.match(curatedProjectBaselineMigration, /portfolio-baseline/);
  assert.match(curatedProjectBaselineMigration, /publication_status = 'pending'/);
  assert.match(curatedProjectBaselineMigration, /reviewed_at IS NULL/);
  assert.match(curatedProjectBaselineMigration, /INSERT INTO portfolio_project_audit/);
  assert.match(curatedProjectBaselineMigration, /novel-browser-glass/);
});
