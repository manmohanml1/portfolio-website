import { escapeHtml, qs, safeExternalUrl, tagsTemplate } from "../utils/dom.js";

function externalLink(url, label) {
  return `<a class="button external-link" href="${escapeHtml(safeExternalUrl(url))}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function renderPreview(project) {
  if (!project.details?.preview) {
    return "";
  }

  const { src, alt } = project.details.preview;

  return `
    <figure class="dialog-preview">
      <img src="${escapeHtml(safeExternalUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy" />
    </figure>
  `;
}

function renderArchitecture(details) {
  const architecture = details.architecture;

  if (!architecture?.steps?.length) {
    return "";
  }

  const [firstStep] = architecture.steps;

  return `
    <details class="architecture-explorer" open>
      <summary class="architecture-toggle">
        <strong>Architecture explorer</strong>
        <span>${escapeHtml(architecture.title)}</span>
      </summary>
      <div class="architecture-body" aria-label="${escapeHtml(architecture.title)}">
        <div class="architecture-path" aria-label="Select a system stage">
          ${architecture.steps
            .map(
              (step, index) => `
                <button
                  class="architecture-node ${index === 0 ? "active" : ""}"
                  type="button"
                  data-architecture-label="${escapeHtml(step.label)}"
                  data-architecture-role="${escapeHtml(step.role)}"
                  data-architecture-detail="${escapeHtml(step.detail)}"
                  aria-pressed="${String(index === 0)}"
                >
                  <span>${escapeHtml(step.role)}</span>
                  <strong>${escapeHtml(step.label)}</strong>
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="architecture-detail" aria-live="polite">
          <p class="architecture-role">${escapeHtml(firstStep.role)}</p>
          <h4>${escapeHtml(firstStep.label)}</h4>
          <p class="architecture-copy">${escapeHtml(firstStep.detail)}</p>
        </div>
      </div>
    </details>
  `;
}

export function createProjectDetailTemplate(project) {
  const details = project.details || {};
  const highlights = details.highlights || project.tags;
  const isCaseStudy = details.caseStudy === true;
  const caseStudySections = [
    [
      "Problem and outcome",
      [details.challenge, details.outcome].filter(Boolean).join(" "),
    ],
    ["Implementation", details.build],
    ["Engineering decisions", details.engineering],
  ].filter(([, content]) => content);
  const overviewNotes = [details.purpose, details.build, details.engineering].filter(Boolean);

  return `
    <div class="dialog-layout ${details.preview ? "with-preview" : "without-preview"}">
      <div class="dialog-content">
        <div class="project-topline">
          <span class="project-type">${escapeHtml(project.type)}</span>
        </div>
        <h2 id="project-dialog-title">${escapeHtml(project.title)}</h2>
        <p class="dialog-summary">${escapeHtml(details.summary || project.description)}</p>
        ${
          isCaseStudy
            ? caseStudySections
                .map(
                  ([title, content]) => `
                    <details class="dialog-section dialog-detail" open>
                      <summary>${escapeHtml(title)}</summary>
                      <p>${escapeHtml(content)}</p>
                    </details>
                  `,
                )
                .join("")
            : overviewNotes.length
              ? `
                <div class="dialog-section dialog-overview">
                  <h3>Project overview</h3>
                  ${overviewNotes.map((content) => `<p>${escapeHtml(content)}</p>`).join("")}
                </div>
              `
              : ""
        }
        ${renderArchitecture(details)}
        <div class="dialog-section">
          <h3>Inside the project</h3>
          <div class="tags" aria-label="${escapeHtml(project.title)} highlights">
            ${tagsTemplate(highlights)}
          </div>
        </div>
        <div class="project-links dialog-actions">
          ${externalLink(project.repo, "Repository")}
          ${project.live ? externalLink(project.live, "Live app") : ""}
          <button class="button feedback-action" type="button" data-feedback-project="${escapeHtml(project.title)}">Suggest improvement</button>
        </div>
      </div>
      ${renderPreview(project)}
    </div>
  `;
}

export function setupProjectDialog({ onFeedback } = {}) {
  const dialog = qs("#project-dialog");
  const body = qs("#project-dialog-body");
  const closeButton = qs(".dialog-close", dialog);

  closeButton.addEventListener("click", () => dialog.close());
  body.addEventListener("click", (event) => {
    const feedbackTrigger = event.target.closest("[data-feedback-project]");

    if (feedbackTrigger) {
      dialog.close();
      onFeedback?.({ project: feedbackTrigger.dataset.feedbackProject });
      return;
    }

    const selectedNode = event.target.closest(".architecture-node");

    if (!selectedNode) {
      return;
    }

    const explorer = selectedNode.closest(".architecture-explorer");
    explorer.querySelectorAll(".architecture-node").forEach((node) => {
      const active = node === selectedNode;
      node.classList.toggle("active", active);
      node.setAttribute("aria-pressed", String(active));
    });
    explorer.querySelector(".architecture-role").textContent = selectedNode.dataset.architectureRole;
    explorer.querySelector("h4").textContent = selectedNode.dataset.architectureLabel;
    explorer.querySelector(".architecture-copy").textContent = selectedNode.dataset.architectureDetail;
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  return function openProjectDialog(project) {
    body.innerHTML = createProjectDetailTemplate(project);
    if (window.matchMedia("(max-width: 720px)").matches) {
      body.querySelectorAll(".dialog-detail").forEach((section) => section.removeAttribute("open"));
      body.querySelectorAll(".architecture-explorer").forEach((explorer) => explorer.removeAttribute("open"));
    }
    dialog.showModal();
    closeButton.focus();
  };
}
