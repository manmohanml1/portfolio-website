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

export async function loadAnalyticsSummary(days, credential) {
  return readJson(await fetch(`/api/admin/analytics?days=${encodeURIComponent(days)}`, {
    cache: "no-store",
    headers: createAdminHeaders(credential),
  }));
}

export async function loadProjectQueue(credential) {
  return readJson(await fetch("/api/admin/projects", {
    cache: "no-store",
    headers: createAdminHeaders(credential),
  }));
}

export async function syncProjectQueue(credential) {
  return readJson(await fetch("/api/admin/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...createAdminHeaders(credential),
    },
    body: JSON.stringify({ action: "sync" }),
  }));
}

export async function saveProjectReview(project, credential) {
  return readJson(await fetch("/api/admin/projects", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...createAdminHeaders(credential),
    },
    body: JSON.stringify({
      githubId: project.githubId,
      status: project.status,
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags,
      caseStudy: project.caseStudy,
      media: project.media,
      expectedUpdatedAt: project.updatedAt,
    }),
  }));
}

export async function uploadProjectMedia(project, file, credential) {
  return readJson(await fetch(
    `/api/admin/project-media?githubId=${encodeURIComponent(project.githubId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        ...createAdminHeaders(credential),
      },
      body: file,
    },
  ));
}

export function mergeSavedProject(state, savedProject) {
  return {
    ...state,
    projects: state.projects.map((project) => (
      project.githubId === savedProject.githubId ? { ...project, ...savedProject } : project
    )),
  };
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
