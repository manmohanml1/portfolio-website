import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  isKnownFeatureFlag,
} from "../../src/config/feature-defaults.js";

export const FEATURE_STORE_TIMEOUT_MS = 2000;
export const ADMIN_AUDIT_LIMIT = 50;

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

export async function readAdminFeatureConfig({
  environment,
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) {
    return {
      source: "defaults",
      flags: FEATURE_FLAG_KEYS.map((key) => ({
        key,
        environment,
        enabled: DEFAULT_FEATURE_FLAGS[key],
        description: "",
        updatedAt: null,
      })),
      audit: [],
    };
  }

  const sql = createSql(connectionString);
  const [rows, auditRows] = await Promise.all([
    sql.query(
      `SELECT key, environment, enabled, description, updated_at
       FROM feature_flags
       WHERE environment = $1
         AND key = ANY($2::text[])
       ORDER BY key`,
      [environment, FEATURE_FLAG_KEYS],
    ),
    sql.query(
      `SELECT feature_key, environment, old_enabled, new_enabled, changed_by, changed_at
       FROM feature_audit
       WHERE environment = $1
         AND feature_key = ANY($2::text[])
       ORDER BY changed_at DESC
       LIMIT $3`,
      [environment, FEATURE_FLAG_KEYS, ADMIN_AUDIT_LIMIT],
    ),
  ]);

  const byKey = new Map(rows.map((row) => [row.key, row]));
  return {
    source: "database",
    flags: FEATURE_FLAG_KEYS.map((key) => {
      const row = byKey.get(key);
      return {
        key,
        environment,
        enabled: row?.enabled ?? DEFAULT_FEATURE_FLAGS[key],
        description: row?.description ?? "",
        updatedAt: row?.updated_at ?? null,
      };
    }),
    audit: auditRows.map((row) => ({
      key: row.feature_key,
      environment: row.environment,
      oldEnabled: row.old_enabled,
      newEnabled: row.new_enabled,
      changedBy: row.changed_by,
      changedAt: row.changed_at,
    })),
  };
}

export async function updateFeatureFlag({
  environment,
  key,
  enabled,
  expectedUpdatedAt = null,
  changedBy,
  connectionString = resolveFeatureConfigConnectionString(),
  createSql = neon,
} = {}) {
  if (!connectionString) {
    throw new Error("Feature configuration database is not configured");
  }

  const sql = createSql(connectionString);
  const rows = await sql.query(
    `WITH actor AS MATERIALIZED (
       SELECT set_config('app.changed_by', $4, TRUE)
     )
     UPDATE feature_flags
     SET enabled = $3
     FROM actor
     WHERE environment = $1
       AND key = $2
       AND ($5::timestamptz IS NULL OR updated_at = $5::timestamptz)
     RETURNING key, environment, enabled, description, updated_at`,
    [environment, key, enabled, changedBy, expectedUpdatedAt],
  );

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    key: row.key,
    environment: row.environment,
    enabled: row.enabled,
    description: row.description,
    updatedAt: row.updated_at,
  };
}
