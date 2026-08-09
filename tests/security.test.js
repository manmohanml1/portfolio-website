import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const robots = await readFile(new URL("../robots.txt", import.meta.url), "utf8");
const adminHtml = await readFile(new URL("../admin.html", import.meta.url), "utf8");

function headersFor(source) {
  return Object.fromEntries(
    vercel.headers.find((rule) => rule.source === source).headers.map(({ key, value }) => [key, value]),
  );
}

test("deployment applies a restrictive browser security baseline", () => {
  const headers = headersFor("/(.*)");
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /object-src 'none'/);
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /connect-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /public\.blob\.vercel-storage\.com/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Cross-Origin-Opener-Policy"], "same-origin");
  assert.match(headers["Permissions-Policy"], /camera=\(\)/);
});

test("owner surfaces are non-cacheable and excluded from search indexing", () => {
  const adminHeaders = headersFor("/admin.html");
  const apiHeaders = headersFor("/api/admin/(.*)");
  assert.match(adminHeaders["Cache-Control"], /no-store/);
  assert.match(adminHeaders["X-Robots-Tag"], /noindex/);
  assert.match(apiHeaders["Cache-Control"], /no-store/);
  assert.match(apiHeaders["X-Robots-Tag"], /noindex/);
  assert.match(adminHtml, /Visitors should not enter credentials/);
  assert.match(robots, /Disallow: \/admin\.html/);
  assert.match(robots, /Disallow: \/api\/admin\//);
});
