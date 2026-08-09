const TELEMETRY_SCRIPTS = Object.freeze([
  {
    src: "/_vercel/insights/script.js",
    queue: "va",
    backlog: "vaq",
    sdk: "@vercel/analytics",
    version: "2.0.1",
  },
  {
    src: "/_vercel/speed-insights/script.js",
    queue: "si",
    backlog: "siq",
    sdk: "@vercel/speed-insights",
    version: "2.0.0",
  },
]);

export function shouldCollectObservability(locationLike = globalThis.location) {
  const hostname = locationLike?.hostname || "";
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  return locationLike?.protocol === "https:" && !local && locationLike?.pathname !== "/admin.html";
}

function initializeQueue(windowLike, queue, backlog) {
  if (windowLike[queue]) return;
  windowLike[queue] = (...parameters) => {
    windowLike[backlog] = windowLike[backlog] || [];
    windowLike[backlog].push(parameters);
  };
}

export function setupPublicObservability({
  documentLike = globalThis.document,
  locationLike = globalThis.location,
  windowLike = globalThis.window,
} = {}) {
  if (!documentLike?.head || !windowLike || !shouldCollectObservability(locationLike)) return false;

  TELEMETRY_SCRIPTS.forEach(({ src, queue, backlog, sdk, version }) => {
    initializeQueue(windowLike, queue, backlog);
    if (documentLike.head.querySelector(`script[src="${src}"]`)) return;

    const script = documentLike.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = sdk;
    script.dataset.sdkv = version;
    documentLike.head.append(script);
  });

  return true;
}
