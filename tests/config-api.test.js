import assert from "node:assert/strict";
import test from "node:test";
import handler, {
  createConfigHandler,
  createPublicFeatureConfig,
  resolveConfigEnvironment,
} from "../api/config.js";
import { FEATURE_FLAG_KEYS } from "../src/config/feature-defaults.js";

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
}

test("Vercel environments map to portfolio environments", () => {
  assert.equal(resolveConfigEnvironment("production"), "production");
  assert.equal(resolveConfigEnvironment("preview"), "staging");
  assert.equal(resolveConfigEnvironment("development"), "development");
  assert.equal(resolveConfigEnvironment(undefined), "development");
});

test("public configuration contains only registered flags", () => {
  const config = createPublicFeatureConfig("production");

  assert.equal(config.version, 1);
  assert.equal(config.environment, "production");
  assert.equal(config.source, "defaults");
  assert.deepEqual(Object.keys(config.flags), FEATURE_FLAG_KEYS);
});

test("config endpoint never caches database responses", async () => {
  const response = createResponse();
  const databaseHandler = createConfigHandler({
    readConfig: async () => ({
      source: "database",
      flags: createPublicFeatureConfig().flags,
    }),
  });
  await databaseHandler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Cache-Control"], "no-store, max-age=0");
  assert.equal(response.headers["CDN-Cache-Control"], "no-store");
  assert.equal(response.headers["Vercel-CDN-Cache-Control"], "no-store");
  assert.equal(response.body.source, "database");
  assert.deepEqual(Object.keys(response.body.flags), FEATURE_FLAG_KEYS);
});

test("config endpoint does not cache fallback responses", async () => {
  const response = createResponse();
  await handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Cache-Control"], "no-store, max-age=0");
  assert.equal(response.body.source, "defaults");
});

test("config endpoint rejects write methods", async () => {
  const response = createResponse();
  await handler({ method: "POST" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET");
  assert.deepEqual(response.body, { error: "Method not allowed" });
});
