import assert from "node:assert/strict";
import test from "node:test";
import { createAdminFeatureHandler } from "../api/admin/features.js";

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; },
  };
}

test("admin feature endpoint rejects unauthenticated requests", async () => {
  const handler = createAdminFeatureHandler({ authorize: async () => null });
  const response = createResponse();
  await handler({ method: "GET", query: { environment: "development" } }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("owner can read an environment-scoped control-plane state", async () => {
  let requestedEnvironment;
  const handler = createAdminFeatureHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    readConfig: async ({ environment }) => {
      requestedEnvironment = environment;
      return { source: "database", flags: [], audit: [] };
    },
  });
  const response = createResponse();
  await handler({ method: "GET", query: { environment: "staging" } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(requestedEnvironment, "staging");
  assert.equal(response.body.owner, "owner@example.com");
});

test("admin updates require a trusted origin and registered Boolean flag", async () => {
  const authorize = async () => ({ label: "owner@example.com" });
  const untrustedHandler = createAdminFeatureHandler({ authorize, trustedOrigin: () => false });
  const untrustedResponse = createResponse();
  await untrustedHandler({
    method: "PUT",
    query: { environment: "production" },
    body: { key: "features.feedback.enabled", enabled: false },
  }, untrustedResponse);
  assert.equal(untrustedResponse.statusCode, 403);

  const invalidHandler = createAdminFeatureHandler({ authorize, trustedOrigin: () => true });
  const invalidResponse = createResponse();
  await invalidHandler({
    method: "PUT",
    query: { environment: "production" },
    body: { key: "unknown.enabled", enabled: false },
  }, invalidResponse);
  assert.equal(invalidResponse.statusCode, 400);
});

test("admin updates attribute the owner and enforce optimistic conflicts", async () => {
  let updateInput;
  const handler = createAdminFeatureHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
    updateFlag: async (input) => {
      updateInput = input;
      return null;
    },
  });
  const response = createResponse();
  await handler({
    method: "PUT",
    query: { environment: "staging" },
    body: {
      key: "features.feedback.enabled",
      enabled: false,
      expectedUpdatedAt: "2026-08-08T12:00:00.000Z",
    },
  }, response);

  assert.equal(response.statusCode, 409);
  assert.equal(updateInput.changedBy, "owner@example.com");
  assert.equal(updateInput.environment, "staging");
});

test("admin writes require a valid optimistic update timestamp", async () => {
  const handler = createAdminFeatureHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
  });
  const response = createResponse();
  await handler({
    method: "PUT",
    query: { environment: "staging" },
    body: { key: "features.feedback.enabled", enabled: false },
  }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Invalid update version");
});
