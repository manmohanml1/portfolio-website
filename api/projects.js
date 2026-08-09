import { readApprovedProjectRows, readManagedProjectRows } from "./_lib/project-store.js";
import { BASELINE_REVIEWER } from "../src/config/project-publication.js";

function toRepository(project) {
  return {
    id: project.githubId,
    name: project.name,
    html_url: project.repo,
    homepage: project.homepage,
    description: project.githubDescription,
    language: project.language,
    topics: project.topics,
    curation: {
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags,
      caseStudy: project.caseStudy,
      media: project.media,
      ownerReviewed: Boolean(project.reviewedBy && project.reviewedBy !== BASELINE_REVIEWER),
    },
  };
}

export function createPublishedProjectsHandler({
  readProjects = readApprovedProjectRows,
  readManagedProjects = readManagedProjectRows,
} = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }
    try {
      const [projects, managedProjects] = await Promise.all([readProjects(), readManagedProjects()]);
      response.status(200).json({
        version: 2,
        source: "publishing-queue",
        repositories: projects.map(toRepository),
        managedRepositories: managedProjects.map((project) => project.repo),
      });
    } catch {
      response.status(200).json({
        version: 2,
        source: "fallback",
        repositories: [],
        managedRepositories: [],
      });
    }
  };
}

export default createPublishedProjectsHandler();
