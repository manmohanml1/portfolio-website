import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_FEATURE_FLAGS, isKnownFeatureFlag } from "./src/config/feature-defaults.js";
import { readFeatureConfig } from "./api/_lib/feature-store.js";
import adminAuthConfigHandler from "./api/admin/auth-config.js";
import { createAdminAnalyticsHandler } from "./api/admin/analytics.js";
import { createAdminFeatureHandler } from "./api/admin/features.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const hasFeatureDatabase = Boolean(
  process.env.FEATURE_CONFIG_DATABASE_URL || process.env.DATABASE_URL,
);

const localAdminState = new Map(
  ["development", "staging", "production"].map((environment) => [environment, {
    flags: Object.entries(DEFAULT_FEATURE_FLAGS).map(([key, enabled]) => ({
      key,
      environment,
      enabled,
      description: "Local control-center preview",
      updatedAt: new Date().toISOString(),
    })),
    audit: [],
  }]),
);

async function readLocalAdminConfig({ environment }) {
  const state = localAdminState.get(environment);
  return { source: "local-memory", flags: state.flags, audit: state.audit };
}

async function updateLocalAdminFlag({ environment, key, enabled, expectedUpdatedAt, changedBy }) {
  const state = localAdminState.get(environment);
  const flag = state.flags.find((entry) => entry.key === key);
  if (!flag || flag.updatedAt !== expectedUpdatedAt) return null;
  const oldEnabled = flag.enabled;
  const changedAt = new Date().toISOString();
  flag.enabled = enabled;
  flag.updatedAt = changedAt;
  state.audit.unshift({ key, environment, oldEnabled, newEnabled: enabled, changedBy, changedAt });
  return { ...flag };
}

const localAdminFeatureHandler = createAdminFeatureHandler(
  hasFeatureDatabase ? {} : {
    readConfig: readLocalAdminConfig,
    updateFlag: updateLocalAdminFlag,
  },
);

async function readLocalAnalytics({ days }) {
  const until = new Date();
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const trend = Array.from({ length: days }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(date.getUTCDate() + index);
    return {
      date: date.toISOString(),
      pageviews: 8 + ((index * 7) % 19),
      visitors: 5 + ((index * 5) % 12),
    };
  });
  const rows = (values) => values.map(([label, pageviews, visitors]) => ({ label, pageviews, visitors }));
  return {
    configured: true,
    generatedAt: until.toISOString(),
    range: { days, since: since.toISOString().slice(0, 10), until: until.toISOString().slice(0, 10) },
    totals: trend.reduce((total, row) => ({
      pageviews: total.pageviews + row.pageviews,
      visitors: total.visitors + row.visitors,
    }), { pageviews: 0, visitors: 0 }),
    trend,
    breakdowns: {
      pages: rows([["/", 112, 76], ["/#work", 54, 39], ["/#journey", 31, 25]]),
      referrers: rows([["linkedin.com", 68, 51], ["github.com", 43, 32], ["Direct / Unknown", 36, 28]]),
      countries: rows([["US", 91, 67], ["IN", 44, 31], ["CA", 18, 14]]),
      devices: rows([["Desktop", 103, 74], ["Mobile", 47, 35], ["Tablet", 8, 6]]),
    },
    dashboardUrl: "https://vercel.com/dashboard",
  };
}

const localAdminAnalyticsHandler = createAdminAnalyticsHandler({ readSummary: readLocalAnalytics });

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function createApiResponse(response) {
  return {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(value) {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(value));
    },
  };
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/api/admin/auth-config") {
    await adminAuthConfigHandler(request, createApiResponse(response));
    return;
  }

  if (url.pathname === "/api/admin/features") {
    request.query = Object.fromEntries(url.searchParams);
    request.body = request.method === "PUT" ? await readJsonBody(request) : {};
    await localAdminFeatureHandler(request, createApiResponse(response));
    return;
  }

  if (url.pathname === "/api/admin/analytics") {
    request.query = Object.fromEntries(url.searchParams);
    await localAdminAnalyticsHandler(request, createApiResponse(response));
    return;
  }

  if (url.pathname === "/api/config") {
    const storedConfig = hasFeatureDatabase
      ? await readFeatureConfig({ environment: "development" })
      : {
        source: "local-memory",
        flags: Object.fromEntries(
          localAdminState.get("development").flags.map((flag) => [flag.key, flag.enabled]),
        ),
      };
    const flags = { ...storedConfig.flags };
    let hasOverrides = false;

    url.searchParams.getAll("flag").forEach((override) => {
      const separator = override.lastIndexOf(":");
      const key = override.slice(0, separator);
      const value = override.slice(separator + 1);

      if (separator > 0 && isKnownFeatureFlag(key) && ["true", "false"].includes(value)) {
        flags[key] = value === "true";
        hasOverrides = true;
      }
    });

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({
      version: 1,
      environment: "development",
      source: hasOverrides ? "local-overrides" : storedConfig.source,
      flags,
    }));
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(root, requested));

  if (!filePath.startsWith(normalize(root)) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "text/plain" });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Portfolio preview running at http://localhost:${port}`);
});
