export const GITHUB_USERNAME = "manmohanml1";
export const PORTFOLIO_TOPIC = "portfolio-showcase";

const CATEGORY_TOPICS = {
  "portfolio-frontend": { category: "frontend", type: "Frontend", visual: "React UI", accent: "#36d6c4" },
  "portfolio-backend": { category: "backend", type: "Backend", visual: "REST API", accent: "#ffc857" },
  "portfolio-data": { category: "data", type: "Data", visual: "Data stream", accent: "#57a6ff" },
  "portfolio-ai": { category: "ai", type: "AI", visual: "AI workflow", accent: "#ff6b9a" },
};

function humanizeTopic(topic) {
  return topic
    .replace(/^portfolio-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapGitHubRepository(repository) {
  const topics = repository.topics || [];
  const categoryTopic = topics.find((topic) => CATEGORY_TOPICS[topic]);
  const presentation = CATEGORY_TOPICS[categoryTopic] || {
    category: "other",
    type: "GitHub",
    visual: "New work",
    accent: "#36d6c4",
  };
  const technologyTags = topics
    .filter((topic) => topic !== PORTFOLIO_TOPIC && !CATEGORY_TOPICS[topic])
    .map(humanizeTopic);
  const tags = [...new Set([repository.language, ...technologyTags].filter(Boolean))].slice(0, 5);

  return {
    title: repository.name.replaceAll("-", " "),
    repo: repository.html_url,
    live: repository.homepage || undefined,
    type: presentation.type,
    category: presentation.category,
    size: "GitHub",
    description: repository.description || "A newly selected project from my public GitHub portfolio.",
    tags: tags.length >= 2 ? tags : [...tags, "Portfolio", "GitHub"].slice(0, 2),
    visual: presentation.visual,
    accent: presentation.accent,
    discovered: true,
  };
}

export async function fetchOptInProjects(fetcher = globalThis.fetch) {
  if (typeof fetcher !== "function") {
    return [];
  }

  const response = await fetcher(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub projects request failed: ${response.status}`);
  }

  const repositories = await response.json();

  return repositories
    .filter(
      (repository) =>
        !repository.archived && !repository.fork && (repository.topics || []).includes(PORTFOLIO_TOPIC),
    )
    .map(mapGitHubRepository);
}

