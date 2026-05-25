export const GITHUB_USERNAME = "manmohanml1";
export const PORTFOLIO_TOPIC = "portfolio-showcase";
export const LIVE_PROJECT_TOPIC = "portfolio-live";

const CATEGORY_TOPICS = {
  "portfolio-frontend": { category: "frontend", type: "Frontend", visual: "React UI", accent: "#36d6c4" },
  "portfolio-backend": { category: "backend", type: "Backend", visual: "REST API", accent: "#ffc857" },
  "portfolio-data": { category: "data", type: "Data", visual: "Data stream", accent: "#57a6ff" },
  "portfolio-ai": { category: "ai", type: "AI", visual: "AI workflow", accent: "#ff6b9a" },
  "portfolio-wearable": { category: "wearable", type: "Meta Display", visual: "Glasses UI", accent: "#27d3d1" },
};

const DISPLAY_APPS = {
  "autonomous-travel-guide-mrbd": {
    title: "Autonomous Travel Guide",
    visual: "Travel guide",
    details: {
      summary: "A glasses-first travel companion that presents live destination context in a compact wearable interface.",
      purpose:
        "Turns arrival in an unfamiliar place into glanceable guidance: local conditions, landmarks, useful phrases, exchange rates, and daily spending context.",
      build:
        "Built as a 600 x 600 D-pad navigable web app with public travel, weather, air-quality, translation, and currency providers plus local persistence.",
      engineering:
        "Provider responses are normalized for a constrained display, key travel state is cached locally, and core flows remain navigable through directional controls.",
      highlights: ["Live travel APIs", "D-pad navigation", "Local trip state", "Meta Display UX"],
    },
  },
  "glass-tube": {
    title: "GlassTube",
    visual: "Video viewer",
    details: {
      summary: "A focused YouTube viewing prototype designed for the Meta Ray-Ban Display form factor.",
      purpose:
        "Tests how familiar video consumption can be reduced to a fast, readable glasses interaction without pretending to replace YouTube.",
      build:
        "Built around a 600 x 600 focus-driven interface, official YouTube embedding, recent-view storage, and guarded outbound navigation.",
      engineering:
        "Known videos work without an API key; optional search remains local during prototyping, while external navigation is restricted to trusted YouTube HTTPS hosts.",
      highlights: ["YouTube embed", "Focus navigation", "Safe outbound links", "Local history"],
      preview: {
        src: "https://raw.githubusercontent.com/manmohanml1/glass-tube/main/assets/glass-tube-player.png",
        alt: "GlassTube video player interface for a wearable display",
      },
    },
  },
  "glass-search-meta-display": {
    title: "Glass Search",
    visual: "Search UI",
    details: {
      summary: "A voice and handwriting-first search surface designed to remain glanceable on display glasses.",
      purpose:
        "Explores search when a keyboard is inconvenient, emphasizing short queries, nearby-place intent, and device-native navigation handoff.",
      build:
        "Built with query intent handling, provider adapters, local recent state, conditional GPS access, and native map handoff behind a 600 x 600 UI.",
      engineering:
        "Location is requested only for relevant intents, and the provider boundary can be replaced later without redesigning screens or interaction flows.",
      highlights: ["Voice input", "Handwriting flow", "Map handoff", "Provider adapters"],
    },
  },
};

function humanizeTopic(topic) {
  return topic
    .replace(/^portfolio-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRepositoryTitle(name) {
  if (DISPLAY_APPS[name.toLowerCase()]) {
    return DISPLAY_APPS[name.toLowerCase()].title;
  }

  return name
    .replaceAll("_", "-")
    .split("-")
    .map((part) => {
      if (["api", "ai", "ui", "mrbd"].includes(part.toLowerCase())) {
        return part.toUpperCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function isDisplayApp(repository) {
  const identity = `${repository.name} ${repository.description || ""}`.toLowerCase();
  return /meta ray-ban display|meta display|mrbd|glasses-first/.test(identity);
}

export function mapGitHubRepository(repository) {
  const topics = repository.topics || [];
  const displayApp = DISPLAY_APPS[repository.name.toLowerCase()];
  const categoryTopic = topics.find((topic) => CATEGORY_TOPICS[topic]);
  const presentation = CATEGORY_TOPICS[categoryTopic] || (isDisplayApp(repository) ? CATEGORY_TOPICS["portfolio-wearable"] : {
    category: "other",
    type: "Selected",
    visual: "New project",
    accent: "#36d6c4",
  });
  const technologyTags = topics
    .filter((topic) => topic !== PORTFOLIO_TOPIC && topic !== LIVE_PROJECT_TOPIC && !CATEGORY_TOPICS[topic])
    .map(humanizeTopic);
  const contextTags = presentation.category === "wearable" ? ["Meta Display"] : [];
  const tags = [...new Set([repository.language, ...contextTags, ...technologyTags].filter(Boolean))].slice(0, 5);

  return {
    title: formatRepositoryTitle(repository.name),
    repo: repository.html_url,
    live: topics.includes(LIVE_PROJECT_TOPIC) && repository.homepage ? repository.homepage : undefined,
    type: presentation.type,
    category: presentation.category,
    description: repository.description || "A newly selected project from my public GitHub portfolio.",
    tags: tags.length >= 2 ? tags : [...tags, "Selected Work"].slice(0, 2),
    visual: displayApp?.visual || presentation.visual,
    accent: presentation.accent,
    details: displayApp?.details,
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
