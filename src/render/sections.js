import { credentials, experiences, skills, stackItems } from "../data/portfolio.js";
import { escapeHtml, qs } from "../utils/dom.js";

export function renderStackStrip() {
  const stackTrack = qs("#stack-track");
  const doubledStack = [...stackItems, ...stackItems];

  stackTrack.innerHTML = doubledStack.map((item) => `<span>${item}</span>`).join("");
}

export function renderJourney() {
  const experienceList = qs("#experience-list");
  const credentialGrid = qs("#credential-grid");

  experienceList.innerHTML = experiences
    .map(
      (item) => `
        <article class="timeline-item reveal">
          <span>${escapeHtml(item.org)}</span>
          <h4>${escapeHtml(item.role)}</h4>
          <p class="timeline-meta">${escapeHtml(item.period)} · ${escapeHtml(item.location)}</p>
          <p>${escapeHtml(item.detail)}</p>
          ${
            item.highlights.length
              ? `
                <details class="career-detail">
                  <summary>Highlights</summary>
                  <ul>
                    ${item.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
                  </ul>
                </details>
              `
              : ""
          }
        </article>
      `,
    )
    .join("");

  credentialGrid.innerHTML = credentials
    .map(
      (item) => `
        <article class="credential-card ${item.featured ? "featured" : ""} reveal">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
        </article>
      `,
    )
    .join("");
}

export function renderSkills() {
  const skillGrid = qs(".skill-grid");

  skillGrid.innerHTML = skills
    .map(
      (skill) => `
        <section class="reveal">
          <h3>${skill.title}</h3>
          <p>${skill.description}</p>
        </section>
      `,
    )
    .join("");
}
