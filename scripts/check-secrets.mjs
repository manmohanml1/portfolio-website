import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SKIPPED_DIRECTORIES = new Set([".git", "node_modules"]);
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".sql", ".txt", ".yml", ".yaml"]);
const SECRET_PATTERNS = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/],
  ["database credential", /\bpostgres(?:ql)?:\/\/(?!user:password@)[^\s:@]+:[^\s@]+@/i],
  ["Vercel access token", /\b(?:VERCEL_API_TOKEN|BLOB_READ_WRITE_TOKEN)\s*=\s*(?!replace-with-)[^\s<>{}\[\]]{12,}/i],
  ["Resend API key", /\bre_[A-Za-z0-9]{20,}\b/],
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (entry.name === ".env.example") return [path.join(directory, entry.name)];
    if (entry.name.startsWith(".env")) return [];
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : collectFiles(path.join(directory, entry.name));
    }
    return TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [path.join(directory, entry.name)] : [];
  }));
  return nested.flat();
}

const findings = [];
for (const file of await collectFiles(ROOT)) {
  const source = await readFile(file, "utf8");
  for (const [label, pattern] of SECRET_PATTERNS) {
    if (pattern.test(source)) findings.push(`${path.relative(ROOT, file)}: possible ${label}`);
  }
}

if (findings.length) {
  console.error("Potential tracked secrets detected:\n" + findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Secret scan checked tracked source patterns.");
}
