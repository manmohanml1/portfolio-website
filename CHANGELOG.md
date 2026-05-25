# Changelog

All notable changes to this portfolio will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use semantic versioning where practical.

## [Unreleased]

## [1.2.0] - 2026-05-25

### Added

- Added expanded project detail dialogs with purpose and engineering notes, safe external actions, and a compact published GlassTube preview image.
- Added a viewer-controlled reduced-motion setting alongside the visual theme control.
- Added a product roadmap for interactive portfolio additions, with case-study and architecture exploration features entering local review.
- Added curated case-study content and interactive architecture exploration for selected projects.
- Added a private visitor-feedback dialog with contextual project suggestions and Formspree delivery without domain or DNS setup.

### Changed

- Consolidated the theme selector into five structurally distinct visual modes: Swiss Grid, cinema-inspired Interstellar, Studio Light, Terminal, and Neo Brutalist.
- Made ambient scene artwork theme-specific, removing unnecessary floating objects and glow effects outside Interstellar.
- Tightened the mobile header, hero, profile summary, and project detail dialog for faster scanning on small screens.
- Removed repository storage-size labels from project cards and details because they do not communicate product value.
- Replaced generic career-signal cards with LinkedIn-backed experience, education, recognition, and recommendation evidence.
- Refined the career timeline with supplied role history, work outcomes, academic recognition, and received recommendation details.
- Removed redundant technology pills from experience cards so professional history stays compact on mobile.
- Condensed role summaries into expandable impact highlights and removed employment-type labels from the timeline.
- Updated the current Amtrak experience to reflect Labor Management System work, SQL Server/JDBC integrations, responsive Angular delivery, and modernization work.
- Limited full case-study treatment to projects with enough verified material, while simplifying lighter project details.
- Omitted the preview area for projects without a published screenshot instead of showing empty visual space.
- Removed the unnecessary hero interface-status label and made external project/profile actions open in a new tab.

### Fixed

- Normalized auto-added GitHub project titles, categories, and tags for consistent project cards.
- Classified Meta Ray-Ban Display applications as wearable projects with their own project filter.
- Removed the unavailable Fitness Exercises live-demo link and required explicit live-link opt-in for future fetched projects.

## [1.1.0] - 2026-05-24

### Added

- Added opt-in GitHub project discovery using the `portfolio-showcase` repository topic.
- Added a visible deployment release indicator and a documented version policy.
- Added CI enforcement requiring pull request titles to begin with `feat:` or `fix:`.

### Changed

- Removed the repetitive proof-of-work card section in favor of a tighter project presentation.
- Reframed the hero and profile panel around the current backend, full-stack, and cloud-data toolkit.

## [1.0.0] - 2026-05-24

### Added

- Initial personal portfolio experience with spatial and VR/AR-inspired presentation.
- Project showcase organized around frontend, AI, and systems work.
- Ten selectable visual themes with persistent preference and improved dark-theme contrast.
- Journey, education, achievements, and skills content informed by public professional information.
- Working external profile links, standard `mailto:` contact behavior, and a responsive back-to-top control.
- Modular JavaScript architecture separating content, rendering, interactions, themes, and environment configuration.
- Automated tests for project filtering, themes, content integrity, environment resolution, and document contracts.
- GitHub Actions workflows for pull-request quality validation and environment-specific release candidate packaging.
- Published the initial production portfolio deployment on Vercel Hobby.
- Connected the GitHub repository to Vercel for automatic production and preview deployments.

[Unreleased]: https://github.com/manmohanml1/portfolio-website/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/manmohanml1/portfolio-website/releases/tag/v1.0.0
