# Vercel Deployment

This portfolio uses a static browser application plus `api/config.js`, a read-only Vercel Function that serves validated runtime feature defaults. Private feedback is forwarded through Formspree. The current configuration foundation does not yet require a database, email domain, or paid build runtime.

## Production

- Provider: Vercel Hobby
- Project: `portfolio-website`
- Production URL: [portfolio-website-pearl-eight-44.vercel.app](https://portfolio-website-pearl-eight-44.vercel.app)
- Production branch: `main`

## Git Deployment Connection

The initial production deployment was published through the Vercel CLI, and the Vercel project is now connected to GitHub:

- GitHub repository: [manmohanml1/portfolio-website](https://github.com/manmohanml1/portfolio-website)
- Vercel project: `portfolio-website`

Pushes to `main` deploy production. Feature branches and pull requests create Vercel preview deployments for review before merge.

## Environments

The current quality pipeline validates three logical environments:

| Application Environment | Use |
| --- | --- |
| `development` | Local changes and early experimentation |
| `staging` | Preview deployment reviewed before publishing |
| `production` | Public portfolio on the primary domain |

Vercel preview deployments are connected to feature branches and pull requests, while production deployments are connected to `main`.

## Runtime Configuration

`GET /api/config` returns the six public feature flags used during portfolio startup. The endpoint supports only `GET`, exposes no secrets, and uses a short edge-cache window. If the request fails or returns malformed data, the browser enables the complete checked-in experience.

The next infrastructure slice will connect this endpoint to Neon through a server-only `DATABASE_URL`. Until that change ships, there are no configuration environment variables to add in Vercel.

## Private Feedback Setup

The feedback modal posts privately to the Formspree form configured in `src/services/feedback.js`:

```text
https://formspree.io/f/mwvzrbpb
```

There are no Vercel environment variables for this setup. In Formspree, verify the notification inbox for the `Portfolio Feedback` form and manage submission notifications there. The page includes the `_gotcha` honeypot field recognized by Formspree, and no submissions are exposed as a public reviews feed.

After deploying the feature to a Vercel Preview URL, submit one test suggestion and confirm that Formspree delivers it to your configured inbox before merging to production.

## Release Habit

1. Create a feature branch for each meaningful improvement.
2. Add the user-visible change to `CHANGELOG.md` under `Unreleased`.
3. Update `ROADMAP.md` when a planned or in-review capability is included in the release.
4. Update `src/config/release.js`, open a `feat:` or `fix:` pull request, and allow validation to complete.
5. Review the Vercel Preview at desktop and mobile sizes; exercise integrations such as feedback when they changed.
6. Merge to `main` after review and verify the Vercel production deployment and public release badge.
7. Create the matching GitHub release tag on the production merge commit.
8. Confirm the pull request checklist, changelog, roadmap status, live badge, and GitHub release page tell the same release story.

## Official References

- [Vercel Hobby Plan](https://vercel.com/docs/accounts/plans/hobby)
- [Vercel Deployments](https://vercel.com/docs/deployments)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
