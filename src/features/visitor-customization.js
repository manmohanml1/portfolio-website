import { escapeHtml, qs, qsa } from "../utils/dom.js";
import {
  AUDIENCE_OPTIONS,
  clearVisitorPreferences,
  DEFAULT_VISITOR_PREFERENCES,
  PROJECT_LAYOUT_OPTIONS,
  readVisitorPreferences,
  updateVisitorPreferences,
} from "../services/visitor-preferences.js";
import { getAudienceLens } from "../data/audience-lenses.js";

export function applyAudienceLens(audience, documentLike = document) {
  const resolvedAudience = AUDIENCE_OPTIONS.includes(audience) ? audience : "general";
  const lens = getAudienceLens(resolvedAudience);
  documentLike.documentElement.dataset.audience = resolvedAudience;
  const eyebrow = documentLike.querySelector?.("#hero-eyebrow");
  const title = documentLike.querySelector?.("#intro-title");
  const description = documentLike.querySelector?.("#hero-text");
  const words = documentLike.querySelector?.("#hero-focus-words");
  const profileDetail = documentLike.querySelector?.("#profile-detail");
  const signalGrid = documentLike.querySelector?.("#signal-grid");
  const monitorCode = documentLike.querySelector?.("#monitor-code");
  if (eyebrow) eyebrow.textContent = lens.eyebrow;
  if (title) title.textContent = lens.title;
  if (description) description.textContent = lens.description;
  if (words) words.innerHTML = lens.words.map((word) => `<span>${word}</span>`).join("");
  if (profileDetail) profileDetail.textContent = lens.profileDetail;
  if (signalGrid) {
    signalGrid.innerHTML = lens.signals
      .map(([label, value]) => `<div class="signal-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join("");
  }
  if (monitorCode) monitorCode.textContent = lens.monitor.join("\n");

  const textFields = {
    "#build-title": lens.buildTitle,
    "#work-eyebrow": lens.workEyebrow,
    "#work-title": lens.workTitle,
    "#work-copy": lens.workCopy,
    "#journey-title": lens.journeyTitle,
    "#journey-copy": lens.journeyCopy,
    "#experience-title": lens.experienceTitle,
    "#skills-title": lens.skillsTitle,
    "#contact-copy": lens.contactCopy,
  };
  Object.entries(textFields).forEach(([selector, value]) => {
    const element = documentLike.querySelector?.(selector);
    if (element) element.textContent = value;
  });
  lens.metrics.forEach(([value, label], index) => {
    const number = index + 1;
    const valueElement = documentLike.querySelector?.(`#metric-${number}-value`);
    const labelElement = documentLike.querySelector?.(`#metric-${number}-label`);
    if (valueElement) valueElement.textContent = value;
    if (labelElement) labelElement.textContent = label;
  });
  return resolvedAudience;
}

export function applyProjectLayout(projectLayout, documentLike = document) {
  const resolvedLayout = PROJECT_LAYOUT_OPTIONS.includes(projectLayout) ? projectLayout : "cards";
  documentLike.documentElement.dataset.projectLayout = resolvedLayout;
  return resolvedLayout;
}

export function hasCustomizedPreferences(preferences) {
  return preferences.theme !== DEFAULT_VISITOR_PREFERENCES.theme
    || preferences.reduceMotion !== DEFAULT_VISITOR_PREFERENCES.reduceMotion
    || preferences.audience !== DEFAULT_VISITOR_PREFERENCES.audience
    || preferences.projectLayout !== DEFAULT_VISITOR_PREFERENCES.projectLayout;
}

function updateViewQuery(audience, historyLike = globalThis.history, locationLike = globalThis.location) {
  if (!historyLike?.replaceState || !locationLike?.href) return;
  const url = new URL(locationLike.href);
  if (audience === "general") url.searchParams.delete("view");
  else url.searchParams.set("view", audience);
  historyLike.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function setupVisitorCustomization({
  initialPreferences = readVisitorPreferences(),
  onAudienceChange,
  onProjectLayoutChange,
  storage = globalThis.localStorage,
  reload = () => globalThis.location.reload(),
} = {}) {
  const audienceButtons = qsa("button[data-audience]");
  const layoutButtons = qsa("button[data-project-layout]");
  const resetButton = qs(".preferences-reset");

  if (audienceButtons.length === 0 || layoutButtons.length === 0 || !resetButton) {
    return;
  }

  const syncControls = (preferences) => {
    const audience = applyAudienceLens(preferences.audience);
    const projectLayout = applyProjectLayout(preferences.projectLayout);

    audienceButtons.forEach((button) => {
      const selected = button.dataset.audience === audience;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    layoutButtons.forEach((button) => {
      const selected = button.dataset.projectLayout === projectLayout;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    resetButton.hidden = !hasCustomizedPreferences(preferences);
  };

  syncControls(initialPreferences);

  audienceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preferences = updateVisitorPreferences({ audience: button.dataset.audience }, storage);
      syncControls(preferences);
      updateViewQuery(preferences.audience);
      onAudienceChange?.(preferences.audience);
    });
  });

  layoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preferences = updateVisitorPreferences({ projectLayout: button.dataset.projectLayout }, storage);
      syncControls(preferences);
      onProjectLayoutChange?.(preferences.projectLayout);
    });
  });

  globalThis.addEventListener?.("portfolio:preferences-changed", (event) => {
    syncControls(event.detail);
  });

  resetButton.addEventListener("click", () => {
    clearVisitorPreferences(storage);
    updateViewQuery("general");
    reload();
  });
}
