import assert from "node:assert/strict";
import test from "node:test";
import { ENVIRONMENTS, resolveEnvironment } from "../src/config/environment.js";

test("localhost defaults to development", () => {
  assert.equal(resolveEnvironment({ hostname: "localhost" }).name, "development");
  assert.equal(resolveEnvironment({ hostname: "127.0.0.1" }).name, "development");
});

test("local environment overrides support staging and production validation", () => {
  assert.equal(resolveEnvironment({ hostname: "localhost", search: "?env=staging" }).name, "staging");
  assert.equal(resolveEnvironment({ hostname: "localhost", search: "?env=production" }).name, "production");
});

test("remote preview and production hostnames resolve safely", () => {
  assert.equal(resolveEnvironment({ hostname: "portfolio-staging.example.com" }).name, "staging");
  assert.equal(resolveEnvironment({ hostname: "preview-123.vercel.app" }).name, "staging");
  assert.equal(resolveEnvironment({ hostname: "portfolio.example.com" }).name, "production");
});

test("invalid overrides do not escape defined environments", () => {
  assert.equal(resolveEnvironment({ hostname: "localhost", search: "?env=anything" }).name, "development");
  assert.deepEqual(Object.keys(ENVIRONMENTS), ["development", "staging", "production"]);
});

test("CI validates only a defined target environment", () => {
  const target = process.env.PORTFOLIO_ENV;

  if (target) {
    assert.ok(ENVIRONMENTS[target], `${target} must be configured before deployment`);
  }
});
