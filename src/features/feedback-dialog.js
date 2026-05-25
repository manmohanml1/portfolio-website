import { sendFeedback } from "../services/feedback.js";
import { qs, qsa } from "../utils/dom.js";

const CATEGORY_VALUES = new Set(["project", "design", "content", "bug", "opportunity"]);
const MAX_MESSAGE_LENGTH = 800;

export function prepareFeedbackPayload(values) {
  const category = CATEGORY_VALUES.has(values.category) ? values.category : "content";
  const message = String(values.message || "").trim().slice(0, MAX_MESSAGE_LENGTH);
  const email = String(values.email || "").trim();
  const replyConsent = Boolean(values.replyConsent);

  return {
    category,
    message,
    project: String(values.project || "").trim().slice(0, 120),
    email: replyConsent ? email.slice(0, 254) : "",
    replyConsent,
    _gotcha: String(values._gotcha || "").trim(),
  };
}

export function setupFeedbackDialog() {
  const dialog = qs("#feedback-dialog");
  const form = qs("#feedback-form");
  const closeButton = qs(".dialog-close", dialog);
  const projectLabel = qs("#feedback-project");
  const projectInput = qs("#feedback-project-input");
  const status = qs("#feedback-status");
  const submitButton = qs('button[type="submit"]', form);

  function setStatus(message, type = "") {
    status.textContent = message;
    status.dataset.state = type;
  }

  function openFeedbackDialog({ project = "" } = {}) {
    form.reset();
    projectInput.value = project;
    projectLabel.hidden = !project;
    projectLabel.textContent = project ? `Regarding: ${project}` : "";
    form.elements.category.value = project ? "project" : "design";
    setStatus("");
    dialog.showModal();
    form.elements.message.focus();
  }

  qsa("[data-open-feedback]").forEach((trigger) => {
    trigger.addEventListener("click", () => openFeedbackDialog());
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = prepareFeedbackPayload({
      category: form.elements.category.value,
      message: form.elements.message.value,
      email: form.elements.email.value,
      replyConsent: form.elements.replyConsent.checked,
      project: projectInput.value,
      _gotcha: form.elements.namedItem("_gotcha").value,
    });

    if (!payload.message) {
      setStatus("Please include a suggestion before sending.", "error");
      return;
    }

    if (form.elements.email.value.trim() && !payload.replyConsent) {
      setStatus("Select permission to receive a reply, or remove your email.", "error");
      return;
    }

    submitButton.disabled = true;
    setStatus("Sending privately...", "pending");

    try {
      const result = await sendFeedback(payload);
      form.reset();
      setStatus(result.message || "Thanks. Your suggestion was sent privately.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  return openFeedbackDialog;
}
