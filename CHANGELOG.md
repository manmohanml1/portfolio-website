# Changelog

All notable changes to this portfolio will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use semantic versioning where practical.

## [Unreleased]

### Added

- Added an authenticated Project Publishing Inbox that discovers `portfolio-showcase` repositories and stages them as pending owner review instead of publishing them automatically.
- Added evidence-assisted project drafts using public README sections, repository languages, topics, and detected technology signals.
- Added editable generated case studies to the owner review flow, with approved drafts rendered through the existing public project dialog.
- Added repository-derived image and demo-link candidates with owner-selected cover media, editable alternative text, and safe external video links.
- Added owner-authenticated JPEG, PNG, and WebP uploads from desktop or mobile to Vercel Blob, with file-signature validation and a 3 MB limit.
- Added owner-managed project titles, descriptions, categories, and technology tags with pending, approved, and hidden publication states.
- Added Neon-backed project moderation and audit history, protected sync/review APIs, trusted-origin checks, and optimistic concurrency protection.
- Added an approved-only public project endpoint with a checked-in curated-project fallback when the publishing store is unavailable.
- Added five independent composition worlds over one shared component system: Android Bento OS, Cosmos Constellation, Product Casebook, Blueprint System Map, and Future Lab Interface Deck.
- Added a theme-to-layout configuration contract and dedicated composition stylesheet so new projects, career entries, and skills inherit every portfolio world without duplicated renderers or markup.
- Added a Vercel security-header baseline with CSP, anti-framing, MIME-sniffing protection, restricted browser permissions, referrer controls, and explicit admin indexing and cache boundaries.
- Added public crawler guidance and a single-page sitemap while excluding the owner workspace and protected admin APIs.
- Added five purpose-built visual worlds: Android for friendly tonal surfaces, Cosmos for deep-space viewing, Product for polished scanning, Blueprint for systems work, and Future Lab for a clean speculative interface.
- Added dedicated theme and responsive style layers so shared components remain reusable while each visual world can customize typography, surfaces, composition, and interaction character.
- Added an accessible evidence explorer that searches curated projects, professional experience, current skills, and credentials while respecting the active audience lens and opening matching project case studies directly.
- Added a responsive engineering-progression timeline from graduate study and teaching through cloud backend work, enterprise full-stack delivery, operated platforms, and wearable experiments.
- Added curated flagship case studies for the Portfolio Operations Platform and Novel Browser Glass, including architecture explorers and verified live links.
- Added repository-backed case studies and architecture paths for Movies API, LeetCode Practice, Software Engineering Design Patterns, OpenGL GLUT Game, TypeScript Practice, GlassTube, Glass Search, Checkmate Glass, and Autonomous Travel Guide.
- Added verified preview media for the Fitness Exercises App and GlassTube where repository visuals are available.

### Changed

