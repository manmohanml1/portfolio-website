import assert from "node:assert/strict";
import test from "node:test";
import {
  createAdminProjectMediaHandler,
  PROJECT_IMAGE_MAX_BYTES,
} from "../api/admin/project-media.js";

function createResponse() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; },
  };
}

function pngBody() {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
}

test("project image uploads require an authenticated owner and trusted origin", async () => {
  const unauthorized = createResponse();
  await createAdminProjectMediaHandler({ authorize: async () => null })(
    { method: "POST", headers: {}, query: {}, body: pngBody() }, unauthorized,
  );
  assert.equal(unauthorized.statusCode, 401);

  const untrusted = createResponse();
  await createAdminProjectMediaHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => false,
  })({ method: "POST", headers: {}, query: {}, body: pngBody() }, untrusted);
  assert.equal(untrusted.statusCode, 403);
});

test("owner can upload a validated project image to public object storage", async () => {
  let uploadInput;
  const response = createResponse();
  const handler = createAdminProjectMediaHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
    upload: async (...input) => {
      uploadInput = input;
      return { url: "https://portfolio.public.blob.vercel-storage.com/cover.png" };
    },
  });
  await handler({
    method: "POST",
    query: { githubId: "7" },
    headers: { "content-type": "image/png", "content-length": String(pngBody().length) },
    body: pngBody(),
  }, response);

  assert.equal(response.statusCode, 201);
  assert.match(response.body.url, /blob\.vercel-storage\.com/);
  assert.match(uploadInput[0], /portfolio\/projects\/7\/cover\.png/);
  assert.equal(uploadInput[2].access, "public");
});

test("project image uploads reject oversized or disguised files", async () => {
  const handler = createAdminProjectMediaHandler({
    authorize: async () => ({ label: "owner@example.com" }),
    trustedOrigin: () => true,
  });
  const oversized = createResponse();
  await handler({
    method: "POST",
    query: { githubId: "7" },
    headers: { "content-type": "image/png", "content-length": String(PROJECT_IMAGE_MAX_BYTES + 1) },
    body: pngBody(),
  }, oversized);
  assert.equal(oversized.statusCode, 413);

  const disguised = createResponse();
  await handler({
    method: "POST",
    query: { githubId: "7" },
    headers: { "content-type": "image/png" },
    body: Buffer.from("not an image"),
  }, disguised);
  assert.equal(disguised.statusCode, 400);
});
