import assert from "node:assert/strict";
import test from "node:test";
import { fetchOptInProjects, mapGitHubRepository, PORTFOLIO_TOPIC } from "../src/services/github-projects.js";
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

  assert.equal(project.title, "fresh api project");
  assert.equal(project.category, "backend");
  assert.equal(project.type, "Backend");
  assert.deepEqual(project.tags, ["TypeScript", "Express"]);
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

  assert.deepEqual(projects.map((project) => project.title), ["fresh api project"]);
});

test("externally sourced card content is safely prepared for HTML rendering", () => {
  assert.equal(escapeHtml("<script>bad()</script>"), "&lt;script&gt;bad()&lt;/script&gt;");
  assert.equal(safeExternalUrl("javascript:alert(1)"), "#");
  assert.equal(safeExternalUrl("https://github.com/manmohanml1/project"), "https://github.com/manmohanml1/project");
});
