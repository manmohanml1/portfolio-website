import assert from "node:assert/strict";
import test from "node:test";
import {
  applyProjectCuration,
  fetchOptInProjects,
  LIVE_PROJECT_TOPIC,
  mapGitHubRepository,
  PORTFOLIO_TOPIC,
} from "../src/services/github-projects.js";
import { escapeHtml, safeExternalUrl } from "../src/utils/dom.js";

const selectedRepository = {
  name: "fresh-api-project",
  html_url: "https://github.com/manmohanml1/fresh-api-project",
  homepage: "https://example.com/demo",
  description: "A typed service.",
  language: "TypeScript",
  topics: [PORTFOLIO_TOPIC, "portfolio-backend", "express"],
  archived: false,
  fork: false,
};

test("tagged GitHub repositories map into filterable portfolio cards", () => {
  const project = mapGitHubRepository(selectedRepository);

  assert.equal(project.title, "Fresh API Project");
  assert.equal(project.category, "backend");
  assert.equal(project.type, "Backend");
  assert.deepEqual(project.tags, ["TypeScript", "Express"]);
  assert.equal(project.size, undefined);
  assert.equal(project.live, undefined);
});

test("only owner-approved repositories returned by the publishing API are fetched", async () => {
  let requestedUrl;
  const projects = await fetchOptInProjects(async (url) => {
    requestedUrl = url;
    return {
    ok: true,
    json: async () => ({ repositories: [selectedRepository] }),
  };
  });

  assert.equal(requestedUrl, "/api/projects");
  assert.deepEqual(projects.map((project) => project.title), ["Fresh API Project"]);
});

test("owner curation overrides generated presentation without changing repository identity", () => {
  const project = applyProjectCuration(mapGitHubRepository(selectedRepository), {
    title: "Production API Foundation",
    description: "A reviewed service architecture case study.",
    category: "data",
    tags: ["TypeScript", "PostgreSQL", "AWS"],
    caseStudy: { caseStudy: true, summary: "Evidence-backed summary", build: "Built as an API." },
    media: {
      coverImageUrl: "https://raw.githubusercontent.com/manmohanml1/fresh-api-project/main/preview.png",
      coverImageAlt: "API dashboard preview",
      demoUrl: "https://www.youtube.com/watch?v=example",
    },
    ownerReviewed: true,
  });

  assert.equal(project.title, "Production API Foundation");
  assert.equal(project.description, "A reviewed service architecture case study.");
  assert.equal(project.category, "data");
  assert.equal(project.type, "Data");
  assert.deepEqual(project.tags, ["TypeScript", "PostgreSQL", "AWS"]);
  assert.equal(project.repo, selectedRepository.html_url);
  assert.equal(project.details.summary, "Evidence-backed summary");
  assert.equal(project.details.caseStudy, true);
  assert.match(project.details.preview.src, /preview\.png/);
  assert.equal(project.details.preview.alt, "API dashboard preview");
  assert.match(project.details.demoUrl, /youtube\.com/);
  assert.equal(project.ownerReviewed, true);
});

test("externally sourced card content is safely prepared for HTML rendering", () => {
  assert.equal(escapeHtml("<script>bad()</script>"), "&lt;script&gt;bad()&lt;/script&gt;");
  assert.equal(safeExternalUrl("javascript:alert(1)"), "#");
  assert.equal(safeExternalUrl("https://github.com/manmohanml1/project"), "https://github.com/manmohanml1/project");
});

test("Meta Display apps receive wearable presentation from public descriptions", () => {
  const wearable = mapGitHubRepository({
    ...selectedRepository,
    name: "glass-search-meta-display",
    description: "Voice and handwriting-first browser for Meta Ray-Ban Display glasses",
    topics: [PORTFOLIO_TOPIC],
  });

  assert.equal(wearable.title, "Glass Search");
  assert.equal(wearable.category, "wearable");
  assert.equal(wearable.type, "Meta Display");
  assert.equal(wearable.visual, "Search UI");
  assert.deepEqual(wearable.tags, ["TypeScript", "Meta Display"]);
  assert.equal(wearable.size, undefined);
  assert.match(wearable.details.build, /600 x 600/);
});

test("published project previews are surfaced only for explicitly curated apps", () => {
  const glassTube = mapGitHubRepository({
    ...selectedRepository,
    name: "glass-tube",
    description: "YouTube viewer prototype for Meta Ray-Ban Display glasses",
    topics: [PORTFOLIO_TOPIC],
  });
  const travelGuide = mapGitHubRepository({
    ...selectedRepository,
    name: "autonomous-travel-guide-mrbd",
    description: "Glasses-first travel guide",
    topics: [PORTFOLIO_TOPIC],
  });

  assert.match(glassTube.details.preview.src, /glass-tube-player\.png$/);
  assert.equal(travelGuide.details.preview, undefined);
  assert.match(travelGuide.details.purpose, /guidance/);
});

test("live app links require an explicit verified-live topic", () => {
  const withoutOptIn = mapGitHubRepository(selectedRepository);
  const withOptIn = mapGitHubRepository({
    ...selectedRepository,
    topics: [...selectedRepository.topics, LIVE_PROJECT_TOPIC],
  });

  assert.equal(withoutOptIn.live, undefined);
  assert.equal(withOptIn.live, "https://example.com/demo");
});
