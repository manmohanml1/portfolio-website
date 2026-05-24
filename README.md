# Manmohan Lonawat Portfolio

Personal portfolio website presenting frontend, AI, and systems work in a spatial, theme-switchable interface. The site is built as a static web application with modular JavaScript, so it is lightweight to host and straightforward to extend.

## Highlights

- Interactive hero and project gallery with category filtering.
- Ten visual modes, including spatial, interstellar, light, dark, and terminal themes.
- Responsive navigation, accessible theme selector, and back-to-top control.
- Portfolio content separated from UI behavior for easier updates.
- Automated validation across development, staging, and production environment rules.

## Local Preview

```bash
node dev-server.mjs
```

Open `http://localhost:4173`.

Local environment previews:

```text
http://localhost:4173/?env=staging
http://localhost:4173/?env=production
```

## Verification

```bash
node scripts/check.mjs
node --test
```

GitHub Actions repeats these checks across supported Node versions and environment modes before producing a static release artifact.

## Project Structure

```text
src/config/        Runtime environment rules
src/data/          Portfolio content and theme catalog
src/features/      User interaction behavior
src/render/        Section and project rendering
src/utils/         Shared DOM helpers
tests/             Automated behavior and content checks
.github/workflows/ CI and release candidate packaging
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for extension guidance and [CHANGELOG.md](CHANGELOG.md) for project history.

## Deployment

This is a static site, so it can be hosted on a free static hosting platform without a backend runtime. Recommended options and initial setup notes are captured in [DEPLOYMENT.md](DEPLOYMENT.md).

## Contribution Flow

The initial project is established on `main`. Future improvements should be developed on a short-lived feature branch, validated through GitHub Actions, recorded under `Unreleased` in the changelog, and merged through a pull request.

