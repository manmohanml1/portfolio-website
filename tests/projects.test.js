import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../src/data/portfolio.js";
import { createProjectDetailTemplate } from "../src/features/project-dialog.js";
import {
  canOpenProjectCard,
  createProjectCardTemplate,
  getFilterLabel,
  getProjectAudiences,
  getProjectActionLabel,
  getProjectsForFilter,
  mergeProjects,
  PROJECT_FILTERS,
  getProjectsForAudience,
} from "../src/render/projects.js";

test("whole-card project details are available only from non-interactive Card surfaces", () => {
  assert.equal(canOpenProjectCard("cards", false), true);
  assert.equal(canOpenProjectCard("cards", true), false);
  assert.equal(canOpenProjectCard("list", false), false);
  assert.equal(canOpenProjectCard("list", true), false);

  const card = createProjectCardTemplate(projects[0], 3);
  assert.match(card, /data-project-card-index="3"/);
});

test("audience lenses retain only projects relevant to the selected portfolio variant", () => {
  const backend = getProjectsForAudience("backend");
  const fullstack = getProjectsForAudience("fullstack");
  const data = getProjectsForAudience("data");
  const ai = getProjectsForAudience("ai");

  assert.ok(backend.length < projects.length);
  assert.equal(backend[0].category, "backend");
  assert.ok(backend.every((project) => getProjectAudiences(project).includes("backend")));
  assert.ok(fullstack.every((project) => getProjectAudiences(project).includes("fullstack")));
  assert.equal(data[0].category, "data");
  assert.equal(ai[0].category, "ai");
  assert.deepEqual(getProjectsForAudience("general"), projects);
  assert.ok(!backend.some((project) => project.category === "frontend"));
  assert.ok(!backend.some((project) => project.title === "OpenGL GLUT Game"));
  assert.ok(ai.some((project) => project.title === "LangChain Project"));
  assert.ok(ai.some((project) => project.title === "Novel Browser Glass"));
  assert.ok(ai.some((project) => project.title === "Glass Search"));
  assert.ok(ai.some((project) => project.title === "Checkmate Glass"));
});

test("all declared project filters produce projects", () => {
  for (const filter of PROJECT_FILTERS.filter((item) => item !== "wearable")) {
    assert.ok(getProjectsForFilter(filter).length > 0, `${filter} should produce cards`);
  }
});

test("specific filters return only matching projects", () => {
  for (const filter of PROJECT_FILTERS.filter((item) => !["all", "featured", "wearable"].includes(item))) {
    const filtered = getProjectsForFilter(filter);
    assert.ok(filtered.every((project) => project.category === filter));
  }
});

test("all and invalid filters safely render full portfolio", () => {
  assert.equal(getProjectsForFilter("all").length, projects.length);
  assert.equal(getProjectsForFilter("invalid").length, projects.length);
  assert.equal(getFilterLabel("invalid"), "all projects");
  assert.equal(getFilterLabel("featured"), "featured projects");
  assert.equal(getFilterLabel("backend"), "Backend projects");
  assert.equal(getFilterLabel("ai"), "AI projects");
  assert.equal(getFilterLabel("wearable"), "Wearable projects");
});

test("featured filter keeps the default project view intentionally small", () => {
  const featured = getProjectsForFilter("featured");

  assert.ok(featured.length >= 3);
  assert.ok(featured.length < projects.length);
  assert.ok(featured.every((project) => project.featured));
  assert.ok(featured.some((project) => project.title === "Portfolio Operations Platform"));
  assert.ok(featured.some((project) => project.title === "Novel Browser Glass"));
});

test("approved discoveries enrich curated projects and append new repositories", () => {
  const added = { ...projects[0], repo: "https://github.com/manmohanml1/new-project", title: "New project" };
  const duplicate = {
    ...projects[0],
    title: "Owner-reviewed title",
    featured: false,
    ownerReviewed: true,
    details: { summary: "Owner-reviewed summary" },
  };
  const merged = mergeProjects(projects, [duplicate, added]);

  assert.equal(merged.length, projects.length + 1);
  assert.equal(merged[0].title, "Owner-reviewed title");
  assert.equal(merged[0].featured, projects[0].featured);
  assert.equal(merged[0].details.summary, "Owner-reviewed summary");
  assert.equal(merged.at(-1).title, "New project");
});

