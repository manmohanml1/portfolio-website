WITH candidates AS MATERIALIZED (
  SELECT github_id, publication_status AS old_status
  FROM portfolio_project_queue
  WHERE LOWER(repository_name) = ANY (ARRAY[
    'autonomous-travel-guide-mrbd',
    'checkmate-glass-mrbd',
    'fitness-exercises-app',
    'glass-search-meta-display',
    'glass-tube',
    'langchain-project-1',
    'leetcode-practice',
    'movies-api',
    'novel-browser-glass',
    'opengl_glut_game',
    'portfolio-website',
    'scalable-data-processing-system-for-high-volume-workloads',
    'software-engineering-design-patterns',
    'typescript-practice'
  ])
    AND publication_status = 'pending'
    AND reviewed_at IS NULL
), updated AS (
  UPDATE portfolio_project_queue queue
  SET publication_status = 'approved',
      reviewed_by = 'portfolio-baseline',
      reviewed_at = NOW()
  FROM candidates
  WHERE queue.github_id = candidates.github_id
  RETURNING queue.github_id
)
INSERT INTO portfolio_project_audit (github_id, old_status, new_status, changed_by)
SELECT candidates.github_id, candidates.old_status, 'approved', 'portfolio-baseline'
FROM candidates
JOIN updated USING (github_id);
