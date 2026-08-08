import { setupEnvironment } from "./config/environment.js";
import { applyFeatureAvailability } from "./features/feature-availability.js";
import { setupBackToTop, setupRevealAnimation, setupTiltCards } from "./features/interactions.js";
import { setupMotionPreference } from "./features/motion-preference.js";
import { setupFeedbackDialog } from "./features/feedback-dialog.js";
import { setupProjectDialog } from "./features/project-dialog.js";
import { setupThemeMenu } from "./features/theme-switcher.js";
import { applyProjectFocus, setupVisitorCustomization } from "./features/visitor-customization.js";
import { setupProjectFilters } from "./render/projects.js";
import { renderReleaseIndicator } from "./render/release.js";
import { renderJourney, renderSkills, renderStackStrip } from "./render/sections.js";
import { isFeatureEnabled, loadFeatureConfig } from "./services/feature-config.js";
import { readVisitorPreferences, updateVisitorPreferences } from "./services/visitor-preferences.js";

async function bootPortfolio() {
  const environment = setupEnvironment();
  const featureConfig = await loadFeatureConfig({ environment: environment.name });
  applyFeatureAvailability(featureConfig);

  const journeyEnabled = isFeatureEnabled(featureConfig, "sections.journey.enabled");
  const skillsEnabled = isFeatureEnabled(featureConfig, "sections.skills.enabled");
  const feedbackEnabled = isFeatureEnabled(featureConfig, "features.feedback.enabled");
  const projectDialogsEnabled = isFeatureEnabled(featureConfig, "features.projectDialogs.enabled");
  const projectFiltersEnabled = isFeatureEnabled(featureConfig, "features.projectFilters.enabled");
  const tiltCardsEnabled = isFeatureEnabled(featureConfig, "effects.tiltCards.enabled");
  const visitorCustomizationEnabled = isFeatureEnabled(
    featureConfig,
    "features.visitorCustomization.enabled",
  );
  const visitorPreferences = readVisitorPreferences();

  if (visitorCustomizationEnabled) applyProjectFocus(visitorPreferences.projectFocus);

  renderReleaseIndicator();
  renderStackStrip();
  if (journeyEnabled) renderJourney();
  if (skillsEnabled) renderSkills();

  const openFeedbackDialog = feedbackEnabled ? setupFeedbackDialog() : undefined;
  const openProjectDialog = projectDialogsEnabled
    ? setupProjectDialog({ onFeedback: openFeedbackDialog })
    : undefined;

  const projectFilterController = setupProjectFilters({
    filtersEnabled: projectFiltersEnabled,
    initialFilter: visitorCustomizationEnabled && projectFiltersEnabled
      ? visitorPreferences.projectFocus
      : "all",
    onFilterChange: visitorCustomizationEnabled && projectFiltersEnabled
      ? (projectFocus) => updateVisitorPreferences({ projectFocus })
      : undefined,
    onCardsRendered: tiltCardsEnabled ? () => setupTiltCards(".project-card") : undefined,
    onOpenProject: openProjectDialog,
  });
  setupThemeMenu({ customizationEnabled: visitorCustomizationEnabled });
  setupMotionPreference();
  if (visitorCustomizationEnabled) {
    setupVisitorCustomization({
      initialPreferences: visitorPreferences,
      onProjectFocusChange: projectFiltersEnabled
        ? (projectFocus) => projectFilterController.setFilter(projectFocus)
        : undefined,
    });
  }
  setupRevealAnimation();
  if (tiltCardsEnabled) setupTiltCards();
  setupBackToTop();
}

bootPortfolio();
