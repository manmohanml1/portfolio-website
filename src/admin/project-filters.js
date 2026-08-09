export function filterProjectQueue(projects, { query = "", category = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  return projects.filter((project) => {
    if (category && project.category !== category) return false;
    if (!normalizedQuery) return true;
    const evidence = project.evidence || {};
    const searchable = [
      project.name,
      project.title,
      project.description,
      project.githubDescription,
      project.category,
      project.language,
      ...(project.tags || []),
      ...(project.topics || []),
      ...(evidence.languages || []),
      ...(evidence.technologies || []),
    ].filter(Boolean).join(" ").toLowerCase();
    return searchable.includes(normalizedQuery);
  });
}
