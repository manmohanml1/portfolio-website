import assert from "node:assert/strict";
import test from "node:test";
import { mergeSavedFlag } from "../src/admin/api.js";

test("a successful flag save commits the returned value and optimistic version", () => {
  const state = {
    owner: "owner-id",
    source: "database",
    flags: [{
      key: "features.feedback.enabled",
      environment: "staging",
      enabled: true,
      updatedAt: "2026-08-08T12:00:00.000Z",
    }],
    audit: [],
  };
  const savedFlag = {
    key: "features.feedback.enabled",
    environment: "staging",
    enabled: false,
    updatedAt: "2026-08-08T12:01:00.000Z",
  };

  const result = mergeSavedFlag(state, savedFlag);

  assert.equal(result.flags[0].enabled, false);
  assert.equal(result.flags[0].updatedAt, savedFlag.updatedAt);
  assert.deepEqual(result.audit[0], {
    key: savedFlag.key,
    environment: "staging",
    oldEnabled: true,
    newEnabled: false,
    changedBy: "owner-id",
    changedAt: savedFlag.updatedAt,
  });
  assert.equal(state.flags[0].enabled, true);
});
