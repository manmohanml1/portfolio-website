import { spawnSync } from "node:child_process";

const files = [
  "dev-server.mjs",
  "src/main.js",
  "src/config/environment.js",
  "src/config/release.js",
  "src/data/portfolio.js",
  "src/data/themes.js",
  "src/services/github-projects.js",
  "src/services/feedback.js",
  "src/features/interactions.js",
  "src/features/motion-preference.js",
  "src/features/feedback-dialog.js",
  "src/features/project-dialog.js",
  "src/features/theme-switcher.js",
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
