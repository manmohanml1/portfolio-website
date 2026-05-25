export const FEEDBACK_ENDPOINT = "https://formspree.io/f/mwvzrbpb";

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function sendFeedback(payload) {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await readJson(response);

  if (!response.ok || result.ok === false) {
    throw new Error(result.message || "Your suggestion could not be sent right now.");
  }

  return { message: "Thanks. Your suggestion was sent privately." };
}
