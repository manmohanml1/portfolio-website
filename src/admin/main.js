import {
  clearCredentials,
  getStoredCredential,
  loadAdminAuthConfig,
  signInOwner,
  signOutOwner,
  storeCredential,
} from "./auth-client.js";
import {
  loadAnalyticsSummary,
  loadFeatureState,
  loadProjectQueue,
  mergeSavedFlag,
  mergeSavedProject,
  saveFeatureFlag,
  saveProjectReview,
  syncProjectQueue,
  uploadProjectMedia,
} from "./api.js";
import {
  renderAnalytics,
  renderAudit,
  renderFlags,
  renderProjectAudit,
  renderProjectInbox,
} from "./render.js";

const elements = {
  authPanel: document.querySelector("#auth-panel"),
  authStatus: document.querySelector("#auth-status"),
  login: document.querySelector("#owner-login"),
  remoteFields: document.querySelector("#remote-fields"),
  localFields: document.querySelector("#local-fields"),
  workspace: document.querySelector("#admin-workspace"),
  ownerLabel: document.querySelector("#owner-label"),
  systemState: document.querySelector("#system-state"),
  signOut: document.querySelector("#sign-out"),
  refresh: document.querySelector("#refresh-config"),
  configurationContext: document.querySelector("#configuration-context"),
  notice: document.querySelector("#environment-notice"),
  source: document.querySelector("#flag-source"),
  search: document.querySelector("#flag-search"),
  flags: document.querySelector("#flag-list"),
  audit: document.querySelector("#audit-list"),
  analytics: document.querySelector("#analytics-summary"),
  analyticsStatus: document.querySelector("#analytics-status"),
  analyticsRanges: [...document.querySelectorAll("[data-analytics-days]")],
  performanceLink: document.querySelector("#performance-dashboard-link"),
  publishingStatus: document.querySelector("#publishing-status"),
  publishingSummary: document.querySelector("#publishing-summary"),
  publishingList: document.querySelector("#publishing-list"),
  publishingAudit: document.querySelector("#publishing-audit"),
  syncProjects: document.querySelector("#sync-projects"),
  projectsViewTitle: document.querySelector("#projects-view-title"),
  projectsListPanel: document.querySelector("#projects-list-panel"),
  projectsHistoryPanel: document.querySelector("#projects-history-panel"),
  toast: document.querySelector("#admin-toast"),
  workspaceTabs: [...document.querySelectorAll(".workspace-tabs > [role='tab']")],
  workspacePanels: [...document.querySelectorAll("[data-workspace-panel]")],
  runtimeTabs: [...document.querySelectorAll("#runtime-panel .sub-tabs [role='tab']")],
  runtimePanels: [...document.querySelectorAll("[data-runtime-panel]")],
  projectTabs: [...document.querySelectorAll("#projects-panel .sub-tabs [role='tab']")],
  analyticsTabs: [...document.querySelectorAll("#analytics-panel .sub-tabs [role='tab']")],
  analyticsPanels: [...document.querySelectorAll("[data-analytics-panel]")],
};

let authConfig;
let credential;
let environment = "development";
let currentState = { flags: [], audit: [] };
let projectState = { source: "loading", projects: [], audit: [] };
let analyticsDays = 7;
let toastTimer;
const initialRoute = globalThis.location.hash.slice(1).split("/").filter(Boolean);
let workspaceTab = ["runtime", "projects", "analytics"].includes(initialRoute[0])
  ? initialRoute[0]
  : ["flags", "audit"].includes(initialRoute[0]) ? "runtime" : "runtime";
let runtimeView = initialRoute[0] === "audit"
  ? "history"
  : ["controls", "history"].includes(initialRoute[1]) ? initialRoute[1] : "controls";
let projectView = ["review", "published", "hidden", "history"].includes(initialRoute[1])
  ? initialRoute[1]
  : "review";
let analyticsView = ["traffic", "performance"].includes(initialRoute[1])
  ? initialRoute[1]
  : "traffic";

function updateRoute() {
  const child = workspaceTab === "runtime"
    ? runtimeView
    : workspaceTab === "projects" ? projectView : analyticsView;
  const url = new URL(globalThis.location.href);
  url.hash = `${workspaceTab}/${child}`;
  globalThis.history.replaceState(null, "", url);
}

