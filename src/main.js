import { setupEnvironment } from "./config/environment.js";
import { setupBackToTop, setupCursorLight, setupRevealAnimation, setupTiltCards } from "./features/interactions.js";
import { setupThemeMenu } from "./features/theme-switcher.js";
import { setupProjectFilters } from "./render/projects.js";
import { renderCaseStudies, renderJourney, renderSkills, renderStackStrip } from "./render/sections.js";

function bootPortfolio() {
  setupEnvironment();
  renderStackStrip();
  renderCaseStudies();
  renderJourney();
  renderSkills();
  setupProjectFilters({ onCardsRendered: () => setupTiltCards(".project-card") });
  setupThemeMenu();
  setupRevealAnimation();
  setupCursorLight();
  setupTiltCards();
  setupBackToTop();
}

bootPortfolio();
