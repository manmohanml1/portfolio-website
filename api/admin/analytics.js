import { authorizeAdminRequest } from "../_lib/admin-auth.js";
import { ANALYTICS_RANGES, readAnalyticsSummary } from "../_lib/vercel-analytics.js";

function resolveRange(request) {
  const value = request.query?.days;
  if (typeof value === "string") return Number(value);
  try {
    return Number(new URL(request.url, "http://localhost").searchParams.get("days") || 7);
  } catch {
    return 7;
  }
}

export function createAdminAnalyticsHandler({
  authorize = authorizeAdminRequest,
  readSummary = readAnalyticsSummary,
} = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    const owner = await authorize(request);
    if (!owner) {
      response.status(401).json({ error: "Owner authentication required" });
      return;
    }

    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const days = resolveRange(request);
    if (!ANALYTICS_RANGES.includes(days)) {
      response.status(400).json({ error: "Invalid analytics range" });
      return;
    }

    try {
      const summary = await readSummary({ days });
      response.status(200).json({ version: 1, owner: owner.label, ...summary });
    } catch {
      response.status(502).json({ error: "Vercel Web Analytics is unavailable" });
    }
  };
}

export default createAdminAnalyticsHandler();
