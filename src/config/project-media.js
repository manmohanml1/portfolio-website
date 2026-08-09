const NON_COVER_HOSTS = new Set([
  "api.codeclimate.com",
  "badge.fury.io",
  "codecov.io",
  "coveralls.io",
  "img.shields.io",
  "shields.io",
]);

const BADGE_PATH_PATTERN = /(?:^|[/_.-])(?:badge|badges|shield|shields)(?:[/_.-]|$)/i;
const BADGE_ALT_PATTERN = /\b(?:build status|coverage badge|license badge|version badge)\b/i;

export function isUsefulProjectImage({ url = "", alt = "" } = {}) {
  try {
    const parsed = new URL(String(url));
    if (parsed.protocol !== "https:" || NON_COVER_HOSTS.has(parsed.hostname.toLowerCase())) return false;
    if (parsed.pathname.toLowerCase().endsWith(".svg")) return false;
    return !BADGE_PATH_PATTERN.test(parsed.pathname) && !BADGE_ALT_PATTERN.test(String(alt));
  } catch {
    return false;
  }
}
