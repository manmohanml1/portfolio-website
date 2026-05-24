import { projects } from "../data/portfolio.js";
import { fetchOptInProjects } from "../services/github-projects.js";
import { escapeHtml, qs, qsa, safeExternalUrl, tagsTemplate } from "../utils/dom.js";

export const PROJECT_FILTERS = ["all", "frontend", "backend", "data", "ai"];
const FILTER_LABELS = {
  all: "all projects",
  frontend: "Frontend projects",
  backend: "Backend projects",
  data: "Data projects",
  ai: "AI projects",
};

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

export function setupProjectFilters({ onCardsRendered } = {}) {
  const grid = qs("#project-grid");
  const filters = qsa(".filter");
  const projectCount = qs("#project-count");
  const githubProjectStatus = qs("#github-project-status");
  let availableProjects = projects;
  let activeFilter = "all";

  function renderProjects(filter = "all") {
    activeFilter = filter;
    const visibleProjects = getProjectsForFilter(filter, availableProjects);
    const filterLabel = getFilterLabel(filter);

    grid.innerHTML = visibleProjects
      .map(
        (project) => `
          <article class="project-card ${project.featured ? "featured" : ""}">
            <div class="project-visual" aria-hidden="true">
              <span style="--project-accent: ${escapeHtml(project.accent)}">${escapeHtml(project.visual)}</span>
            </div>
            <div class="project-topline">
              <span class="project-type">${escapeHtml(project.type)}</span>
              <span class="repo-size">${escapeHtml(project.size)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="tags" aria-label="${escapeHtml(project.title)} technologies">
              ${tagsTemplate(project.tags)}
            </div>
            <div class="project-links">
              <a class="external-link" href="${escapeHtml(safeExternalUrl(project.repo))}">Repository</a>
              ${project.live ? `<a class="external-link" href="${escapeHtml(safeExternalUrl(project.live))}">Live app</a>` : ""}
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

  renderProjects();

  fetchOptInProjects()
    .then((discoveredProjects) => {
      availableProjects = mergeProjects(projects, discoveredProjects);
      const addedProjects = availableProjects.length - projects.length;
      githubProjectStatus.textContent =
        addedProjects > 0
          ? `${addedProjects} tagged GitHub project${addedProjects === 1 ? "" : "s"} added live`
          : "Curated selection · live GitHub additions enabled";
      renderProjects(activeFilter);
    })
    .catch(() => {
      githubProjectStatus.textContent = "Curated projects shown; GitHub additions unavailable";
    });
}
