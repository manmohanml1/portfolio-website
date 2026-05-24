import assert from "node:assert/strict";
import test from "node:test";
import { caseStudies, credentials, experiences, projects, skills, stackItems } from "../src/data/portfolio.js";
import { DEFAULT_THEME, resolveTheme, themes } from "../src/data/themes.js";

test("portfolio data has project basics needed by renderers", () => {
  assert.ok(projects.length >= 6);

  for (const project of projects) {
    assert.ok(project.title);
    assert.match(project.repo, /^https:\/\/github\.com\/manmohanml1\//);
    assert.ok(project.category);
    assert.ok(project.type);
    assert.ok(project.visual);
    assert.ok(project.accent);
    assert.ok(project.tags.length >= 2);
  }
});

test("project filters have visible content", () => {
  const categories = new Set(projects.map((project) => project.category));

  for (const category of ["frontend", "backend", "data", "ai"]) {
    assert.ok(categories.has(category), `missing ${category} project`);
  }
});

test("theme config includes spatial default and unique ids", () => {
  const ids = themes.map((theme) => theme.id);

  assert.ok(ids.includes("spatial"));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(themes.length >= 8);

  for (const theme of themes) {
    assert.ok(theme.label);
    assert.equal(theme.swatches.length, 3);
  }
});

test("theme resolver uses supported themes and safely falls back", () => {
  assert.equal(resolveTheme("terminal"), "terminal");
  assert.equal(resolveTheme("unknown-theme"), DEFAULT_THEME);
  assert.equal(resolveTheme(undefined), DEFAULT_THEME);
});

test("supporting sections have enough content to render", () => {
  assert.ok(caseStudies.length >= 3);
  assert.ok(experiences.length >= 3);
  assert.ok(credentials.length >= 4);
  assert.ok(skills.length >= 4);
  assert.ok(stackItems.length >= 10);
});
