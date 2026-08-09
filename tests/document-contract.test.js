import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const adminHtml = await readFile(new URL("../admin.html", import.meta.url), "utf8");
const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const serverSource = await readFile(new URL("../dev-server.mjs", import.meta.url), "utf8");

test("document exposes stable section navigation targets", () => {
  for (const id of ["top", "evidence", "work", "journey", "skills", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("document loads the modular application entry and contact link", () => {
  assert.match(html, /href="styles\/layout-worlds\.css"/);
  assert.match(html, /src="src\/main\.js"/);
  assert.match(html, /href="styles\/themes\.css"/);
  assert.match(html, /href="styles\/responsive\.css"/);
  assert.match(html, /href="mailto:manmohanlonawat@gmail\.com"/);
});

test("document includes accessible controls for theme, project details, and back-to-top actions", () => {
  assert.match(html, /aria-label="Customize view"/);
  assert.match(html, /id="project-dialog"/);
  assert.match(html, /id="feedback-dialog"/);
  assert.match(html, /data-open-feedback>Suggest an improvement/);
  assert.match(html, /aria-label="Back to top"/);
  assert.match(html, /id="release-indicator"/);
});

test("hidden feature controls cannot be made visible by component display styles", () => {
  assert.match(styles, /\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
});

test("visitor customization is rollout-gated and supports audience lenses and project layouts", () => {
  assert.match(mainSource, /features\.visitorCustomization\.enabled/);
  assert.match(mainSource, /setupVisitorCustomization/);
  assert.match(html, /data-audience-evidence="backend"/);
  assert.match(styles, /data-audience="general"/);
  assert.match(styles, /data-project-layout="list"/);
  assert.doesNotMatch(styles, /counter\(project-index/);
  assert.match(styles, /grid-auto-flow: dense/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\) minmax\(160px, 0\.28fr\)/);
  assert.match(styles, /\.project-card \.project-links/);
  assert.match(styles, /data-project-layout="list"\]\[data-theme\] \.project-card/);
  assert.match(styles, /data-audience="general"\]\) \.filter-bar/);
});

test("document emphasizes backend work without the removed proof section", () => {
  assert.match(html, /<span>Backend<\/span>/);
  assert.match(html, /Java \+ Spring Boot/);
  assert.match(html, /Angular \+ Tailwind/);
  assert.doesNotMatch(html, /Proof of work/);
  assert.doesNotMatch(html, /Built like real systems/);
  assert.doesNotMatch(html, /Spatial portfolio interface active/);
});

test("document exposes accessible evidence discovery and career progression", () => {
  assert.match(html, /for="evidence-query">Find by technology or capability/);
  assert.match(html, /aria-label="Portfolio perspective"/);
  assert.match(html, /aria-label="Project layout"/);
  assert.match(html, /id="evidence-status" role="status" aria-live="polite"/);
  assert.match(html, /Search across projects, experience, skills, and credentials/);
  assert.match(html, /id="evidence-clear"[^>]+aria-label="Clear search"[^>]+hidden/);
  assert.doesNotMatch(html, /data-evidence-query/);
  assert.match(html, /id="career-progression" aria-label="Engineering progression"/);
  assert.match(mainSource, /setupEvidenceExplorer/);
});

test("career section presents verified professional signal wording", () => {
  assert.match(html, /Experience, education, and verified highlights/);
  assert.match(html, /Education & professional signal/);
});

test("document reserves an opt-in filter for wearable display projects", () => {
  assert.match(html, /data-filter="wearable" hidden>Wearables/);
  assert.doesNotMatch(html, /deployed React fitness/i);
});

test("admin control center is unlinked, no-index, and uses a dedicated module", () => {
  assert.doesNotMatch(html, /href=["']\/admin\.html/);
  assert.match(adminHtml, /name="robots" content="noindex, nofollow, noarchive, nosnippet"/);
  assert.match(adminHtml, /src="\/src\/admin\/main\.js"/);
  assert.match(adminHtml, /role="group" aria-label="Configuration environment"/);
  assert.match(adminHtml, /role="tablist" aria-label="Control Center views"/);
  assert.match(adminHtml, /id="runtime-panel" role="tabpanel"/);
  assert.match(adminHtml, /role="tablist" aria-label="Runtime views"/);
  assert.match(adminHtml, /id="runtime-controls-panel" role="tabpanel"/);
  assert.match(adminHtml, /id="runtime-history-panel" role="tabpanel"/);
  assert.match(adminHtml, /id="projects-panel" role="tabpanel"/);
  assert.match(adminHtml, /role="tablist" aria-label="Project publishing views"/);
  assert.match(adminHtml, /id="sync-projects"/);
  assert.match(adminHtml, /Project review inbox/);
  assert.match(adminHtml, /id="analytics-panel" role="tabpanel"/);
  assert.match(adminHtml, /role="tablist" aria-label="Analytics views"/);
  assert.match(adminHtml, /data-analytics-days="7"/);
  assert.match(mainSource, /setupPublicObservability/);
});

test("local preview server routes the owner publishing inbox and approved project feed", () => {
  assert.match(serverSource, /\/api\/admin\/projects/);
  assert.match(serverSource, /\/api\/projects/);
  assert.match(serverSource, /readLocalProjectQueue/);
  assert.match(serverSource, /reviewLocalProject/);
  assert.match(serverSource, /readProjects: hasFeatureDatabase \? undefined : readLocalApprovedProjects/);
});

test("public profile links open outside the portfolio tab", () => {
  assert.match(html, /href="https:\/\/github\.com\/manmohanml1" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/linkedin\.com\/in\/mml8050" target="_blank" rel="noopener noreferrer"/);
});
