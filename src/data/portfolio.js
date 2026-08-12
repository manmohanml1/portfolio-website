export const projects = [
  {
    title: "Portfolio Operations Platform",
    repo: "https://github.com/manmohanml1/portfolio-website",
    live: "https://portfolio-website-pearl-eight-44.vercel.app/",
    type: "Platform",
    category: "backend",
    audiences: ["backend", "fullstack", "data", "ai"],
    featured: true,
    description:
      "An operated portfolio platform with Neon-backed runtime configuration, owner authentication, audit history, protected analytics, automated tests, and preview-to-production delivery.",
    tags: ["Node.js", "Neon PostgreSQL", "JWT", "Vercel", "GitHub Actions"],
    visual: "Control plane",
    accent: "#2563eb",
    details: {
      caseStudy: true,
      summary:
        "A personal portfolio that evolved into a small production system with separate public, configuration, and owner-control boundaries.",
      purpose:
        "Keeps the public portfolio focused while allowing environment-specific capabilities, analytics, and operational controls to change without exposing privileged access.",
      challenge:
        "Introduce real configuration and owner operations without turning a lightweight public site into an unsafe or unnecessarily heavy application.",
      build:
        "Built as a static-first modular frontend with Vercel Functions, Neon PostgreSQL, Neon Auth, server-side JWT verification, exact owner authorization, and GitHub Actions quality gates.",
      engineering:
        "The design separates public reads from authenticated writes, records configuration changes automatically, rejects stale updates, and keeps secrets behind server-only adapters.",
      outcome:
        "A release-managed platform that demonstrates authentication, API security, database design, environment isolation, observability, and CI/CD through a working public product.",
      highlights: ["Runtime feature flags", "Owner control center", "Audit history", "Protected analytics", "Automated delivery"],
      architecture: {
        title: "Portfolio control path",
        steps: [
          {
            label: "Public portfolio",
            role: "Experience",
            detail: "Static-first pages render curated work while anonymous preferences remain local to the visitor's device.",
          },
          {
            label: "Vercel Functions",
            role: "Boundary",
            detail: "Read-only configuration and protected owner APIs validate requests before accessing external services or data.",
          },
          {
            label: "Neon",
            role: "Control plane",
            detail: "PostgreSQL stores environment-specific flags and audit history while Neon Auth issues the owner identity.",
          },
          {
            label: "GitHub + Vercel",
            role: "Delivery",
            detail: "Automated checks, Preview deployments, release records, and production promotion guard every meaningful update.",
          },
        ],
      },
    },
  },
  {
    title: "CommitQuest",
    repo: "https://github.com/manmohanml1/commitquest",
    type: "Interactive product",
    category: "frontend",
    audiences: ["fullstack", "ai"],
    featured: true,
    description:
      "An evidence-backed repository visualization product that turns issues, pull requests, tests, workflows, roadmaps, and releases into an explorable engineering world.",
    tags: ["Angular", "Phaser", "Accessibility", "GitHub Actions", "Evidence design"],
    visual: "Repository world",
    accent: "#65f4c5",
    details: {
      caseStudy: true,
      summary:
        "A standalone product for presenting real repository work as an engaging engineering campaign without replacing the evidence behind it.",
      purpose:
        "Makes the story and structure of a software project easier to understand while keeping GitHub as the source of truth for every verified claim.",
      challenge:
        "Repository evidence is distributed across code, pull requests, tests, workflows, releases, and planning documents. The experience needed to connect those signals without rewarding activity volume, inventing achievements, or making essential information depend on a game canvas.",
      build:
        "Built with Angular 21 for the accessible application and evidence surfaces, plus a lazy-loaded Phaser 4 world. The v0.2 reference campaign, Portfolio Citadel, maps six verified repository responsibilities to distinct scalable landmarks alongside candidate quests, merged encounters, and release chapters.",
      engineering:
        "The campaign projection, mapping algorithm, and scoring rules are versioned independently. Roadmap candidates stay visibly separate from verified outcomes, Phaser remains an optional visual layer, and primary-source links preserve the path back to GitHub evidence.",
      outcome:
        "Version 0.2.0 is released with six explorable regions, eight candidate quests, four verified encounters, four release chapters, responsive keyboard-accessible navigation, green CI and security checks, and an immutable release artifact. Public repository generation is planned for v0.3.0.",
      highlights: [
        "Evidence-backed campaigns",
        "Six scalable landmarks",
        "Accessible interaction model",
        "Versioned projections",
        "Immutable v0.2.0 release",
      ],
      preview: {
        src: "https://raw.githubusercontent.com/manmohanml1/commitquest/v0.2.0/apps/web/public/og.png",
        alt: "CommitQuest repository world with connected engineering landmarks",
      },
      architecture: {
        title: "Repository-to-campaign projection",
        steps: [
          {
            label: "Repository evidence",
            role: "Source of truth",
            detail:
              "Issues, roadmap entries, pull requests, tests, workflows, and releases provide the traceable inputs for a campaign.",
          },
          {
            label: "Versioned projection",
            role: "Domain model",
            detail:
              "Deterministic mapping keeps candidate plans, verified outcomes, schema compatibility, and scoring rules explicit.",
          },
          {
            label: "Accessible campaign",
            role: "Experience",
            detail:
              "Angular renders the authoritative controls and evidence while Phaser supplies the scalable visual world and landmark interaction.",
          },
          {
            label: "Primary evidence",
            role: "Trust",
            detail:
              "Every verified encounter and chapter preserves a direct route back to its original GitHub source.",
          },
        ],
      },
    },
  },
  {
    title: "Novel Browser Glass",
    repo: "https://github.com/manmohanml1/novel-browser-glass",
    live: "https://novel-browser-glass.vercel.app/",
    type: "Wearable",
    category: "wearable",
    audiences: ["fullstack", "ai"],
    featured: true,
    description:
      "A glasses-first novel reader for a 600 by 600 Meta Ray-Ban Display surface with D-pad navigation, saved progress, comfort controls, prefetching, and an offline-friendly shell.",
    tags: ["Meta Display", "D-pad UX", "Local storage", "Service Worker", "Vercel"],
    visual: "600 x 600",
    accent: "#ec4899",
    details: {
      caseStudy: true,
      summary:
        "A long-form reading product redesigned for a glanceable wearable display rather than adapted from a phone layout.",
      purpose:
        "Lets readers search novels, browse chapters, resume progress, and tune reading comfort through controls that work on a compact wearable display.",
      challenge:
        "Make dense reading and navigation usable with limited space, directional focus, intermittent connectivity, and no assumption of touch input.",
      build:
        "Built with a modular browser client, Vercel API proxy, focus-first navigation, local reading persistence, adjacent chapter prefetching, and a service-worker-backed static shell.",
      engineering:
        "Screen orchestration, source parsing, persistence, and display interaction are separated so provider or device integrations can evolve without rewriting the reader.",
      outcome:
        "A deployed wearable product that demonstrates constrained-interface design, resilient local state, API normalization, and device-oriented verification.",
      highlights: ["D-pad navigation", "Saved reading progress", "Chapter prefetch", "Offline shell", "Comfort modes"],
      architecture: {
        title: "Glasses reading flow",
        steps: [
          {
            label: "Display controls",
            role: "Input",
            detail: "Directional focus and select/back actions drive every primary flow without relying on touch.",
          },
          {
            label: "Reader client",
            role: "Experience",
            detail: "A 600 by 600 interface manages search, chapter browsing, reading comfort, and visible focus state.",
          },
          {
            label: "API proxy",
            role: "Service",
            detail: "A server boundary normalizes source content and keeps parsing concerns outside the display UI.",
          },
          {
            label: "Local persistence",
            role: "Resilience",
            detail: "Favorites, history, settings, and reading position survive sessions without requiring a visitor account.",
          },
        ],
      },
    },
  },
  {
    title: "GlassTube",
    repo: "https://github.com/manmohanml1/glass-tube",
    type: "Wearable",
    category: "wearable",
    audiences: ["fullstack"],
    description:
      "A 600 by 600, D-pad-first YouTube viewer for Meta Ray-Ban Display with safe video parsing, featured content, viewing history, and optional private search.",
    tags: ["Meta Display", "YouTube Embed", "D-pad UX", "Security", "Node tests"],
    visual: "Video focus",
    accent: "#ef4444",
    details: {
      caseStudy: true,
      summary:
        "A glasses-first video viewer that narrows YouTube interaction to focused playback, quick discovery, and recent-video return paths.",
      purpose:
        "Opens known YouTube URLs or IDs quickly and supports optional search without attempting to reproduce the full YouTube client.",
      challenge:
        "Make video discovery usable through directional focus while constraining outbound navigation and keeping API credentials out of public browser code.",
      build:
        "Built as a modular web client with screen orchestration, rendering helpers, YouTube URL parsing, local history, navigation policy, Node tests, and an optional local-only Data API configuration.",
      engineering:
        "Playback and URL parsing work without a key; search remains optional and private, with a documented server-side proxy boundary required before any public release.",
      outcome:
        "A security-conscious wearable prototype with explicit platform limitations, validation-only CI, and replaceable service boundaries.",
      highlights: ["YouTube embed playback", "Focus navigation", "Local history", "Safe URL policy", "Optional search"],
      preview: {
        src: "https://raw.githubusercontent.com/manmohanml1/glass-tube/main/assets/glass-tube-player.png",
        alt: "GlassTube player interface on a compact display",
      },
      architecture: {
        title: "Glasses video flow",
        steps: [
          { label: "Focus controls", role: "Input", detail: "Directional controls navigate categories, history, search, and playback actions." },
          { label: "App screens", role: "Experience", detail: "Screen orchestration renders a compact 600 by 600 browsing and player surface." },
          { label: "YouTube services", role: "Integration", detail: "Parsing and optional search services normalize video IDs and provider responses." },
          { label: "Navigation policy", role: "Security", detail: "External navigation is restricted to approved HTTPS YouTube hosts and secrets stay outside tracked browser code." },
        ],
      },
    },
  },
  {
    title: "Glass Search",
    repo: "https://github.com/manmohanml1/glass-search-meta-display",
    type: "Wearable",
    category: "wearable",
    audiences: ["fullstack", "ai"],
    description:
      "A voice and handwriting-first search surface for Meta Ray-Ban Display with intent-aware GPS, in-app results, native map handoff, and local recent-query state.",
    tags: ["Meta Display", "Voice input", "GPS", "Search adapters", "80% coverage"],
    visual: "Search intent",
    accent: "#06b6d4",
    details: {
      caseStudy: true,
      summary:
        "A glanceable search and place-discovery interface designed around wearable input, selective location access, and provider replacement.",
      purpose:
        "Lets a wearer ask informational or place questions, see compact results, and hand navigation intent to the device map experience.",
      challenge:
        "Unify voice, handwriting, manual text, shortcuts, GPS, web search, and map handoff without making every query request sensitive location data.",
      build:
        "Separates device API wiring and screens from query intent, provider adapters, local storage, map handoff, and outbound URL security policies.",
      engineering:
        "Location is requested only for nearby or navigation intent, while the current provider can be replaced behind a service interface without changing screen interactions.",
      outcome:
        "A tested wearable search foundation with 80% service/security coverage gates and a clear path to a Meta-approved production provider.",
      highlights: ["Multimodal search", "Intent-aware GPS", "Native geo handoff", "Provider adapter", "Coverage gate"],
      architecture: {
        title: "Wearable search decision path",
        steps: [
          { label: "Voice or text", role: "Input", detail: "Voice, handwriting, manual entry, and shortcuts enter one focus-driven action model." },
          { label: "Intent service", role: "Decision", detail: "Query intent determines whether information, nearby context, GPS, or navigation is required." },
          { label: "Search adapter", role: "Provider", detail: "A replaceable web-compatible adapter returns normalized informational and place results." },
          { label: "Results or geo", role: "Delivery", detail: "The app renders compact results or transfers navigation through a native geo intent." },
        ],
      },
    },
  },
  {
    title: "Checkmate Glass",
    repo: "https://github.com/manmohanml1/checkmate-glass-mrbd",
    type: "Wearable",
    category: "wearable",
    audiences: ["fullstack", "ai"],
    description:
      "A glasses-first chess game with complete move rules, three local AI difficulties, focus-based board controls, resumable games, and persistent local rankings.",
    tags: ["Meta Display", "Chess engine", "Local AI", "Persistence", "Offline shell"],
    visual: "Board focus",
    accent: "#f59e0b",
    details: {
      caseStudy: true,
      summary:
        "A complete player-versus-computer chess experience compressed into a high-contrast 600 by 600 directional interface.",
      purpose:
        "Supports difficulty selection, legal chess play, match resumption, and local result tracking without touch or a required network service.",
      challenge:
        "Combine complete chess rules, computer move selection, promotion choices, board focus, persistence, and small-display readability.",
      build:
        "Separates navigation and game flow from a dedicated rules engine, three AI strategies, local persistence, and a reserved but inactive shared-ranking API boundary.",
      engineering:
        "The production experience remains local-first; global rankings are intentionally disabled until authenticated writes, validation, and abuse controls are designed.",
      outcome:
        "An offline-friendly wearable game demonstrating domain rules, AI choices, resilient state, and honest security boundaries.",
      highlights: ["Complete chess rules", "Three AI levels", "D-pad board", "Resume game", "Local rankings"],
      architecture: {
        title: "Local chess turn loop",
        steps: [
          { label: "Board focus", role: "Input", detail: "Directional controls select pieces, destinations, promotion choices, and menu actions." },
          { label: "Chess engine", role: "Rules", detail: "Legal moves, check state, castling, en passant, promotion, mate, and stalemate resolve locally." },
          { label: "AI strategy", role: "Opponent", detail: "The chosen difficulty selects a local computer move from the legal game state." },
          { label: "Local record", role: "Persistence", detail: "In-progress matches and rankings survive sessions without an account or shared backend." },
        ],
      },
    },
  },
  {
    title: "Autonomous Travel Guide",
    repo: "https://github.com/manmohanml1/autonomous-travel-guide-mrbd",
    type: "Wearable",
    category: "wearable",
    audiences: ["fullstack", "data", "ai"],
    description:
      "A wearable travel companion combining destination search, GPS, weather, air quality, landmarks, guidance, exchange rates, translation, and daily spend tracking.",
    tags: ["Meta Display", "Geolocation", "8 public APIs", "Caching", "80% coverage"],
    visual: "Travel context",
    accent: "#22c55e",
    details: {
      caseStudy: true,
      summary:
        "A D-pad navigable travel dashboard that composes live destination context from multiple public providers into one compact experience.",
      purpose:
        "Gives travelers useful local context, language help, currency information, landmarks, conditions, and a lightweight budget without changing apps repeatedly.",
      challenge:
        "Normalize eight external providers, manage location and navigation safely, preserve useful state locally, and keep a data-heavy product readable at 600 by 600.",
      build:
        "Uses configuration-owned endpoints, provider-specific service adapters, local caching and persistence, outbound navigation policy, automated tests, and GitHub Actions coverage gates.",
      engineering:
        "The MVP uses no-key public APIs and documents the backend proxy, privacy, rate-limit, reliability, and commercial-provider work required for larger-scale use.",
      outcome:
        "A broad wearable integration project that demonstrates API normalization, resilience, geospatial context, constrained UI, and production-aware tradeoffs.",
      highlights: ["Destination context", "Weather + air quality", "Landmarks + guides", "Translation", "Budget tracking"],
      architecture: {
        title: "Destination context pipeline",
        steps: [
          { label: "Search or GPS", role: "Context", detail: "A destination query or current location establishes the travel context with explicit user intent." },
          { label: "Provider services", role: "Integration", detail: "Adapters call geocoding, weather, air, landmark, guide, country, currency, and translation providers." },
          { label: "Normalized state", role: "Application", detail: "Provider responses are shaped into consistent destination, condition, language, currency, and guide models." },
          { label: "Glasses cards", role: "Experience", detail: "Focus-driven cards expose only the current slice of context while local storage preserves trip and budget state." },
        ],
      },
    },
  },
  {
    title: "Fitness Exercises App",
    repo: "https://github.com/manmohanml1/Fitness-exercises-app",
    type: "Frontend",
    category: "frontend",
    audiences: ["fullstack"],
    featured: true,
    description:
      "A React fitness application with exercise discovery, routing, Material UI components, loaders, and horizontal content browsing.",
    tags: ["React", "Material UI", "React Router", "API UI"],
    visual: "React UI",
    accent: "#36d6c4",
    details: {
      caseStudy: true,
      summary:
        "A user-facing fitness discovery interface built around searchable exercise content and responsive browsing.",
      purpose:
        "Helps users explore exercise options through a usable product interface instead of navigating raw exercise data.",
      challenge:
        "Turn a large exercise catalog into a browsing flow that stays approachable across small and large screens.",
      build:
        "Built with React, Material UI, and client-side routing, with API-backed exercise exploration and reusable content browsing components.",
      engineering:
        "The application demonstrates routed UI composition, reusable presentation components, and handling API content across responsive screen sizes.",
      outcome:
        "A navigable product interface that demonstrates API-driven frontend delivery, component reuse, and responsive content discovery.",
      highlights: ["Exercise search", "Responsive browsing", "Material UI", "API integration"],
      preview: {
        src: "https://i.ibb.co/Yt9spGc/image.png",
        alt: "Fitness exercise discovery application",
      },
      architecture: {
        title: "Exercise discovery flow",
        steps: [
          { label: "Search + categories", role: "Discovery", detail: "Users narrow a large exercise catalog through terms, body-part categories, and horizontal browsing." },
          { label: "React routes", role: "Navigation", detail: "Client-side routes separate discovery from detailed exercise views without full-page reloads." },
          { label: "API requests", role: "Data", detail: "Reusable fetch utilities load exercise records and related content for the selected route." },
          { label: "Material UI", role: "Presentation", detail: "Responsive components, loaders, cards, and scrolling collections shape API data into a usable interface." },
        ],
      },
    },
  },
  {
    title: "Scalable Data Processing System",
    repo: "https://github.com/manmohanml1/Scalable-Data-Processing-System-for-High-Volume-Workloads",
    type: "Data",
    category: "data",
    audiences: ["backend", "data"],
    featured: true,
    description:
      "A high-volume ingestion and processing pipeline using Kafka producers and consumers, AWS Kinesis streams, PostgreSQL partitioning, and Kubernetes deployment manifests.",
    tags: ["Kafka", "Kinesis", "PostgreSQL", "Kubernetes"],
    visual: "Data stream",
    accent: "#57a6ff",
    details: {
      caseStudy: true,
      summary: "A cloud-oriented data pipeline project for ingesting and processing high-volume event workloads.",
      purpose:
        "Explores how incoming events can move reliably through streaming ingestion into storage and deployable processing services.",
      challenge:
        "Model a data workload that can accept continuous events, persist them efficiently, and remain deployable as demand grows.",
      build:
        "Structured around Kafka producers and consumers, AWS Kinesis, partitioned PostgreSQL storage, and Kubernetes deployment configuration.",
      engineering:
        "Its value is in systems thinking: partitioned persistence, container deployment primitives, and operational health/scaling foundations.",
      outcome:
        "A system-design project showing the path from ingestion through scalable storage and container orchestration.",
      highlights: ["Kafka flow", "Kinesis ingestion", "Partitioned storage", "Kubernetes"],
      architecture: {
        title: "Event processing path",
        steps: [
          {
            label: "Producer",
            role: "Input",
            detail: "Event producers represent high-volume incoming records entering the processing flow.",
          },
          {
            label: "Kafka / Kinesis",
            role: "Stream",
            detail: "Streaming infrastructure decouples ingestion from downstream processing and supports scalable event movement.",
          },
          {
            label: "Consumer",
            role: "Process",
            detail: "Consumer services read the stream and shape events for persistence and downstream handling.",
          },
          {
            label: "PostgreSQL",
            role: "Store",
            detail: "Partitioned PostgreSQL storage is used to organize growing data volumes efficiently.",
          },
          {
            label: "Kubernetes",
            role: "Operate",
            detail: "Deployment manifests frame health, rollout, and scaling concerns for containerized services.",
          },
        ],
      },
    },
  },
  {
    title: "LangChain Project",
    repo: "https://github.com/manmohanml1/Langchain-Project-1",
    type: "AI",
    category: "ai",
    audiences: ["ai", "fullstack"],
    description:
      "A Turborepo monorepo with a TypeScript Express API and Next.js web app, structured for experiments that connect application code with AI workflows.",
    tags: ["LangChain", "Next.js", "Express", "TypeScript"],
    visual: "AI workflow",
    accent: "#ff6b9a",
    details: {
      caseStudy: true,
      summary: "An application-oriented AI experiment connecting a TypeScript service with a modern web surface.",
      purpose:
        "Treats AI behavior as part of a product architecture, with interface and service boundaries that can change independently.",
      challenge:
        "Experiment with AI workflows without coupling the user-facing application directly to model orchestration logic.",
      build:
        "Organized as a Turborepo with a Next.js frontend and Express API, allowing AI workflow experiments to evolve behind clear boundaries.",
      engineering:
        "A monorepo layout keeps shared development coherent while leaving room for model, API, and client experimentation.",
      outcome:
        "A structured application prototype where the AI layer can evolve behind a typed web and service boundary.",
      highlights: ["Turborepo", "Next.js", "Express API", "LangChain"],
      architecture: {
        title: "AI product boundary",
        steps: [
          {
            label: "Next.js",
            role: "Interface",
            detail: "The web app presents the product interaction without owning backend orchestration.",
          },
          {
            label: "Express API",
            role: "Service",
            detail: "A TypeScript API boundary receives product requests and separates clients from workflow details.",
          },
          {
            label: "LangChain",
            role: "Workflow",
            detail: "LangChain experiments coordinate AI behavior behind the service interface.",
          },
          {
            label: "Response",
            role: "Delivery",
            detail: "Results return through the API to the web surface, preserving a replaceable architecture.",
          },
        ],
      },
    },
  },
  {
    title: "Movies API",
    repo: "https://github.com/manmohanml1/Movies-API",
    type: "Backend",
    category: "backend",
    audiences: ["backend"],
    description:
      "A Java 17 and Spring Boot 3 REST API that reads movie data by IMDb identifier and creates linked reviews through a MongoDB-backed service layer.",
    tags: ["Java 17", "Spring Boot 3", "MongoDB", "Maven", "REST APIs"],
    visual: "REST API",
    accent: "#ffc857",
    details: {
      caseStudy: true,
      summary:
        "A focused backend project that models movie retrieval and review creation through a conventional Spring application boundary.",
      purpose:
        "Provides REST endpoints for browsing movies, looking up a movie by IMDb ID, and attaching a review to an existing movie document.",
      challenge:
        "Keep HTTP handling, business operations, and MongoDB access separated while linking newly created reviews back to movie records.",
      build:
        "Built with Java 17, Spring Boot 3, Spring Web, Spring Data MongoDB, Maven, Lombok, and environment-based database configuration.",
      engineering:
        "Movie and review controllers delegate to services, repositories own persistence, and the review workflow updates the related movie through its IMDb identifier.",
      outcome:
        "A compact demonstration of layered Spring API design, document persistence, path-based resource lookup, and creation responses.",
      highlights: ["Movie collection endpoint", "IMDb lookup", "Review creation", "MongoDB repositories", "Layered services"],
      architecture: {
        title: "Movie and review request flow",
        steps: [
          { label: "REST controllers", role: "HTTP", detail: "Movie and review routes validate the request shape and return explicit HTTP responses." },
          { label: "Service layer", role: "Logic", detail: "Services coordinate movie retrieval and review creation without placing persistence logic in controllers." },
          { label: "Repositories", role: "Data access", detail: "Spring Data repositories provide the MongoDB query and save boundaries." },
          { label: "MongoDB", role: "Store", detail: "Movie documents and review records are persisted and related through the movie IMDb identifier." },
        ],
      },
    },
  },
  {
    title: "LeetCode Practice",
    repo: "https://github.com/manmohanml1/Leetcode-Practice",
    type: "Backend",
    category: "backend",
    audiences: ["backend"],
    description:
      "A multi-language practice repository with TypeScript, Java, and Python solutions, native test frameworks, GitHub Actions CI, and a smart Windows test runner.",
    tags: ["TypeScript", "Java", "JUnit 5", "Maven", "Jest", "CI"],
    visual: "TS + Java",
    accent: "#8bd450",
    details: {
      caseStudy: true,
      summary:
        "A collaborative algorithm practice system that applies the same solution-and-test discipline across TypeScript, Java, and Python.",
      purpose:
        "Makes multi-language problem solving repeatable by standardizing folders, naming, tests, contributions, and automated validation.",
      challenge:
        "Give three ecosystems a consistent contributor experience while preserving their native build and testing tools.",
      build:
        "Solutions are grouped by language, contributor, and difficulty; Jest, JUnit 5 with Maven, and Pytest validate each implementation, while GitHub Actions runs all suites with dependency caching.",
      engineering:
        "A root Windows runner supports all-language, single-language, interactive, and git-diff-based smart testing so local feedback can stay proportional to the change.",
      outcome:
        "An open-source-ready practice repository with predictable naming, pull-request checks, contribution guidance, and automated multi-language quality gates.",
      highlights: ["TypeScript + Java + Python", "Jest + JUnit 5 + Pytest", "Smart test selection", "GitHub Actions", "Contributor workflow"],
      architecture: {
        title: "Multi-language validation path",
        steps: [
          { label: "Problem solution", role: "Source", detail: "Each language keeps solutions organized by difficulty and a consistent LeetCode naming convention." },
          { label: "Native tests", role: "Verification", detail: "Jest, JUnit 5, and Pytest validate implementations using the conventions of each ecosystem." },
          { label: "Smart runner", role: "Local tooling", detail: "The root runner selects all, one, or only changed-language suites from a single entry point." },
          { label: "GitHub Actions", role: "CI", detail: "Pushes and pull requests run the complete cached test matrix before changes can be accepted." },
        ],
      },
    },
  },
  {
    title: "Software Engineering Design Patterns",
    repo: "https://github.com/manmohanml1/Software-Engineering-Design-Patterns",
    type: "Backend",
    category: "backend",
    audiences: ["backend"],
    description:
      "A message broadcasting system modeled with behavioral and structural design patterns, including Observer and Composite.",
    tags: ["Design Patterns", "Observer", "Composite", "Architecture"],
    visual: "Patterns",
    accent: "#b89cff",
    details: {
      caseStudy: true,
      summary:
        "A C++ message-broadcasting system that models a university, its colleges, departments, faculty, students, and listserv audiences as a changing hierarchy.",
      purpose:
        "Supports campus-wide, college, and department announcements while allowing organizational units and members to be added or removed dynamically.",
      challenge:
        "Represent both nested organizational structure and changing message subscriptions without tightly coupling every sender to every recipient.",
      build:
        "Implemented in C++ from revised UML diagrams using Composite for the university hierarchy and Observer for listserv subscriptions and notifications.",
      engineering:
        "Composite nodes and leaves share hierarchy operations, while listserv observers track membership changes and broadcast to the appropriate organizational scope.",
      outcome:
        "A concrete comparison between an original and improved object model, including documented benefits, tradeoffs, dynamic menus, and campus notification scenarios.",
      highlights: ["Observer pattern", "Composite pattern", "Dynamic hierarchy", "Scoped listservs", "UML redesign"],
      architecture: {
        title: "University announcement model",
        steps: [
          { label: "University hierarchy", role: "Composite root", detail: "The campus contains colleges, departments, and member leaves through a uniform hierarchical interface." },
          { label: "Membership changes", role: "Domain", detail: "Interactive operations add or remove departments, faculty, and students while preserving hierarchy behavior." },
          { label: "Listserv observers", role: "Messaging", detail: "Campus, college, and department subscriptions represent different announcement audiences." },
          { label: "Notification", role: "Outcome", detail: "Messages propagate only to members currently subscribed within the selected organizational scope." },
        ],
      },
    },
  },
  {
    title: "OpenGL GLUT Game",
    repo: "https://github.com/manmohanml1/OpenGL_Glut_Game",
    type: "Systems",
    category: "backend",
    audiences: ["general"],
    description:
      "A modular C++ OpenGL/GLUT action game with animated player and enemy systems, collisions, projectiles, health, parallax scenes, audio, menus, and multiple levels.",
    tags: ["C++", "OpenGL", "GLUT", "Collision", "Audio"],
    visual: "OpenGL",
    accent: "#ff8f5a",
    details: {
      caseStudy: true,
      summary:
        "A graphics-programming term project organized into focused gameplay, rendering, input, audio, and screen-state modules.",
      purpose:
        "Builds a playable desktop game loop with animated scenes, combat interactions, navigation screens, and audiovisual feedback.",
      challenge:
        "Coordinate real-time rendering, keyboard input, movement, collisions, enemies, health, projectiles, assets, and screen transitions in a procedural graphics environment.",
      build:
        "Implemented in C++ with OpenGL and GLUT, with separate source and header modules for scenes, player state, enemies, bullets, collisions, textures, timers, sound, parallax, menus, help, and credits.",
      engineering:
        "Responsibility-specific modules keep frame updates and gameplay concerns separated, while shared assets and screen state support multiple levels and menu flows.",
      outcome:
        "A substantial interactive systems project demonstrating event loops, real-time state coordination, media assets, and modular C++ organization.",
      highlights: ["Real-time game loop", "Collision system", "Animated sprites", "Parallax scenes", "Audio and menus"],
      architecture: {
        title: "Game frame lifecycle",
        steps: [
          { label: "Input + timer", role: "Events", detail: "Keyboard handlers and timers update player intent, movement, and recurring game state." },
          { label: "Gameplay systems", role: "Simulation", detail: "Player, enemy, bullet, health, falling-object, and collision modules resolve each frame." },
          { label: "Scene renderer", role: "Graphics", detail: "OpenGL scene, lighting, texture, sprite, and parallax modules compose the visible world." },
          { label: "Screen + audio", role: "Experience", detail: "Menus, help, credits, messages, popups, and sound complete the playable application flow." },
        ],
      },
    },
  },
  {
    title: "TypeScript Practice",
    repo: "https://github.com/manmohanml1/Typescript-Practice",
    type: "Frontend",
    category: "frontend",
    audiences: ["fullstack"],
    description:
      "A compact TypeScript setup and domain exercise that models a pizza menu, orders, register balance, queue state, and order completion.",
    tags: ["TypeScript", "Jest", "Domain modeling", "State transitions"],
    visual: "TypeScript",
    accent: "#7dd3fc",
    details: {
      caseStudy: true,
      summary:
        "A deliberately small practice repository for strengthening typed setup and basic domain-state reasoning.",
      purpose:
        "Models adding menu items, placing orders, assigning identifiers, collecting payment, queuing work, and completing an order.",
      challenge:
        "Represent a small set of related state transitions clearly enough to expose mistakes in selection, payment, identity, and completion behavior.",
      build:
        "Uses a TypeScript compiler configuration and Jest setup around a small restaurant-order domain exercise.",
      engineering:
        "The exercise makes state transitions explicit across menu data, register balance, order identifiers, queue entries, and completion status.",
      outcome:
        "A compact, deliberately scoped exercise that demonstrates typed setup and sequential domain-state changes without overstating its production scope.",
      highlights: ["TypeScript setup", "Order queue", "State transitions", "Jest configuration"],
      architecture: {
        title: "Order state flow",
        steps: [
          { label: "Menu", role: "Catalog", detail: "Available pizzas and prices form the source data for order selection." },
          { label: "Place order", role: "Command", detail: "A selected item increments register balance and creates a uniquely identified queued order." },
          { label: "Order queue", role: "State", detail: "Queued orders retain their item and current processing status." },
          { label: "Complete order", role: "Transition", detail: "Completion locates an order by ID and advances its status from ordered to completed." },
        ],
      },
    },
  },
];

