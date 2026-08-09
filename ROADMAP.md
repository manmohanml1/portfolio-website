# Portfolio Product Roadmap

This list tracks additions that make the site useful to explore, not simply more decorative.

## Interaction Additions

| Addition | Purpose | Status |
| --- | --- | --- |
| Runtime Feature Configuration | Separate deployment from availability through validated, fail-open configuration flags. | Shipped in v1.3.0 |
| Neon Configuration Store | Persist environment-specific flags and audit history without exposing database credentials to the browser. | Shipped in v1.4.0 |
| Admin Control Center | Let the portfolio owner update environment flags through an authenticated interface with audit history. | Shipped in v1.6.0 |
| Control Center Observability | Add owner-only Vercel Web Analytics summaries and protected Speed Insights access after the authenticated control plane ships. | Shipped in v1.7.0 |
| Evidence Explorer | Let visitors search verified projects, experience, skills, and credentials by technology or capability from the same surface used to browse work. | Ready for v1.8.0 Preview |
| Engineering Progression | Connect education, cloud backend work, enterprise delivery, platform operations, and wearable experiments in one career path. | Ready for v1.8.0 Preview |
| Curated Flagship Work | Lead with operated systems and distinctive wearable products, while giving every curated repository an honest implementation story and inspectable architecture path. | Ready for v1.8.0 Preview |
| Portfolio Layout Worlds | Render one evidence model through five independent, responsive portfolio compositions without duplicating content or interactions. | Ready for v1.8.0 Preview |
| Project Publishing Inbox | Stage newly tagged GitHub repositories for owner review, enrichment, and approval before public presentation. | Ready for v1.8.0 Preview |
| Project Media Curation | Extract repository image and demo candidates, then let the owner approve an accessible cover and optional external demo link. | Ready for v1.8.0 Preview |
| Database-First Project Catalog | Import every current project into the publishing inventory, preserve the checked-in fallback during parity review, then cut public presentation over to owner-reviewed Neon records. | In progress for v1.8.0 Preview |
| Owned Writing Hub | Publish canonical technical articles on the portfolio, then syndicate excerpts and links to LinkedIn or other networks without duplicating the source of truth. | Planned after v1.8.0 |
| Visitor Customization | Let viewers choose an audience lens and project layout locally within admin-enabled capabilities. | Shipped in v1.5.0 |
| Project Case Study Mode | Let viewers understand the problem, implementation choices, and result behind selected work. | Shipped in v1.2.0 |
| Architecture Explorer | Make backend, data, and product-system flows inspectable stage by stage. | Shipped in v1.2.0 |
| Role-Based Viewing | Curate complete hero, profile, stack, project, career, skills, metrics, and contact variants for general, backend, full-stack, cloud/data, or AI visitors. | Shipped in v1.5.0 |
| Command Palette | Provide fast keyboard navigation across projects, technologies, themes, and contact actions. | Planned |
| Live Tech Filter | Let a viewer choose a technology and see every relevant project immediately. | Planned |
| Project Timeline | Present the progression from interface work into APIs, data systems, and wearable or AI experiments. | Planned |
| Wearable Developer Lab | Provide a 600 by 600 device simulator and reusable focus-navigation patterns across selected Meta Display projects. | Planned for v1.9.0 |
| Operations & Resilience Lab | Pair private OpenTelemetry diagnostics with safe public failure and graceful-degradation scenarios. | Planned for v1.10.0 |
| Portfolio Evidence Service | Expose verified portfolio knowledge through a read-only Spring AI and MCP service. | Planned for v1.11.0 |
| Job Evidence Agent | Match role requirements to cited portfolio evidence and report honest capability gaps. | Planned for v1.12.0 |
| Visitor Feedback Channel | Collect structured private improvement suggestions; approved testimonials remain a later curation step. | Shipped in v1.2.0 |

## Delivery Notes

- Runtime configuration currently exposes seven Boolean flags and checked-in defaults; variants and targeting remain deliberately out of scope.
- A persistent Neon control-plane branch stores independent development, staging, and production values behind the existing read-only API contract.
- Vercel Preview databases remain isolated for safe future schema testing, while all Previews read the shared staging feature flags.
- Database changes are recorded automatically in `feature_audit`; the v1.6 owner workspace reads that history and uses optimistic writes to prevent stale updates.
- Neon Auth is introduced only for the v1.6 owner workspace with exact email/subject allowlists, trusted origins, and server-side JWT verification. The public site exposes no signup UI; the allowlist denies every non-owner identity while Neon Managed Better Auth permits signup by default.
- Analytics has its own owner-only Control Center tab in v1.7; Web Analytics aggregates pass through a protected server adapter, while real-user Core Web Vitals remain in Vercel's protected Speed Insights dashboard.
- Visitor preferences stay anonymous and device-local; theme, motion, audience lens, and project layout never enter Neon.
- General retains the complete portfolio; specialized audience lenses remove irrelevant evidence and replace page-wide positioning, while shareable `?view=` links open each curated variant without visitor accounts.
- Configuration failures must preserve the complete portfolio, and local URL overrides must never affect remote deployments.
- Database credentials and admin writes must remain behind Vercel Functions rather than browser code.
- Case studies remain curated for accuracy instead of being generated from incomplete repository metadata.
- Architecture explorers are used only where a real system flow can be explained clearly.
- The `portfolio-showcase` GitHub topic creates an owner review candidate; it never grants public visibility by itself. Only approved queue records are exposed by the public project API.
- Project moderation is global rather than environment-specific so one reviewed publication decision follows Preview into Production; every status transition is owner-attributed and audited.
- Repository sync extracts transparent GitHub evidence and generates an editable draft; owner approval remains mandatory because generated case-study language is never treated as verified merely because it was inferred.
- Repository media remains owner-curated: images are proposed from public project documentation, alternative text is editable, and video stays an external HTTPS demo link rather than an embedded upload system.
- Owner image uploads use public Vercel Blob storage; Neon stores only the resulting HTTPS URL and accessible description with the project record.
- The checked-in project catalog remains a temporary fallback during database parity review. Removing it is a separate cutover step after all 14 baseline records are synchronized and verified in Preview.
- A future Writing Hub should use the portfolio as the canonical article source and treat LinkedIn as distribution. It should remain a separate content workflow inside this Control Center until multiple unrelated products justify a standalone operations repository.
- Every shipped interaction should remain usable on mobile, keyboard accessible, and compatible with reduced motion.
- Visitor feedback should be privately submitted and moderated; the public portfolio should never expose an unreviewed comment feed.
- Shipped feedback routes suggestions privately through Formspree; testimonials remain a later opt-in curation decision.
