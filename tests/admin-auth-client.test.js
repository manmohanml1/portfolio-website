import assert from "node:assert/strict";
import test from "node:test";
import { signInOwner } from "../src/admin/auth-client.js";

test("owner sign-in uses the JWT returned by Neon Auth", async () => {
  const requests = [];
  const credential = await signInOwner(
    { mode: "neon-auth", authUrl: "https://auth.example.com/auth" },
    { email: "owner@example.com", password: "secret" },
    async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({
        session: { user: { email: "owner@example.com" } },
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "set-auth-jwt": "signed-owner-token",
        },
      });
    },
  );

  assert.deepEqual(credential, { mode: "neon-auth", value: "signed-owner-token" });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://auth.example.com/auth/sign-in/email");
  const clientInfo = JSON.parse(requests[0].options.headers["X-Neon-Client-Info"]);
  assert.equal(clientInfo.sdk, "portfolio-control-center");
  assert.equal(clientInfo.runtime, "browser");
});

test("owner sign-in accepts a Neon base URL without an auth suffix", async () => {
  let requestedUrl = "";
  await signInOwner(
    { mode: "neon-auth", authUrl: "https://auth.example.com/" },
    { email: "owner@example.com", password: "secret" },
    async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({
        data: { session: { access_token: "signed-owner-token" } },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  );

  assert.equal(requestedUrl, "https://auth.example.com/auth/sign-in/email");
});

test("owner sign-in exchanges the Neon session for a verifiable JWT", async () => {
  const requests = [];
  const credential = await signInOwner(
    { mode: "neon-auth", authUrl: "https://auth.example.com/auth" },
    { email: "owner@example.com", password: "secret" },
    async (url, options) => {
      requests.push({ url, options });
      if (url.endsWith("/sign-in/email")) {
        return new Response(JSON.stringify({
          token: "opaque-session-token",
          user: { email: "owner@example.com" },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ token: "header.payload.signature" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  );

  assert.deepEqual(credential, { mode: "neon-auth", value: "header.payload.signature" });
  assert.deepEqual(requests.map(({ url }) => url), [
    "https://auth.example.com/auth/sign-in/email",
    "https://auth.example.com/auth/token",
  ]);
  assert.equal(requests[1].options.credentials, "include");
  assert.ok(requests[1].options.headers["X-Neon-Client-Info"]);
});

test("owner sign-in exposes Neon authentication errors", async () => {
  await assert.rejects(
    signInOwner(
      { mode: "neon-auth", authUrl: "https://auth.example.com/auth" },
      { email: "owner@example.com", password: "incorrect" },
      async () => new Response(JSON.stringify({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      }), { status: 401, headers: { "Content-Type": "application/json" } }),
    ),
    /Invalid email or password/,
  );
});
