import assert from "node:assert/strict";
import test from "node:test";
import { applyAudienceLens, applyProjectLayout, hasCustomizedPreferences } from "../src/features/visitor-customization.js";
import {
  clearVisitorPreferences,
  DEFAULT_VISITOR_PREFERENCES,
  LEGACY_MOTION_STORAGE_KEY,
  LEGACY_PREFERENCES_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
  normalizeVisitorPreferences,
  PREFERENCES_STORAGE_KEY,
  readVisitorPreferences,
  resolveAudienceFromSearch,
  updateVisitorPreferences,
} from "../src/services/visitor-preferences.js";

function createStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    snapshot() {
      return Object.fromEntries(values);
    },
  };
}

test("visitor preferences validate every locally persisted field", () => {
  assert.deepEqual(
    normalizeVisitorPreferences({
      theme: "terminal",
      reduceMotion: true,
      audience: "backend",
      projectLayout: "list",
      ignored: "private",
    }),
    {
      version: 2,
      theme: "terminal",
      reduceMotion: true,
      audience: "backend",
      projectLayout: "list",
    },
  );

  assert.deepEqual(normalizeVisitorPreferences({
    theme: "missing",
    reduceMotion: "true",
    audience: "wearable",
    projectLayout: "tiles",
  }), DEFAULT_VISITOR_PREFERENCES);
});

test("legacy theme and motion keys migrate into one versioned record", () => {
  const storage = createStorage({
    [LEGACY_THEME_STORAGE_KEY]: "interstellar",
    [LEGACY_MOTION_STORAGE_KEY]: "true",
  });
  const preferences = readVisitorPreferences(storage);

  assert.equal(preferences.theme, "interstellar");
  assert.equal(preferences.reduceMotion, true);
  assert.deepEqual(JSON.parse(storage.snapshot()[PREFERENCES_STORAGE_KEY]), preferences);
});

test("version one project focus migrates to the closest audience lens", () => {
  const storage = createStorage({
    [LEGACY_PREFERENCES_STORAGE_KEY]: JSON.stringify({
      version: 1,
      theme: "terminal",
      reduceMotion: false,
      projectFocus: "frontend",
    }),
  });

  const preferences = readVisitorPreferences(storage);
  assert.equal(preferences.audience, "fullstack");
  assert.equal(preferences.projectLayout, "cards");
  assert.deepEqual(JSON.parse(storage.snapshot()[PREFERENCES_STORAGE_KEY]), preferences);
});

test("updates preserve unrelated preferences and reset removes current and legacy keys", () => {
  const storage = createStorage();

  updateVisitorPreferences({ theme: "light", audience: "data", projectLayout: "list" }, storage);
  const updated = updateVisitorPreferences({ reduceMotion: true }, storage);

  assert.equal(updated.theme, "light");
  assert.equal(updated.audience, "data");
  assert.equal(updated.projectLayout, "list");
  assert.equal(updated.reduceMotion, true);

  clearVisitorPreferences(storage);
  assert.deepEqual(storage.snapshot(), {});
});

test("malformed or unavailable browser storage safely restores defaults", () => {
  const malformed = createStorage({ [PREFERENCES_STORAGE_KEY]: "{not-json" });
  const blocked = {
    getItem() {
      throw new Error("storage blocked");
    },
    setItem() {
      throw new Error("storage blocked");
    },
    removeItem() {
      throw new Error("storage blocked");
    },
  };

  assert.deepEqual(readVisitorPreferences(malformed), DEFAULT_VISITOR_PREFERENCES);
  assert.deepEqual(readVisitorPreferences(blocked), DEFAULT_VISITOR_PREFERENCES);
  assert.doesNotThrow(() => clearVisitorPreferences(blocked));
});

test("audience and layout apply only supported document states", () => {
  const documentLike = { documentElement: { dataset: {} } };

  assert.equal(applyAudienceLens("backend", documentLike), "backend");
  assert.equal(documentLike.documentElement.dataset.audience, "backend");
  assert.equal(applyAudienceLens("unknown", documentLike), "general");
  assert.equal(documentLike.documentElement.dataset.audience, "general");
  assert.equal(applyProjectLayout("list", documentLike), "list");
  assert.equal(applyProjectLayout("unknown", documentLike), "cards");
});

test("a valid shared view overrides local audience while invalid views do not", () => {
  assert.equal(resolveAudienceFromSearch("?view=backend", "ai"), "backend");
  assert.equal(resolveAudienceFromSearch("?view=unknown", "ai"), "ai");
  assert.equal(resolveAudienceFromSearch("", "unknown"), "general");
});

test("restore defaults appears only after a meaningful preference changes", () => {
  assert.equal(hasCustomizedPreferences(DEFAULT_VISITOR_PREFERENCES), false);
  assert.equal(hasCustomizedPreferences({ ...DEFAULT_VISITOR_PREFERENCES, theme: "terminal" }), true);
  assert.equal(hasCustomizedPreferences({ ...DEFAULT_VISITOR_PREFERENCES, audience: "ai" }), true);
  assert.equal(hasCustomizedPreferences({ ...DEFAULT_VISITOR_PREFERENCES, projectLayout: "list" }), true);
});
