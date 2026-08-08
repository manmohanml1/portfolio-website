import {
  clearCredentials,
  getStoredCredential,
  loadAdminAuthConfig,
  signInOwner,
  signOutOwner,
  storeCredential,
} from "./auth-client.js";
import { loadFeatureState, saveFeatureFlag } from "./api.js";
import { renderAudit, renderFlags } from "./render.js";

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
  notice: document.querySelector("#environment-notice"),
  source: document.querySelector("#flag-source"),
  search: document.querySelector("#flag-search"),
  flags: document.querySelector("#flag-list"),
  audit: document.querySelector("#audit-list"),
  toast: document.querySelector("#admin-toast"),
  tabs: [...document.querySelectorAll("[role='tab']")],
  panels: [...document.querySelectorAll("[role='tabpanel']")],
};

let authConfig;
let credential;
let environment = "development";
let currentState = { flags: [], audit: [] };
let toastTimer;
let workspaceTab = globalThis.location.hash === "#audit" ? "audit" : "flags";

function selectWorkspaceTab(nextTab, { updateUrl = true } = {}) {
  workspaceTab = nextTab === "audit" ? "audit" : "flags";
  elements.tabs.forEach((tab) => {
    const selected = tab.id === `${workspaceTab}-tab`;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  elements.panels.forEach((panel) => {
    panel.hidden = panel.id !== `${workspaceTab}-panel`;
  });
  if (updateUrl) {
    const url = new URL(globalThis.location.href);
    url.hash = workspaceTab === "audit" ? "audit" : "";
    globalThis.history.replaceState(null, "", url);
  }
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
    await saveFeatureFlag(environment, flag, credential);
    showToast(`${flag.key} updated`);
    await refreshState();
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
  selectEnvironment(environment);
  await refreshState();
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

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectWorkspaceTab(tab.id.replace("-tab", "")));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = elements.tabs.indexOf(tab);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = elements.tabs[(currentIndex + direction + elements.tabs.length) % elements.tabs.length];
    selectWorkspaceTab(nextTab.id.replace("-tab", ""));
    nextTab.focus();
  });
});

elements.refresh.addEventListener("click", refreshState);
elements.search.addEventListener("input", renderState);
elements.signOut.addEventListener("click", async () => {
  await signOutOwner(authConfig);
  credential = null;
  showLogin("Signed out.");
});

try {
  authConfig = await loadAdminAuthConfig();
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