export const stackItems = [
  "Java",
  "Spring Boot",
  "Angular",
  "SQL Server",
  "JDBC",
  "TypeScript",
  "Nest.js",
  "REST APIs",
  "AWS",
  "OAuth 2.0",
  "JUnit 5",
  "Tailwind CSS",
  "Kafka",
  "PostgreSQL",
  "Jest",
  "GitHub Actions",
  "Wearable Web",
];

export const careerTimeline = [
  {
    period: "2021 - 2022",
    title: "Computer science and teaching foundation",
    audiences: ["backend", "fullstack", "data", "ai"],
    description:
      "Completed an MS in Computer Science, taught programming-language concepts, and earned Phi Kappa Phi recognition.",
  },
  {
    period: "2023 - 2025",
    title: "Cloud backend and healthcare APIs",
    audiences: ["backend", "fullstack", "data", "ai"],
    description:
      "Built TypeScript and Nest.js services across AWS Lambda, FHIR, OAuth, event-driven integrations, Terraform, and observability.",
  },
  {
    period: "2025 - Present",
    title: "Enterprise full-stack systems",
    audiences: ["backend", "fullstack", "data"],
    description:
      "Delivering Java and Spring Boot APIs, Angular applications, SQL-heavy workflows, scheduled processing, and AWS deployments.",
  },
  {
    period: "Current experiments",
    title: "Operated platforms and wearable products",
    audiences: ["backend", "fullstack", "ai"],
    description:
      "Applying production practices to an authenticated portfolio control plane and a growing suite of Meta Display web applications.",
  },
];

