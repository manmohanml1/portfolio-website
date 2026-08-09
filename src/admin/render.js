const LABELS = {
  "sections.journey.enabled": "Journey section",
  "sections.skills.enabled": "Skills section",
  "features.feedback.enabled": "Visitor feedback",
  "features.projectDialogs.enabled": "Project details",
  "features.projectFilters.enabled": "Project filters",
  "effects.tiltCards.enabled": "Card tilt effects",
  "features.visitorCustomization.enabled": "Visitor customization",
};

function formatDate(value) {
  if (!value) return "Not changed in this environment";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createToggle(flag, onChange) {
  const label = document.createElement("label");
  label.className = "switch-control";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = flag.enabled;
  input.setAttribute("aria-label", `Toggle ${LABELS[flag.key] || flag.key}`);
  input.addEventListener("change", () => onChange(input.checked));
  const track = document.createElement("span");
  track.className = "switch-track";
  track.setAttribute("aria-hidden", "true");
  label.append(input, track);
  return label;
}

export function renderFlags(container, flags, { filter = "", onSave }) {
  container.replaceChildren();
  const normalizedFilter = filter.trim().toLowerCase();
  const visibleFlags = flags.filter((flag) => {
    const searchable = `${LABELS[flag.key] || ""} ${flag.key} ${flag.description || ""}`.toLowerCase();
    return searchable.includes(normalizedFilter);
  });

  visibleFlags.forEach((flag) => {
    const row = document.createElement("article");
    row.className = "flag-row";
    row.dataset.key = flag.key;

    const copy = document.createElement("div");
    copy.className = "flag-copy";
    const heading = document.createElement("h3");
    heading.textContent = LABELS[flag.key] || flag.key;
    const key = document.createElement("code");
    key.textContent = flag.key;
    const description = document.createElement("p");
    description.textContent = flag.description || "Runtime Boolean flag";
    const modified = document.createElement("small");
    modified.textContent = formatDate(flag.updatedAt);
    copy.append(heading, key, description, modified);

    const controls = document.createElement("div");
    controls.className = "flag-controls";
    const state = document.createElement("strong");
    state.textContent = flag.enabled ? "Enabled" : "Disabled";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "save-action";
    save.textContent = "Save";
    save.disabled = true;
    let pendingValue = flag.enabled;
    const toggle = createToggle(flag, (enabled) => {
      pendingValue = enabled;
      state.textContent = enabled ? "Enabled" : "Disabled";
      save.disabled = enabled === flag.enabled;
      row.classList.toggle("is-dirty", !save.disabled);
    });
    save.addEventListener("click", async () => {
      save.disabled = true;
      toggle.querySelector("input").disabled = true;
      await onSave({ ...flag, enabled: pendingValue }, { row, save, toggle, state });
    });
    controls.append(state, toggle, save);
    row.append(copy, controls);
    container.append(row);
  });

  if (visibleFlags.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No flags match this filter.";
    container.append(empty);
  }
}

export function renderAudit(container, entries) {
  container.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No recorded changes for this environment.";
    container.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "audit-row";
    const event = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = LABELS[entry.key] || entry.key;
    const transition = document.createElement("span");
    transition.textContent = `${entry.oldEnabled === null ? "Created" : entry.oldEnabled ? "On" : "Off"} → ${entry.newEnabled ? "On" : "Off"}`;
    event.append(name, transition);
    const meta = document.createElement("div");
    meta.className = "audit-meta";
    const actor = document.createElement("span");
    actor.textContent = entry.changedBy;
    const time = document.createElement("time");
    time.dateTime = entry.changedAt;
    time.textContent = formatDate(entry.changedAt);
    meta.append(actor, time);
    row.append(event, meta);
    container.append(row);
  });
}

function formatInteger(value) {
  return new Intl.NumberFormat().format(Number(value) || 0);
}

function createMetric(label, value, detail) {
  const metric = document.createElement("div");
  metric.className = "analytics-metric";
  const name = document.createElement("span");
  name.textContent = label;
  const number = document.createElement("strong");
  number.textContent = formatInteger(value);
  const context = document.createElement("small");
  context.textContent = detail;
  metric.append(name, number, context);
  return metric;
}

function createBreakdown(title, rows) {
  const section = document.createElement("section");
  section.className = "analytics-breakdown";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "analytics-empty";
    empty.textContent = "No data in this window.";
    section.append(empty);
    return section;
  }

  const list = document.createElement("ol");
  rows.forEach((row) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = row.label;
    label.title = row.label;
    const value = document.createElement("strong");
    value.textContent = formatInteger(row.pageviews);
    value.setAttribute("aria-label", `${formatInteger(row.pageviews)} page views`);
    item.append(label, value);
    list.append(item);
  });
  section.append(list);
  return section;
}

function createTrend(rows) {
  const section = document.createElement("section");
  section.className = "analytics-trend";
  const heading = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = "Traffic trend";
  const note = document.createElement("span");
  note.textContent = "Daily page views";
  heading.append(title, note);
  section.append(heading);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "analytics-empty";
    empty.textContent = "No traffic has been recorded in this window.";
    section.append(empty);
    return section;
  }

  const maximum = Math.max(...rows.map((row) => row.pageviews), 1);
  const chart = document.createElement("div");
  chart.className = "trend-bars";
  chart.setAttribute("role", "img");
  chart.setAttribute("aria-label", "Daily page-view trend");
  rows.forEach((row) => {
    const bar = document.createElement("span");
    bar.style.setProperty("--bar-height", `${Math.max((row.pageviews / maximum) * 100, 3)}%`);
    const date = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(row.date));
    bar.title = `${date}: ${formatInteger(row.pageviews)} page views`;
    chart.append(bar);
  });
  section.append(chart);
  return section;
}

export function renderAnalytics(container, summary) {
  container.replaceChildren();
  if (!summary?.configured) {
    const setup = document.createElement("div");
    setup.className = "analytics-setup";
    const heading = document.createElement("h3");
    heading.textContent = "Analytics connection required";
    const copy = document.createElement("p");
    copy.textContent = "Enable Web Analytics in Vercel and add the server-only VERCEL_API_TOKEN to load owner summaries.";
    setup.append(heading, copy);
    container.append(setup);
    return;
  }

  const metrics = document.createElement("div");
  metrics.className = "analytics-metrics";
  metrics.append(
    createMetric("Page views", summary.totals.pageviews, `${summary.range.days}-day total`),
    createMetric("Visitors", summary.totals.visitors, "Aggregated, privacy-friendly"),
  );

  const breakdowns = document.createElement("div");
  breakdowns.className = "analytics-breakdowns";
  breakdowns.append(
    createBreakdown("Top pages", summary.breakdowns.pages),
    createBreakdown("Referrers", summary.breakdowns.referrers),
    createBreakdown("Countries", summary.breakdowns.countries),
    createBreakdown("Devices", summary.breakdowns.devices),
  );

  const speed = document.createElement("section");
  speed.className = "speed-insights-panel";
  const copy = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = "Speed Insights";
  const description = document.createElement("p");
  description.textContent = "Real-user Core Web Vitals are collected on the public portfolio and remain available in Vercel's protected dashboard.";
  copy.append(heading, description);
  const link = document.createElement("a");
  link.href = summary.dashboardUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open Vercel insights";
  speed.append(copy, link);

  container.append(metrics, createTrend(summary.trend), breakdowns, speed);
}
