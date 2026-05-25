import { projects } from "../data/portfolio.js";
import { fetchOptInProjects } from "../services/github-projects.js";
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

export function getProjectsForFilter(filter = "all", availableProjects = projects) {
  if (!PROJECT_FILTERS.includes(filter) || filter === "all") {
    return availableProjects;
  }

  return availableProjects.filter((project) => project.category === filter);
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

export function setupProjectFilters({ onCardsRendered, onOpenProject } = {}) {
  const grid = qs("#project-grid");
  const filters = qsa(".filter");
  const projectCount = qs("#project-count");
  const githubProjectStatus = qs("#github-project-status");
  const wearableFilter = qs('[data-filter="wearable"]');
  let availableProjects = projects;
  let activeFilter = "all";

  function renderProjects(filter = "all") {
    activeFilter = filter;
    const visibleProjects = getProjectsForFilter(filter, availableProjects);
    const filterLabel = getFilterLabel(filter);

    grid.innerHTML = visibleProjects
      .map(
        (project, index) => `
          <article class="project-card ${project.featured ? "featured" : ""}" data-project-index="${index}">
            <button class="project-visual project-open" type="button" data-open-project="${index}" aria-label="View details for ${escapeHtml(project.title)}">
              <span style="--project-accent: ${escapeHtml(project.accent)}">${escapeHtml(project.visual)}</span>
            </button>
            <div class="project-topline">
              <span class="project-type">${escapeHtml(project.type)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="tags" aria-label="${escapeHtml(project.title)} technologies">
              ${tagsTemplate(project.tags)}
            </div>
            <div class="project-links">
              <button class="details-link" type="button" data-open-project="${index}">${getProjectActionLabel(project)}</button>
              <a class="external-link" href="${escapeHtml(safeExternalUrl(project.repo))}" target="_blank" rel="noopener noreferrer">Repository</a>
              ${project.live ? `<a class="external-link" href="${escapeHtml(safeExternalUrl(project.live))}" target="_blank" rel="noopener noreferrer">Live app</a>` : ""}
            </div>
          </article>
        `,
      )
      .join("");

    projectCount.textContent = `Showing ${visibleProjects.length} ${filterLabel}`;

    requestAnimationFrame(() => {
      qsa(".project-card").forEach((card, index) => {
        window.setTimeout(() => card.classList.add("show"), index * 60);
      });
      onCardsRendered?.();
    });
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderProjects(button.dataset.filter);
    });
  });

  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-project]");
    const card = event.target.closest(".project-card");

    if (trigger) {
      onOpenProject?.(getProjectsForFilter(activeFilter, availableProjects)[Number(trigger.dataset.openProject)]);
      return;
    }

    if (card && !event.target.closest("a, button")) {
      onOpenProject?.(getProjectsForFilter(activeFilter, availableProjects)[Number(card.dataset.projectIndex)]);
    }
  });

  renderProjects();

  fetchOptInProjects()
    .then((discoveredProjects) => {
      availableProjects = mergeProjects(projects, discoveredProjects);
      const addedProjects = availableProjects.length - projects.length;
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
}
