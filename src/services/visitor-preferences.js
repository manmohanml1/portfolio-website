import { DEFAULT_THEME, resolveTheme } from "../data/themes.js";

export const PREFERENCES_STORAGE_KEY = "portfolio-preferences-v1";
export const LEGACY_THEME_STORAGE_KEY = "portfolio-theme";
export const LEGACY_MOTION_STORAGE_KEY = "portfolio-reduce-motion";
export const PROJECT_FOCUS_OPTIONS = Object.freeze(["all", "frontend", "backend", "data", "ai"]);

export const DEFAULT_VISITOR_PREFERENCES = Object.freeze({
  version: 1,
  theme: DEFAULT_THEME,
  reduceMotion: null,
  projectFocus: "all",
});

function safeStorageCall(callback, fallback) {
  try {
    return callback();
  } catch {
    return fallback;
  }
}

export function normalizeVisitorPreferences(value = {}) {
  const reduceMotion = typeof value?.reduceMotion === "boolean" ? value.reduceMotion : null;

  return Object.freeze({
    version: 1,
    theme: resolveTheme(value?.theme),
    reduceMotion,
    projectFocus: PROJECT_FOCUS_OPTIONS.includes(value?.projectFocus) ? value.projectFocus : "all",
  });
}

function readLegacyPreferences(storage) {
  const theme = safeStorageCall(() => storage?.getItem(LEGACY_THEME_STORAGE_KEY), null);
  const reduceMotionValue = safeStorageCall(() => storage?.getItem(LEGACY_MOTION_STORAGE_KEY), null);

  return normalizeVisitorPreferences({
    theme: theme || DEFAULT_THEME,
    reduceMotion: ["true", "false"].includes(reduceMotionValue)
      ? reduceMotionValue === "true"
      : null,
  });
}

export function writeVisitorPreferences(preferences, storage = globalThis.localStorage) {
  const normalized = normalizeVisitorPreferences(preferences);
  safeStorageCall(() => storage?.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalized)));
  if (typeof globalThis.dispatchEvent === "function" && typeof globalThis.CustomEvent === "function") {
    globalThis.dispatchEvent(new globalThis.CustomEvent("portfolio:preferences-changed", { detail: normalized }));
  }
  return normalized;
}

export function readVisitorPreferences(storage = globalThis.localStorage) {
  const storedValue = safeStorageCall(() => storage?.getItem(PREFERENCES_STORAGE_KEY), null);

  if (storedValue) {
    try {
      return normalizeVisitorPreferences(JSON.parse(storedValue));
    } catch {
      return writeVisitorPreferences(DEFAULT_VISITOR_PREFERENCES, storage);
    }
  }

  const migrated = readLegacyPreferences(storage);
  const hasLegacyPreference = safeStorageCall(
    () => Boolean(storage?.getItem(LEGACY_THEME_STORAGE_KEY) || storage?.getItem(LEGACY_MOTION_STORAGE_KEY)),
    false,
  );

  return hasLegacyPreference ? writeVisitorPreferences(migrated, storage) : migrated;
}

export function updateVisitorPreferences(patch, storage = globalThis.localStorage) {
  return writeVisitorPreferences({ ...readVisitorPreferences(storage), ...patch }, storage);
}

export function clearVisitorPreferences(storage = globalThis.localStorage) {
  [PREFERENCES_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY, LEGACY_MOTION_STORAGE_KEY].forEach((key) => {
    safeStorageCall(() => storage?.removeItem(key));
  });

  return DEFAULT_VISITOR_PREFERENCES;
}