- Classified all 14 checked-in GitHub projects as the published baseline in the owner queue while keeping future repositories tagged with `portfolio-showcase` pending for review.
- Kept baseline publication metadata from replacing checked-in case studies until the owner explicitly reviews and saves an override.
- Reorganized the private Control Center into Runtime, Projects, and Analytics workspaces with focused nested views for controls, history, review states, traffic, and performance.
- Changed approved GitHub records to enrich matching curated projects instead of being discarded as duplicates, while preserving curated order and featured placement.
- Routed opt-in GitHub additions through the owner-reviewed publishing queue; applying a repository topic alone no longer makes a project visible to visitors.
- Moved GitHub discovery to a server-side owner action, removing the public browser's direct dependency on the GitHub API.
- Rebuilt cards, project grids, career layouts, skill surfaces, metric bands, and responsive fallbacks per theme so switching appearance now feels like moving between five portfolio demos rather than recoloring one site.
- Extended each composition world into navigation, section headings, evidence controls, career progression, skill bands, and contact endings so the complete page changes design language with the selected theme.
- Reframed the owner sign-in page with explicit portfolio ownership and visitor guidance so it cannot be mistaken for a public credential request.
- Reworked the five visual worlds around distinct compositions and ambient motion, including a vertically moving Cosmos galaxy without the previous ring object.
- Replaced the previous default palette and legacy theme identities with Android, Cosmos, and Future Lab alternatives while retaining the stronger Product and Blueprint worlds.
- Rebuilt the hiring-perspective choices as equal-width segmented controls and balanced featured project cards into clean two-column desktop rows without unused grid space.
- Reworked phone, tablet, laptop, desktop, and wide-screen breakpoints across navigation, hero content, profile signals, project controls, card and list layouts, dialogs, career content, skills, and contact actions.
- Removed mobile navigation and project-filter scrolling in favor of stable grid layouts, and added compact handling for 320px screens without clipped controls or text.
- Repositioned the public portfolio around the current Java, Spring Boot, Angular, SQL Server, AWS, and TypeScript stack before earlier technologies and experiments.
- Reworked general-view hero, profile signals, metrics, skills, project ordering, metadata, and contact language to match the current LinkedIn career direction.
- Combined role perspective, technology search, project category filters, and card/list layout into one visible Work explorer instead of hiding role controls inside the theme menu.
- Reduced the theme menu to appearance and motion controls so every option has a predictable purpose.
- Promoted four opt-in wearable repositories from generic GitHub discovery cards to curated portfolio records with accurate descriptions and implementation boundaries.
- Simplified the mobile Work explorer to one searchable field, wrapped project filters, and Cards/List controls without horizontally scrolling technology or category rows.
- Moved the search clear action inside the field and made it appear only when a query exists.
- Reworked project previews into compact dialog-intro media so case-study and architecture content use the full dialog width on desktop and mobile.
- Advanced the local feature candidate to `v1.8.0` for visitor Evidence & Discovery review.

### Fixed

- Trusted Vercel Git branch Preview origins for authenticated owner mutations while retaining exact-origin matching against lookalike hosts.
- Rejected README badges and SVG shields as project covers, hid failed previews, and showed Save/Discard actions only for changed publishing drafts.

## [1.7.0] - 2026-08-09

### Added

- Added privacy-conscious Vercel Web Analytics and Speed Insights collection to the public portfolio while excluding the owner workspace.
- Added an owner-only Analytics tab with 7-day and 30-day traffic totals, daily trends, top pages, referrers, countries, and devices.
- Added a protected analytics API that keeps the Vercel token server-side and returns only normalized aggregate data.

### Changed

- Released Control Center observability as `v1.7.0` after authenticated Preview verification.

## [1.6.0] - 2026-08-08

### Added

- Added an unlinked, no-index owner Control Center for switching development, staging, and production feature flags and reviewing environment audit history.
- Separated flag management and audit history into keyboard-accessible owner workspace tabs that retain the selected environment.
- Added a protected admin feature API with server-side Neon Auth JWT verification, exact owner allowlists, trusted mutation origins, optimistic update checks, and owner-attributed database changes.
- Added a development-only local owner-token flow and in-memory control-plane preview that cannot activate on Vercel.
- Added focused automated coverage for authorization boundaries, admin reads and writes, conflict handling, secret-safe bootstrap configuration, and audit queries.

### Changed

- Released the authenticated owner Control Center and immediate Neon-backed feature availability as `v1.6.0`.

### Fixed

- Aligned owner sign-in with Neon's managed Auth protocol by sending client metadata, exchanging the session for an issued JWT, deriving branch-matched JWKS verification, and preserving actionable service errors.
- Kept successful flag saves synchronized with the database-returned value and optimistic version so the Control Center no longer reverts visually or creates a false second-save conflict.
- Matched optimistic flag versions at the millisecond precision preserved by JSON, preventing PostgreSQL microseconds from causing false `409` conflicts.
- Disabled browser and edge caching for public runtime configuration so saved flags take effect on the next page refresh.
- Opened the Control Center on the environment served by its deployment: Staging for Preview, Production for Production, and Development locally.

## [1.5.2] - 2026-08-08

### Fixed

- Restored whole-card pointer access to project details in Cards view while preserving Repository, Live app, and explicit details actions.
- Kept List rows non-clickable outside their explicit actions and removed the misleading row-level pointer cursor.
- Replaced bright Neo Brutalist card and project-dialog whites with softer paper surfaces while preserving its borders, shadows, and accent colors.

