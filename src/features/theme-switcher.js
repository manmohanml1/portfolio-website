import { DEFAULT_THEME, resolveTheme, themes } from "../data/themes.js";
import { readVisitorPreferences, updateVisitorPreferences } from "../services/visitor-preferences.js";
import { qs, qsa } from "../utils/dom.js";

export function renderThemeOptions({ customizationEnabled = false } = {}) {
  const themeOptions = qs("#theme-options");

  themeOptions.innerHTML = themes
    .map(
      (theme) => `
        <button class="theme-option" type="button" data-theme="${theme.id}">
          <span class="theme-swatch" aria-hidden="true">
            ${theme.swatches.map((color) => `<i style="background: ${color}"></i>`).join("")}
          </span>
          <span>${theme.label}</span>
        </button>
      `,
    )
    .join("") + `
      <button class="motion-trigger theme-option" type="button" aria-label="Reduce motion" aria-pressed="false" title="Reduce motion">
        <span class="motion-symbol" aria-hidden="true">≋</span>
        <span class="motion-label">Reduce motion</span>
      </button>
      ${
        customizationEnabled
          ? `<div class="audience-control" role="group" aria-label="Tailor portfolio evidence">
              <span class="preference-section-label">View for</span>
              <div class="audience-options">
                <button type="button" data-audience="general" aria-pressed="true">General</button>
                <button type="button" data-audience="backend" aria-pressed="false">Backend</button>
                <button type="button" data-audience="fullstack" aria-pressed="false">Full stack</button>
                <button type="button" data-audience="data" aria-pressed="false">Cloud / data</button>
                <button type="button" data-audience="ai" aria-pressed="false">AI</button>
              </div>
            </div>
            <div class="layout-control" role="group" aria-label="Project layout">
              <span class="preference-section-label">Projects</span>
              <div class="layout-options">
                <button type="button" data-project-layout="cards" aria-pressed="true">Cards</button>
                <button type="button" data-project-layout="list" aria-pressed="false">List</button>
              </div>
            </div>
            <button class="preferences-reset theme-option" type="button" hidden>
              <span class="preference-symbol" aria-hidden="true">&#8634;</span>
              <span>Restore defaults</span>
            </button>`
          : ""
      }
    `;
}

export function applyTheme(themeId) {
  const theme = resolveTheme(themeId);

  document.documentElement.dataset.theme = theme;
  updateVisitorPreferences({ theme });

  qsa(".theme-option").forEach((option) => {
    option.classList.toggle("active", option.dataset.theme === theme);
  });
}

export function setupThemeMenu({ customizationEnabled = false } = {}) {
  const themeTrigger = qs(".theme-trigger");
  const themeOptions = qs("#theme-options");

  renderThemeOptions({ customizationEnabled });
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