function selectWorkspaceTab(nextTab, { updateUrl = true } = {}) {
  workspaceTab = ["runtime", "projects", "analytics"].includes(nextTab) ? nextTab : "runtime";
  elements.workspaceTabs.forEach((tab) => {
    const selected = tab.id === `${workspaceTab}-tab`;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  elements.workspacePanels.forEach((panel) => {
    panel.hidden = panel.id !== `${workspaceTab}-panel`;
  });
  if (updateUrl) updateRoute();
}

function selectRuntimeView(nextView, { updateUrl = true } = {}) {
  runtimeView = ["controls", "history"].includes(nextView) ? nextView : "controls";
  elements.runtimeTabs.forEach((tab) => {
    const selected = tab.id === `runtime-${runtimeView}-tab`;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  elements.runtimePanels.forEach((panel) => {
    panel.hidden = panel.id !== `runtime-${runtimeView}-panel`;
  });
  if (updateUrl) updateRoute();
}

function selectProjectView(nextView, { updateUrl = true } = {}) {
  projectView = ["review", "published", "hidden", "history"].includes(nextView) ? nextView : "review";
  elements.projectTabs.forEach((tab) => {
    const selected = tab.id === `projects-${projectView}-tab`;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  elements.projectsListPanel.hidden = projectView === "history";
  elements.projectsHistoryPanel.hidden = projectView !== "history";
  if (projectView !== "history") {
    elements.projectsListPanel.setAttribute("aria-labelledby", `projects-${projectView}-tab`);
  }
  renderPublishingState();
  if (updateUrl) updateRoute();
}

function selectAnalyticsView(nextView, { updateUrl = true } = {}) {
  analyticsView = ["traffic", "performance"].includes(nextView) ? nextView : "traffic";
  elements.analyticsTabs.forEach((tab) => {
    const selected = tab.id === `analytics-${analyticsView}-tab`;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  elements.analyticsPanels.forEach((panel) => {
    panel.hidden = panel.id !== `analytics-${analyticsView}-panel`;
  });
  if (updateUrl) updateRoute();
}

function showToast(message, tone = "success") {
  globalThis.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.dataset.tone = tone;
  elements.toast.hidden = false;
  toastTimer = globalThis.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

function selectEnvironment(nextEnvironment) {
  environment = nextEnvironment;
  document.querySelectorAll("[data-environment]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.environment === environment));
  });
  elements.notice.className = `environment-notice is-${environment}`;
  elements.notice.textContent = environment === "production"
    ? "Production controls the public portfolio. Saving requires confirmation."
    : environment === "staging"
      ? "Staging controls all Vercel Preview deployments."
      : "Development controls the local environment.";
}

function renderState() {
  elements.source.textContent = `${currentState.flags.length} flags · ${currentState.source}`;
  renderFlags(elements.flags, currentState.flags, {
    filter: elements.search.value,
    onSave: handleSave,
  });
  renderAudit(elements.audit, currentState.audit);
}

async function refreshState() {
  elements.flags.setAttribute("aria-busy", "true");
  try {
    const state = await loadFeatureState(environment, credential);
    currentState = state;
    elements.ownerLabel.textContent = state.owner;
    elements.systemState.textContent = `${environment} connected`;
    renderState();
  } catch (error) {
    if (error.status === 401) {
      clearCredentials();
      credential = null;
      showLogin("Your owner session is not authorized.");
      return;
    }
    showToast(error.message, "error");
  } finally {
    elements.flags.removeAttribute("aria-busy");
  }
}

async function refreshAnalytics() {
  elements.analytics.setAttribute("aria-busy", "true");
  elements.analyticsStatus.textContent = "Loading production analytics...";
  try {
    const summary = await loadAnalyticsSummary(analyticsDays, credential);
    renderAnalytics(elements.analytics, summary);
    if (summary.dashboardUrl) elements.performanceLink.href = summary.dashboardUrl;
    elements.analyticsStatus.textContent = summary.configured
      ? `${summary.range.since} to ${summary.range.until} · refreshed now`
      : "Server-side Vercel connection is not configured";
  } catch (error) {
    if (error.status === 401) {
      clearCredentials();
      credential = null;
      showLogin("Your owner session is not authorized.");
      return;
    }
    elements.analyticsStatus.textContent = error.message;
    renderAnalytics(elements.analytics, null);
    showToast(error.message, "error");
  } finally {
    elements.analytics.removeAttribute("aria-busy");
  }
}

function renderPublishingState() {
  const counts = projectState.projects.reduce((summary, project) => {
    summary[project.status] = (summary[project.status] || 0) + 1;
    return summary;
  }, { pending: 0, approved: 0, hidden: 0 });
  const statusByView = { review: "pending", published: "approved", hidden: "hidden" };
  const titleByView = {
    review: "Project review inbox",
    published: "Published projects",
    hidden: "Hidden projects",
    history: "Publication history",
  };
  const selectedStatus = statusByView[projectView];
  const visibleProjects = selectedStatus
    ? projectState.projects.filter((project) => project.status === selectedStatus)
    : [];
  const summaryByView = {
    review: `${visibleProjects.length} awaiting review · ${counts.approved} published · ${counts.hidden} hidden`,
    published: `${visibleProjects.length} published · ${counts.pending} awaiting review · ${counts.hidden} hidden`,
    hidden: `${visibleProjects.length} hidden · ${counts.pending} awaiting review · ${counts.approved} published`,
  };
  elements.projectsViewTitle.textContent = titleByView[projectView];
  elements.publishingSummary.textContent = projectView === "history"
    ? `${projectState.audit.length} recent publication decisions`
    : summaryByView[projectView];
  renderProjectInbox(elements.publishingList, {
    ...projectState,
    projects: visibleProjects,
    emptyMessage: projectView === "published"
      ? "No GitHub additions are currently approved for public presentation."
      : projectView === "hidden"
        ? "No projects are hidden."
        : "No projects are waiting for review. Sync GitHub to check for tagged repositories.",
  }, {
    onSave: handleProjectSave,
    onUpload: async (project, file) => {
      const result = await uploadProjectMedia(project, file, credential);
      showToast("Project image uploaded; save the project to publish it");
      return result.url;
    },
  });
  renderProjectAudit(elements.publishingAudit, projectState.audit);
}

async function refreshProjects() {
  elements.publishingList.setAttribute("aria-busy", "true");
  elements.publishingStatus.textContent = "Loading the owner publishing queue...";
  try {
    projectState = await loadProjectQueue(credential);
    elements.publishingStatus.textContent = ["database", "local-memory"].includes(projectState.source)
      ? "Review tagged GitHub repositories before they appear publicly."
      : "The publishing database migration is not available in this deployment.";
    renderPublishingState();
  } catch (error) {
    if (error.status === 401) {
      clearCredentials();
      credential = null;
      showLogin("Your owner session is not authorized.");
      return;
    }
    elements.publishingStatus.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    elements.publishingList.removeAttribute("aria-busy");
  }
}

async function handleProjectSave(project, controls) {
  if (project.status === "approved") {
    const confirmed = globalThis.confirm(`${project.name} will become visible on the public portfolio. Continue?`);
    if (!confirmed) {
      renderPublishingState();
      return;
    }
  }
  try {
    const response = await saveProjectReview(project, credential);
    projectState = mergeSavedProject(projectState, response.project);
    await refreshProjects();
    showToast(`${project.name} updated`);
  } catch (error) {
    showToast(error.message, "error");
    await refreshProjects();
  } finally {
    controls.form.classList.remove("is-saving");
    controls.save.disabled = false;
  }
}

async function handleSave(flag, controls) {
  if (environment === "production") {
    const confirmed = globalThis.confirm(
      `${flag.enabled ? "Enable" : "Disable"} ${flag.key} in production?`,
    );
    if (!confirmed) {
      renderState();
      return;
    }
  }

  controls.row.classList.add("is-saving");
  try {
    const response = await saveFeatureFlag(environment, flag, credential);
    currentState = mergeSavedFlag(currentState, response.flag);
    renderState();
    showToast(`${flag.key} updated`);
  } catch (error) {
    showToast(error.message, "error");
    await refreshState();
  }
}

function showLogin(message = "Sign in with the configured owner identity.") {
  elements.workspace.hidden = true;
  elements.signOut.hidden = true;
  elements.authPanel.hidden = false;
  elements.authStatus.textContent = message;
  elements.systemState.textContent = "Locked";
  elements.login.hidden = !authConfig?.configured;
}

async function showWorkspace() {
  elements.authPanel.hidden = true;
  elements.workspace.hidden = false;
  elements.signOut.hidden = false;
  selectWorkspaceTab(workspaceTab, { updateUrl: false });
  selectRuntimeView(runtimeView, { updateUrl: false });
  selectProjectView(projectView, { updateUrl: false });
  selectAnalyticsView(analyticsView, { updateUrl: false });
  selectEnvironment(environment);
  await refreshState();
  if (workspaceTab === "analytics") await refreshAnalytics();
  if (workspaceTab === "projects") await refreshProjects();
}

elements.login.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.login.querySelector("button[type='submit']");
  submit.disabled = true;
  elements.authStatus.textContent = "Verifying owner…";
  const form = new FormData(elements.login);
  try {
    credential = await signInOwner(authConfig, {
      email: form.get("email"),
      password: form.get("password"),
      localToken: form.get("localToken"),
    });
    storeCredential(credential);
    await showWorkspace();
  } catch (error) {
    elements.authStatus.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

document.querySelectorAll("[data-environment]").forEach((button) => {
  button.addEventListener("click", async () => {
    selectEnvironment(button.dataset.environment);
    await refreshState();
  });
});

function bindTabKeyboard(tabs, select) {
  tabs.forEach((tab) => {
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = tabs.indexOf(tab);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
      select(nextTab);
      nextTab.focus();
    });
  });
}

elements.workspaceTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    selectWorkspaceTab(tab.id.replace("-tab", ""));
    if (workspaceTab === "analytics") await refreshAnalytics();
    if (workspaceTab === "projects") await refreshProjects();
  });
});
bindTabKeyboard(elements.workspaceTabs, (nextTab) => {
  selectWorkspaceTab(nextTab.id.replace("-tab", ""));
});

elements.runtimeTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectRuntimeView(tab.id.replace("runtime-", "").replace("-tab", "")));
});
bindTabKeyboard(elements.runtimeTabs, (nextTab) => {
  selectRuntimeView(nextTab.id.replace("runtime-", "").replace("-tab", ""));
});

