# Portfolio Product Roadmap

This list tracks additions that make the site useful to explore, not simply more decorative.

## Interaction Additions

| Addition | Purpose | Status |
| --- | --- | --- |
| Runtime Feature Configuration | Separate deployment from availability through validated, fail-open configuration flags. | Shipped in v1.3.0 |
| Neon Configuration Store | Persist environment-specific flags and audit history without exposing database credentials to the browser. | Shipped in v1.4.0 |
| Admin Control Center | Let the portfolio owner update production flags through an authenticated interface. | Planned |
| Visitor Customization | Let viewers choose an audience lens and project layout locally within admin-enabled capabilities. | In preview review for v1.5.0 |
| Project Case Study Mode | Let viewers understand the problem, implementation choices, and result behind selected work. | Shipped in v1.2.0 |
| Architecture Explorer | Make backend, data, and product-system flows inspectable stage by stage. | Shipped in v1.2.0 |
| Role-Based Viewing | Reorder hero, stack, projects, skills, and career evidence for general, backend, full-stack, cloud/data, or AI visitors. | In preview review for v1.5.0 |
| Command Palette | Provide fast keyboard navigation across projects, technologies, themes, and contact actions. | Planned |
| Live Tech Filter | Let a viewer choose a technology and see every relevant project immediately. | Planned |
| Project Timeline | Present the progression from interface work into APIs, data systems, and wearable or AI experiments. | Planned |
| Visitor Feedback Channel | Collect structured private improvement suggestions; approved testimonials remain a later curation step. | Shipped in v1.2.0 |

## Delivery Notes

- Runtime configuration currently exposes seven Boolean flags and checked-in defaults; variants and targeting remain deliberately out of scope.
- A persistent Neon control-plane branch stores independent development, staging, and production values behind the existing read-only API contract.
- Vercel Preview databases remain isolated for safe future schema testing, while all Previews read the shared staging feature flags.
- Database changes are recorded automatically in `feature_audit`; a dedicated admin interface remains a separate later feature.
- Neon Auth remains disabled until the Admin Control Center includes explicit owner authorization and restricted account creation.
- Visitor preferences stay anonymous and device-local; theme, motion, audience lens, and project layout never enter Neon.
- Audience lenses reorder the full portfolio while category filters remain temporary; shareable `?view=` links can open a tailored starting point without visitor accounts.
- Configuration failures must preserve the complete portfolio, and local URL overrides must never affect remote deployments.
- Database credentials and admin writes must remain behind Vercel Functions rather than browser code.
- Case studies remain curated for accuracy instead of being generated from incomplete repository metadata.
- Architecture explorers are used only where a real system flow can be explained clearly.
- Every shipped interaction should remain usable on mobile, keyboard accessible, and compatible with reduced motion.
- Visitor feedback should be privately submitted and moderated; the public portfolio should never expose an unreviewed comment feed.
- Shipped feedback routes suggestions privately through Formspree; testimonials remain a later opt-in curation decision.