test("baseline publication status does not replace checked-in curation with generated drafts", () => {
  const baseline = {
    ...projects[0],
    title: "Generated title",
    ownerReviewed: false,
    details: { summary: "Generated summary" },
  };
  const merged = mergeProjects(projects, [baseline]);
  assert.equal(merged[0], projects[0]);
});

test("managed hidden or pending repositories suppress checked-in project copies", () => {
  const managedRepo = projects[0].repo;
  const merged = mergeProjects(projects, [], [managedRepo]);

  assert.equal(merged.some((project) => project.repo === managedRepo), false);
  assert.equal(merged.length, projects.length - 1);
});

test("wearable projects can be added and filtered after GitHub discovery", () => {
  const wearable = { ...projects[0], repo: "https://github.com/manmohanml1/display-app", category: "wearable" };
  const merged = mergeProjects(projects, [wearable]);

  const wearables = getProjectsForFilter("wearable", merged);
  assert.ok(wearables.some((project) => project.title === "Novel Browser Glass"));
  assert.equal(wearables.at(-1), wearable);
});

test("project detail dialog presents safely separated repository actions", () => {
  const fitnessApp = projects.find((project) => project.title === "Fitness Exercises App");
  const template = createProjectDetailTemplate(fitnessApp);

  assert.match(template, /Purpose/);
  assert.match(template, /Problem or challenge/);
  assert.match(template, /Implementation/);
  assert.match(template, /Outcome or current state/);
  assert.match(template, /target="_blank" rel="noopener noreferrer">Repository/);
  assert.match(template, /data-feedback-project=.*Suggest improvement/);
  assert.doesNotMatch(template, /repo-size|[KMG]B/);
  assert.doesNotMatch(template, />Live app</);
  assert.match(template, /dialog-preview/);
  assert.match(template, /dialog-intro with-preview/);
  assert.ok(template.indexOf("dialog-preview") < template.indexOf("Problem or challenge"));
});

test("disabled project dialogs leave repository access without dead detail controls", () => {
  const card = createProjectCardTemplate(projects[0], 0, { allowDetails: false });
  const detail = createProjectDetailTemplate(projects[0], { allowFeedback: false });

  assert.match(card, />Repository<\/a>/);
  assert.doesNotMatch(card, /data-open-project|data-project-card-index|details-link|project-open/);
  assert.doesNotMatch(detail, /data-feedback-project|Suggest improvement/);
});

test("curated system case studies render interactive architecture stages", () => {
  const dataProject = projects.find((project) => project.title === "Scalable Data Processing System");
  const template = createProjectDetailTemplate(dataProject);

  assert.match(template, /Problem or challenge/);
  assert.match(template, /Architecture explorer/);
  assert.match(template, /data-architecture-label="Kafka \/ Kinesis"/);
  assert.match(template, /aria-pressed="true"/);
});

test("project actions reserve case-study wording for genuinely curated stories", () => {
  const dataProject = projects.find((project) => project.title === "Scalable Data Processing System");
  const basicProject = { title: "Small experiment", tags: ["JavaScript"] };

  assert.equal(getProjectActionLabel(dataProject), "Case study");
  assert.equal(getProjectActionLabel(basicProject), "Details");

  const basicTemplate = createProjectDetailTemplate(basicProject);
  assert.doesNotMatch(basicTemplate, /Problem or challenge|Architecture explorer/);
});

test("CommitQuest is curated as the product while its reference campaign remains supporting context", () => {
  const commitQuest = projects.find((project) => project.title === "CommitQuest");
  const template = createProjectDetailTemplate(commitQuest);

  assert.ok(commitQuest.featured);
  assert.equal(commitQuest.repo, "https://github.com/manmohanml1/commitquest");
  assert.match(template, /CommitQuest/);
  assert.match(template, /Version 0\.2\.0 is released/);
  assert.match(template, /Repository-to-campaign projection/);
  assert.equal((template.match(/Portfolio Citadel/g) || []).length, 1);
});
