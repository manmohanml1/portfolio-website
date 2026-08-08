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
