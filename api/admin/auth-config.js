import { isLocalAdminRuntime } from "../_lib/admin-auth.js";

export function createAdminAuthConfig(environment = process.env) {
  const local = isLocalAdminRuntime(environment);
  const portfolioEnvironment = environment.VERCEL_ENV === "production"
    ? "production"
    : environment.VERCEL_ENV === "preview"
      ? "staging"
      : "development";
  const authUrl = environment.NEON_AUTH_BASE_URL
    || environment.NEON_AUTH_URL
    || environment.VITE_NEON_AUTH_URL
    || "";
  return {
    version: 1,
    mode: local && environment.ADMIN_LOCAL_TOKEN ? "local-token" : "neon-auth",
    portfolioEnvironment,
    authUrl,
    configured: local
      ? Boolean(environment.ADMIN_LOCAL_TOKEN)
      : Boolean(authUrl),
  };
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  response.setHeader("Cache-Control", "no-store");
  response.status(200).json(createAdminAuthConfig());
}
