# Portfolio Architecture

This portfolio is a static, no-build site with modular ES modules and a hosted Formspree delivery endpoint for private feedback. It is intentionally lighter than a full Next.js or Astro app, while still leaving room for future features.

## Structure

- `index.html`: semantic page shell and persistent layout anchors.
- `styles.css`: current visual system, responsive layout, theme variables, and animations.
- `src/data/portfolio.js`: editable curated portfolio content, skills, and journey sections.
- `src/data/themes.js`: theme definitions used by the style switcher.
- `src/config/environment.js`: runtime environment resolution for local, staging/preview, and production hosts.
- `src/config/release.js`: visible production release version and release type badge metadata.
- `src/services/github-projects.js`: opt-in public GitHub repository discovery via `portfolio-showcase` topic.
- `src/services/feedback.js`: private suggestion requests from the browser to the configured Formspree endpoint.
- `src/render/`: DOM rendering modules for content sections.
- `src/features/`: interactive features such as theme switching, motion preference, project and feedback dialogs, card tilt, and back-to-top.
- `src/utils/`: small shared utilities.
- `tests/`: data integrity tests that catch broken projects, missing themes, and incomplete section content.
- `.github/workflows/quality.yml`: CI quality gate and deployable static artifact packaging.
- `.github/workflows/release-candidate.yml`: manually packages a validated artifact for a selected environment.
- `CHANGELOG.md`: user-visible project history and the next release queue.
- `ROADMAP.md`: interaction ideas and delivery status for future portfolio expansion.
- `DEPLOYMENT.md`: static hosting choices and release flow.

## Why This Shape

The nearby Codex projects use a similar separation of concerns: configs, services, components, security/helpers, and tests. For a portfolio, the equivalent is data, renderers, interactions, and verification.

This is not as heavy as a framework, but it avoids the worst static-site problem: one giant file where every future change risks unrelated behavior.

The current theme registry chooses visible worlds and persists a viewer preference. Ambient artwork is opt-in for an individual world, so a scene such as Interstellar's black hole does not leak into cleaner modes. The visual rules still live in CSS because they alter composition, atmosphere, typography, and responsive behavior rather than merely tokens.

## Update Checklist

1. Update curated content in `src/data/portfolio.js`, or tag a public repository `portfolio-showcase` for live inclusion.
2. Add or adjust themes in `src/data/themes.js`.
3. Keep rendering logic in `src/render/`.
4. Keep interaction logic in `src/features/`.
5. Record meaningful user-visible changes under `Unreleased` in `CHANGELOG.md`.
6. Promote delivered feature status in `ROADMAP.md` when applicable.
7. Update `src/config/release.js` according to the versioning policy.
8. Title the pull request with `feat:` or `fix:`.
9. Run `node scripts/check.mjs` and `node --test`.
10. Preview in browser at desktop and mobile widths.
11. After production deployment, create the matching GitHub release tag and confirm the public badge and release records agree.

## Environments

The static client resolves three supported environments:

- `development`: `localhost` or `127.0.0.1`.
- `staging`: hostnames containing `staging` or `preview`.
- `production`: any deployed public hostname not matching staging rules.

For local testing only, load `?env=staging` or `?env=production` to exercise an environment before deployment.

## GitHub Project Inclusion

Curated flagship projects remain in `src/data/portfolio.js`. Additional public repositories are fetched from GitHub at runtime and rendered only when explicitly tagged `portfolio-showcase`. Optional category topics (`portfolio-frontend`, `portfolio-backend`, `portfolio-data`, `portfolio-ai`, `portfolio-wearable`) place a project into the matching filter. Descriptions that clearly identify a Meta Ray-Ban Display or glasses-first application also map to the wearable presentation automatically.

Live application links for fetched projects require the additional `portfolio-live` topic, so a stale GitHub homepage does not advertise an unavailable demo. This keeps inclusion intentional and avoids requiring a deployment for each new selected repository. If the public GitHub API is temporarily unavailable or rate limited, the curated project set continues to render.

Wearable entries are intentionally different from normal web-app cards. A Meta Display project should identify its glasses-first interaction, constrained 600 x 600 presentation, and focus/D-pad navigation in its repository metadata; the portfolio can then communicate the device work instead of presenting it as generic JavaScript.

Each fetched repository gets a baseline details view from stable GitHub metadata. Rich summaries and preview images are opt-in enrichments defined alongside curated project data or known-display presentation mapping, and should reference only published repository assets. Missing images are omitted instead of rendered as placeholders. This avoids making live-page rendering dependent on fragile README parsing or unverified image selection.

## Visitor Feedback

Phase 1 keeps suggestions private and deliberately small in scope:

1. Contact and project dialogs open the same accessible feedback form.
2. The client sends a category, optional project context, suggestion, and optional consented reply email to Formspree.
3. Formspree forwards accepted submissions privately and applies its hosted spam filtering; the form includes its `_gotcha` honeypot field.
4. Nothing is rendered publicly or saved to a database.

The Formspree endpoint is public by design and does not require a custom domain, DNS records, or Vercel secrets. A private database and manually approved testimonials are possible later, but are intentionally outside Phase 1.

## Pipeline

The GitHub Actions quality workflow runs on pull requests, pushes to `main`/`develop`, and manual dispatch:

1. Test all three environments on Node.js 20 and 22.
2. Syntax-check every application module.
3. Run automated test coverage for data integrity, themes, filters, feedback form contracts, environment resolution, and HTML accessibility contracts.
4. Package static deployment assets after every matrix check passes.

The manual `Prepare Release Candidate` workflow selects a GitHub Environment (`development`, `staging`, or `production`) and packages a validated artifact. Configure required reviewers for the `production` environment in repository settings.

Once a hosting provider is chosen, add a deployment step that consumes the validated artifact:

- preview or development branches -> preview/staging environment,
- `main` -> production environment with approval protection if desired.

## Git Workflow

`main` is the stable, public portfolio branch. After the initial repository publish, keep future work on focused feature branches and merge through pull requests so the automated checks guard every update. Pull request titles must use `feat:` for functionality and `fix:` for corrections. The changelog provides a readable history independent of individual commits.

## Release Versioning

- `feat:` increments the minor release, such as `v1.0.0` to `v1.1.0`.
- `fix:` increments the patch release, such as `v1.1.0` to `v1.1.1`.
- A major overhaul uses a `feat:` pull request and increments the major release, such as `v1.11.0` to `v2.0.0`.

Update `src/config/release.js` and the changelog together so the header badge always represents the deployed release.

## When To Move To A Framework

Move to Astro, Vite, or Next.js when you want:

- separate component files with templates per section,
- image optimization,
- route-level case studies,
- MD/MDX project pages,
- deployment previews with typed build checks.

For the current one-page portfolio, this no-build modular setup is a practical middle ground.

## Next Structural Extraction

The JavaScript is now split by responsibility. The main remaining large file is `styles.css`, because five visual worlds and their scene artwork share the same component surfaces. If theme work continues, split it into:

- `src/styles/tokens.css`: shared spacing, typography, and surface tokens,
- `src/styles/themes.css`: theme-specific variable overrides and ambient scenes,
- `src/styles/components.css`: cards, navigation, controls, and sections,
- `src/styles/responsive.css`: breakpoint behavior.

That is the right next refactor when additional design variants or new pages are introduced; it is not required to ship the current single-page site.
