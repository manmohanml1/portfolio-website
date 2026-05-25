import assert from "node:assert/strict";
import test from "node:test";
import {
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

test("only opt-in non-archived owned repositories are fetched", async () => {
  const projects = await fetchOptInProjects(async () => ({
    ok: true,
    json: async () => [
      selectedRepository,
      { ...selectedRepository, name: "untagged", topics: [] },
      { ...selectedRepository, name: "archived", archived: true },
      { ...selectedRepository, name: "forked", fork: true },
    ],
  }));

  assert.deepEqual(projects.map((project) => project.title), ["Fresh API Project"]);
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
