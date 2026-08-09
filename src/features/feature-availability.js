import { isFeatureEnabled } from "../services/feature-config.js";

const VISIBILITY_RULES = Object.freeze({
  "sections.journey.enabled": ["#journey", 'a[href="#journey"]'],
  "sections.skills.enabled": ["#skills", 'a[href="#skills"]'],
  "features.feedback.enabled": ["[data-open-feedback]", "#feedback-dialog"],
  "features.projectDialogs.enabled": ["#project-dialog"],
  "features.projectFilters.enabled": [".filter-bar"],
  "features.visitorCustomization.enabled": ["[data-visitor-customization]"],
});

export function applyFeatureAvailability(config, documentLike = document) {
  Object.entries(VISIBILITY_RULES).forEach(([key, selectors]) => {
    const enabled = isFeatureEnabled(config, key);

    selectors.forEach((selector) => {
      documentLike.querySelectorAll(selector).forEach((element) => {
        element.hidden = !enabled;
        element.setAttribute("aria-hidden", String(!enabled));
      });
    });
  });

  documentLike.documentElement.dataset.featureConfigSource = config.source;
}
