import { projects } from "../data/portfolio.js";
import { qs, qsa, tagsTemplate } from "../utils/dom.js";

export const PROJECT_FILTERS = ["all", "frontend", "backend", "data", "ai"];
const FILTER_LABELS = {
  all: "all projects",
  frontend: "Frontend projects",
  backend: "Backend projects",
  data: "Data projects",
  ai: "AI projects",
};

export function getProjectsForFilter(filter = "all") {
  if (!PROJECT_FILTERS.includes(filter) || filter === "all") {
    return projects;
  }

  return projects.filter((project) => project.category === filter);
}

export function getFilterLabel(filter = "all") {
  return FILTER_LABELS[filter] || FILTER_LABELS.all;
}

export function setupProjectFilters({ onCardsRendered } = {}) {
  const grid = qs("#project-grid");
  const filters = qsa(".filter");
  const projectCount = qs("#project-count");

  function renderProjects(filter = "all") {
    const visibleProjects = getProjectsForFilter(filter);
    const filterLabel = getFilterLabel(filter);

    grid.innerHTML = visibleProjects
      .map(
        (project) => `
          <article class="project-card ${project.featured ? "featured" : ""}">
            <div class="project-visual" aria-hidden="true">
              <span style="--project-accent: ${project.accent}">${project.visual}</span>
            </div>
            <div class="project-topline">
              <span class="project-type">${project.type}</span>
              <span class="repo-size">${project.size}</span>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tags" aria-label="${project.title} technologies">
              ${tagsTemplate(project.tags)}
            </div>
            <div class="project-links">
              <a class="external-link" href="${project.repo}">Repository</a>
              ${project.live ? `<a class="external-link" href="${project.live}">Live app</a>` : ""}
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
}
