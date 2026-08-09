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
