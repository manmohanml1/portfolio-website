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
