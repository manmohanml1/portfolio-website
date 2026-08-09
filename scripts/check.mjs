import { spawnSync } from "node:child_process";

const files = [
  "api/config.js",
  "api/admin/auth-config.js",
  "api/admin/features.js",
  "api/admin/projects.js",
  "api/_lib/admin-auth.js",
  "api/_lib/feature-store.js",
  "api/_lib/github-discovery.js",
  "api/_lib/project-store.js",
  "api/_lib/project-draft.js",
  "api/projects.js",
  "dev-server.mjs",
  "src/main.js",
  "src/admin/api.js",
  "src/admin/auth-client.js",
  "src/admin/main.js",
  "src/admin/render.js",
  "src/config/environment.js",
  "src/config/feature-defaults.js",
  "src/config/release.js",
  "src/data/portfolio.js",
  "src/data/themes.js",
  "src/services/github-projects.js",
  "src/services/feedback.js",
  "src/services/feature-config.js",
  "src/services/visitor-preferences.js",
  "src/features/feature-availability.js",
  "src/features/evidence-explorer.js",
  "src/features/interactions.js",
  "src/features/motion-preference.js",
  "src/features/feedback-dialog.js",
  "src/features/project-dialog.js",
  "src/features/theme-switcher.js",
  "src/features/visitor-customization.js",
  "src/render/projects.js",
  "src/render/release.js",
  "src/render/sections.js",
  "src/utils/dom.js",
];

for (const file of files) {
  const check = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });

  if (check.status !== 0) {
    process.exit(check.status || 1);
  }
}

console.log(`Syntax checked ${files.length} source files.`);
