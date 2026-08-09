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

`GET /api/config` returns the seven public feature flags used during portfolio startup. The endpoint supports only `GET`, exposes no secrets, and bypasses browser and edge caches so owner changes apply on the next page refresh. If the request fails or returns malformed data, the browser enables the complete checked-in experience.

## Browser Security And Safe Browsing

`vercel.json` applies a restrictive Content Security Policy, anti-framing controls, MIME-sniffing protection, a limited browser permissions policy, and explicit referrer handling. The owner page and admin APIs additionally return `no-store` and `X-Robots-Tag` headers. `robots.txt` excludes the owner workspace and admin API from normal crawling, while `sitemap.xml` lists only the public portfolio root.

If Google displays a deceptive-site or phishing warning:

1. Check the exact affected production or Preview hostname in [Google Safe Browsing Site Status](https://transparencyreport.google.com/safe-browsing/search).
2. Add the exact production URL-prefix property to Google Search Console and open **Security & Manual Actions → Security issues**.
3. Inspect every example URL. Confirm that the public page, `/admin.html`, third-party images, Formspree endpoint, and outbound project links match the expected repository configuration.
4. Deploy the security configuration and verify the response headers on the public page and `/admin.html`.
5. Request a review from the Security Issues report only after the corrected deployment is live. Google may take several days to propagate an approved review to browser warnings.

Security headers reduce exploitability and accidental data exposure, but they do not automatically remove an existing Safe Browsing classification. The production portfolio should eventually use a stable owned domain, and the owner Control Center can move to a separate restricted deployment if automated scanners continue to associate a password form with the public portfolio hostname.

### Neon Setup

1. Add Neon from the Vercel Marketplace and select its free plan. Keep it as a separate managed resource connected to the `portfolio-website` project.
2. In the Neon SQL Editor, run migrations in numeric order, then `db/seeds/001_feature_flags.sql`. Existing databases should apply any newer migration they have not yet run; v1.8 requires `db/migrations/003_create_project_publishing_queue.sql`, `db/migrations/004_add_project_evidence_drafts.sql`, and `db/migrations/005_publish_curated_project_baseline.sql`.
3. Copy the connection string for Neon's persistent `main` branch into a server-only Vercel variable named `FEATURE_CONFIG_DATABASE_URL`. Enable it for Preview and Production; never prefix it with `VITE_` or expose it in browser code.
4. Keep Neon's integration-managed `DATABASE_URL` if Preview database branches are useful for future schema or application-data testing. `/api/config` deliberately prefers `FEATURE_CONFIG_DATABASE_URL`, so those isolated branches do not fragment feature-flag control.
5. Redeploy the Preview. Its `/api/config` response should report `"environment":"staging"` and `"source":"database"`.
6. Change only the intended staging row on the persistent Neon branch, verify every Preview follows it on the next refresh, and restore it before production promotion.

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
2. Create the single owner identity through Neon's email sign-up API, then disable email sign-up while keeping email sign-in enabled. Do not use the Neon Console's **Create user** action for a password login: it creates a user record without a password credential. Never publish a permanent sign-up interface. Every non-owner account remains unauthorized by the portfolio APIs through the exact owner allowlist.
3. In the connected Neon/Vercel integration, enable Auth and Preview branching. Neon then injects a branch-correct `NEON_AUTH_BASE_URL` and registers each deployment origin automatically. The app derives the matching JWKS URL from that base URL so Preview tokens are never checked against Production signing keys. Auth users and settings clone with the database branch, while Preview sessions remain isolated from Production.
4. Confirm the integration-managed `NEON_AUTH_BASE_URL` exists in the Vercel Preview and Production environments. `NEON_AUTH_JWKS_URL` remains an optional legacy fallback only when no Auth base URL is available. `NEON_AUTH_ISSUER` and `NEON_AUTH_AUDIENCE` are optional additional checks and should be added only when those exact claims are declared by the issued token.
5. Add the exact identity to `ADMIN_OWNER_IDS` and optionally `ADMIN_OWNER_EMAILS`. The immutable Auth user id is preferred; email remains supported as an exact, case-normalized allowlist.
6. Add any additional stable portfolio origins to `ADMIN_TRUSTED_ORIGINS`, separated by commas. Vercel's immutable deployment, Git branch Preview, and production hostnames are trusted automatically from `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL`.
7. Do not add `ADMIN_LOCAL_TOKEN` to Vercel. It is a local-development credential and is rejected whenever `VERCEL_ENV` is present or `NODE_ENV=production`.
8. Redeploy, open `/admin.html`, sign in as the owner, change one staging flag, confirm the audit entry, and verify a Preview follows the new value on its next refresh.

The page is unlinked and marked `noindex`, but access control comes from server-side JWT verification and the exact owner allowlist. Each admin read and write repeats authorization. Production mutations also require a confirmation in the UI and stale updates receive a `409` conflict.

Neon's current Managed Better Auth service does not yet provide a built-in restricted-signup switch. The portfolio therefore exposes sign-in only and treats the API allowlist as the authorization boundary. Enable email verification when available, use `ADMIN_OWNER_IDS` for the owner, and remove any unexpected Auth users from Neon.

### Project Publishing Inbox Setup

1. Run `db/migrations/003_create_project_publishing_queue.sql`, `db/migrations/004_add_project_evidence_drafts.sql`, and `db/migrations/005_publish_curated_project_baseline.sql` against the persistent Neon database referenced by `FEATURE_CONFIG_DATABASE_URL`.
2. Optionally add a server-only `GITHUB_TOKEN` to Preview and Production. Use a fine-grained token with read access to public repository metadata only. Without it, manual sync still works within GitHub's lower unauthenticated rate limit.
3. Redeploy, sign in to `/admin.html`, open **Projects**, and select **Sync GitHub**. The 14 current checked-in repositories enter as the approved baseline; any other repository tagged `portfolio-showcase` enters the queue as `pending`. Sync extracts public README sections and repository languages to prefill a presentation and case-study draft.
4. Review the extracted evidence and generated claims, adjust the visitor-facing title, description, category, technology tags, case study, proposed cover image, accessible alternative text, and optional external demo link, then keep the project pending, approve it, or hide it.
5. Refresh the public portfolio after approval and confirm the project appears. Hidden and pending records must never be returned by `/api/projects`.

The publishing queue is intentionally global rather than split by development, staging, and production. Preview is used to review the UI and owner workflow, while the approval itself represents one publication decision that will follow the same code into Production. Status changes are owner-attributed in `portfolio_project_audit`, and stale reviews receive a `409` conflict rather than overwriting newer work.

Repository media discovery reads only public documentation and proposes candidates; it does not upload or mirror files. Selected images and demo URLs must use HTTPS. Images render with owner-reviewed alternative text, while videos open as external links so the portfolio does not inherit video storage, transcoding, consent, or autoplay complexity.

### Project Image Upload Setup

1. In the Vercel project, open **Storage**, create a **Blob** store named `portfolio-media`, and choose **Public** access because approved project images are displayed directly on the public portfolio.
2. Connect the Blob store to Preview and Production. New stores use Vercel OIDC automatically; an older store may provide `BLOB_READ_WRITE_TOKEN` instead. Keep every storage credential server-only.
3. Redeploy, sign in to the Control Center, expand a project's **Media** section, and choose **Upload from device**. JPEG, PNG, and WebP files up to 3 MB are accepted from desktop or mobile.
4. Add meaningful alternative text, review the preview, and select **Save changes**. Uploading creates the Blob object, while saving attaches its URL and alternative text to the Neon project record.

The upload endpoint repeats owner authentication, checks the mutation origin, validates the declared content type and file signature, and generates a randomized public Blob pathname. Localhost deliberately reports storage as unconfigured unless it is run with Vercel storage credentials; use a Vercel Preview for the complete upload test.

The checked-in curated portfolio remains the reliable baseline if Neon is unavailable. Dynamic GitHub additions fail closed to an empty set, so an outage cannot publish an unreviewed repository or remove the curated projects already shipped with the site.

Project content currently has two deliberate sources. `src/data/portfolio.js` is the checked-in baseline used for reliable public rendering. GitHub supplies repository metadata and README evidence, while Neon stores its synchronized queue record, generated drafts, owner overrides, publication status, review attribution, and audit history. An owner-reviewed Neon record can enrich a matching baseline project; an untouched baseline record is listed as published without replacing the stronger checked-in presentation.

### Control Center Analytics Setup

1. In the Vercel project, open **Analytics** and enable Web Analytics. Open **Speed Insights** and enable it for the same project.
2. Create a Vercel access token for the portfolio owner. Add it as the server-only `VERCEL_API_TOKEN` variable for Preview and Production. Never expose it with a `VITE_` prefix or return it from an API.
3. Add `VERCEL_PROJECT_ID` for the portfolio project and `VERCEL_TEAM_ID` for its owning team to Preview and Production. These are public identifiers, but keeping them in environment configuration makes the adapter portable and avoids relying on framework-specific system-variable exposure.
4. Optionally add `VERCEL_ANALYTICS_DASHBOARD_URL` with the direct project Analytics or Speed Insights URL. Without it, the Control Center links to the general Vercel dashboard.
5. Redeploy. Visit the public portfolio to begin collecting page views and real-user performance data; `/admin.html` is deliberately excluded from both collectors.
6. Sign in to `/admin.html`, open **Analytics**, and confirm 7-day and 30-day summaries load. New projects may show an empty state until Vercel processes initial visits.

The owner endpoint calls Vercel's aggregated Web Analytics API and returns only page views, visitors, daily trends, and ranked dimensions. The access token never reaches the browser. Speed Insights does not expose the same supported read API, so Core Web Vitals remain in Vercel's protected dashboard rather than relying on an undocumented endpoint.

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
