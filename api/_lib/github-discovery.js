import { GITHUB_USERNAME, PORTFOLIO_TOPIC } from "../../src/services/github-projects.js";
import { generateProjectDraft } from "./project-draft.js";
import { isBaselinePublishedRepository } from "../../src/config/project-publication.js";

async function readOptionalResponse(response, type) {
  if (!response.ok) return type === "json" ? {} : "";
  return type === "json" ? response.json() : response.text();
}

export function extractEvidenceDocumentPaths(readme = "") {
  const paths = [...String(readme).matchAll(/\[[^\]]+\]\(([^)]+\.md)(?:#[^)]*)?\)/gi)]
    .map((match) => match[1].replace(/^\.\//, ""))
    .filter((path) => !/^https?:/i.test(path) && !path.includes(".."))
    .filter((path) => /architecture|testing|design|technical/i.test(path));
  return [...new Set(paths)].slice(0, 2);
}

function encodeRepositoryPath(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function resolveRepositoryMediaUrl(repository, value) {
  const source = String(value || "").trim().replace(/^<|>$/g, "");
  if (!source || /^(?:data:|javascript:)/i.test(source)) return "";
  if (/^https:\/\//i.test(source)) return source;
  if (/^[a-z]+:/i.test(source)) return "";
  const branch = repository.default_branch || "main";
  const path = source.replace(/^\.\//, "").replace(/^\//, "");
  return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${encodeURIComponent(repository.name)}/${encodeURIComponent(branch)}/${path}`;
}

export function extractMediaCandidates(repository, markdown = "") {
  const candidates = [];
  const append = (kind, url, alt, source) => {
    const resolvedUrl = resolveRepositoryMediaUrl(repository, url);
    if (!resolvedUrl || candidates.some((candidate) => candidate.url === resolvedUrl)) return;
    candidates.push({ kind, url: resolvedUrl, alt: String(alt || "").trim().slice(0, 160), source });
  };
  [...String(markdown).matchAll(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)]
    .forEach((match) => append("image", match[2], match[1], "README image"));
  [...String(markdown).matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi)]
    .forEach((match) => append("image", match[1], match[2], "README image"));
  [...String(markdown).matchAll(/\[([^\]]*)\]\(([^)]+(?:\.mp4|\.webm|\.mov|youtube\.com\/watch[^)]*|youtu\.be\/[^)]*))\)/gi)]
    .forEach((match) => append("video", match[2], match[1], "README demo"));
  return candidates.slice(0, 10);
}

export async function enrichPortfolioRepository(repository, { fetcher, headers }) {
  const baseUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repository.name)}`;
  const [readme, languages] = await Promise.all([
    fetcher(`${baseUrl}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
    }).then((response) => readOptionalResponse(response, "text")).catch(() => ""),
    fetcher(`${baseUrl}/languages`, { headers })
      .then((response) => readOptionalResponse(response, "json")).catch(() => ({})),
  ]);
  const evidencePaths = extractEvidenceDocumentPaths(readme);
  const evidenceDocuments = await Promise.all(evidencePaths.map((path) => (
    fetcher(`${baseUrl}/contents/${encodeRepositoryPath(path)}`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
    }).then((response) => readOptionalResponse(response, "text")).catch(() => "")
  )));
  const combinedReadme = [readme, ...evidenceDocuments.map((document, index) => (
    document ? `\n# Linked engineering evidence: ${evidencePaths[index]}\n${document}` : ""
  ))].filter(Boolean).join("\n");
  const mediaCandidates = extractMediaCandidates(repository, combinedReadme);
  const draft = generateProjectDraft(repository, { readme: combinedReadme, languages });
  const cover = mediaCandidates.find((candidate) => candidate.kind === "image");
  const demo = mediaCandidates.find((candidate) => candidate.kind === "video");
  draft.evidence.mediaCandidates = mediaCandidates;
  draft.presentation.media = {
    coverImageUrl: cover?.url || "",
    coverImageAlt: cover?.alt || (cover ? `${draft.presentation.title} project preview` : ""),
    demoUrl: demo?.url || "",
  };
  return {
    ...repository,
    portfolioDraft: draft,
  };
}

export async function discoverPortfolioRepositories({
  fetcher = globalThis.fetch,
  token = process.env.GITHUB_TOKEN || "",
} = {}) {
  if (typeof fetcher !== "function") throw new Error("GitHub discovery is unavailable");
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetcher(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
    { headers },
  );
  if (!response.ok) throw new Error(`GitHub discovery failed: ${response.status}`);
  const repositories = await response.json();
  const selected = repositories.filter((repository) => (
    !repository.archived
    && !repository.fork
    && (
      (repository.topics || []).includes(PORTFOLIO_TOPIC)
      || isBaselinePublishedRepository(repository)
    )
  ));
  return Promise.all(selected.slice(0, 20).map(
    (repository) => enrichPortfolioRepository(repository, { fetcher, headers }),
  ));
}
