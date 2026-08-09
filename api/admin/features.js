import { isKnownFeatureFlag } from "../../src/config/feature-defaults.js";
import { readAdminFeatureConfig, updateFeatureFlag } from "../_lib/feature-store.js";
import { authorizeAdminRequest, isTrustedMutationOrigin } from "../_lib/admin-auth.js";

const ENVIRONMENTS = new Set(["development", "staging", "production"]);

function resolveRequestedEnvironment(request) {
  const value = request.query?.environment;
  if (typeof value === "string") return value;
  try {
    return new URL(request.url, "http://localhost").searchParams.get("environment") || "development";
  } catch {
    return "development";
  }
}

export function createAdminFeatureHandler({
  authorize = authorizeAdminRequest,
  readConfig = readAdminFeatureConfig,
  updateFlag = updateFeatureFlag,
  trustedOrigin = isTrustedMutationOrigin,
} = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    const owner = await authorize(request);
    if (!owner) {
      response.status(401).json({ error: "Owner authentication required" });
      return;
    }

    const environment = resolveRequestedEnvironment(request);
    if (!ENVIRONMENTS.has(environment)) {
      response.status(400).json({ error: "Invalid environment" });
      return;
    }

    if (request.method === "GET") {
      try {
        const state = await readConfig({ environment });
        response.status(200).json({ version: 1, environment, owner: owner.label, ...state });
      } catch {
        response.status(503).json({ error: "Feature configuration is unavailable" });
      }
      return;
    }

    if (request.method !== "PUT") {
      response.setHeader("Allow", "GET, PUT");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    if (!trustedOrigin(request)) {
      response.status(403).json({ error: "Untrusted request origin" });
      return;
    }

    const { key, enabled, expectedUpdatedAt } = request.body || {};
    if (!isKnownFeatureFlag(key) || typeof enabled !== "boolean") {
      response.status(400).json({ error: "Invalid feature update" });
      return;
    }
    if (typeof expectedUpdatedAt !== "string" || !Number.isFinite(Date.parse(expectedUpdatedAt))) {
      response.status(400).json({ error: "Invalid update version" });
      return;
    }

    try {
      const flag = await updateFlag({
        environment,
        key,
        enabled,
        expectedUpdatedAt,
        changedBy: owner.label,
      });
      if (!flag) {
        response.status(409).json({ error: "Configuration changed; refresh before saving" });
        return;
      }
      response.status(200).json({ version: 1, flag });
    } catch {
      response.status(503).json({ error: "Feature configuration is unavailable" });
    }
  };
}

export default createAdminFeatureHandler();
