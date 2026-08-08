import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_FEATURE_FLAGS, isKnownFeatureFlag } from "./src/config/feature-defaults.js";
import { readFeatureConfig } from "./api/_lib/feature-store.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/api/config") {
    const storedConfig = await readFeatureConfig({ environment: "development" });
    const flags = { ...storedConfig.flags };
    let hasOverrides = false;

    url.searchParams.getAll("flag").forEach((override) => {
      const separator = override.lastIndexOf(":");
      const key = override.slice(0, separator);
      const value = override.slice(separator + 1);

      if (separator > 0 && isKnownFeatureFlag(key) && ["true", "false"].includes(value)) {
        flags[key] = value === "true";
        hasOverrides = true;
      }
    });

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({
      version: 1,
      environment: "development",
      source: hasOverrides ? "local-overrides" : storedConfig.source,
      flags,
    }));
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(root, requested));

  if (!filePath.startsWith(normalize(root)) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "text/plain" });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Portfolio preview running at http://localhost:${port}`);
});
