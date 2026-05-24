export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function tagsTemplate(tags) {
  return tags.map((tag) => `<span>${tag}</span>`).join("");
}
