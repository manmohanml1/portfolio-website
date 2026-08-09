import { DEFAULT_THEME, getTheme, themes } from "../data/themes.js";
import { readVisitorPreferences, updateVisitorPreferences } from "../services/visitor-preferences.js";
import { qs, qsa } from "../utils/dom.js";

export function renderThemeOptions() {
  const themeOptions = qs("#theme-options");

  themeOptions.innerHTML = themes
    .map(
      (theme) => `
        <button class="theme-option" type="button" data-theme="${theme.id}">
          <span class="theme-swatch" aria-hidden="true">
            ${theme.swatches.map((color) => `<i style="background: ${color}"></i>`).join("")}
          </span>
          <span class="theme-option-copy">
            <strong>${theme.label}</strong>
            <small>${theme.description}</small>
          </span>
        </button>
      `,
    )
    .join("") + `
      <button class="motion-trigger theme-option" type="button" aria-label="Reduce motion" aria-pressed="false" title="Reduce motion">
        <span class="motion-symbol" aria-hidden="true">≋</span>
        <span class="motion-label">Reduce motion</span>
      </button>
    `;
}

export function applyTheme(themeId) {
  const themeConfig = getTheme(themeId);
  const theme = themeConfig.id;

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeLayout = themeConfig.layout;
  updateVisitorPreferences({ theme });

  qsa(".theme-option").forEach((option) => {
    option.classList.toggle("active", option.dataset.theme === theme);
  });
}

export function setupThemeMenu() {
  const themeTrigger = qs(".theme-trigger");
  const themeOptions = qs("#theme-options");

  renderThemeOptions();
  applyTheme(readVisitorPreferences().theme || DEFAULT_THEME);

  themeTrigger.addEventListener("click", () => {
    const isOpen = themeTrigger.getAttribute("aria-expanded") === "true";
    themeTrigger.setAttribute("aria-expanded", String(!isOpen));
  });

  themeOptions.addEventListener("click", (event) => {
    const option = event.target.closest(".theme-option");

    if (!option || !option.dataset.theme) {
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