## [1.5.1] - 2026-08-08

### Fixed

- Restored consistent Cards and List composition across every theme after the v1.5 visitor-customization release.
- Packed featured Cards without empty desktop grid cells and prevented Studio Light, Interstellar, and Neo Brutalist card surfaces from leaking into List rows.
- Preserved compact, theme-specific List actions and dividers across desktop and mobile layouts.

## [1.5.0] - 2026-08-08

### Added

- Added versioned, validated local visitor preferences for theme, motion, audience lens, and project layout without accounts or server-side profile data.
- Added General, Backend, Full Stack, Cloud/Data, and AI portfolio variants that replace page-wide positioning and retain only explicitly relevant projects, skills, experience, credentials, signals, and technologies.
- Added a visual Cards gallery and a clearly separate editorial List layout, plus shareable `?view=backend`, `?view=fullstack`, `?view=data`, and `?view=ai` starting points.
- Scoped List actions to project rows and added compact, bordered, tactile dialog actions without decorative numbering.
- Added a database-backed rollout flag and idempotent migration for visitor customization.
- Added tests for v1 preference migration, malformed and blocked storage, URL audience resolution, evidence ordering, contextual reset behavior, and rollout wiring.

### Changed

- Consolidated the existing theme and reduced-motion storage keys behind a resilient preference service.
- Kept project category filters available in General and removed them from specialized variants where they conflict with curated audience evidence.
- Aligned Vercel `-git-` branch aliases with the staging environment used by the Preview configuration endpoint.
- Advanced the public release to `v1.5.0`.

## [1.4.0] - 2026-08-08

### Added

- Added a server-only Neon configuration store with independent development, staging, and production feature values.
- Added a dedicated shared feature-configuration connection so all Vercel Previews follow the same staging flags while retaining isolated databases for future schema testing.
- Added idempotent database migrations, 18 seeded flag records, and automatic change auditing for future admin updates.
- Added tests for database fallback, query parameterization, source-aware caching, and SQL schema contracts.

### Changed

- Updated local configuration loading to read Neon when configured while preserving localhost-only URL overrides.
- Prioritized `FEATURE_CONFIG_DATABASE_URL` over Neon's deployment-specific `DATABASE_URL` to prevent Preview branches from fragmenting flag control.
- Updated CI and release-candidate artifacts to install locked dependencies and include API and database assets.
- Kept Neon Auth disabled until authenticated admin controls can ship with explicit owner authorization.
- Advanced the visible feature candidate to `v1.4.0`.

## [1.3.0] - 2026-08-08

### Added

- Added a strict six-flag runtime configuration registry for Journey, Skills, Feedback, project dialogs, project filters, and card tilt.
- Added a read-only Vercel configuration endpoint with local development overrides and short-lived edge caching.
- Added fail-open configuration loading so unavailable or malformed configuration preserves the complete portfolio experience.
- Added automated coverage for configuration validation, API method safety, UI visibility, disabled project controls, and local-only overrides.

### Changed

- Updated portfolio startup to initialize rendering and interactions only when their registered features are enabled.
- Included Vercel API functions in the validated deployment artifact in preparation for Neon-backed configuration.

## [1.2.1] - 2026-05-25

### Fixed

- Corrected roadmap delivery statuses for the case study, architecture explorer, and private feedback features shipped in `v1.2.0`.
- Expanded release checklists to cover roadmap promotion, preview review, production verification, and GitHub release tagging.

## [1.2.0] - 2026-05-25

### Added

- Added expanded project detail dialogs with purpose and engineering notes, safe external actions, and a compact published GlassTube preview image.
- Added a viewer-controlled reduced-motion setting alongside the visual theme control.
- Added a product roadmap for interactive portfolio additions, with case-study and architecture exploration features shipped in this release.
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
- Refined private feedback delivery with a completed submission state and cleaner inbox labels for Formspree notifications.

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

[Unreleased]: https://github.com/manmohanml1/portfolio-website/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/manmohanml1/portfolio-website/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/manmohanml1/portfolio-website/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/manmohanml1/portfolio-website/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/manmohanml1/portfolio-website/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/manmohanml1/portfolio-website/releases/tag/v1.0.0
