CREATE TABLE IF NOT EXISTS portfolio_project_queue (
  github_id BIGINT PRIMARY KEY,
  repository_name TEXT NOT NULL UNIQUE,
  repository_url TEXT NOT NULL,
  homepage_url TEXT,
  github_description TEXT,
  primary_language TEXT,
  topics TEXT[] NOT NULL DEFAULT '{}',
  github_updated_at TIMESTAMPTZ,
  publication_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (publication_status IN ('pending', 'approved', 'hidden')),
  title_override TEXT,
  description_override TEXT,
  category_override TEXT
    CHECK (category_override IS NULL OR category_override IN ('frontend', 'backend', 'data', 'ai', 'wearable', 'other')),
  tags_override TEXT[],
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_project_queue_status_idx
  ON portfolio_project_queue (publication_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS portfolio_project_audit (
  id BIGSERIAL PRIMARY KEY,
  github_id BIGINT NOT NULL REFERENCES portfolio_project_queue(github_id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_project_audit_changed_idx
  ON portfolio_project_audit (changed_at DESC);

CREATE OR REPLACE FUNCTION set_portfolio_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolio_project_updated_at ON portfolio_project_queue;
CREATE TRIGGER portfolio_project_updated_at
BEFORE UPDATE ON portfolio_project_queue
FOR EACH ROW EXECUTE FUNCTION set_portfolio_project_updated_at();
