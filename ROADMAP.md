# Portfolio Product Roadmap

This list tracks additions that make the site useful to explore, not simply more decorative.

## Interaction Additions

| Addition | Purpose | Status |
| --- | --- | --- |
| Runtime Feature Configuration | Separate deployment from availability through validated, fail-open configuration flags. | Shipped in v1.3.0 |
| Neon Configuration Store | Persist environment-specific flags and audit history without exposing database credentials to the browser. | Shipped in v1.4.0 |
| Admin Control Center | Let the portfolio owner update environment flags through an authenticated interface with audit history. | In development for v1.6.0 |
| Control Center Observability | Add owner-only Vercel Web Analytics and Speed Insights summaries after the authenticated control plane ships. | Planned for v1.7.0 |
| Visitor Customization | Let viewers choose an audience lens and project layout locally within admin-enabled capabilities. | Shipped in v1.5.0 |
| Project Case Study Mode | Let viewers understand the problem, implementation choices, and result behind selected work. | Shipped in v1.2.0 |
| Architecture Explorer | Make backend, data, and product-system flows inspectable stage by stage. | Shipped in v1.2.0 |
| Role-Based Viewing | Curate complete hero, profile, stack, project, career, skills, metrics, and contact variants for general, backend, full-stack, cloud/data, or AI visitors. | Shipped in v1.5.0 |
| Command Palette | Provide fast keyboard navigation across projects, technologies, themes, and contact actions. | Planned |
| Live Tech Filter | Let a viewer choose a technology and see every relevant project immediately. | Planned |
| Project Timeline | Present the progression from interface work into APIs, data systems, and wearable or AI experiments. | Planned |
| Visitor Feedback Channel | Collect structured private improvement suggestions; approved testimonials remain a later curation step. | Shipped in v1.2.0 |

## Delivery Notes

- Runtime configuration currently exposes seven Boolean flags and checked-in defaults; variants and targeting remain deliberately out of scope.
- A persistent Neon control-plane branch stores independent development, staging, and production values behind the existing read-only API contract.
- Vercel Preview databases remain isolated for safe future schema testing, while all Previews read the shared staging feature flags.
- Database changes are recorded automatically in `feature_audit`; the v1.6 owner workspace reads that history and uses optimistic writes to prevent stale updates.
- Neon Auth is introduced only for the v1.6 owner workspace with exact email/subject allowlists, trusted origins, server-side JWT verification, and public registration disabled.
- Audit history has its own Control Center tab; analytics remains a separate v1.7 integration so v1.6 can validate authentication and writes without also introducing a Vercel API token.
- Visitor preferences stay anonymous and device-local; theme, motion, audience lens, and project layout never enter Neon.
- General retains the complete portfolio; specialized audience lenses remove irrelevant evidence and replace page-wide positioning, while shareable `?view=` links open each curated variant without visitor accounts.
- Configuration failures must preserve the complete portfolio, and local URL overrides must never affect remote deployments.
- Database credentials and admin writes must remain behind Vercel Functions rather than browser code.
- Case studies remain curated for accuracy instead of being generated from incomplete repository metadata.
- Architecture explorers are used only where a real system flow can be explained clearly.
- Every shipped interaction should remain usable on mobile, keyboard accessible, and compatible with reduced motion.
- Visitor feedback should be privately submitted and moderated; the public portfolio should never expose an unreviewed comment feed.
- Shipped feedback routes suggestions privately through Formspree; testimonials remain a later opt-in curation decision.
