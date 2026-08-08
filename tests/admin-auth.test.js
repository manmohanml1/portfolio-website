import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeAdminRequest,
  isLocalAdminRuntime,
  isTrustedMutationOrigin,
} from "../api/_lib/admin-auth.js";
import { createAdminAuthConfig } from "../api/admin/auth-config.js";

test("local owner tokens work only outside Vercel and production", async () => {
  const request = { headers: { "x-admin-local-token": "local-secret" } };
  const local = await authorizeAdminRequest(request, {
    environment: { ADMIN_LOCAL_TOKEN: "local-secret", ADMIN_LOCAL_OWNER_EMAIL: "owner@example.com" },
  });
  const preview = await authorizeAdminRequest(request, {
    environment: { VERCEL_ENV: "preview", ADMIN_LOCAL_TOKEN: "local-secret" },
  });

  assert.equal(local.email, "owner@example.com");
  assert.equal(local.mode, "local");
  assert.equal(preview, null);
  assert.equal(isLocalAdminRuntime({ NODE_ENV: "production" }), false);
});

test("remote owner authorization requires an exact allowlisted identity", async () => {
  const request = { headers: { authorization: "Bearer signed-token" } };
  const environment = {
    VERCEL_ENV: "preview",
    ADMIN_OWNER_EMAILS: "owner@example.com",
    ADMIN_OWNER_IDS: "owner-id",
  };
  const emailOwner = await authorizeAdminRequest(request, {
    environment,
    verifyToken: async () => ({ sub: "different-id", email: "OWNER@example.com" }),
  });
  const denied = await authorizeAdminRequest(request, {
    environment,
    verifyToken: async () => ({ sub: "different-id", email: "visitor@example.com" }),
  });

  assert.equal(emailOwner.label, "owner@example.com");
  assert.equal(denied, null);
});

test("mutation origins are explicit and environment-aware", () => {
  assert.equal(isTrustedMutationOrigin(
    { headers: { origin: "http://localhost:4173" } },
    { ADMIN_LOCAL_TOKEN: "secret" },
  ), true);
  assert.equal(isTrustedMutationOrigin(
    { headers: { origin: "https://portfolio.example.com" } },
    { VERCEL_ENV: "production", ADMIN_TRUSTED_ORIGINS: "https://portfolio.example.com" },
  ), true);
  assert.equal(isTrustedMutationOrigin(
    { headers: { origin: "https://attacker.example" } },
    { VERCEL_ENV: "production", ADMIN_TRUSTED_ORIGINS: "https://portfolio.example.com" },
  ), false);
});

test("public admin auth bootstrap never includes the local secret", () => {
  const config = createAdminAuthConfig({
    ADMIN_LOCAL_TOKEN: "do-not-expose",
    NEON_AUTH_URL: "https://auth.example.com",
  });
  assert.deepEqual(config, {
    version: 1,
    mode: "local-token",
    authUrl: "https://auth.example.com",
    configured: true,
  });
  assert.equal(JSON.stringify(config).includes("do-not-expose"), false);
});

test("remote bootstrap uses Neon Vercel integration variables", () => {
  const config = createAdminAuthConfig({
    VERCEL_ENV: "preview",
    NEON_AUTH_BASE_URL: "https://preview-auth.example.com",
    NEON_AUTH_JWKS_URL: "https://preview-auth.example.com/.well-known/jwks.json",
  });

  assert.deepEqual(config, {
    version: 1,
    mode: "neon-auth",
    authUrl: "https://preview-auth.example.com",
    configured: true,
  });
});
