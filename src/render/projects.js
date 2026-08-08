import { projects } from "../data/portfolio.js";
import { fetchOptInProjects } from "../services/github-projects.js";
import { AUDIENCE_OPTIONS } from "../services/visitor-preferences.js";
import { getAudienceLens } from "../data/audience-lenses.js";
import { escapeHtml, qs, qsa, safeExternalUrl, tagsTemplate } from "../utils/dom.js";

export const PROJECT_FILTERS = ["all", "frontend", "backend", "data", "ai", "wearable"];
const FILTER_LABELS = {
  all: "all projects",
  frontend: "Frontend projects",
  backend: "Backend projects",
  data: "Data projects",
  ai: "AI projects",
  wearable: "Wearable projects",
};

export function getProjectActionLabel(project) {
  if (project.details?.caseStudy) {
    return "Case study";
  }

  return project.details?.preview ? "Preview" : "Details";
}

export function canOpenProjectCard(layout, hasInteractiveTarget = false) {
  return layout === "cards" && !hasInteractiveTarget;
}

export function getProjectsForFilter(filter = "all", availableProjects = projects) {
  if (!PROJECT_FILTERS.includes(filter) || filter === "all") {
    return availableProjects;
  }

  return availableProjects.filter((project) => project.category === filter);
}

const AUDIENCE_CATEGORY_ORDER = Object.freeze({
  general: [],
  backend: ["backend", "data", "ai", "frontend", "wearable"],
  fullstack: ["frontend", "backend", "data", "ai", "wearable"],
  data: ["data", "backend", "ai", "frontend", "wearable"],
  ai: ["ai", "backend", "frontend", "data", "wearable"],
});

const CATEGORY_AUDIENCES = Object.freeze({
  frontend: ["fullstack"],
  backend: ["backend", "fullstack"],
  data: ["backend", "data"],
  ai: ["ai", "fullstack"],
  wearable: [],
  other: [],
});

export function getProjectAudiences(project) {
  return project.audiences || CATEGORY_AUDIENCES[project.category] || [];
}

export function getProjectsForAudience(audience = "general", availableProjects = projects) {
  const resolvedAudience = AUDIENCE_OPTIONS.includes(audience) ? audience : "general";
  const order = AUDIENCE_CATEGORY_ORDER[resolvedAudience];
  if (order.length === 0) return [...availableProjects];

  return availableProjects
    .filter((project) => getProjectAudiences(project).includes(resolvedAudience))
    .map((project, index) => ({ project, index }))
    .sort((left, right) => {
      const leftRank = order.indexOf(left.project.category);
      const rightRank = order.indexOf(right.project.category);
      return (leftRank === -1 ? order.length : leftRank)
        - (rightRank === -1 ? order.length : rightRank)
        || left.index - right.index;
    })
    .map(({ project }) => project);
}

export function getFilterLabel(filter = "all") {
  return FILTER_LABELS[filter] || FILTER_LABELS.all;
}

export function mergeProjects(curatedProjects, discoveredProjects) {
  const curatedUrls = new Set(curatedProjects.map((project) => project.repo.toLowerCase()));
  return [
    ...curatedProjects,
    ...discoveredProjects.filter((project) => !curatedUrls.has(project.repo.toLowerCase())),
  ];
}

export function createProjectCardTemplate(project, index, { allowDetails = true } = {}) {
  return `
    <article class="project-card ${project.featured ? "featured" : ""}"${allowDetails ? ` data-project-card-index="${index}"` : ""}>
      ${
        allowDetails
          ? `<button class="project-visual project-open" type="button" data-open-project="${index}" aria-label="View details for ${escapeHtml(project.title)}">
              <span style="--project-accent: ${escapeHtml(project.accent)}">${escapeHtml(project.visual)}</span>
            </button>`
          : `<div class="project-visual" aria-hidden="true">
              <span style="--project-accent: ${escapeHtml(project.accent)}">${escapeHtml(project.visual)}</span>
            </div>`
      }
      <div class="project-topline">
        <span class="project-type">${escapeHtml(project.type)}</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <div class="tags" aria-label="${escapeHtml(project.title)} technologies">
        ${tagsTemplate(project.tags)}
      </div>
      <div class="project-links">
        ${allowDetails ? `<button class="details-link" type="button" data-open-project="${index}">${getProjectActionLabel(project)}</button>` : ""}
        <a class="external-link" href="${escapeHtml(safeExternalUrl(project.repo))}" target="_blank" rel="noopener noreferrer">Repository</a>
        ${project.live ? `<a class="external-link" href="${escapeHtml(safeExternalUrl(project.live))}" target="_blank" rel="noopener noreferrer">Live app</a>` : ""}
      </div>
    </article>
  `;
}

