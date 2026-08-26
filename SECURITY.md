# Security Policy

## Supported Version

Security corrections are applied to the current production release on `main`.

## Reporting A Vulnerability

Do not open a public issue for a suspected vulnerability or exposed credential. Report it privately through GitHub's **Report a vulnerability** form when private vulnerability reporting is enabled for this repository. If that form is unavailable, use the private contact path on the portfolio website and avoid including secrets in the first message.

Include the affected URL or component, reproducible steps, expected impact, and any non-sensitive evidence. Please do not test against other users, attempt denial of service, access data beyond what is necessary to demonstrate the issue, or publish details before a correction is available.

## Security Boundaries

- The public portfolio never accepts account registration.
- Owner APIs require a Neon Auth token, exact owner allowlisting, and a trusted request origin.
- Database, GitHub, Vercel, and Blob credentials remain server-only.
- GitHub-derived project content remains a draft until owner review.
- Owner-enabled live previews run in sandboxed iframes without same-origin access.
