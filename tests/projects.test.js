import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/data/portfolio.js";
import { getFilterLabel, getProjectsForFilter, PROJECT_FILTERS } from "../src/render/projects.js";

test("all declared project filters produce projects", () => {
  for (const filter of PROJECT_FILTERS) {
    assert.ok(getProjectsForFilter(filter).length > 0, `${filter} should produce cards`);
  }
});

test("specific filters return only matching projects", () => {
  for (const filter of PROJECT_FILTERS.filter((item) => item !== "all")) {
    const filtered = getProjectsForFilter(filter);
    assert.ok(filtered.every((project) => project.category === filter));
  }
});

test("all and invalid filters safely render full portfolio", () => {
  assert.equal(getProjectsForFilter("all").length, projects.length);
  assert.equal(getProjectsForFilter("invalid").length, projects.length);
  assert.equal(getFilterLabel("invalid"), "all projects");
  assert.equal(getFilterLabel("backend"), "Backend projects");
  assert.equal(getFilterLabel("ai"), "AI projects");
});
