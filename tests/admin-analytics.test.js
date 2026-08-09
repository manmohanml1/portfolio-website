import assert from "node:assert/strict";
import test from "node:test";
import { createAdminAnalyticsHandler } from "../api/admin/analytics.js";

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test("analytics endpoint rejects unauthenticated requests", async () => {
  const response = createResponse();
  await createAdminAnalyticsHandler({ authorize: async () => null })({ method: "GET" }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("analytics endpoint validates the reporting window", async () => {
  const response = createResponse();
  await createAdminAnalyticsHandler({
    authorize: async () => ({ label: "owner@example.com" }),
  })({ method: "GET", query: { days: "90" } }, response);
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { error: "Invalid analytics range" });
});

test("owner receives only the normalized analytics summary", async () => {
  const response = createResponse();
  let requestedDays;
  await createAdminAnalyticsHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    readSummary: async ({ days }) => {
      requestedDays = days;
      return { configured: true, totals: { pageviews: 12, visitors: 8 } };
    },
  })({ method: "GET", query: { days: "30" } }, response);
  assert.equal(requestedDays, 30);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.owner, "owner@example.com");
  assert.equal(response.body.totals.pageviews, 12);
});
