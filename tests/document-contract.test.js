import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

test("document exposes stable section navigation targets", () => {
  for (const id of ["top", "work", "journey", "skills", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("document loads the modular application entry and contact link", () => {
  assert.match(html, /src="src\/main\.js"/);
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
  assert.match(styles, /counter\(project-index, decimal-leading-zero\)/);
  assert.match(styles, /grid-template-columns: 72px minmax\(0, 1fr\) minmax\(160px, 0\.28fr\)/);
  assert.match(styles, /data-audience="general"\]\) \.filter-bar/);
});

test("document emphasizes backend work without the removed proof section", () => {
  assert.match(html, /<span>Backend<\/span>/);
  assert.match(html, /TypeScript \+ Java/);
  assert.doesNotMatch(html, /Proof of work/);
  assert.doesNotMatch(html, /Built like real systems/);
  assert.doesNotMatch(html, /Spatial portfolio interface active/);
});

test("career section presents verified professional signal wording", () => {
  assert.match(html, /Experience, education, and verified highlights/);
  assert.match(html, /Education & professional signal/);
});

test("document reserves an opt-in filter for wearable display projects", () => {
  assert.match(html, /data-filter="wearable" hidden>Wearables/);
  assert.doesNotMatch(html, /deployed React fitness/i);
});

test("public profile links open outside the portfolio tab", () => {
  assert.match(html, /href="https:\/\/github\.com\/manmohanml1" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/linkedin\.com\/in\/mml8050" target="_blank" rel="noopener noreferrer"/);
});
