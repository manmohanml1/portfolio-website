import assert from "node:assert/strict";
import test from "node:test";
import { applyViewDensity } from "../src/features/visitor-customization.js";
import {
  clearVisitorPreferences,
  DEFAULT_VISITOR_PREFERENCES,
  LEGACY_MOTION_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
  normalizeVisitorPreferences,
  PREFERENCES_STORAGE_KEY,
  readVisitorPreferences,
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
      density: "compact",
      projectFocus: "backend",
      ignored: "private",
    }),
    {
      version: 1,
      theme: "terminal",
      reduceMotion: true,
      density: "compact",
      projectFocus: "backend",
    },
  );

  assert.deepEqual(normalizeVisitorPreferences({
    theme: "missing",
    reduceMotion: "true",
    density: "tiny",
    projectFocus: "wearable",
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

test("updates preserve unrelated preferences and reset removes current and legacy keys", () => {
  const storage = createStorage();

  updateVisitorPreferences({ theme: "light", projectFocus: "data" }, storage);
  const compact = updateVisitorPreferences({ density: "compact" }, storage);

  assert.equal(compact.theme, "light");
  assert.equal(compact.projectFocus, "data");
  assert.equal(compact.density, "compact");

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

test("view density applies only supported document states", () => {
  const documentLike = { documentElement: { dataset: {} } };

  assert.equal(applyViewDensity("compact", documentLike), "compact");
  assert.equal(documentLike.documentElement.dataset.density, "compact");
  assert.equal(applyViewDensity("unknown", documentLike), "comfortable");
  assert.equal(documentLike.documentElement.dataset.density, "comfortable");
});
