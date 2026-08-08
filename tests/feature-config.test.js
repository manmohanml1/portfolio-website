import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_KEYS, isKnownFeatureFlag } from "../src/config/feature-defaults.js";
import { applyFeatureAvailability } from "../src/features/feature-availability.js";
import {
  createDefaultFeatureConfig,
  getFeatureConfigEndpoint,
  isFeatureEnabled,
  loadFeatureConfig,
  normalizeFeatureConfig,
} from "../src/services/feature-config.js";

test("feature registry starts with six enabled public flags", () => {
  assert.equal(FEATURE_FLAG_KEYS.length, 6);
  assert.ok(FEATURE_FLAG_KEYS.every((key) => DEFAULT_FEATURE_FLAGS[key] === true));
  assert.equal(isKnownFeatureFlag("features.feedback.enabled"), true);
  assert.equal(isKnownFeatureFlag("unknown.enabled"), false);
});

test("remote configuration accepts known booleans and ignores unknown or malformed values", () => {
  const config = normalizeFeatureConfig(
    {
      flags: {
        "sections.journey.enabled": false,
        "sections.skills.enabled": "false",
        "unknown.enabled": false,
      },
    },
    "staging",
  );

  assert.equal(config.environment, "staging");
  assert.equal(config.source, "remote");
  assert.equal(config.flags["sections.journey.enabled"], false);
  assert.equal(config.flags["sections.skills.enabled"], true);
  assert.equal(Object.hasOwn(config.flags, "unknown.enabled"), false);
});

test("missing and malformed payloads fall back to the complete default experience", () => {
  for (const payload of [null, [], {}, { flags: null }]) {
    assert.deepEqual(normalizeFeatureConfig(payload, "production"), createDefaultFeatureConfig("production"));
  }
});

test("failed and non-success requests fail open to defaults", async () => {
  const failed = await loadFeatureConfig({
    environment: "production",
    fetchImpl: async () => {
      throw new Error("offline");
    },
    locationLike: { origin: "https://portfolio.example", hostname: "portfolio.example", search: "" },
  });
  const missing = await loadFeatureConfig({
    environment: "production",
    fetchImpl: async () => ({ ok: false }),
    locationLike: { origin: "https://portfolio.example", hostname: "portfolio.example", search: "" },
  });

  assert.equal(failed.source, "defaults");
  assert.equal(missing.source, "defaults");
  assert.equal(isFeatureEnabled(failed, "features.feedback.enabled"), true);
});

test("successful requests normalize the response and send an abort signal", async () => {
  let request;
  const config = await loadFeatureConfig({
    environment: "development",
    fetchImpl: async (...args) => {
      request = args;
      return {
        ok: true,
        json: async () => ({ flags: { "features.feedback.enabled": false } }),
      };
    },
    locationLike: { origin: "http://localhost:4173", hostname: "localhost", search: "" },
  });

  assert.equal(request[0], "/api/config");
  assert.ok(request[1].signal instanceof AbortSignal);
  assert.equal(config.source, "remote");
  assert.equal(config.flags["features.feedback.enabled"], false);
});

test("query overrides are forwarded only during local development", () => {
  const search = "?flag=sections.journey.enabled:false&flag=features.feedback.enabled:false";

  assert.equal(
    getFeatureConfigEndpoint({ origin: "http://localhost:4173", hostname: "localhost", search }),
    "/api/config?flag=sections.journey.enabled%3Afalse&flag=features.feedback.enabled%3Afalse",
  );
  assert.equal(
    getFeatureConfigEndpoint({ origin: "https://portfolio.example", hostname: "portfolio.example", search }),
    "/api/config",
  );
});

test("feature availability hides controlled UI and exposes configuration health", () => {
  const elements = new Map();
  const createElement = () => ({
    hidden: false,
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  });

  ["#journey", 'a[href="#journey"]', "[data-open-feedback]", "#feedback-dialog"].forEach((selector) => {
    elements.set(selector, [createElement()]);
  });

  const documentLike = {
    documentElement: { dataset: {} },
    querySelectorAll(selector) {
      return elements.get(selector) || [];
    },
  };
  const config = normalizeFeatureConfig({
    flags: {
      "sections.journey.enabled": false,
      "features.feedback.enabled": false,
    },
  });

  applyFeatureAvailability(config, documentLike);

  for (const selector of ["#journey", 'a[href="#journey"]', "[data-open-feedback]", "#feedback-dialog"]) {
    assert.equal(elements.get(selector)[0].hidden, true);
    assert.equal(elements.get(selector)[0].attributes["aria-hidden"], "true");
  }
  assert.equal(documentLike.documentElement.dataset.featureConfigSource, "remote");
});
