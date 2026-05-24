# Portfolio Architecture

This portfolio is a static, no-build site with modular ES modules. It is intentionally lighter than a full Next.js or Astro app, while still leaving room for future features.

## Structure

- `index.html`: semantic page shell and persistent layout anchors.
- `styles.css`: current visual system, responsive layout, theme variables, and animations.
- `src/data/portfolio.js`: editable curated portfolio content, skills, and journey sections.
- `src/data/themes.js`: theme definitions used by the style switcher.
- `src/config/environment.js`: runtime environment resolution for local, staging/preview, and production hosts.
- `src/services/github-projects.js`: opt-in public GitHub repository discovery via `portfolio-showcase` topic.
- `src/render/`: DOM rendering modules for content sections.
- `src/features/`: interactive features such as theme switching, reveal animation, card tilt, cursor light, and back-to-top.
- `src/utils/`: small shared utilities.
- `tests/`: data integrity tests that catch broken projects, missing themes, and incomplete section content.
- `.github/workflows/quality.yml`: CI quality gate and deployable static artifact packaging.
- `.github/workflows/release-candidate.yml`: manually packages a validated artifact for a selected environment.
- `CHANGELOG.md`: user-visible project history and the next release queue.
- `DEPLOYMENT.md`: static hosting choices and release flow.

## Why This Shape

The nearby Codex projects use a similar separation of concerns: configs, services, components, security/helpers, and tests. For a portfolio, the equivalent is data, renderers, interactions, and verification.

This is not as heavy as a framework, but it avoids the worst static-site problem: one giant file where every future change risks unrelated behavior.

## Update Checklist

1. Update curated content in `src/data/portfolio.js`, or tag a public repository `portfolio-showcase` for live inclusion.
2. Add or adjust themes in `src/data/themes.js`.
3. Keep rendering logic in `src/render/`.
4. Keep interaction logic in `src/features/`.
5. Record meaningful user-visible changes under `Unreleased` in `CHANGELOG.md`.
6. Run `node scripts/check.mjs` and `node --test`.
7. Preview in browser at desktop and mobile widths.

## Environments

The static client resolves three supported environments:

- `development`: `localhost` or `127.0.0.1`.
- `staging`: hostnames containing `staging` or `preview`.
- `production`: any deployed public hostname not matching staging rules.

For local testing only, load `?env=staging` or `?env=production` to exercise an environment before deployment.

## GitHub Project Inclusion

Curated flagship projects remain in `src/data/portfolio.js`. Additional public repositories are fetched from GitHub at runtime and rendered only when explicitly tagged `portfolio-showcase`. Optional category topics (`portfolio-frontend`, `portfolio-backend`, `portfolio-data`, `portfolio-ai`) place a project into the matching filter.

This keeps inclusion intentional and avoids requiring a deployment for each new selected repository. If the public GitHub API is temporarily unavailable or rate limited, the curated project set continues to render.

## Pipeline

The GitHub Actions quality workflow runs on pull requests, pushes to `main`/`develop`, and manual dispatch:

1. Test all three environments on Node.js 20 and 22.
2. Syntax-check every application module.
3. Run automated test coverage for data integrity, themes, filters, environment resolution, and HTML accessibility contracts.
4. Package a static deployment artifact after every matrix check passes.

The manual `Prepare Release Candidate` workflow selects a GitHub Environment (`development`, `staging`, or `production`) and packages a validated artifact. Configure required reviewers for the `production` environment in repository settings.

Once a hosting provider is chosen, add a deployment step that consumes the validated artifact:

- preview or development branches -> preview/staging environment,
- `main` -> production environment with approval protection if desired.

## Git Workflow

`main` is the stable, public portfolio branch. After the initial repository publish, keep future work on focused feature branches and merge through pull requests so the automated checks guard every update. The changelog provides a readable history independent of individual commits.

## When To Move To A Framework

Move to Astro, Vite, or Next.js when you want:

- separate component files with templates per section,
- image optimization,
- route-level case studies,
- MD/MDX project pages,
- deployment previews with typed build checks.

For the current one-page portfolio, this no-build modular setup is a practical middle ground.

## Next Structural Extraction

The JavaScript is now split by responsibility. The main remaining large file is `styles.css`, because ten visual themes and their scene artwork share the same component surfaces. If theme work continues, split it into:

- `src/styles/tokens.css`: shared spacing, typography, and surface tokens,
- `src/styles/themes.css`: theme-specific variable overrides and ambient scenes,
- `src/styles/components.css`: cards, navigation, controls, and sections,
- `src/styles/responsive.css`: breakpoint behavior.

That is the right next refactor when additional design variants or new pages are introduced; it is not required to ship the current single-page site.
