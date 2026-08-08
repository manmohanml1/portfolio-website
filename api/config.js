import { DEFAULT_FEATURE_FLAGS } from "../src/config/feature-defaults.js";

export function resolveConfigEnvironment(vercelEnvironment = process.env.VERCEL_ENV) {
  if (vercelEnvironment === "production") return "production";
  if (vercelEnvironment === "preview") return "staging";
  return "development";
}

export function createPublicFeatureConfig(environment = resolveConfigEnvironment()) {
  return {
    version: 1,
    environment,
    flags: { ...DEFAULT_FEATURE_FLAGS },
  };
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  response.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  response.status(200).json(createPublicFeatureConfig());
}
