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

test("document includes accessible controls for theme and back-to-top actions", () => {
  assert.match(html, /aria-label="Change visual style"/);
  assert.match(html, /aria-label="Back to top"/);
});

test("document emphasizes backend work without the removed proof section", () => {
  assert.match(html, /<span>Backend<\/span>/);
  assert.match(html, /TypeScript \+ Java/);
  assert.doesNotMatch(html, /Proof of work/);
  assert.doesNotMatch(html, /Built like real systems/);
});
