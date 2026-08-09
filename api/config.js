import { DEFAULT_FEATURE_FLAGS } from "../src/config/feature-defaults.js";
import { readFeatureConfig } from "./_lib/feature-store.js";

export function resolveConfigEnvironment(vercelEnvironment = process.env.VERCEL_ENV) {
  if (vercelEnvironment === "production") return "production";
  if (vercelEnvironment === "preview") return "staging";
  return "development";
}

export function createPublicFeatureConfig(
  environment = resolveConfigEnvironment(),
  storedConfig = { source: "defaults", flags: DEFAULT_FEATURE_FLAGS },
) {
  return {
    version: 1,
    environment,
    source: storedConfig.source,
    flags: { ...storedConfig.flags },
  };
}

export function createConfigHandler({ readConfig = readFeatureConfig } = {}) {
  return async function handler(request, response) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const environment = resolveConfigEnvironment();
    const storedConfig = await readConfig({ environment });

    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("CDN-Cache-Control", "no-store");
    response.setHeader("Vercel-CDN-Cache-Control", "no-store");
    response.status(200).json(createPublicFeatureConfig(environment, storedConfig));
  };
}

export default createConfigHandler();