elements.projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectProjectView(tab.id.replace("projects-", "").replace("-tab", "")));
});
bindTabKeyboard(elements.projectTabs, (nextTab) => {
  selectProjectView(nextTab.id.replace("projects-", "").replace("-tab", ""));
});

elements.analyticsTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    selectAnalyticsView(tab.id.replace("analytics-", "").replace("-tab", ""));
    if (analyticsView === "traffic") await refreshAnalytics();
  });
});
bindTabKeyboard(elements.analyticsTabs, (nextTab) => {
  selectAnalyticsView(nextTab.id.replace("analytics-", "").replace("-tab", ""));
});

elements.analyticsRanges.forEach((button) => {
  button.addEventListener("click", async () => {
    analyticsDays = Number(button.dataset.analyticsDays);
    elements.analyticsRanges.forEach((entry) => {
      entry.setAttribute("aria-pressed", String(entry === button));
    });
    await refreshAnalytics();
  });
});

elements.refresh.addEventListener("click", () => {
  return refreshState();
});
elements.syncProjects.addEventListener("click", async () => {
  elements.syncProjects.disabled = true;
  elements.publishingStatus.textContent = "Syncing tagged repositories from GitHub...";
  try {
    projectState = await syncProjectQueue(credential);
    renderPublishingState();
    elements.publishingStatus.textContent = `${projectState.synced} GitHub repositories synchronized.`;
    showToast("GitHub project catalog synchronized");
  } catch (error) {
    elements.publishingStatus.textContent = error.message;
    showToast(error.message, "error");
  } finally {
    elements.syncProjects.disabled = false;
  }
});
elements.search.addEventListener("input", renderState);
elements.signOut.addEventListener("click", async () => {
  await signOutOwner(authConfig);
  credential = null;
  showLogin("Signed out.");
});

try {
  authConfig = await loadAdminAuthConfig();
  environment = authConfig.portfolioEnvironment || "development";
  elements.localFields.hidden = authConfig.mode !== "local-token";
  elements.remoteFields.hidden = authConfig.mode === "local-token";
  elements.remoteFields.querySelectorAll("input").forEach((input) => {
    input.required = authConfig.mode !== "local-token";
  });
  elements.localFields.querySelector("input").required = authConfig.mode === "local-token";
  credential = getStoredCredential(authConfig.mode);
  if (!authConfig.configured) {
    showLogin("Admin authentication has not been configured for this environment.");
  } else if (credential) {
    await showWorkspace();
  } else {
    showLogin(authConfig.mode === "local-token" ? "Enter the local preview token." : undefined);
  }
} catch (error) {
  showLogin(error.message);
}
