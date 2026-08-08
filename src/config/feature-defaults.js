export const FEATURE_FLAG_KEYS = Object.freeze([
  "sections.journey.enabled",
  "sections.skills.enabled",
  "features.feedback.enabled",
  "features.projectDialogs.enabled",
  "features.projectFilters.enabled",
  "effects.tiltCards.enabled",
  "features.visitorCustomization.enabled",
]);

export const DEFAULT_FEATURE_FLAGS = Object.freeze(
  Object.fromEntries(FEATURE_FLAG_KEYS.map((key) => [key, true])),
);

export function isKnownFeatureFlag(key) {
  return FEATURE_FLAG_KEYS.includes(key);
}
