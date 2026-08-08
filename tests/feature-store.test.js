import assert from "node:assert/strict";
import test from "node:test";
import { mergeDatabaseFlags, readFeatureConfig } from "../api/_lib/feature-store.js";
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
