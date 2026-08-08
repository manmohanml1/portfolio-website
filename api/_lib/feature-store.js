import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  isKnownFeatureFlag,
} from "../../src/config/feature-defaults.js";

export const FEATURE_STORE_TIMEOUT_MS = 2000;

export function resolveFeatureConfigConnectionString(environment = process.env) {
  return environment.FEATURE_CONFIG_DATABASE_URL || environment.DATABASE_URL || "";
}

export function mergeDatabaseFlags(rows = []) {
  const flags = { ...DEFAULT_FEATURE_FLAGS };
  let acceptedRows = 0;

  rows.forEach((row) => {
    if (isKnownFeatureFlag(row?.key) && typeof row.enabled === "boolean") {
      flags[row.key] = row.enabled;
      acceptedRows += 1;
    }
  });

  return {
    source: acceptedRows > 0 ? "database" : "defaults",
    flags,
  };
}

export async function readFeatureConfig({
  environment,
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
  timeoutMs = FEATURE_STORE_TIMEOUT_MS,
} = {}) {
  if (!connectionString) {
    return mergeDatabaseFlags();
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const sql = createSql(connectionString);
    const rows = await sql.query(
      `SELECT key, enabled
       FROM feature_flags
       WHERE environment = $1
         AND key = ANY($2::text[])`,
      [environment, FEATURE_FLAG_KEYS],
      { fetchOptions: { signal: controller.signal } },
    );

    return mergeDatabaseFlags(rows);
  } catch {
    return mergeDatabaseFlags();
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
