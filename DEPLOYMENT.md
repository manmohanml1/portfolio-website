# Vercel Deployment

This portfolio uses a static browser application plus Vercel Functions for public configuration reads and authenticated owner updates. Private feedback is forwarded through Formspree. Neon is optional for the public portfolio and its free plan is sufficient for this configuration workload; a missing database connection safely restores checked-in defaults.

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
| `staging` | Shared configuration scope used by Vercel Preview deployments |
| `production` | Public portfolio on the primary domain |

Vercel preview deployments are connected to feature branches and pull requests, while production deployments are connected to `main`.

## Runtime Configuration

`GET /api/config` returns the seven public feature flags used during portfolio startup. The endpoint supports only `GET`, exposes no secrets, and uses a short edge-cache window for database-backed responses. If the request fails or returns malformed data, the browser enables the complete checked-in experience.

### Neon Setup

1. Add Neon from the Vercel Marketplace and select its free plan. Keep it as a separate managed resource connected to the `portfolio-website` project.
2. In the Neon SQL Editor, run migrations in numeric order, then `db/seeds/001_feature_flags.sql`. Existing v1.4 databases should run `db/migrations/002_add_visitor_customization_flag.sql` for the v1.5 rollout flag.
3. Copy the connection string for Neon's persistent `main` branch into a server-only Vercel variable named `FEATURE_CONFIG_DATABASE_URL`. Enable it for Preview and Production; never prefix it with `VITE_` or expose it in browser code.
4. Keep Neon's integration-managed `DATABASE_URL` if Preview database branches are useful for future schema or application-data testing. `/api/config` deliberately prefers `FEATURE_CONFIG_DATABASE_URL`, so those isolated branches do not fragment feature-flag control.
5. Redeploy the Preview. Its `/api/config` response should report `"environment":"staging"` and `"source":"database"`.
6. Change only the intended staging row on the persistent Neon branch, verify every Preview follows it after the short cache window, and restore it before production promotion.

The schema stores all three environment scopes in one persistent configuration database. A unique `(key, environment)` constraint keeps their values separate. Neon may still create isolated database branches for Vercel Previews, but those branches are intentionally ignored by the configuration reader when `FEATURE_CONFIG_DATABASE_URL` is present.

Use parameterized SQL to control values directly during this phase:

```sql
UPDATE feature_flags
SET enabled = FALSE
WHERE key = 'features.feedback.enabled'
  AND environment = 'staging';
```

Every insert or meaningful update creates a `feature_audit` record automatically. The Admin Control Center provides authenticated writes without changing the public read contract.

The deployment should expose `FEATURE_CONFIG_DATABASE_URL` server-side. It may also expose Neon's integration-managed `DATABASE_URL`; neither connection string belongs in browser code.

### Admin Control Center Setup

1. In the Neon Console, select the intended persistent branch, open **Auth**, and enable Managed Better Auth with email/password authentication.
2. Create the single owner identity. Neon currently allows sign-up by default, so do not publish a sign-up interface. Every non-owner account remains unauthorized by the portfolio APIs through the exact owner allowlist.
3. In the connected Neon/Vercel integration, enable Auth and Preview branching. Neon then injects branch-correct `NEON_AUTH_BASE_URL` and `NEON_AUTH_JWKS_URL` values and registers each deployment origin automatically. Auth users and settings clone with the database branch, while Preview sessions remain isolated from Production.
4. Confirm those two integration-managed variables exist in the Vercel Preview and Production environments. `NEON_AUTH_ISSUER` and `NEON_AUTH_AUDIENCE` are optional additional checks and should be added only when those exact claims are declared by the issued token.
5. Add the exact identity to `ADMIN_OWNER_IDS` and optionally `ADMIN_OWNER_EMAILS`. The immutable Auth user id is preferred; email remains supported as an exact, case-normalized allowlist.
6. Add any additional stable portfolio origins to `ADMIN_TRUSTED_ORIGINS`, separated by commas. Vercel's current deployment and production hostnames are trusted automatically from their system variables.
7. Do not add `ADMIN_LOCAL_TOKEN` to Vercel. It is a local-development credential and is rejected whenever `VERCEL_ENV` is present or `NODE_ENV=production`.
8. Redeploy, open `/admin.html`, sign in as the owner, change one staging flag, confirm the audit entry, and verify a Preview follows the new value after the public configuration cache expires.

The page is unlinked and marked `noindex`, but access control comes from server-side JWT verification and the exact owner allowlist. Each admin read and write repeats authorization. Production mutations also require a confirmation in the UI and stale updates receive a `409` conflict.

Neon's current Managed Better Auth service does not yet provide a built-in restricted-signup switch. The portfolio therefore exposes sign-in only and treats the API allowlist as the authorization boundary. Enable email verification when available, use `ADMIN_OWNER_IDS` for the owner, and remove any unexpected Auth users from Neon.

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
- [Neon Vercel Integration](https://vercel.com/marketplace/neon)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon Auth](https://neon.com/docs/neon-auth)
- [Neon Auth Flow](https://neon.com/docs/auth/authentication-flow)
