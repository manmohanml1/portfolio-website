import assert from "node:assert/strict";
import test from "node:test";
import { credentials, experiences, projects, skills, stackItems } from "../src/data/portfolio.js";
import { DEFAULT_THEME, resolveTheme, themes } from "../src/data/themes.js";
import { readFile } from "node:fs/promises";

const themeSwitcherSource = await readFile(new URL("../src/features/theme-switcher.js", import.meta.url), "utf8");

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
    assert.equal(project.size, undefined);
  }
});

test("project filters have visible content", () => {
  const categories = new Set(projects.map((project) => project.category));

  for (const category of ["frontend", "backend", "data", "ai"]) {
    assert.ok(categories.has(category), `missing ${category} project`);
  }
});

test("curated projects do not advertise an unavailable Fitness live app", () => {
  const fitnessApp = projects.find((project) => project.title === "Fitness Exercises App");

  assert.equal(fitnessApp.live, undefined);
  assert.ok(!fitnessApp.tags.includes("Netlify"));
});

test("theme config exposes a focused set of distinct visual worlds", () => {
  const ids = themes.map((theme) => theme.id);

  assert.deepEqual(ids, ["swiss", "interstellar", "light", "terminal", "brutalist"]);
  assert.equal(new Set(ids).size, ids.length);

  for (const theme of themes) {
    assert.ok(theme.label);
    assert.equal(theme.swatches.length, 3);
  }
});

test("theme resolver uses supported themes and safely falls back", () => {
  assert.equal(resolveTheme("terminal"), "terminal");
  assert.equal(resolveTheme("dark"), DEFAULT_THEME);
  assert.equal(resolveTheme("spatial"), DEFAULT_THEME);
  assert.equal(resolveTheme("sunset"), DEFAULT_THEME);
  assert.equal(resolveTheme("futuresque"), DEFAULT_THEME);
  assert.equal(resolveTheme("journey"), DEFAULT_THEME);
  assert.equal(resolveTheme("unknown-theme"), DEFAULT_THEME);
  assert.equal(resolveTheme(undefined), DEFAULT_THEME);
});

test("theme menu includes a viewer-controlled motion preference", () => {
  assert.match(themeSwitcherSource, /aria-label="Reduce motion"/);
  assert.match(themeSwitcherSource, /motion-trigger/);
});

test("supporting sections have enough content to render", () => {
  assert.ok(experiences.length >= 3);
  assert.ok(credentials.length >= 4);
  assert.ok(skills.length >= 4);
  assert.ok(stackItems.length >= 10);
});

test("career signal uses supplied professional evidence instead of weak profile counters", () => {
  const experienceText = experiences.map((item) => `${item.org} ${item.role} ${item.detail}`).join(" ");
  const credentialText = credentials.map((item) => `${item.label} ${item.value} ${item.detail || ""}`).join(" ");
  const amtrak = experiences.find((item) => item.org === "Amtrak");
  assert.ok(amtrak);
  const amtrakText = `${amtrak.detail} ${amtrak.highlights.join(" ")}`;

  assert.match(experienceText, /Amtrak.*Full Stack Engineer/);
  assert.match(amtrakText, /Labor Management System/);
  assert.match(amtrakText, /JDBC.*SQL Server/);
  assert.match(amtrakText, /Tailwind tokens.*laptop, tablet, and mobile breakpoints/);
  assert.match(experienceText, /Evernorth Health Services.*Back End Developer/);
  assert.match(experienceText, /Squad Software Inc/);
  assert.match(experienceText, /California State University, Fresno.*Teaching Associate/);
  assert.match(credentialText, /Master of Science.*California State University, Fresno.*2021 - 2022/);
  assert.match(credentialText, /Bachelor of Engineering.*Walchand Institute of Technology/);
  assert.match(credentialText, /Phi Kappa Phi/);
  assert.match(credentialText, /Kent Shikama/);
  assert.doesNotMatch(credentialText, /followers|connections|Location signal/i);
  assert.ok(experiences.every((item) => item.stack === undefined));
  assert.ok(experiences.every((item) => item.employment === undefined));
  assert.ok(experiences.every((item) => item.highlights.length <= 3));
});

test("flagship system projects expose curated architecture paths", () => {
  const architectureProjects = projects.filter((project) => project.details?.architecture);

  assert.ok(architectureProjects.length >= 2);
  for (const project of architectureProjects) {
    assert.equal(project.details.caseStudy, true);
    assert.ok(project.details.challenge);
    assert.ok(project.details.outcome);
    assert.ok(project.details.architecture.steps.length >= 4);
    assert.ok(project.details.architecture.steps.every((step) => step.label && step.role && step.detail));
  }
});
