export const projects = [
  {
    title: "Fitness Exercises App",
    repo: "https://github.com/manmohanml1/Fitness-exercises-app",
    type: "Frontend",
    category: "frontend",
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
    },
  },
  {
    title: "Scalable Data Processing System",
    repo: "https://github.com/manmohanml1/Scalable-Data-Processing-System-for-High-Volume-Workloads",
    type: "Data",
    category: "data",
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
    description:
      "A compact API-focused repository for movie data workflows, useful as a foundation for backend practice and service integration.",
    tags: ["API", "Backend", "Service Design"],
    visual: "REST API",
    accent: "#ffc857",
  },
  {
    title: "LeetCode Practice",
    repo: "https://github.com/manmohanml1/Leetcode-Practice",
    type: "Backend",
    category: "backend",
    description:
      "A multi-language practice repository with TypeScript, Java, and Python solutions, native test frameworks, GitHub Actions CI, and a smart Windows test runner.",
    tags: ["TypeScript", "Java", "JUnit 5", "Maven", "Jest", "CI"],
    visual: "TS + Java",
    accent: "#8bd450",
  },
  {
    title: "Software Engineering Design Patterns",
    repo: "https://github.com/manmohanml1/Software-Engineering-Design-Patterns",
    type: "Backend",
    category: "backend",
    description:
      "A message broadcasting system modeled with behavioral and structural design patterns, including Observer and Composite.",
    tags: ["Design Patterns", "Observer", "Composite", "Architecture"],
    visual: "Patterns",
    accent: "#b89cff",
  },
  {
    title: "OpenGL GLUT Game",
    repo: "https://github.com/manmohanml1/OpenGL_Glut_Game",
    type: "Systems",
    category: "backend",
    description:
      "A CSCI term project exploring interactive graphics and game programming with OpenGL and GLUT.",
    tags: ["OpenGL", "GLUT", "C++", "Game Dev"],
    visual: "OpenGL",
    accent: "#ff8f5a",
  },
  {
    title: "TypeScript Practice",
    repo: "https://github.com/manmohanml1/Typescript-Practice",
    type: "Frontend",
    category: "frontend",
    description:
      "Focused TypeScript practice that reinforces typed JavaScript patterns for frontend and backend development.",
    tags: ["TypeScript", "JavaScript", "Practice"],
    visual: "TypeScript",
    accent: "#7dd3fc",
  },
];

export const stackItems = [
  "TypeScript",
  "Java",
  "Express",
  "REST APIs",
  "React",
  "AWS",
  "Kafka",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "Jest",
  "JUnit 5",
  "Maven",
  "LangChain",
  "OpenGL",
];

export const experiences = [
  {
    role: "Full Stack Engineer",
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
    label: "Master of Science - Computer Science",
    value: "California State University, Fresno",
    detail: "2021 - 2022",
  },
  {
    label: "Bachelor of Engineering - Computer Science",
    value: "Walchand Institute of Technology, Solapur",
    detail: "2015 - 2019",
  },
  {
    label: "Academic recognition",
    value: "The Honor Society of Phi Kappa Phi",
    detail: "Member, Apr 2022 - Apr 2023 - distinction awarded to the top 10% of post-graduate students.",
  },
  {
    label: "Received recommendation",
    value: "Kent Shikama - Senior Software Engineer, Evernorth Health Services",
    detail:
      "Recognized on February 26, 2025 for technical acumen, prompt issue resolution, clear bug reports and PR changes, and professional collaboration.",
    featured: true,
  },
];

export const skills = [
  {
    title: "Frontend",
    description: "React, Next.js, Tailwind CSS, Material UI, responsive product interfaces.",
  },
  {
    title: "Backend",
    description: "TypeScript, Java, Express.js, REST APIs, Maven, JUnit, Jest, service design.",
  },
  {
    title: "Data & Cloud",
    description: "Kafka, AWS Kinesis, PostgreSQL, Docker, Kubernetes, autoscaling services.",
  },
  {
    title: "Applied AI",
    description: "LangChain prototypes and experiments that connect models to web and API products.",
  },
];
