import assert from "node:assert/strict";
import test from "node:test";
import { extractReadmeSections, generateProjectDraft } from "../api/_lib/project-draft.js";
import { extractEvidenceDocumentPaths, extractMediaCandidates } from "../api/_lib/github-discovery.js";
import { isUsefulProjectImage } from "../src/config/project-media.js";

const repository = {
  name: "secure-orders-api",
  description: "A typed order-processing service.",
  language: "TypeScript",
  topics: ["portfolio-showcase", "portfolio-backend", "aws"],
};

const readme = `
# Secure Orders API

A service for receiving and tracking customer orders.

## Problem
Order state must remain consistent while requests arrive concurrently.

## Architecture
NestJS exposes REST APIs and stores order state in PostgreSQL on AWS.

## Testing
Jest validates service and API behavior through GitHub Actions.
`;

test("README extraction preserves useful sections while removing markdown decoration", () => {
  const sections = extractReadmeSections(readme);
  assert.deepEqual(sections.map((section) => section.heading), [
    "Secure Orders API", "Problem", "Architecture", "Testing",
  ]);
  assert.match(sections[2].content, /NestJS exposes REST APIs/);
});

test("project drafts use observed repository evidence to prefill review content", () => {
  const draft = generateProjectDraft(repository, {
    readme,
    languages: { TypeScript: 9000, JavaScript: 400 },
  });
  assert.equal(draft.presentation.title, "Secure Orders API");
  assert.equal(draft.presentation.category, "backend");
  assert.ok(draft.presentation.tags.includes("NestJS"));
  assert.ok(draft.presentation.tags.includes("PostgreSQL"));
  assert.match(draft.caseStudy.challenge, /consistent/);
  assert.match(draft.caseStudy.build, /NestJS/);
  assert.match(draft.caseStudy.engineering, /Jest/);
  assert.equal(draft.evidence.source, "github");
});

test("missing README evidence remains blank instead of inventing outcomes", () => {
  const draft = generateProjectDraft(repository, { languages: { TypeScript: 1 } });
  assert.equal(draft.caseStudy.challenge, "");
  assert.equal(draft.caseStudy.outcome, "");
  assert.match(draft.caseStudy.build, /Repository evidence identifies/);
});

test("repository enrichment follows only bounded local engineering documents", () => {
  const paths = extractEvidenceDocumentPaths(`
    [Architecture](ARCHITECTURE.md)
    [Testing](docs/TESTING.md#coverage)
    [Roadmap](ROADMAP.md)
    [External](https://example.com/DESIGN.md)
    [Escape](../private-architecture.md)
  `);
  assert.deepEqual(paths, ["ARCHITECTURE.md", "docs/TESTING.md"]);
});

test("repository enrichment proposes bounded HTTPS image and demo candidates", () => {
  const candidates = extractMediaCandidates({
    name: "secure-orders-api",
    full_name: "manmohanml1/secure-orders-api",
    default_branch: "main",
  }, `
    ![Dashboard](docs/dashboard.png)
    <img src="https://user-images.githubusercontent.com/example/diagram.png" alt="Architecture diagram">
    ![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=flat)
    ![Build badge](docs/build-badge.svg)
    [Demo](https://www.youtube.com/watch?v=example)
    [Unsafe](javascript:alert(1))
  `);

  const images = candidates.filter((candidate) => candidate.kind === "image");
  const videos = candidates.filter((candidate) => candidate.kind === "video");
  assert.equal(images.length, 2);
  assert.equal(images[0].alt, "Dashboard");
  assert.match(images[0].url, /raw\.githubusercontent\.com.*docs\/dashboard\.png/);
  assert.equal(videos.length, 1);
  assert.match(videos[0].url, /youtube\.com/);
});

test("project covers reject badges, SVGs, unsafe schemes, and lookalike status art", () => {
  assert.equal(isUsefulProjectImage({ url: "https://img.shields.io/badge/build-passing.svg" }), false);
  assert.equal(isUsefulProjectImage({ url: "https://example.com/project-cover.svg" }), false);
  assert.equal(isUsefulProjectImage({ url: "javascript:alert(1)" }), false);
  assert.equal(isUsefulProjectImage({
    url: "https://example.com/status.png",
    alt: "Build status",
  }), false);
  assert.equal(isUsefulProjectImage({ url: "https://example.com/project-dashboard.webp" }), true);
});
