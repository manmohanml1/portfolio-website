import assert from "node:assert/strict";
import test from "node:test";
import { createAdminProjectsHandler } from "../api/admin/projects.js";

function createResponse() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; },
  };
}

test("project publishing endpoint requires owner authentication", async () => {
  const response = createResponse();
  await createAdminProjectsHandler({ authorize: async () => null })({ method: "GET" }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("owner can read and synchronize the project publishing queue", async () => {
  let synchronized = 0;
  const handler = createAdminProjectsHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
    discover: async () => [{ id: 7, name: "new-project" }],
    sync: async ({ repositories }) => { synchronized = repositories.length; return repositories.length; },
    readQueue: async () => ({ source: "database", projects: [], audit: [] }),
  });
  const response = createResponse();
  await handler({ method: "POST", body: { action: "sync" } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.owner, "owner@example.com");
  assert.equal(response.body.synced, 1);
  assert.equal(synchronized, 1);
});

test("project publishing writes require trusted origins and valid review fields", async () => {
  const authorize = async () => ({ label: "owner@example.com" });
  const untrusted = createResponse();
  await createAdminProjectsHandler({ authorize, trustedOrigin: () => false })(
    { method: "PUT", body: {} }, untrusted,
  );
  assert.equal(untrusted.statusCode, 403);

  const invalid = createResponse();
  await createAdminProjectsHandler({ authorize, trustedOrigin: () => true })(
    { method: "PUT", body: { githubId: "7", status: "public" } }, invalid,
  );
  assert.equal(invalid.statusCode, 400);
});

test("project review attributes the owner and protects against stale writes", async () => {
  let reviewInput;
  const response = createResponse();
  const handler = createAdminProjectsHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
    review: async (input) => { reviewInput = input; return null; },
  });
  await handler({
    method: "PUT",
    body: {
      githubId: "7",
      status: "approved",
      title: "Reviewed project",
      description: "Owner reviewed description",
      category: "backend",
      tags: ["TypeScript", "AWS"],
      expectedUpdatedAt: "2026-08-09T12:00:00.000Z",
    },
  }, response);
  assert.equal(response.statusCode, 409);
  assert.equal(reviewInput.changedBy, "owner@example.com");
  assert.equal(reviewInput.review.status, "approved");
});
