import assert from "node:assert/strict";
import test from "node:test";
import { setupPublicObservability, shouldCollectObservability } from "../src/features/observability.js";

test("observability collects only on deployed public pages", () => {
  assert.equal(shouldCollectObservability({ protocol: "https:", hostname: "portfolio.example", pathname: "/" }), true);
  assert.equal(shouldCollectObservability({ protocol: "https:", hostname: "portfolio.example", pathname: "/admin.html" }), false);
  assert.equal(shouldCollectObservability({ protocol: "http:", hostname: "localhost", pathname: "/" }), false);
});

test("public observability injects one analytics and speed script", () => {
  const scripts = [];
  const documentLike = {
    head: {
      querySelector: (selector) => scripts.find((script) => selector.includes(script.src)),
      append: (script) => scripts.push(script),
    },
    createElement: () => ({ dataset: {} }),
  };
  const windowLike = {};
  const locationLike = { protocol: "https:", hostname: "portfolio.example", pathname: "/" };

  assert.equal(setupPublicObservability({ documentLike, locationLike, windowLike }), true);
  assert.equal(setupPublicObservability({ documentLike, locationLike, windowLike }), true);
  assert.deepEqual(scripts.map((script) => script.src), [
    "/_vercel/insights/script.js",
    "/_vercel/speed-insights/script.js",
  ]);
  assert.equal(typeof windowLike.va, "function");
  assert.equal(typeof windowLike.si, "function");
});
