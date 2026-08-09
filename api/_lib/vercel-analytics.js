const ANALYTICS_BASE_URL = "https://api.vercel.com/v1/query/web-analytics/visits";
export const ANALYTICS_RANGES = Object.freeze([7, 30]);

function toDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export function resolveAnalyticsConfig(environment = process.env) {
  return {
    token: environment.VERCEL_API_TOKEN || "",
    projectId: environment.VERCEL_PROJECT_ID || "",
    teamId: environment.VERCEL_TEAM_ID || "",
    dashboardUrl: environment.VERCEL_ANALYTICS_DASHBOARD_URL || "https://vercel.com/dashboard",
  };
}

export function createAnalyticsRange(days = 7, now = new Date()) {
  const normalizedDays = ANALYTICS_RANGES.includes(Number(days)) ? Number(days) : 7;
  const until = new Date(now);
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - (normalizedDays - 1));
  return { days: normalizedDays, since: toDate(since), until: toDate(until) };
}

function createBaseUrl(config, endpoint, { since, until }) {
  const url = new URL(`${ANALYTICS_BASE_URL}/${endpoint}`);
  url.searchParams.set("projectId", config.projectId);
  if (config.teamId) url.searchParams.set("teamId", config.teamId);
  url.searchParams.set("since", since);
  url.searchParams.set("until", until);
  url.searchParams.set("filter", "environment eq 'production' and requestPath ne '/admin.html'");
  return url;
}

export function createAnalyticsUrl(config, { by, since, until, limit = 10 }) {
  const url = createBaseUrl(config, "aggregate", { since, until });
  url.searchParams.set("by", by);
  url.searchParams.set("limit", String(limit));
  return url;
}

export function createAnalyticsCountUrl(config, range) {
  return createBaseUrl(config, "count", range);
}

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeRows(rows, dimension) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    label: String(row[dimension] || "Direct / Unknown"),
    pageviews: normalizeNumber(row.pageviews),
    visitors: normalizeNumber(row.visitors),
  }));
}

async function queryAnalytics(config, parameters, fetchImpl) {
  const response = await fetchImpl(createAnalyticsUrl(config, parameters), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload.data)) {
    const error = new Error("Vercel Web Analytics request failed");
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

async function queryAnalyticsCount(config, range, fetchImpl) {
  const response = await fetchImpl(createAnalyticsCountUrl(config, range), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.data || typeof payload.data !== "object") {
    const error = new Error("Vercel Web Analytics count request failed");
    error.status = response.status;
    throw error;
  }
  return {
    pageviews: normalizeNumber(payload.data.pageviews),
    visitors: normalizeNumber(payload.data.visitors),
  };
}

export async function readAnalyticsSummary({
  days = 7,
  now = new Date(),
  environment = process.env,
  fetchImpl = globalThis.fetch,
} = {}) {
  const config = resolveAnalyticsConfig(environment);
  const range = createAnalyticsRange(days, now);
  if (!config.token || !config.projectId) {
    return {
      configured: false,
      range,
      dashboardUrl: config.dashboardUrl,
    };
  }

  const dimensions = ["day", "requestPath", "referrerHostname", "country", "deviceType"];
  const [totals, daily, pages, referrers, countries, devices] = await Promise.all([
    queryAnalyticsCount(config, range, fetchImpl),
    ...dimensions.map((by) => queryAnalytics(config, {
      ...range,
      by,
      limit: by === "day" ? range.days : 6,
    }, fetchImpl)),
  ]);
  const trend = daily.map((row) => ({
    date: row.timestamp,
    pageviews: normalizeNumber(row.pageviews),
    visitors: normalizeNumber(row.visitors),
  }));

  return {
    configured: true,
    generatedAt: new Date(now).toISOString(),
    range,
    totals,
    trend,
    breakdowns: {
      pages: normalizeRows(pages, "requestPath"),
      referrers: normalizeRows(referrers, "referrerHostname"),
      countries: normalizeRows(countries, "country"),
      devices: normalizeRows(devices, "deviceType"),
    },
    dashboardUrl: config.dashboardUrl,
  };
}
