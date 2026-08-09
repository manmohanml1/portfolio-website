import { isUsefulProjectImage } from "../config/project-media.js";

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

function createField(labelText, control) {
  const label = document.createElement("label");
  const labelCopy = document.createElement("span");
  labelCopy.textContent = labelText;
  label.append(labelCopy, control);
  return label;
}

function createProjectSelect(project) {
  const select = document.createElement("select");
  [
    ["pending", "Pending review"],
    ["approved", "Approved for portfolio"],
    ["hidden", "Hidden"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = project.status === value;
    select.append(option);
  });
  return select;
}

function createCategorySelect(project) {
  const select = document.createElement("select");
  [
    ["", "Use GitHub topics"],
    ["frontend", "Frontend"],
    ["backend", "Backend"],
    ["data", "Data"],
    ["ai", "AI"],
    ["wearable", "Wearable"],
    ["other", "Other"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = project.category === value;
    select.append(option);
  });
  return select;
}

function createEvidencePanel(project) {
  const evidence = project.evidence || {};
  const signals = [...new Set([...(evidence.languages || []), ...(evidence.technologies || [])])];
  const panel = document.createElement("details");
  panel.className = "publishing-evidence";
  const summary = document.createElement("summary");
  const label = document.createElement("strong");
  label.textContent = "Extracted repository evidence";
  const count = document.createElement("span");
  count.textContent = `${signals.length} technology signals · ${(evidence.readmeSections || []).length} README sections`;
  summary.append(label, count);
  const body = document.createElement("div");
  body.className = "publishing-evidence-body";
  if (signals.length) {
    const signalList = document.createElement("div");
    signalList.className = "evidence-signals";
    signals.forEach((signal) => {
      const chip = document.createElement("span");
      chip.textContent = signal;
      signalList.append(chip);
    });
    body.append(signalList);
  }
  if (evidence.readmeExcerpt) {
    const excerpt = document.createElement("p");
    excerpt.textContent = evidence.readmeExcerpt;
    body.append(excerpt);
  }
  panel.append(summary, body);
  return panel;
}

function createCaseStudyEditor(project) {
  const caseStudy = project.caseStudy || {};
  const editor = document.createElement("details");
  editor.className = "publishing-case-study";
  const summary = document.createElement("summary");
  const title = document.createElement("strong");
  title.textContent = project.caseStudySource === "owner"
    ? "Owner-edited case study"
    : "Generated case-study draft";
  const hint = document.createElement("span");
  hint.textContent = "Review the claims before approval";
  summary.append(title, hint);
  const fields = document.createElement("div");
  fields.className = "case-study-fields";
  const controls = {};
  [
    ["summary", "Case-study summary", 3],
    ["purpose", "Purpose", 3],
    ["challenge", "Problem or challenge", 3],
    ["build", "Implementation", 4],
    ["engineering", "Engineering decisions", 4],
    ["outcome", "Outcome or current state", 3],
  ].forEach(([field, label, rows]) => {
    const control = document.createElement("textarea");
    control.value = caseStudy[field] || "";
    control.rows = rows;
    control.dataset.caseStudyField = field;
    controls[field] = control;
    fields.append(createField(label, control));
  });
  editor.append(summary, fields);
  return { editor, controls };
}

