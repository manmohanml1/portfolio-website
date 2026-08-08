INSERT INTO feature_flags (key, environment, enabled, description)
SELECT seed.key, environment.name, TRUE, seed.description
FROM (
  VALUES
    ('sections.journey.enabled', 'Show professional experience and education'),
    ('sections.skills.enabled', 'Show current and previous technology stack'),
    ('features.feedback.enabled', 'Allow private visitor suggestions'),
    ('features.projectDialogs.enabled', 'Open detailed project dialogs'),
    ('features.projectFilters.enabled', 'Show project category filters'),
    ('effects.tiltCards.enabled', 'Enable pointer-based project card tilt'),
    ('features.visitorCustomization.enabled', 'Allow local viewer preferences and evidence focus')
) AS seed(key, description)
CROSS JOIN (
  VALUES ('development'), ('staging'), ('production')
) AS environment(name)
ON CONFLICT (key, environment) DO NOTHING;
