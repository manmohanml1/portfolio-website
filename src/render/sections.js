import { credentials, experiences, skills, stackItems } from "../data/portfolio.js";
import { qs } from "../utils/dom.js";

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
          <span>${item.org}</span>
          <h4>${item.role}</h4>
          <p>${item.detail}</p>
        </article>
      `,
    )
    .join("");

  credentialGrid.innerHTML = credentials
    .map(
      (item) => `
        <article class="credential-card reveal">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
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
