import { setupEnvironment } from "./config/environment.js";
import { setupBackToTop, setupRevealAnimation, setupTiltCards } from "./features/interactions.js";
import { setupMotionPreference } from "./features/motion-preference.js";
import { setupFeedbackDialog } from "./features/feedback-dialog.js";
import { setupProjectDialog } from "./features/project-dialog.js";
import { setupThemeMenu } from "./features/theme-switcher.js";
import { setupProjectFilters } from "./render/projects.js";
import { renderReleaseIndicator } from "./render/release.js";
import { renderJourney, renderSkills, renderStackStrip } from "./render/sections.js";

function bootPortfolio() {
  setupEnvironment();
  renderReleaseIndicator();
  renderStackStrip();
  renderJourney();
  renderSkills();
  const openFeedbackDialog = setupFeedbackDialog();
  const openProjectDialog = setupProjectDialog({ onFeedback: openFeedbackDialog });
  setupProjectFilters({ onCardsRendered: () => setupTiltCards(".project-card"), onOpenProject: openProjectDialog });
  setupThemeMenu();
  setupMotionPreference();
  setupRevealAnimation();
  setupTiltCards();
  setupBackToTop();
}

bootPortfolio();
