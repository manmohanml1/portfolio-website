import { credentials, experiences, projects, skills } from "../data/portfolio.js";
import { escapeHtml, qs } from "../utils/dom.js";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function projectText(project) {
  const details = project.details || {};
  return [
    project.title,
    project.type,
    project.description,
    ...(project.tags || []),
    details.summary,
    details.purpose,
    details.challenge,
    details.build,
    details.engineering,
    details.outcome,
    ...(details.highlights || []),
  ].join(" ");
}

export function buildEvidenceIndex({
  projectItems = projects,
  experienceItems = experiences,
  skillItems = skills,
  credentialItems = credentials,
} = {}) {
  return [
    ...projectItems.map((project) => ({
      type: "Project",
      title: project.title,
      summary: project.description,
      href: "#work",
      project,
      audiences: project.audiences || [],
      searchText: normalize(projectText(project)),
    })),
    ...experienceItems.map((experience) => ({
      type: "Experience",
      title: `${experience.role} · ${experience.org}`,
      summary: experience.detail,
      href: "#journey",
      audiences: experience.audiences || [],
      searchText: normalize([
        experience.role,
        experience.org,
        experience.detail,
        ...(experience.highlights || []),
      ].join(" ")),
    })),
    ...skillItems.map((skill) => ({
      type: "Skill path",
      title: skill.title,
      summary: skill.description,
      href: "#skills",
      audiences: skill.audiences || [],
      searchText: normalize(`${skill.title} ${skill.description}`),
    })),
    ...credentialItems.map((credential) => ({
      type: "Credential",
      title: credential.label,
      summary: `${credential.value}. ${credential.detail || ""}`.trim(),
      href: "#journey",
      audiences: credential.audiences || [],
      searchText: normalize(`${credential.label} ${credential.value} ${credential.detail || ""}`),
    })),
  ];
}

export function searchEvidence(query, items = buildEvidenceIndex(), { audience = "general", limit = 8 } = {}) {
  const normalizedQuery = normalize(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  return items
    .filter((item) => audience === "general" || item.audiences.includes(audience))
    .map((item, index) => {
      const title = normalize(item.title);
      const allTokensMatch = tokens.every((token) => item.searchText.includes(token));
      const score = allTokensMatch
        ? tokens.reduce((total, token) => total + (title.includes(token) ? 4 : 1), 0)
          + (item.searchText.includes(normalizedQuery) ? 3 : 0)
        : 0;
      return { item, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function createEvidenceResultTemplate(item) {
  return `
    <a class="evidence-result" href="${escapeHtml(item.href)}"${item.project ? ` data-evidence-project="${escapeHtml(item.title)}"` : ""}>
      <span>${escapeHtml(item.type)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.summary)}</p>
    </a>
  `;
}

export function setupEvidenceExplorer({ initialAudience = "general", onOpenProject } = {}) {
  const input = qs("#evidence-query");
  const clear = qs("#evidence-clear");
  const status = qs("#evidence-status");
  const results = qs("#evidence-results");
  const index = buildEvidenceIndex();
  let audience = initialAudience;

  function render(query = input.value) {
    const matches = searchEvidence(query, index, { audience });
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      results.innerHTML = "";
      status.textContent = "";
      status.hidden = true;
      clear.hidden = true;
      return;
    }

    clear.hidden = false;
    status.hidden = false;
    results.innerHTML = matches.map(createEvidenceResultTemplate).join("");
    status.textContent = matches.length
      ? `${matches.length} evidence result${matches.length === 1 ? "" : "s"} for “${trimmedQuery}”.`
      : `No direct evidence found for “${trimmedQuery}”. Try a technology or capability.`;
  }

  input.addEventListener("input", () => render());
  clear.addEventListener("click", () => {
    input.value = "";
    render("");
    input.focus();
  });
  results.addEventListener("click", (event) => {
    const projectResult = event.target.closest("[data-evidence-project]");
    if (!projectResult || !onOpenProject) return;
    const match = index.find((item) => item.project && item.title === projectResult.dataset.evidenceProject);
    if (!match) return;
    event.preventDefault();
    onOpenProject(match.project);
  });

  return Object.freeze({
    setAudience(nextAudience) {
      audience = nextAudience;
      render();
    },
  });
}
