import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { release } from "../src/config/release.js";

const qualityWorkflow = await readFile(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");

test("current release identifies the deployed feature version", () => {
  assert.match(release.version, /^v\d+\.\d+\.\d+$/);
  assert.equal(release.version, "v1.2.0");
  assert.equal(release.type, "feat");
  assert.equal(release.label, "Feature release");
});

test("pull request quality workflow enforces change-type title prefixes", () => {
  assert.match(qualityWorkflow, /Validate PR title convention/);
  assert.match(qualityWorkflow, /\^\(feat\|fix\):/);
});
