# Manmohan Lonawat Portfolio

Personal portfolio website presenting frontend, AI, and systems work in a theme-switchable interface. The site is built as a static web application with modular JavaScript, so it is lightweight to host and straightforward to extend.

## Highlights

- Interactive hero and project gallery with category filtering.
- Five distinct visual worlds: Swiss Grid, Interstellar, Studio Light, Terminal, and Neo Brutalist.
- Responsive navigation, an accessible theme selector, reduced-motion control, and back-to-top control.
- Project case-study dialogs with challenge/outcome context, interactive architecture explorers for selected systems, and curated visual previews when available.
- Private visitor suggestions from Contact or an individual project, delivered through a hosted form endpoint.
- Portfolio content separated from UI behavior for easier updates.
- Optional live inclusion of newly selected GitHub repositories through a repository topic.
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
src/services/      Public GitHub additions and feedback submission
src/utils/         Shared DOM helpers
tests/             Automated behavior and content checks
.github/workflows/ CI and release candidate packaging
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for extension guidance, [ROADMAP.md](ROADMAP.md) for planned interactive additions, and [CHANGELOG.md](CHANGELOG.md) for project history.

## Deployment

Production deployment is hosted on Vercel:

- Live site: [portfolio-website-pearl-eight-44.vercel.app](https://portfolio-website-pearl-eight-44.vercel.app)

The site remains a static deployment; private visitor feedback is delivered through Formspree. Setup notes and the deployment workflow are captured in [DEPLOYMENT.md](DEPLOYMENT.md).

## Add A New Project

New public GitHub repositories can be included without editing or redeploying the website:

1. Open the repository on GitHub and edit its **About** topics.
2. Add the topic `portfolio-showcase`.
3. Optionally add one classification topic: `portfolio-frontend`, `portfolio-backend`, `portfolio-data`, `portfolio-ai`, or `portfolio-wearable`.
4. Add a description, language, and relevant technology topics so the project card is informative.
5. Add `portfolio-live` only after verifying that the repository homepage points to a working deployed app.

The published website reads public GitHub repository metadata and appends newly tagged projects to the curated project list. Untagged repositories remain on your GitHub profile rather than appearing in the portfolio automatically. Repositories described as Meta Ray-Ban Display or glasses-first apps are also presented as wearable projects, because their interaction and display constraints differ from ordinary web apps.

Every included repository receives a project card and a baseline detail dialog from its public description and technology topics. Rich preview imagery and deeper implementation notes are deliberately curated in the portfolio source only when the repository publishes a trustworthy screenshot or documented project context; projects without imagery show content only rather than an empty placeholder.

## Private Feedback

Viewers can privately suggest improvements from Contact or from an individual project dialog. The browser submits the suggestion to the configured Formspree form, which forwards it to a private inbox. Submissions are not published or rendered as public reviews.

The current endpoint is configured in `src/services/feedback.js`. Formspree manages the notification destination and spam filtering; the form also includes its supported `_gotcha` honeypot field.

### Meta Display App Criteria

For a Meta Ray-Ban Display project, add `portfolio-showcase` and `portfolio-wearable`, then describe the device-specific user experience in the repository description. These projects should demonstrate:

- a 600 x 600 glasses-first display layout with readable high-contrast surfaces,
- focus and D-pad or gesture-driven navigation rather than touch-only interaction,
- lightweight, resilient loading behavior suitable for wearable hardware,
- `portfolio-live` only when a public HTTPS device-test or demo URL is currently working.

The current GlassTube detail view uses a small version of its committed repository screenshot. Autonomous Travel Guide and Glass Search expose expanded purpose and engineering context without reserving image space until screenshots are published in those repositories.

## Contribution Flow

The initial project is established on `main`. Future improvements should be developed on a short-lived feature branch, validated through GitHub Actions, recorded in the changelog, and merged through a pull request.

## Release Versioning

The small badge beside the site name identifies the currently deployed release. Its source of truth is `src/config/release.js`.

| Change Type | Pull Request Prefix | Version Change | Example |
| --- | --- | --- | --- |
| New user-facing feature | `feat:` | Minor version | `v1.0.0` -> `v1.1.0` |
| Small fix or polish update | `fix:` | Patch version | `v1.1.0` -> `v1.1.1` |
| Significant overhaul | `feat:` with a major-release note | Major version | `v1.11.0` -> `v2.0.0` |

Pull request titles are checked automatically and must begin with either `feat: ` or `fix: `.
