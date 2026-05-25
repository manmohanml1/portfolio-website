import { qs } from "../utils/dom.js";

const STORAGE_KEY = "portfolio-reduce-motion";

export function setupMotionPreference() {
  const toggle = qs(".motion-trigger");
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storedPreference = localStorage.getItem(STORAGE_KEY);
  let isReduced = storedPreference === null ? mediaQuery.matches : storedPreference === "true";

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
    localStorage.setItem(STORAGE_KEY, String(isReduced));
    applyPreference();
  });

  applyPreference();
}
