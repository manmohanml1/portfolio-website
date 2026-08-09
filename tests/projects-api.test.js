import assert from "node:assert/strict";
import test from "node:test";
import { createPublishedProjectsHandler } from "../api/projects.js";

function createResponse() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; },
  };
}

test("public project API returns normalized owner-approved repositories", async () => {
  const response = createResponse();
  const handler = createPublishedProjectsHandler({
    readProjects: async () => [{
      githubId: "7", name: "approved-project", repo: "https://github.com/manmohanml1/approved-project",
      homepage: "", githubDescription: "GitHub copy", language: "TypeScript",
      topics: ["portfolio-showcase"], title: "Reviewed title", description: "Reviewed copy",
      category: "backend", tags: ["TypeScript", "AWS"],
      caseStudy: { caseStudy: true, summary: "Reviewed case study" },
      media: {
        coverImageUrl: "https://raw.githubusercontent.com/manmohanml1/approved-project/main/preview.png",
        coverImageAlt: "Approved project preview",
        demoUrl: "https://www.youtube.com/watch?v=example",
      },
      reviewedBy: "owner@example.com",
    }],
    readManagedProjects: async () => [
      { repo: "https://github.com/manmohanml1/approved-project" },
      { repo: "https://github.com/manmohanml1/hidden-project" },
    ],
  });
  await handler({ method: "GET" }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.equal(response.body.repositories[0].curation.title, "Reviewed title");
  assert.equal(response.body.repositories[0].curation.category, "backend");
  assert.equal(response.body.repositories[0].curation.caseStudy.summary, "Reviewed case study");
  assert.match(response.body.repositories[0].curation.media.coverImageUrl, /preview\.png/);
  assert.equal(response.body.repositories[0].curation.ownerReviewed, true);
  assert.deepEqual(response.body.managedRepositories, [
    "https://github.com/manmohanml1/approved-project",
    "https://github.com/manmohanml1/hidden-project",
  ]);
});

test("public project API fails open to an empty addition set", async () => {
  const response = createResponse();
  await createPublishedProjectsHandler({
    readProjects: async () => { throw new Error("offline"); },
    readManagedProjects: async () => [],
  })(
    { method: "GET" }, response,
  );
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.repositories, []);
  assert.deepEqual(response.body.managedRepositories, []);
  assert.equal(response.body.source, "fallback");
});
