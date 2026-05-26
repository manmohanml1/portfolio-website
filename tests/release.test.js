import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { release } from "../src/config/release.js";

const qualityWorkflow = await readFile(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");
const pullRequestTemplate = await readFile(new URL("../.github/PULL_REQUEST_TEMPLATE.md", import.meta.url), "utf8");
const deployment = await readFile(new URL("../DEPLOYMENT.md", import.meta.url), "utf8");
const roadmap = await readFile(new URL("../ROADMAP.md", import.meta.url), "utf8");

test("current release identifies the deployed patch version", () => {
  assert.match(release.version, /^v\d+\.\d+\.\d+$/);
  assert.equal(release.version, "v1.2.1");
  assert.equal(release.type, "fix");
  assert.equal(release.label, "Patch release");
});

test("pull request quality workflow enforces change-type title prefixes", () => {
  assert.match(qualityWorkflow, /Validate PR title convention/);
  assert.match(qualityWorkflow, /\^\(feat\|fix\):/);
});

test("roadmap marks shipped v1.2 capabilities as delivered", () => {
  for (const feature of ["Project Case Study Mode", "Architecture Explorer", "Visitor Feedback Channel"]) {
    assert.match(roadmap, new RegExp(`\\| ${feature} .*\\| Shipped in v1\\.2\\.0 \\|`));
  }

  assert.doesNotMatch(roadmap, /In local review/);
});

test("release checklists protect roadmap promotion and GitHub release tagging", () => {
  assert.match(pullRequestTemplate, /Updated `ROADMAP\.md` delivery status/);
  assert.match(pullRequestTemplate, /Reviewed the Vercel Preview/);
  assert.match(deployment, /Create the matching GitHub release tag/);
  assert.match(deployment, /public release badge/);
});
