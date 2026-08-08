BEGIN;

CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  value_json JSONB,
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (key, environment)
);

CREATE INDEX IF NOT EXISTS feature_flags_environment_idx
  ON feature_flags (environment);

CREATE TABLE IF NOT EXISTS feature_audit (
  id BIGSERIAL PRIMARY KEY,
  feature_key TEXT NOT NULL,
  environment TEXT NOT NULL,
  old_enabled BOOLEAN,
  new_enabled BOOLEAN,
  old_value_json JSONB,
  new_value_json JSONB,
  changed_by TEXT NOT NULL DEFAULT CURRENT_USER,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_audit_lookup_idx
  ON feature_audit (feature_key, environment, changed_at DESC);

CREATE OR REPLACE FUNCTION record_feature_flag_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();

  IF TG_OP = 'UPDATE' AND
     (OLD.enabled, OLD.value_json) IS NOT DISTINCT FROM (NEW.enabled, NEW.value_json) THEN
    RETURN NEW;
  END IF;

  INSERT INTO feature_audit (
    feature_key,
    environment,
    old_enabled,
    new_enabled,
    old_value_json,
    new_value_json,
    changed_by
  ) VALUES (
    NEW.key,
    NEW.environment,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.enabled END,
    NEW.enabled,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.value_json END,
    NEW.value_json,
    COALESCE(NULLIF(CURRENT_SETTING('app.changed_by', TRUE), ''), CURRENT_USER)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feature_flags_audit_trigger ON feature_flags;
CREATE TRIGGER feature_flags_audit_trigger
BEFORE INSERT OR UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION record_feature_flag_change();

COMMIT;
