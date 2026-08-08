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
        data: { session: { access_token: "signed-owner-token" } },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  );

  assert.deepEqual(credential, { mode: "neon-auth", value: "signed-owner-token" });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://auth.example.com/auth/sign-in/email");
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
