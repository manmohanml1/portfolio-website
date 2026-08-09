import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_KEYS } from "../config/feature-defaults.js";

export const FEATURE_CONFIG_VERSION = 1;
export const FEATURE_CONFIG_TIMEOUT_MS = 3000;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function createDefaultFeatureConfig(environment = "development") {
  return Object.freeze({
    version: FEATURE_CONFIG_VERSION,
    environment,
    source: "defaults",
    flags: Object.freeze({ ...DEFAULT_FEATURE_FLAGS }),
  });
}

export function normalizeFeatureConfig(payload, environment = "development") {
  if (!isObject(payload) || !isObject(payload.flags)) {
    return createDefaultFeatureConfig(environment);
  }

  const flags = { ...DEFAULT_FEATURE_FLAGS };

  FEATURE_FLAG_KEYS.forEach((key) => {
    if (typeof payload.flags[key] === "boolean") {
      flags[key] = payload.flags[key];
    }
  });

  const knownSources = new Set(["database", "defaults", "local-memory", "local-overrides", "remote"]);

  return Object.freeze({
    version: FEATURE_CONFIG_VERSION,
    environment,
    source: knownSources.has(payload.source) ? payload.source : "remote",
    flags: Object.freeze(flags),
  });
}

export function isFeatureEnabled(config, key) {
  return config?.flags?.[key] ?? DEFAULT_FEATURE_FLAGS[key] ?? false;
}

export function getFeatureConfigEndpoint(locationLike = globalThis.location) {
  const endpoint = new URL("/api/config", locationLike?.origin || "http://localhost");
  const isLocal = locationLike?.hostname === "localhost" || locationLike?.hostname === "127.0.0.1";

  if (isLocal) {
    const pageParams = new URLSearchParams(locationLike?.search || "");
    pageParams.getAll("flag").forEach((override) => endpoint.searchParams.append("flag", override));
  }

  return `${endpoint.pathname}${endpoint.search}`;
}

export async function loadFeatureConfig({
  environment = "development",
  fetchImpl = globalThis.fetch,
  locationLike = globalThis.location,
  timeoutMs = FEATURE_CONFIG_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== "function") {
    return createDefaultFeatureConfig(environment);
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(getFeatureConfigEndpoint(locationLike), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      return createDefaultFeatureConfig(environment);
    }

    return normalizeFeatureConfig(await response.json(), environment);
  } catch {
    return createDefaultFeatureConfig(environment);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
