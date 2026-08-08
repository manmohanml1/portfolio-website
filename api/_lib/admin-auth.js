import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwksCache = new Map();

function getHeader(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || "";
}

function parseList(value = "") {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function safeTokenMatch(received, expected) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getJwks(url) {
  if (!jwksCache.has(url)) {
    jwksCache.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksCache.get(url);
}

export async function verifyNeonOwnerToken(token, environment = process.env) {
  const jwksUrl = environment.NEON_AUTH_JWKS_URL || "";
  const issuer = environment.NEON_AUTH_ISSUER || "";
  if (!jwksUrl || !issuer) throw new Error("Neon Auth verification is not configured");

  const options = { issuer };
  if (environment.NEON_AUTH_AUDIENCE) options.audience = environment.NEON_AUTH_AUDIENCE;
  const { payload } = await jwtVerify(token, getJwks(jwksUrl), options);
  return payload;
}

export function isLocalAdminRuntime(environment = process.env) {
  return !environment.VERCEL_ENV && environment.NODE_ENV !== "production";
}

export async function authorizeAdminRequest(
  request,
  { environment = process.env, verifyToken = verifyNeonOwnerToken } = {},
) {
  const localToken = getHeader(request, "x-admin-local-token");
  if (
    isLocalAdminRuntime(environment)
    && safeTokenMatch(localToken, environment.ADMIN_LOCAL_TOKEN || "")
  ) {
    return {
      id: "local-owner",
      email: environment.ADMIN_LOCAL_OWNER_EMAIL || "local-owner",
      label: environment.ADMIN_LOCAL_OWNER_EMAIL || "local-owner",
      mode: "local",
    };
  }

  const authorization = getHeader(request, "authorization");
  if (!authorization.startsWith("Bearer ")) return null;

  try {
    const claims = await verifyToken(authorization.slice(7), environment);
    const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
    const subject = typeof claims.sub === "string" ? claims.sub : "";
    const ownerEmails = parseList(environment.ADMIN_OWNER_EMAILS).map((entry) => entry.toLowerCase());
    const ownerIds = parseList(environment.ADMIN_OWNER_IDS);
    const allowed = (email && ownerEmails.includes(email)) || (subject && ownerIds.includes(subject));
    if (!allowed) return null;

    return {
      id: subject,
      email,
      label: email || subject,
      mode: "neon-auth",
    };
  } catch {
    return null;
  }
}

export function isTrustedMutationOrigin(request, environment = process.env) {
  const origin = getHeader(request, "origin");
  if (!origin) return false;

  if (isLocalAdminRuntime(environment) && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  const trusted = new Set(parseList(environment.ADMIN_TRUSTED_ORIGINS));
  if (environment.VERCEL_URL) trusted.add(`https://${environment.VERCEL_URL}`);
  if (environment.VERCEL_PROJECT_PRODUCTION_URL) {
    trusted.add(`https://${environment.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return trusted.has(origin);
}
