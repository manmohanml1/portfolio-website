import { qs } from "../utils/dom.js";
import {
  clearVisitorPreferences,
  readVisitorPreferences,
  updateVisitorPreferences,
} from "../services/visitor-preferences.js";

export function applyViewDensity(density, documentLike = document) {
  const resolvedDensity = density === "compact" ? "compact" : "comfortable";
  documentLike.documentElement.dataset.density = resolvedDensity;
  return resolvedDensity;
}

export function setupVisitorCustomization({
  storage = globalThis.localStorage,
  reload = () => globalThis.location.reload(),
} = {}) {
  const densityToggle = qs(".density-trigger");
  const resetButton = qs(".preferences-reset");

  if (!densityToggle || !resetButton) {
    return;
  }

  const syncDensityControl = (density) => {
    const isCompact = applyViewDensity(density) === "compact";
    const label = qs(".density-label", densityToggle);

    densityToggle.setAttribute("aria-pressed", String(isCompact));
    densityToggle.setAttribute("aria-label", isCompact ? "Use comfortable layout" : "Use compact layout");
    densityToggle.title = isCompact ? "Use comfortable layout" : "Use compact layout";
    label.textContent = isCompact ? "Comfortable layout" : "Compact layout";
  };

  syncDensityControl(readVisitorPreferences(storage).density);

  densityToggle.addEventListener("click", () => {
    const currentDensity = document.documentElement.dataset.density;
    const nextDensity = currentDensity === "compact" ? "comfortable" : "compact";
    syncDensityControl(updateVisitorPreferences({ density: nextDensity }, storage).density);
  });

  resetButton.addEventListener("click", () => {
    clearVisitorPreferences(storage);
    reload();
  });
}