export function setupProjectFilters({
  filtersEnabled = true,
  audience = "general",
  onCardsRendered,
  onOpenProject,
} = {}) {
  const grid = qs("#project-grid");
  const filters = qsa(".filter");
  const projectCount = qs("#project-count");
  const githubProjectStatus = qs("#github-project-status");
  const wearableFilter = qs('[data-filter="wearable"]');
  let availableProjects = projects;
  let discoveredProjects = [];
  let activeFilter = "all";
  let activeAudience = AUDIENCE_OPTIONS.includes(audience) ? audience : "general";

  function getVisibleProjects() {
    return getProjectsForFilter(activeFilter, getProjectsForAudience(activeAudience, availableProjects));
  }

  function syncFilterControls(filter) {
    filters.forEach((item) => item.classList.toggle("active", item.dataset.filter === filter));
  }

  function selectFilter(filter) {
    const resolvedFilter = PROJECT_FILTERS.includes(filter) ? filter : "all";
    syncFilterControls(resolvedFilter);
    renderProjects(resolvedFilter);
  }

  function renderProjects(filter = "all") {
    activeFilter = filter;
    const visibleProjects = getVisibleProjects();
    const filterLabel = activeAudience === "general"
      ? getFilterLabel(filter)
      : getAudienceLens(activeAudience).projectLabel;

    grid.innerHTML = visibleProjects
      .map((project, index) => createProjectCardTemplate(project, index, { allowDetails: Boolean(onOpenProject) }))
      .join("");

    projectCount.textContent = `Showing ${visibleProjects.length} ${filterLabel}`;
    if (activeAudience !== "general" && discoveredProjects.length > 0) {
      const matchingDiscoveries = getProjectsForAudience(activeAudience, discoveredProjects).length;
      githubProjectStatus.textContent = matchingDiscoveries > 0
        ? `${matchingDiscoveries} matching GitHub project${matchingDiscoveries === 1 ? "" : "s"} synced`
        : "Curated audience selection";
    }

    requestAnimationFrame(() => {
      qsa(".project-card").forEach((card, index) => {
        window.setTimeout(() => card.classList.add("show"), index * 60);
      });
      onCardsRendered?.();
    });
  }

  if (filtersEnabled) {
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        selectFilter(button.dataset.filter);
      });
    });
  }

  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-project]");
    const card = event.target.closest(".project-card");

    if (trigger && onOpenProject) {
      onOpenProject?.(getVisibleProjects()[Number(trigger.dataset.openProject)]);
      return;
    }

    if (
      card
      && onOpenProject
      && canOpenProjectCard(document.documentElement.dataset.projectLayout, Boolean(event.target.closest("a, button")))
    ) {
      onOpenProject?.(getVisibleProjects()[Number(card.dataset.projectCardIndex)]);
    }
  });

  syncFilterControls(activeFilter);
  renderProjects(activeFilter);

  fetchOptInProjects()
    .then((fetchedProjects) => {
      availableProjects = mergeProjects(projects, fetchedProjects);
      const addedProjects = availableProjects.length - projects.length;
      // Keep the discovered subset so audience-specific sync status stays accurate.
      discoveredProjects = availableProjects.filter((project) => project.discovered);
      wearableFilter.hidden = !availableProjects.some((project) => project.category === "wearable");
      githubProjectStatus.textContent =
        addedProjects > 0
          ? `${addedProjects} selected GitHub project${addedProjects === 1 ? "" : "s"} synced`
          : "Curated selection · live GitHub additions enabled";
      renderProjects(activeFilter);
    })
    .catch(() => {
      githubProjectStatus.textContent = "Curated projects shown; GitHub additions unavailable";
    });

  return Object.freeze({
    setAudience(nextAudience) {
      activeAudience = AUDIENCE_OPTIONS.includes(nextAudience) ? nextAudience : "general";
      selectFilter("all");
    },
  });
}
