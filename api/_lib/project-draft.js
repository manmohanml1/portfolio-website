const TECHNOLOGY_PATTERNS = Object.freeze([
  ["TypeScript", /\btypescript\b/i],
  ["JavaScript", /\bjavascript\b/i],
  ["Java", /\bjava\b/i],
  ["Python", /\bpython\b/i],
  ["React", /\breact(?:\.js|js)?\b/i],
  ["Angular", /\bangular\b/i],
  ["Spring Boot", /\bspring boot\b/i],
  ["Node.js", /\bnode(?:\.js|js)\b/i],
  ["NestJS", /\bnest(?:\.js|js)\b/i],
  ["PostgreSQL", /\bpostgres(?:ql)?\b/i],
  ["SQL Server", /\bsql server\b/i],
  ["DynamoDB", /\bdynamodb\b/i],
  ["AWS", /\baws|amazon web services\b/i],
  ["Docker", /\bdocker\b/i],
  ["Kubernetes", /\bkubernetes|\bk8s\b/i],
  ["Terraform", /\bterraform\b/i],
  ["GitHub Actions", /\bgithub actions\b/i],
  ["Jest", /\bjest\b/i],
  ["JUnit", /\bjunit\b/i],
  ["PyTest", /\bpytest\b/i],
  ["REST APIs", /\brest(?:ful)?\s+api|\bapi gateway\b/i],
  ["OAuth 2.0", /\boauth\s*2(?:\.0)?\b/i],
  ["Meta Display", /meta ray-ban display|meta display|glasses-first|\bmrbd\b/i],
]);

const CATEGORY_TOPICS = Object.freeze({
  "portfolio-frontend": "frontend",
  "portfolio-backend": "backend",
  "portfolio-data": "data",
  "portfolio-ai": "ai",
  "portfolio-wearable": "wearable",
});

function cleanMarkdown(value = "") {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[`*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(value, maximum) {
  const text = cleanMarkdown(value);
  if (text.length <= maximum) return text;
  const shortened = text.slice(0, maximum - 1);
  const boundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, boundary > maximum * 0.7 ? boundary : maximum - 1)}…`;
}

function humanize(value = "") {
  return value
    .replaceAll("_", "-")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toLowerCase();
      if (["api", "ai", "ui", "mrbd"].includes(normalized)) return normalized.toUpperCase();
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

function formatDraftTitle(name = "") {
  return humanize(name.replace(/-(?:mrbd|meta-display)$/i, ""));
}

function uniqueLabels(values) {
  const aliases = new Map([
    ["javascript", "JavaScript"],
    ["meta ray ban display", "Meta Display"],
    ["meta display", "Meta Display"],
  ]);
  const seen = new Set();
  return values.reduce((result, value) => {
    const normalized = String(value || "").trim();
    const canonical = aliases.get(normalized.toLowerCase()) || normalized;
    const key = canonical.toLowerCase();
    if (!canonical || seen.has(key)) return result;
    seen.add(key);
    result.push(canonical);
    return result;
  }, []);
}

export function extractReadmeSections(readme = "") {
  const sections = [];
  const lines = String(readme).replaceAll("\r", "").split("\n");
  let current = { heading: "Introduction", content: [] };
  const commit = () => {
    const content = clamp(current.content.join("\n"), 900);
    if (content) sections.push({ heading: current.heading, content });
  };
  lines.forEach((line) => {
    const match = line.match(/^#{1,4}\s+(.+?)\s*$/);
    if (match) {
      commit();
      current = { heading: cleanMarkdown(match[1]).slice(0, 80), content: [] };
    } else {
      current.content.push(line);
    }
  });
  commit();
  return sections.slice(0, 16);
}

function sectionContent(sections, names) {
  const match = sections.find((section) => names.some((name) => (
    section.heading.toLowerCase().includes(name)
  )));
  return match?.content || "";
}

function bestSectionContent(sections, names) {
  return sections
    .filter((section) => names.some((name) => section.heading.toLowerCase().includes(name)))
    .sort((left, right) => right.content.length - left.content.length)[0]?.content || "";
}

function inferCategory(repository, text) {
  const topics = repository.topics || [];
  const explicit = topics.find((topic) => CATEGORY_TOPICS[topic]);
  if (explicit) return CATEGORY_TOPICS[explicit];
  if (/meta ray-ban display|meta display|glasses-first|\bmrbd\b/i.test(text)) return "wearable";
  if (/\blangchain\b|\bmachine learning\b|\bartificial intelligence\b|\bllm\b/i.test(text)) return "ai";
  if (/\bkafka\b|\bkinesis\b|\bdata pipeline\b|\betl\b/i.test(text)) return "data";
  if (/spring boot|nest(?:\.js|js)|\bmicroservices?\b|\brest(?:ful)?\s+api/i.test(text)) return "backend";
  if (/\breact\b|\bangular\b|\bmaterial ui\b/i.test(text)) return "frontend";
  return "other";
}

export function generateProjectDraft(repository, { readme = "", languages = {} } = {}) {
  const sections = extractReadmeSections(readme);
  const evidenceText = [repository.name, repository.description, readme].filter(Boolean).join("\n");
  const detected = TECHNOLOGY_PATTERNS
    .filter(([, pattern]) => pattern.test(evidenceText))
    .map(([name]) => name);
  const languageTags = Object.keys(languages).filter((language) => Number(languages[language]) > 0);
  const topicTags = (repository.topics || [])
    .filter((topic) => !topic.startsWith("portfolio-"))
    .map(humanize);
  const tags = uniqueLabels([repository.language, ...languageTags, ...detected, ...topicTags]).slice(0, 8);
  const category = inferCategory(repository, evidenceText);
  const introduction = sectionContent(sections, ["introduction", "overview", "about"])
    || sections[0]?.content
    || repository.description
    || "";
  const summary = clamp(repository.description || introduction, 360);
  const purpose = clamp(sectionContent(sections, ["purpose", "overview", "about", "motivation"]) || introduction, 600);
  const challenge = clamp(sectionContent(sections, ["challenge", "problem", "motivation"]), 600);
  const implementation = clamp(bestSectionContent(sections, [
    "implementation", "architecture", "how it works", "technical", "tech stack", "built with",
    "project structure", "highlights", "features",
  ]), 800) || (tags.length
    ? `Repository evidence identifies ${tags.join(", ")} as the primary implementation signals.`
    : "");
  const engineering = clamp(bestSectionContent(sections, [
    "engineering", "design decision", "security", "testing", "quality", "deployment",
    "verification", "contribution flow",
  ]), 800);
  const outcome = clamp(sectionContent(sections, ["outcome", "result", "status", "current state"]), 600);

  return {
    presentation: {
      title: formatDraftTitle(repository.name),
      description: summary,
      category,
      tags,
    },
    caseStudy: {
      caseStudy: true,
      summary,
      purpose,
      challenge,
      build: implementation,
      engineering,
      outcome,
      highlights: tags.slice(0, 6),
    },
    evidence: {
      source: "github",
      languages: languageTags.slice(0, 10),
      topics: repository.topics || [],
      technologies: detected,
      readmeSections: sections.map((section) => section.heading),
      readmeExcerpt: clamp(introduction, 900),
      generatedAt: new Date().toISOString(),
    },
  };
}
