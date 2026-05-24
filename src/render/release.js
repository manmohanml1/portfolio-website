import { release } from "../config/release.js";
import { qs } from "../utils/dom.js";

export function renderReleaseIndicator() {
  const indicator = qs("#release-indicator");

  indicator.textContent = release.version;
  indicator.dataset.releaseType = release.type;
  indicator.title = `${release.label} (${release.version})`;
  indicator.setAttribute("aria-label", `Current deployed release ${release.version}, ${release.label.toLowerCase()}`);
}

