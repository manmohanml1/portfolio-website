export const audienceLenses = Object.freeze({
  general: {
    eyebrow: "Backend · full-stack · cloud data · applied AI",
    title: "Building reliable products from API to interface.",
    description:
      "I’m Manmohan, building today with TypeScript, Java, REST APIs, React, AWS, Kafka, PostgreSQL, Docker, and Kubernetes, with earlier work across UI, graphics, design patterns, and AI experiments.",
    words: ["Backend", "TypeScript", "Java", "AWS", "Kafka"],
  },
  backend: {
    eyebrow: "Backend engineering · secure APIs · distributed services",
    title: "Building dependable services behind real products.",
    description:
      "My current work centers on Java and Spring Boot services, TypeScript APIs, SQL-heavy workflows, OAuth-secured integrations, testing, and AWS delivery.",
    words: ["Java", "Spring Boot", "TypeScript", "REST APIs", "AWS"],
  },
  fullstack: {
    eyebrow: "Full-stack delivery · API to responsive interface",
    title: "Connecting enterprise services to usable interfaces.",
    description:
      "I work across Spring Boot and TypeScript services, Angular and React interfaces, Tailwind design tokens, and responsive experiences built for laptop, tablet, and mobile breakpoints.",
    words: ["Angular", "Spring Boot", "TypeScript", "Tailwind", "REST APIs"],
  },
  data: {
    eyebrow: "Cloud data · streaming systems · operational delivery",
    title: "Designing data flows that stay understandable as they scale.",
    description:
      "My systems work spans Kafka and Kinesis ingestion, PostgreSQL and SQL Server data workflows, containerized services, Kubernetes, and AWS operations.",
    words: ["Kafka", "AWS", "PostgreSQL", "Kubernetes", "SQL"],
  },
  ai: {
    eyebrow: "Applied AI · typed services · product experiments",
    title: "Exploring AI behind clear product boundaries.",
    description:
      "I build application-oriented AI experiments with LangChain, TypeScript, Next.js, and Express, keeping model workflows behind understandable web and API boundaries.",
    words: ["LangChain", "TypeScript", "Next.js", "Express", "APIs"],
  },
});

export function getAudienceLens(audience) {
  return audienceLenses[audience] || audienceLenses.general;
}

export function rankEvidenceForAudience(items, audience) {
  if (audience === "general") return [...items];

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftMatch = left.item.audiences?.includes(audience) ? 1 : 0;
      const rightMatch = right.item.audiences?.includes(audience) ? 1 : 0;
      return rightMatch - leftMatch || left.index - right.index;
    })
    .map(({ item }) => item);
}
