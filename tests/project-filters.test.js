import assert from "node:assert/strict";
import test from "node:test";
import { filterProjectQueue } from "../src/admin/project-filters.js";

const projects = [
  {
    name: "orders-api",
    title: "Order Platform",
    description: "Spring Boot services",
    category: "backend",
    language: "Java",
    tags: ["Spring Boot", "PostgreSQL"],
    topics: [],
    evidence: { technologies: ["AWS"], languages: ["Java"] },
  },
  {
    name: "travel-glass",
    title: "Travel Guide",
    description: "Wearable destination assistant",
    category: "wearable",
    language: "JavaScript",
    tags: ["Meta Display", "GPS"],
    topics: ["portfolio-wearable"],
    evidence: {},
  },
];

test("project publishing filters search across repository evidence", () => {
  assert.deepEqual(filterProjectQueue(projects, { query: "spring boot" }), [projects[0]]);
  assert.deepEqual(filterProjectQueue(projects, { query: "AWS" }), [projects[0]]);
  assert.deepEqual(filterProjectQueue(projects, { query: "gps" }), [projects[1]]);
});

test("project publishing filters combine category and search", () => {
  assert.deepEqual(filterProjectQueue(projects, { category: "wearable" }), [projects[1]]);
  assert.deepEqual(filterProjectQueue(projects, { category: "backend", query: "travel" }), []);
  assert.deepEqual(filterProjectQueue(projects), projects);
});