export const experiences = [
  {
    role: "Full Stack Engineer",
    audiences: ["backend", "fullstack", "data"],
    org: "Amtrak",
    period: "Jul 2025 - Present",
    location: "Baltimore, Maryland - Remote",
    detail:
      "Building the Labor Management System across secure Java services, responsive Angular experiences, data-intensive workflows, and AWS delivery.",
    highlights: [
      "Spring Boot APIs with JDBC, complex SQL Server logic, scheduled jobs, SMTP notifications, and inter-service API contracts.",
      "Angular mobile web features using Tailwind tokens across laptop, tablet, and mobile breakpoints.",
      "Modernizing Angular and Java versions while supporting secure, tested delivery pipelines.",
    ],
  },
  {
    role: "Back End Developer",
    audiences: ["backend", "fullstack", "data", "ai"],
    org: "Evernorth Health Services",
    period: "Jun 2023 - Jun 2025",
    location: "Jersey City, New Jersey - Remote",
    detail:
      "Delivered serverless healthcare APIs and reusable TypeScript foundations for interoperable AWS services.",
    highlights: [
      "Nest.js and AWS Lambda microservices supporting FHIR R4 and OAuth 2.0.",
      "API Gateway, S3, DynamoDB, SQS, EventBridge, and Terraform delivery.",
      "Shared observability, documentation, testing, and maintainable API patterns.",
    ],
  },
  {
    role: "Back End Developer",
    audiences: ["backend", "fullstack", "data"],
    org: "Squad Software Inc",
    period: "Feb 2023 - Jun 2023",
    location: "Edison, New Jersey - Remote",
    detail:
      "Designed TypeScript microservices and serverless AWS APIs for secure data-processing workflows.",
    highlights: [
      "OAuth 2.0 REST APIs with Lambda, API Gateway, and DynamoDB.",
      "Terraform, GitLab CI/CD, and Splunk operational support.",
    ],
  },
  {
    role: "Teaching Associate",
    audiences: ["ai"],
    org: "California State University, Fresno",
    period: "Aug 2021 - Dec 2022",
    location: "United States",
    detail:
      "Supported approximately 60 programming-languages students through labs, feedback, exams, and office hours.",
    highlights: [
      "Guided learning across Haskell, Mozart (Oz), and Prolog.",
    ],
  },
  {
    role: "Student Assistant",
    audiences: ["general"],
    org: "California State University, Fresno",
    period: "Jul 2021 - Dec 2022",
    location: "United States",
    detail:
      "Supported students and professors with device setup, settings, software installation, and technical troubleshooting.",
    highlights: [],
  },
];

