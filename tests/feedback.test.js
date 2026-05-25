import assert from "node:assert/strict";
import test from "node:test";
import { prepareFeedbackPayload } from "../src/features/feedback-dialog.js";
import { FEEDBACK_ENDPOINT } from "../src/services/feedback.js";

test("feedback input sends contact details only with reply consent", () => {
  const withoutConsent = prepareFeedbackPayload({
    category: "design",
    message: "  Tighten the mobile cards. ",
    email: "viewer@example.com",
    replyConsent: false,
  });
  const withConsent = prepareFeedbackPayload({
    category: "project",
    project: "Scalable Data Processing System",
    message: "Explain partitioning decisions.",
    email: "viewer@example.com",
    replyConsent: true,
  });

  assert.equal(withoutConsent.email, "");
  assert.equal(withConsent.email, "viewer@example.com");
  assert.equal(withConsent.project, "Scalable Data Processing System");
});

test("feedback uses the configured private Formspree destination", () => {
  assert.equal(FEEDBACK_ENDPOINT, "https://formspree.io/f/mwvzrbpb");
});

test("feedback payload limits message content and includes the Formspree honeypot", () => {
  const payload = prepareFeedbackPayload({
    category: "invalid",
    project: "A".repeat(150),
    message: "B".repeat(900),
    _gotcha: "bot entry",
  });

  assert.equal(payload.category, "content");
  assert.equal(payload.project.length, 120);
  assert.equal(payload.message.length, 800);
  assert.equal(payload._gotcha, "bot entry");
});
