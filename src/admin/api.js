import { createAdminHeaders } from "./auth-client.js";

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Admin request failed");
    error.status = response.status;
    throw error;
  }
  return body;
}

export async function loadFeatureState(environment, credential) {
  return readJson(await fetch(`/api/admin/features?environment=${encodeURIComponent(environment)}`, {
    cache: "no-store",
    headers: createAdminHeaders(credential),
  }));
}

export async function saveFeatureFlag(environment, flag, credential) {
  return readJson(await fetch(`/api/admin/features?environment=${encodeURIComponent(environment)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...createAdminHeaders(credential),
    },
    body: JSON.stringify({
      key: flag.key,
      enabled: flag.enabled,
      expectedUpdatedAt: flag.updatedAt,
    }),
  }));
}

export function mergeSavedFlag(state, savedFlag) {
  const previous = state.flags.find((flag) => flag.key === savedFlag.key);
  const flags = state.flags.map((flag) => (
    flag.key === savedFlag.key ? { ...flag, ...savedFlag } : flag
  ));
  if (!previous || previous.enabled === savedFlag.enabled) return { ...state, flags };

  return {
    ...state,
    flags,
    audit: [{
      key: savedFlag.key,
      environment: savedFlag.environment,
      oldEnabled: previous.enabled,
      newEnabled: savedFlag.enabled,
      changedBy: state.owner || "Owner",
      changedAt: savedFlag.updatedAt,
    }, ...state.audit],
  };
}