function createMediaEditor(project, onUpload) {
  const candidates = project.evidence?.mediaCandidates || [];
  const images = candidates.filter((candidate) => (
    candidate.kind === "image" && isUsefulProjectImage(candidate)
  ));
  const videos = candidates.filter((candidate) => candidate.kind === "video");
  const editor = document.createElement("details");
  editor.className = "publishing-media";
  const summary = document.createElement("summary");
  const title = document.createElement("strong");
  title.textContent = project.mediaSource === "owner" ? "Owner-selected media" : "Media draft";
  const hint = document.createElement("span");
  hint.textContent = `${images.length} images · ${videos.length} demos discovered`;
  summary.append(title, hint);

  const fields = document.createElement("div");
  fields.className = "media-fields";
  const coverInput = document.createElement("input");
  coverInput.type = "url";
  coverInput.value = isUsefulProjectImage({
    url: project.media?.coverImageUrl,
    alt: project.media?.coverImageAlt,
  }) ? project.media.coverImageUrl : "";
  coverInput.placeholder = "No cover image selected";
  const coverList = document.createElement("datalist");
  coverList.id = `cover-media-${project.githubId}`;
  images.forEach((candidate) => {
    const option = document.createElement("option");
    option.value = candidate.url;
    option.label = candidate.alt || candidate.source;
    coverList.append(option);
  });
  coverInput.setAttribute("list", coverList.id);
  const altInput = document.createElement("input");
  altInput.value = project.media?.coverImageAlt || "";
  altInput.maxLength = 180;
  altInput.placeholder = "Describe the visible project screen";
  const demoInput = document.createElement("input");
  demoInput.type = "url";
  demoInput.value = project.media?.demoUrl || "";
  demoInput.placeholder = "Optional HTTPS demo or video URL";
  const demoList = document.createElement("datalist");
  demoList.id = `demo-media-${project.githubId}`;
  videos.forEach((candidate) => {
    const option = document.createElement("option");
    option.value = candidate.url;
    option.label = candidate.alt || candidate.source;
    demoList.append(option);
  });
  demoInput.setAttribute("list", demoList.id);

  const uploadControl = document.createElement("div");
  uploadControl.className = "media-upload-control";
  const uploadLabel = document.createElement("label");
  uploadLabel.className = "media-upload-action";
  const uploadText = document.createElement("span");
  uploadText.textContent = "Upload from device";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/jpeg,image/png,image/webp";
  const uploadStatus = document.createElement("span");
  uploadStatus.className = "media-upload-status";
  uploadStatus.textContent = "JPEG, PNG, or WebP · 3 MB maximum";
  uploadLabel.append(uploadText, fileInput);
  uploadControl.append(uploadLabel, uploadStatus);

  const preview = document.createElement("figure");
  preview.className = "media-preview";
  const image = document.createElement("img");
  image.alt = "Selected project cover preview";
  preview.append(image);
  const updatePreview = () => {
    const source = coverInput.value.trim();
    preview.hidden = true;
    image.removeAttribute("src");
    if (!source) return;
    if (!isUsefulProjectImage({ url: source, alt: altInput.value })) {
      uploadStatus.textContent = "Choose a raster project screenshot instead of a badge or SVG.";
      uploadStatus.dataset.tone = "error";
      return;
    }
    image.src = source;
  };
  image.addEventListener("load", () => {
    preview.hidden = false;
    if (uploadStatus.dataset.tone === "error") {
      uploadStatus.textContent = "JPEG, PNG, or WebP · 3 MB maximum";
      delete uploadStatus.dataset.tone;
    }
  });
  image.addEventListener("error", () => {
    preview.hidden = true;
    image.removeAttribute("src");
    uploadStatus.textContent = "Preview unavailable. Choose another image or upload one.";
    uploadStatus.dataset.tone = "error";
  });
  coverInput.addEventListener("input", updatePreview);
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file || !onUpload) return;
    fileInput.disabled = true;
    uploadStatus.textContent = "Uploading image...";
    uploadStatus.dataset.tone = "progress";
    try {
      coverInput.value = await onUpload(project, file);
      if (!altInput.value) altInput.value = `${project.title || project.name} project preview`;
      uploadStatus.textContent = "Uploaded. Save changes to attach this image.";
      uploadStatus.dataset.tone = "success";
      coverInput.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (error) {
      uploadStatus.textContent = error.message;
      uploadStatus.dataset.tone = "error";
    } finally {
      fileInput.disabled = false;
      fileInput.value = "";
    }
  });
  updatePreview();
  fields.append(
    uploadControl,
    createField("Cover image URL", coverInput),
    createField("Cover image alt text", altInput),
    createField("Demo video or walkthrough", demoInput),
    coverList,
    demoList,
    preview,
  );
  editor.append(summary, fields);
  return { editor, controls: { coverInput, altInput, demoInput } };
}

