import { DEFAULT_THEME, resolveTheme, themes } from "../data/themes.js";
import { qs, qsa } from "../utils/dom.js";

const STORAGE_KEY = "portfolio-theme";

export function renderThemeOptions() {
  const themeOptions = qs("#theme-options");

  themeOptions.innerHTML = themes
    .map(
      (theme) => `
        <button class="theme-option" type="button" role="menuitem" data-theme="${theme.id}">
          <span class="theme-swatch" aria-hidden="true">
            ${theme.swatches.map((color) => `<i style="background: ${color}"></i>`).join("")}
          </span>
          <span>${theme.label}</span>
        </button>
      `,
    )
    .join("");
}

export function applyTheme(themeId) {
  const theme = resolveTheme(themeId);

  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);

  qsa(".theme-option").forEach((option) => {
    option.classList.toggle("active", option.dataset.theme === theme);
  });
}

export function setupThemeMenu() {
  const themeTrigger = qs(".theme-trigger");
  const themeOptions = qs("#theme-options");

  renderThemeOptions();
  applyTheme(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);

  themeTrigger.addEventListener("click", () => {
    const isOpen = themeTrigger.getAttribute("aria-expanded") === "true";
    themeTrigger.setAttribute("aria-expanded", String(!isOpen));
  });

  themeOptions.addEventListener("click", (event) => {
    const option = event.target.closest(".theme-option");

    if (!option) {
      return;
    }

    applyTheme(option.dataset.theme);
    themeTrigger.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".theme-menu")) {
      themeTrigger.setAttribute("aria-expanded", "false");
    }
  });
}