export const credentials = [
  {
    audiences: ["backend", "fullstack", "data", "ai"],
    label: "Master of Science - Computer Science",
    value: "California State University, Fresno",
    detail: "2021 - 2022",
  },
  {
    audiences: ["backend", "fullstack", "data", "ai"],
    label: "Bachelor of Engineering - Computer Science",
    value: "Walchand Institute of Technology, Solapur",
    detail: "2015 - 2019",
  },
  {
    audiences: ["backend", "fullstack", "data", "ai"],
    label: "Academic recognition",
    value: "The Honor Society of Phi Kappa Phi",
    detail: "Member, Apr 2022 - Apr 2023 - distinction awarded to the top 10% of post-graduate students.",
  },
  {
    audiences: ["backend", "fullstack", "data"],
    label: "Received recommendation",
    value: "Kent Shikama - Senior Software Engineer, Evernorth Health Services",
    detail:
      "Recognized on February 26, 2025 for technical acumen, prompt issue resolution, clear bug reports and PR changes, and professional collaboration.",
    featured: true,
  },
];

export const skills = [
  {
    title: "Current enterprise stack",
    audiences: ["backend", "fullstack", "data"],
    description: "Java, Spring Boot, Angular, SQL Server, JDBC, Tailwind tokens, scheduled processing, SMTP, and AWS delivery.",
  },
  {
    title: "Cloud backend foundation",
    audiences: ["backend", "fullstack", "ai"],
    description: "TypeScript, Nest.js, AWS Lambda, FHIR R4, OAuth 2.0, API Gateway, S3, DynamoDB, SQS, EventBridge, and Terraform.",
  },
  {
    title: "Data, delivery, and quality",
    audiences: ["data", "backend"],
    description: "Complex SQL, Kafka, Kinesis, PostgreSQL, Docker, Kubernetes, OpenAPI, JUnit 5, Jest, CI/CD, and security scanning.",
  },
  {
    title: "Product experiments",
    audiences: ["ai", "fullstack"],
    description: "Meta Display wearable apps, LangChain prototypes, responsive React products, local-first persistence, and constrained-interface design.",
  },
];
