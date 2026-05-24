# Vercel Deployment

This portfolio is a static application: it needs only `index.html`, `styles.css`, and `src/` to deploy. No server, database, or paid build runtime is required.

## Production

- Provider: Vercel Hobby
- Project: `portfolio-website`
- Production URL: [portfolio-website-pearl-eight-44.vercel.app](https://portfolio-website-pearl-eight-44.vercel.app)
- Production branch: `main`

## Git Deployment Connection

The initial production deployment has been published through the Vercel CLI. Automatic deploys from GitHub still require adding GitHub as a Vercel login connection, then connecting:

- GitHub repository: [manmohanml1/portfolio-website](https://github.com/manmohanml1/portfolio-website)
- Vercel project: `portfolio-website`

After the GitHub connection is authorized in Vercel, pushes to `main` should deploy production and feature branches or pull requests should generate preview deployments.

## Environments

The current quality pipeline validates three logical environments:

| Application Environment | Use |
| --- | --- |
| `development` | Local changes and early experimentation |
| `staging` | Preview deployment reviewed before publishing |
| `production` | Public portfolio on the primary domain |

Connect Vercel preview deployments to pull requests and production deployment to `main` after the GitHub login connection is available.

## Release Habit

1. Create a feature branch for each meaningful improvement.
2. Add the user-visible change to `CHANGELOG.md` under `Unreleased`.
3. Open a pull request and allow the validation workflow to complete.
4. Merge to `main` after review and deploy to production.
5. At a milestone, move `Unreleased` entries into a dated version and create a GitHub release tag.

## Official References

- [Vercel Hobby Plan](https://vercel.com/docs/accounts/plans/hobby)
- [Vercel Deployments](https://vercel.com/docs/deployments)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
