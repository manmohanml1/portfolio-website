import { authorizeAdminRequest, isTrustedMutationOrigin } from "../_lib/admin-auth.js";
import { discoverPortfolioRepositories } from "../_lib/github-discovery.js";
import {
  normalizeProjectReview,
  readAdminProjectQueue,
  reviewProjectCandidate,
  syncProjectCandidates,
} from "../_lib/project-store.js";

function validVersion(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function createAdminProjectsHandler({
  authorize = authorizeAdminRequest,
  trustedOrigin = isTrustedMutationOrigin,
  discover = discoverPortfolioRepositories,
  sync = syncProjectCandidates,
  readQueue = readAdminProjectQueue,
  review = reviewProjectCandidate,
} = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    const owner = await authorize(request);
    if (!owner) {
      response.status(401).json({ error: "Owner authentication required" });
      return;
    }

    if (request.method === "GET") {
      try {
        const state = await readQueue();
        response.status(200).json({ version: 1, owner: owner.label, ...state });
      } catch {
        response.status(503).json({ error: "Project publishing queue is unavailable" });
      }
      return;
    }

    if (!["POST", "PUT"].includes(request.method)) {
      response.setHeader("Allow", "GET, POST, PUT");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }
    if (!trustedOrigin(request)) {
      response.status(403).json({ error: "Untrusted request origin" });
      return;
    }

    if (request.method === "POST") {
      if (request.body?.action !== "sync") {
        response.status(400).json({ error: "Invalid project action" });
        return;
      }
      try {
        const repositories = await discover();
        const synced = await sync({ repositories });
        const state = await readQueue();
        response.status(200).json({ version: 1, owner: owner.label, synced, ...state });
      } catch {
        response.status(503).json({ error: "GitHub project synchronization is unavailable" });
      }
      return;
    }

    const { githubId, expectedUpdatedAt } = request.body || {};
    const normalizedReview = normalizeProjectReview(request.body);
    if (!/^\d+$/.test(String(githubId || "")) || !validVersion(expectedUpdatedAt) || !normalizedReview) {
      response.status(400).json({ error: "Invalid project review" });
      return;
    }
    try {
      const project = await review({
        githubId,
        review: normalizedReview,
        expectedUpdatedAt,
        changedBy: owner.label,
      });
      if (!project) {
        response.status(409).json({ error: "Project changed; refresh before saving" });
        return;
      }
      response.status(200).json({ version: 1, project });
    } catch {
      response.status(503).json({ error: "Project publishing queue is unavailable" });
    }
  };
}

export default createAdminProjectsHandler();
