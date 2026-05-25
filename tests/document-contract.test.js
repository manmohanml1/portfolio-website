import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

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
  assert.match(html, /aria-label="Change visual style"/);
  assert.match(html, /id="project-dialog"/);
  assert.match(html, /id="feedback-dialog"/);
  assert.match(html, /data-open-feedback>Suggest an improvement/);
  assert.match(html, /aria-label="Back to top"/);
  assert.match(html, /id="release-indicator"/);
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
