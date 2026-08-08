import assert from "node:assert/strict";
import test from "node:test";
import handler, { createPublicFeatureConfig, resolveConfigEnvironment } from "../api/config.js";
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
  assert.deepEqual(Object.keys(config.flags), FEATURE_FLAG_KEYS);
});

test("config endpoint serves cacheable GET responses", () => {
  const response = createResponse();
  handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["Cache-Control"], /s-maxage=30/);
  assert.deepEqual(Object.keys(response.body.flags), FEATURE_FLAG_KEYS);
});

test("config endpoint rejects write methods", () => {
  const response = createResponse();
  handler({ method: "POST" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET");
  assert.deepEqual(response.body, { error: "Method not allowed" });
});
