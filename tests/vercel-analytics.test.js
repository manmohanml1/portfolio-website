import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnalyticsCountUrl,
  createAnalyticsRange,
  createAnalyticsUrl,
  readAnalyticsSummary,
  resolveAnalyticsConfig,
} from "../api/_lib/vercel-analytics.js";

test("analytics configuration keeps Vercel credentials server-side", () => {
  const config = resolveAnalyticsConfig({
    VERCEL_API_TOKEN: "secret-token",
    VERCEL_PROJECT_ID: "prj_portfolio",
    VERCEL_TEAM_ID: "team_owner",
  });
  assert.equal(config.token, "secret-token");
  assert.equal(config.projectId, "prj_portfolio");
  assert.equal(config.teamId, "team_owner");
});

test("analytics ranges and URLs are bounded to production portfolio traffic", () => {
  const range = createAnalyticsRange(7, new Date("2026-08-09T12:00:00.000Z"));
  assert.deepEqual(range, { days: 7, since: "2026-08-03", until: "2026-08-09" });
  const url = createAnalyticsUrl({ projectId: "prj_1", teamId: "team_1" }, { ...range, by: "day" });
  assert.equal(url.searchParams.get("projectId"), "prj_1");
  assert.equal(url.searchParams.get("teamId"), "team_1");
  assert.equal(url.searchParams.get("by"), "day");
  assert.match(url.searchParams.get("filter"), /environment eq 'production'/);
  assert.match(url.searchParams.get("filter"), /requestPath ne '\/admin\.html'/);
  const countUrl = createAnalyticsCountUrl({ projectId: "prj_1", teamId: "team_1" }, range);
  assert.match(countUrl.pathname, /visits\/count$/);
  assert.equal(countUrl.searchParams.get("since"), "2026-08-03");
});

test("analytics summaries combine exact totals with five aggregate queries", async () => {
  const requests = [];
  const fixtures = {
    day: [
      { timestamp: "2026-08-08T00:00:00.000Z", pageviews: 10, visitors: 7 },
      { timestamp: "2026-08-09T00:00:00.000Z", pageviews: 14, visitors: 9 },
    ],
    requestPath: [{ requestPath: "/", pageviews: 20, visitors: 13 }],
    referrerHostname: [{ referrerHostname: "linkedin.com", pageviews: 8, visitors: 6 }],
    country: [{ country: "US", pageviews: 12, visitors: 9 }],
    deviceType: [{ deviceType: "Desktop", pageviews: 16, visitors: 11 }],
  };
  const summary = await readAnalyticsSummary({
    days: 7,
    now: new Date("2026-08-09T12:00:00.000Z"),
    environment: {
      VERCEL_API_TOKEN: "secret-token",
      VERCEL_PROJECT_ID: "prj_portfolio",
      VERCEL_TEAM_ID: "team_owner",
    },
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (url.pathname.endsWith("/count")) {
        return { ok: true, json: async () => ({ data: { pageviews: 21, visitors: 14 } }) };
      }
      return { ok: true, json: async () => ({ data: fixtures[url.searchParams.get("by")] }) };
    },
  });

  assert.equal(requests.length, 6);
  assert.ok(requests.every(({ options }) => options.headers.Authorization === "Bearer secret-token"));
  assert.deepEqual(summary.totals, { pageviews: 21, visitors: 14 });
  assert.equal(summary.breakdowns.pages[0].label, "/");
  assert.equal(summary.breakdowns.referrers[0].label, "linkedin.com");
  assert.equal("token" in summary, false);
});

test("missing analytics credentials return a setup state without a request", async () => {
  const summary = await readAnalyticsSummary({ environment: {}, fetchImpl: () => assert.fail("unexpected request") });
  assert.equal(summary.configured, false);
  assert.equal(summary.range.days, 7);
});
