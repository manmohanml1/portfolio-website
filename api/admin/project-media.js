import { put } from "@vercel/blob";
import { authorizeAdminRequest, isTrustedMutationOrigin } from "../_lib/admin-auth.js";

export const PROJECT_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = Object.freeze({
  "image/jpeg": { extension: "jpg", valid: (body) => body.length >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff },
  "image/png": { extension: "png", valid: (body) => body.length >= 8 && body.subarray(1, 4).toString("ascii") === "PNG" },
  "image/webp": { extension: "webp", valid: (body) => body.length >= 12 && body.subarray(0, 4).toString("ascii") === "RIFF" && body.subarray(8, 12).toString("ascii") === "WEBP" },
});

async function readUploadBody(request) {
  if (Buffer.isBuffer(request.body)) return request.body;
  if (request.body instanceof Uint8Array) return Buffer.from(request.body);
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > PROJECT_IMAGE_MAX_BYTES) throw new Error("too-large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function createAdminProjectMediaHandler({
  authorize = authorizeAdminRequest,
  trustedOrigin = isTrustedMutationOrigin,
  upload = put,
} = {}) {
  return async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");
    const owner = await authorize(request);
    if (!owner) {
      response.status(401).json({ error: "Owner authentication required" });
      return;
    }
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      response.status(405).json({ error: "Method not allowed" });
      return;
    }
    if (!trustedOrigin(request)) {
      response.status(403).json({ error: "Untrusted request origin" });
      return;
    }

    const githubId = String(request.query?.githubId || "");
    const contentType = String(request.headers?.["content-type"] || "").split(";")[0].toLowerCase();
    const imageType = IMAGE_TYPES[contentType];
    const declaredLength = Number(request.headers?.["content-length"] || 0);
    if (!/^\d+$/.test(githubId) || !imageType) {
      response.status(400).json({ error: "Upload a JPEG, PNG, or WebP project image" });
      return;
    }
    if (declaredLength > PROJECT_IMAGE_MAX_BYTES) {
      response.status(413).json({ error: "Project images must be 3 MB or smaller" });
      return;
    }

    try {
      const body = await readUploadBody(request);
      if (!body.length || body.length > PROJECT_IMAGE_MAX_BYTES) {
        response.status(413).json({ error: "Project images must be 3 MB or smaller" });
        return;
      }
      if (!imageType.valid(body)) {
        response.status(400).json({ error: "The file contents do not match the selected image type" });
        return;
      }
      const blob = await upload(`portfolio/projects/${githubId}/cover.${imageType.extension}`, body, {
        access: "public",
        addRandomSuffix: true,
        contentType,
        cacheControlMaxAge: 31_536_000,
      });
      response.status(201).json({ version: 1, url: blob.url, owner: owner.label });
    } catch (error) {
      if (error?.message === "too-large") {
        response.status(413).json({ error: "Project images must be 3 MB or smaller" });
        return;
      }
      response.status(503).json({ error: "Project image storage is not configured" });
    }
  };
}

export default createAdminProjectMediaHandler();
