INSERT INTO feature_flags (key, environment, enabled, description)
SELECT
  'features.visitorCustomization.enabled',
  environment.name,
  TRUE,
  'Allow local viewer preferences and layout customization'
FROM (
  VALUES ('development'), ('staging'), ('production')
) AS environment(name)
ON CONFLICT (key, environment) DO NOTHING;
