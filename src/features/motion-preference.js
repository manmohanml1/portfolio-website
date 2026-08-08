import { qs } from "../utils/dom.js";
import { readVisitorPreferences, updateVisitorPreferences } from "../services/visitor-preferences.js";

export function setupMotionPreference() {
  const toggle = qs(".motion-trigger");
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storedPreference = readVisitorPreferences().reduceMotion;
  let isReduced = storedPreference === null ? mediaQuery.matches : storedPreference;

  function applyPreference() {
    const label = qs(".motion-label", toggle);

    document.documentElement.classList.toggle("reduce-motion", isReduced);
    toggle.setAttribute("aria-pressed", String(isReduced));
    toggle.setAttribute("aria-label", isReduced ? "Enable motion" : "Reduce motion");
    toggle.title = isReduced ? "Enable motion" : "Reduce motion";
    label.textContent = isReduced ? "Enable motion" : "Reduce motion";
  }

  toggle.addEventListener("click", () => {
    isReduced = !isReduced;
    updateVisitorPreferences({ reduceMotion: isReduced });
    applyPreference();
  });

  applyPreference();
}
