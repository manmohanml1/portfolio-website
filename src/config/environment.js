export const ENVIRONMENTS = {
  development: {
    name: "development",
    enableMotion: true,
    allowThemePersistence: true,
  },
  staging: {
    name: "staging",
    enableMotion: true,
    allowThemePersistence: true,
  },
  production: {
    name: "production",
    enableMotion: true,
    allowThemePersistence: true,
  },
};

export function resolveEnvironment({ hostname = "", search = "" } = {}) {
  const override = new URLSearchParams(search).get("env");
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocal && override && ENVIRONMENTS[override]) {
    return ENVIRONMENTS[override];
  }

  if (isLocal) {
    return ENVIRONMENTS.development;
  }

  if (hostname.includes("staging") || hostname.includes("preview")) {
    return ENVIRONMENTS.staging;
  }

  return ENVIRONMENTS.production;
}

export function setupEnvironment(locationLike = window.location) {
  const environment = resolveEnvironment(locationLike);

  document.documentElement.dataset.environment = environment.name;
  return environment;
}