export function renderProjectInbox(container, state, { onSave, onUpload, onDiscard }) {
  container.replaceChildren();
  if (!state.projects.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = state.source === "unconfigured"
      ? "Run the project publishing migration before syncing GitHub."
      : state.emptyMessage || "No repositories are in the publishing queue. Sync GitHub to discover tagged projects.";
    container.append(empty);
    return;
  }

  state.projects.forEach((project) => {
    const card = document.createElement("details");
    card.className = "publishing-row";
    card.dataset.status = project.status;
    const cardSummary = document.createElement("summary");
    cardSummary.className = "publishing-card-summary";
    const cardIdentity = document.createElement("div");
    const cardStatus = document.createElement("span");
    cardStatus.className = "publication-status";
    cardStatus.textContent = project.status;
    const cardTitle = document.createElement("strong");
    cardTitle.textContent = project.title || project.name;
    const cardRepository = document.createElement("small");
    cardRepository.textContent = project.name;
    cardIdentity.append(cardStatus, cardTitle, cardRepository);
    const cardMeta = document.createElement("div");
    const cardCategory = document.createElement("strong");
    cardCategory.textContent = project.category || "Uncategorized";
    const cardSignals = document.createElement("span");
    cardSignals.textContent = `${project.tags.length} technology signals`;
    const cardUpdated = document.createElement("small");
    cardUpdated.textContent = `Updated ${formatDate(project.githubUpdatedAt)}`;
    cardMeta.append(cardCategory, cardSignals, cardUpdated);
    cardSummary.append(cardIdentity, cardMeta);

    const form = document.createElement("form");
    form.className = "publishing-editor";

    const heading = document.createElement("div");
    heading.className = "publishing-heading";
    const repository = document.createElement("a");
    repository.href = project.repo;
    repository.target = "_blank";
    repository.rel = "noopener noreferrer";
    repository.textContent = "Open repository";
    const updated = document.createElement("small");
    updated.textContent = `GitHub updated ${formatDate(project.githubUpdatedAt)}`;
    heading.append(repository, updated);

    const context = document.createElement("p");
    context.className = "publishing-context";
    context.textContent = project.githubDescription || "No GitHub description provided.";
    const evidence = createEvidencePanel(project);

    const fields = document.createElement("div");
    fields.className = "publishing-fields";
    const titleInput = document.createElement("input");
    titleInput.value = project.title;
    titleInput.maxLength = 120;
    titleInput.placeholder = "Use generated repository title";
    const description = document.createElement("textarea");
    description.value = project.description;
    description.maxLength = 600;
    description.rows = 3;
    description.placeholder = "Use the GitHub description";
    const category = createCategorySelect(project);
    const tags = document.createElement("input");
    tags.value = project.tags.join(", ");
    tags.placeholder = "TypeScript, AWS, APIs";
    const publication = createProjectSelect(project);
    fields.append(
      createField("Portfolio title", titleInput),
      createField("Public description", description),
      createField("Category", category),
      createField("Technology tags", tags),
      createField("Publication", publication),
    );
    const { editor: caseStudyEditor, controls: caseStudyControls } = createCaseStudyEditor(project);
    const { editor: mediaEditor, controls: mediaControls } = createMediaEditor(project, onUpload);

    const actions = document.createElement("div");
    actions.className = "publishing-actions";
    const reviewed = document.createElement("small");
    reviewed.textContent = project.reviewedAt
      ? `Reviewed by ${project.reviewedBy} · ${formatDate(project.reviewedAt)}`
      : "Not reviewed";
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "save-action";
    save.textContent = project.status === "pending" ? "Review project" : "Save changes";
    const discard = document.createElement("button");
    discard.type = "button";
    discard.className = "secondary-action";
    discard.textContent = "Discard";
    const actionButtons = document.createElement("div");
    actionButtons.className = "publishing-action-buttons";
    actionButtons.hidden = true;
    actionButtons.append(discard, save);
    actions.append(reviewed, actionButtons);

    const readDraft = () => ({
      status: publication.value,
      title: titleInput.value,
      description: description.value,
      category: category.value,
      tags: tags.value.split(",").map((entry) => entry.trim()).filter(Boolean),
      caseStudy: {
        caseStudy: true,
        ...Object.fromEntries(Object.entries(caseStudyControls).map(([field, control]) => [
          field,
          control.value,
        ])),
        highlights: tags.value.split(",").map((entry) => entry.trim()).filter(Boolean),
      },
      media: {
        coverImageUrl: mediaControls.coverInput.value,
        coverImageAlt: mediaControls.altInput.value,
        demoUrl: mediaControls.demoInput.value,
      },
    });
    const initialDraft = JSON.stringify(readDraft());
    const updateDirtyState = () => {
      const dirty = JSON.stringify(readDraft()) !== initialDraft;
      card.classList.toggle("is-dirty", dirty);
      actionButtons.hidden = !dirty;
    };
    form.addEventListener("input", updateDirtyState);
    form.addEventListener("change", updateDirtyState);
    discard.addEventListener("click", () => onDiscard(project));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (actionButtons.hidden) return;
      save.disabled = true;
      form.classList.add("is-saving");
      await onSave({
        ...project,
        ...readDraft(),
      }, { form, save, previousStatus: project.status });
    });

    form.append(heading, context, evidence, fields, mediaEditor, caseStudyEditor, actions);
    card.append(cardSummary, form);
    container.append(card);
  });
}

export function renderProjectAudit(container, entries) {
  container.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No publication decisions have been recorded.";
    container.append(empty);
    return;
  }
  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "audit-row";
    const event = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const transition = document.createElement("span");
    transition.textContent = `${entry.oldStatus || "Discovered"} → ${entry.newStatus}`;
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

  container.append(metrics, createTrend(summary.trend), breakdowns);
}
