export const FEEDBACK_ENDPOINT = "https://formspree.io/f/mwvzrbpb";

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function createFormspreeSubmission(payload) {
  const category = titleCase(payload.category);

  return {
    subject: `Portfolio suggestion - ${category}`,
    message: payload.message,
    "Feedback category": category,
    ...(payload.project ? { "Related project": payload.project } : {}),
    ...(payload.email ? { email: payload.email, "Reply requested": "Yes" } : {}),
    _gotcha: payload._gotcha,
  };
}

export async function sendFeedback(payload) {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(createFormspreeSubmission(payload)),
  });
  const result = await readJson(response);

  if (!response.ok || result.ok === false) {
    throw new Error(result.message || "Your suggestion could not be sent right now.");
  }

  return { message: "Thanks. Your suggestion was sent privately." };
}
