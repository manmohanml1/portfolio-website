# Deployment Options

This portfolio is a static application: it needs only `index.html`, `styles.css`, and `src/` to deploy. No server, database, or paid build runtime is required.

## Good Free Hosts

| Provider | Best Fit | Initial Setup |
| --- | --- | --- |
| Vercel Hobby | Fastest GitHub-connected previews and simple custom domain setup for a personal project | Import the GitHub repository; set no build command and deploy the repository root |
| Cloudflare Pages Free | Strong static-site delivery and room for a lightweight long-lived portfolio | Connect the GitHub repository; deploy the repository root as static assets |
| Netlify Free | Simple Git deploys and deploy previews | Import from GitHub; publish the repository root with no build command |
| GitHub Pages | Fewest moving parts once the code is on GitHub | Enable Pages from the `main` branch root or add a Pages workflow |

## Recommendation

Start with **Cloudflare Pages** for a durable static portfolio, or **Vercel Hobby** if the most important experience is automatic preview URLs for each iteration. Both work naturally with this repository's static output.

## Environments

The current quality pipeline validates three logical environments:

| Application Environment | Use |
| --- | --- |
| `development` | Local changes and early experimentation |
| `staging` | Preview deployment reviewed before publishing |
| `production` | Public portfolio on the primary domain |

Once the hosting provider is selected, connect its preview deployment to pull requests and its production deployment to `main`.

## Release Habit

1. Create a feature branch for each meaningful improvement.
2. Add the user-visible change to `CHANGELOG.md` under `Unreleased`.
3. Open a pull request and allow the validation workflow to complete.
4. Merge to `main` after review and deploy to production.
5. At a milestone, move `Unreleased` entries into a dated version and create a GitHub release tag.

## Official Plan References

- [Vercel Hobby Plan](https://vercel.com/docs/accounts/plans/hobby)
- [Cloudflare Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Netlify Pricing](https://www.netlify.com/pricing/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages/getting-started-with-github-pages)

