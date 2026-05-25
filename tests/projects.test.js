import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/data/portfolio.js";
import { createProjectDetailTemplate } from "../src/features/project-dialog.js";
import { getFilterLabel, getProjectActionLabel, getProjectsForFilter, mergeProjects, PROJECT_FILTERS } from "../src/render/projects.js";

test("all declared project filters produce projects", () => {
  for (const filter of PROJECT_FILTERS.filter((item) => item !== "wearable")) {
    assert.ok(getProjectsForFilter(filter).length > 0, `${filter} should produce cards`);
  }
});

test("specific filters return only matching projects", () => {
  for (const filter of PROJECT_FILTERS.filter((item) => !["all", "wearable"].includes(item))) {
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
  assert.equal(getFilterLabel("wearable"), "Wearable projects");
});

test("live discovered projects are appended without duplicating curated repositories", () => {
  const added = { ...projects[0], repo: "https://github.com/manmohanml1/new-project", title: "New project" };
  const duplicate = { ...projects[0], title: "Duplicate title ignored" };
  const merged = mergeProjects(projects, [duplicate, added]);

  assert.equal(merged.length, projects.length + 1);
  assert.equal(merged.at(-1).title, "New project");
});

test("wearable projects can be added and filtered after GitHub discovery", () => {
  const wearable = { ...projects[0], repo: "https://github.com/manmohanml1/display-app", category: "wearable" };
  const merged = mergeProjects(projects, [wearable]);

  assert.deepEqual(getProjectsForFilter("wearable", merged), [wearable]);
});

test("project detail dialog presents safely separated repository actions", () => {
  const template = createProjectDetailTemplate(projects[0]);

  assert.match(template, /Problem and outcome/);
  assert.match(template, /Implementation/);
  assert.match(template, /target="_blank" rel="noopener noreferrer">Repository/);
  assert.match(template, /data-feedback-project=.*Suggest improvement/);
  assert.doesNotMatch(template, /repo-size|[KMG]B/);
  assert.doesNotMatch(template, />Live app</);
  assert.doesNotMatch(template, /dialog-preview/);
});

test("curated system case studies render interactive architecture stages", () => {
  const dataProject = projects.find((project) => project.title === "Scalable Data Processing System");
  const template = createProjectDetailTemplate(dataProject);

  assert.match(template, /Problem and outcome/);
  assert.match(template, /Architecture explorer/);
  assert.match(template, /data-architecture-label="Kafka \/ Kinesis"/);
  assert.match(template, /aria-pressed="true"/);
});

test("project actions reserve case-study wording for genuinely curated stories", () => {
  const dataProject = projects.find((project) => project.title === "Scalable Data Processing System");
  const basicProject = projects.find((project) => project.title === "Movies API");

  assert.equal(getProjectActionLabel(dataProject), "Case study");
  assert.equal(getProjectActionLabel(basicProject), "Details");

  const basicTemplate = createProjectDetailTemplate(basicProject);
  assert.doesNotMatch(basicTemplate, /Problem and outcome|Architecture explorer/);
});
