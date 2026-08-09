import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEvidenceIndex,
  createEvidenceResultTemplate,
  searchEvidence,
} from "../src/features/evidence-explorer.js";

const evidence = buildEvidenceIndex();

test("evidence index combines projects, professional experience, skills, and credentials", () => {
  const types = new Set(evidence.map((item) => item.type));

  assert.deepEqual(types, new Set(["Project", "Experience", "Skill path", "Credential"]));
  assert.ok(evidence.some((item) => item.title === "Portfolio Operations Platform"));
  assert.ok(evidence.some((item) => item.title.includes("Amtrak")));
});

test("evidence search finds current stack and wearable proof", () => {
  const spring = searchEvidence("Spring Boot", evidence);
  const wearable = searchEvidence("wearable", evidence);

  assert.ok(spring.some((item) => item.title.includes("Amtrak")));
  assert.ok(spring.some((item) => item.title === "Current enterprise stack"));
  assert.ok(wearable.some((item) => item.title === "Novel Browser Glass"));
});

test("evidence search respects the active audience lens and query completeness", () => {
  const backendWearables = searchEvidence("wearable", evidence, { audience: "backend" });
  const aiWearables = searchEvidence("wearable", evidence, { audience: "ai" });

  assert.ok(!backendWearables.some((item) => item.title === "Novel Browser Glass"));
  assert.ok(aiWearables.some((item) => item.title === "Novel Browser Glass"));
  assert.deepEqual(searchEvidence("", evidence), []);
  assert.deepEqual(searchEvidence("definitely absent", evidence), []);
});

test("evidence result templates remain escaped and link only to portfolio sections", () => {
  const template = createEvidenceResultTemplate({
    type: "Project",
    title: "<unsafe>",
    summary: "Evidence & decisions",
    href: "#work",
    project: {},
  });

  assert.match(template, /&lt;unsafe&gt;/);
  assert.match(template, /Evidence &amp; decisions/);
  assert.match(template, /href="#work"/);
  assert.match(template, /data-evidence-project="&lt;unsafe&gt;"/);
});
