import assert from "node:assert/strict";
import test from "node:test";
import { prepareFeedbackPayload } from "../src/features/feedback-dialog.js";
import { createFormspreeSubmission, FEEDBACK_ENDPOINT } from "../src/services/feedback.js";

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

test("Formspree notifications use readable labels and omit empty optional fields", () => {
  const general = createFormspreeSubmission({
    category: "design",
    message: "Add another interaction.",
    project: "",
    email: "",
    _gotcha: "",
  });
  const project = createFormspreeSubmission({
    category: "project",
    message: "Show the deployment flow.",
    project: "Data Pipeline",
    email: "viewer@example.com",
    _gotcha: "",
  });

  assert.equal(general.subject, "Portfolio suggestion - Design");
  assert.equal(general["Feedback category"], "Design");
  assert.equal(general["Related project"], undefined);
  assert.equal(general.email, undefined);
  assert.equal(general["Reply requested"], undefined);
  assert.equal(project["Related project"], "Data Pipeline");
  assert.equal(project.email, "viewer@example.com");
  assert.equal(project["Reply requested"], "Yes");
});
