import { qs, qsa } from "../utils/dom.js";
import {
  clearVisitorPreferences,
  DEFAULT_VISITOR_PREFERENCES,
  PROJECT_FOCUS_OPTIONS,
  readVisitorPreferences,
  updateVisitorPreferences,
} from "../services/visitor-preferences.js";

export function applyProjectFocus(projectFocus, documentLike = document) {
  const resolvedFocus = PROJECT_FOCUS_OPTIONS.includes(projectFocus) ? projectFocus : "all";
  documentLike.documentElement.dataset.projectFocus = resolvedFocus;
  return resolvedFocus;
}

export function hasCustomizedPreferences(preferences) {
  return preferences.theme !== DEFAULT_VISITOR_PREFERENCES.theme
    || preferences.reduceMotion !== DEFAULT_VISITOR_PREFERENCES.reduceMotion
    || preferences.projectFocus !== DEFAULT_VISITOR_PREFERENCES.projectFocus;
}

export function setupVisitorCustomization({
  initialPreferences = readVisitorPreferences(),
  onProjectFocusChange,
  storage = globalThis.localStorage,
  reload = () => globalThis.location.reload(),
} = {}) {
  const focusButtons = qsa("button[data-project-focus]");
  const resetButton = qs(".preferences-reset");

  if (focusButtons.length === 0 || !resetButton) {
    return;
  }

  const syncControls = (preferences) => {
    const focus = applyProjectFocus(preferences.projectFocus);

    focusButtons.forEach((button) => {
      const selected = button.dataset.projectFocus === focus;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    resetButton.hidden = !hasCustomizedPreferences(preferences);
  };

  syncControls(initialPreferences);

  focusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preferences = updateVisitorPreferences({ projectFocus: button.dataset.projectFocus }, storage);
      syncControls(preferences);
      onProjectFocusChange?.(preferences.projectFocus);
    });
  });

  globalThis.addEventListener?.("portfolio:preferences-changed", (event) => {
    syncControls(event.detail);
  });

  resetButton.addEventListener("click", () => {
    clearVisitorPreferences(storage);
    reload();
  });
}
