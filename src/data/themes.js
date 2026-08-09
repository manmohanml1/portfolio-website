export const themes = [
  {
    id: "swiss",
    label: "Android",
    description: "Modern tonal surfaces",
    layout: "bento-os",
    swatches: ["#f7f9f4", "#0b57d0", "#0f9d58"],
  },
  {
    id: "interstellar",
    label: "Cosmos",
    description: "Focused deep-space view",
    layout: "constellation",
    swatches: ["#050812", "#70d7ff", "#ffbd66"],
  },
  {
    id: "light",
    label: "Product",
    description: "Polished product view",
    layout: "casebook",
    swatches: ["#eef4ff", "#1d5bd8", "#0c8f78"],
  },
  {
    id: "terminal",
    label: "Blueprint",
    description: "Systems and architecture",
    layout: "system-map",
    swatches: ["#071a2f", "#67d4ff", "#d7f1ff"],
  },
  {
    id: "brutalist",
    label: "Future Lab",
    description: "Clean speculative systems",
    layout: "interface-deck",
    swatches: ["#eef3f1", "#153d3a", "#ff654a"],
  },
];

export const DEFAULT_THEME = "swiss";

export function resolveTheme(themeId) {
  return themes.find((theme) => theme.id === themeId)?.id || DEFAULT_THEME;
}

export function getTheme(themeId) {
  return themes.find((theme) => theme.id === resolveTheme(themeId));
}
