import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeDatabaseFlags,
  readAdminFeatureConfig,
  readFeatureConfig,
  resolveFeatureConfigConnectionString,
  updateFeatureFlag,
} from "../api/_lib/feature-store.js";
import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_KEYS } from "../src/config/feature-defaults.js";

test("database rows override only registered Boolean flags", () => {
  const result = mergeDatabaseFlags([
    { key: "features.feedback.enabled", enabled: false },
    { key: "sections.skills.enabled", enabled: "false" },
    { key: "unknown.enabled", enabled: false },
  ]);

  assert.equal(result.source, "database");
  assert.equal(result.flags["features.feedback.enabled"], false);
  assert.equal(result.flags["sections.skills.enabled"], true);
  assert.deepEqual(Object.keys(result.flags), FEATURE_FLAG_KEYS);
});

test("missing database credentials fail open without opening a connection", async () => {
  let connected = false;
  const result = await readFeatureConfig({
    environment: "development",
    connectionString: "",
    createSql() {
      connected = true;
    },
  });

  assert.equal(connected, false);
  assert.equal(result.source, "defaults");
  assert.deepEqual(result.flags, DEFAULT_FEATURE_FLAGS);
});

test("shared feature configuration takes priority over an isolated deployment database", () => {
  assert.equal(
    resolveFeatureConfigConnectionString({
      FEATURE_CONFIG_DATABASE_URL: "postgresql://shared-control-plane",
      DATABASE_URL: "postgresql://isolated-preview-branch",
    }),
    "postgresql://shared-control-plane",
  );
  assert.equal(
    resolveFeatureConfigConnectionString({ DATABASE_URL: "postgresql://legacy-connection" }),
    "postgresql://legacy-connection",
  );
  assert.equal(resolveFeatureConfigConnectionString({}), "");
});

test("database reads are parameterized by environment and registered keys", async () => {
  let query;
  const result = await readFeatureConfig({
    environment: "staging",
    connectionString: "postgresql://example",
    createSql: () => ({
      async query(...args) {
        query = args;
        return [{ key: "sections.journey.enabled", enabled: false }];
      },
    }),
  });

  assert.match(query[0], /WHERE environment = \$1/);
  assert.deepEqual(query[1], ["staging", FEATURE_FLAG_KEYS]);
  assert.ok(query[2].fetchOptions.signal instanceof AbortSignal);
  assert.equal(result.source, "database");
  assert.equal(result.flags["sections.journey.enabled"], false);
});

test("database failures and empty result sets fail open to defaults", async () => {
  const failing = await readFeatureConfig({
    environment: "production",
    connectionString: "postgresql://example",
    createSql: () => ({
      query: async () => {
        throw new Error("database unavailable");
      },
    }),
  });
  const empty = await readFeatureConfig({
    environment: "production",
    connectionString: "postgresql://example",
    createSql: () => ({ query: async () => [] }),
  });

  assert.equal(failing.source, "defaults");
  assert.equal(empty.source, "defaults");
  assert.deepEqual(failing.flags, DEFAULT_FEATURE_FLAGS);
});

test("admin reads combine complete registered flags with recent audit history", async () => {
  const queries = [];
  const result = await readAdminFeatureConfig({
    environment: "staging",
    connectionString: "postgresql://example",
    createSql: () => ({
      async query(statement, parameters) {
        queries.push([statement, parameters]);
        if (statement.includes("FROM feature_audit")) {
          return [{
            feature_key: "features.feedback.enabled",
            environment: "staging",
            old_enabled: true,
            new_enabled: false,
            changed_by: "owner@example.com",
            changed_at: "2026-08-08T12:00:00.000Z",
          }];
        }
        return [{
          key: "features.feedback.enabled",
          environment: "staging",
          enabled: false,
          description: "Private feedback form",
          updated_at: "2026-08-08T12:00:00.000Z",
        }];
      },
    }),
  });

  assert.equal(queries.length, 2);
  assert.equal(result.flags.length, FEATURE_FLAG_KEYS.length);
  assert.equal(result.flags.find((flag) => flag.key === "features.feedback.enabled").enabled, false);
  assert.equal(result.audit[0].changedBy, "owner@example.com");
});

test("admin updates are parameterized with owner attribution and version checks", async () => {
  let query;
  const result = await updateFeatureFlag({
    environment: "production",
    key: "features.feedback.enabled",
    enabled: false,
    expectedUpdatedAt: "2026-08-08T12:00:00.000Z",
    changedBy: "owner@example.com",
    connectionString: "postgresql://example",
    createSql: () => ({
      async query(...args) {
        query = args;
        return [{
          key: "features.feedback.enabled",
          environment: "production",
          enabled: false,
          description: "Private feedback form",
          updated_at: "2026-08-08T12:01:00.000Z",
        }];
      },
    }),
  });

  assert.match(query[0], /set_config\('app.changed_by'/);
  assert.deepEqual(query[1], [
    "production",
    "features.feedback.enabled",
    false,
    "owner@example.com",
    "2026-08-08T12:00:00.000Z",
  ]);
  assert.equal(result.enabled, false);
});
