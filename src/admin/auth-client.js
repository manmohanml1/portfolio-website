const TOKEN_KEY = "portfolio-admin-token";
const LOCAL_TOKEN_KEY = "portfolio-admin-local-token";

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Authentication request failed");
  return body;
}

function getAuthEndpoint(authUrl, path) {
  const baseUrl = authUrl.replace(/\/+$/, "");
  const authBaseUrl = baseUrl.endsWith("/auth") ? baseUrl : `${baseUrl}/auth`;
  return `${authBaseUrl}/${path}`;
}

export async function loadAdminAuthConfig() {
  return readJson(await fetch("/api/admin/auth-config", { cache: "no-store" }));
}

export function getStoredCredential(mode) {
  const key = mode === "local-token" ? LOCAL_TOKEN_KEY : TOKEN_KEY;
  const value = sessionStorage.getItem(key) || "";
  return value ? { mode, value } : null;
}

export function storeCredential(credential) {
  const key = credential.mode === "local-token" ? LOCAL_TOKEN_KEY : TOKEN_KEY;
  sessionStorage.setItem(key, credential.value);
}

export function clearCredentials() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LOCAL_TOKEN_KEY);
}

export function createAdminHeaders(credential) {
  if (!credential) return {};
  return credential.mode === "local-token"
    ? { "X-Admin-Local-Token": credential.value }
    : { Authorization: `Bearer ${credential.value}` };
}

export async function signInOwner(config, { email, password, localToken }, fetchImpl = globalThis.fetch) {
  if (config.mode === "local-token") {
    if (!localToken) throw new Error("Enter the local owner token");
    return { mode: "local-token", value: localToken };
  }

  if (!config.authUrl) throw new Error("Neon Auth is not configured");
  const signInResponse = await readJson(await fetchImpl(getAuthEndpoint(config.authUrl, "sign-in/email"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }));
  const token = signInResponse.data?.session?.access_token
    || signInResponse.session?.access_token
    || signInResponse.data?.session?.accessToken;
  if (!token) throw new Error("Neon Auth did not return an access token");
  return { mode: "neon-auth", value: token };
}

export async function signOutOwner(config, fetchImpl = globalThis.fetch) {
  clearCredentials();
  if (config?.mode === "neon-auth" && config.authUrl) {
    await fetchImpl(getAuthEndpoint(config.authUrl, "sign-out"), {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }
}
