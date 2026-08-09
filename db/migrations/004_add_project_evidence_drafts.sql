ALTER TABLE portfolio_project_queue
  ADD COLUMN IF NOT EXISTS generated_presentation JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS extracted_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS generated_case_study JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS case_study_override JSONB,
  ADD COLUMN IF NOT EXISTS media_override JSONB;

CREATE INDEX IF NOT EXISTS portfolio_project_queue_evidence_idx
  ON portfolio_project_queue USING GIN (extracted_evidence);
