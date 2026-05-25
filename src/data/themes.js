export const themes = [
  {
    id: "swiss",
    label: "Swiss Grid",
    swatches: ["#f4f3ef", "#121212", "#e33224"],
  },
  {
    id: "interstellar",
    label: "Interstellar",
    swatches: ["#050816", "#7dd3fc", "#c084fc"],
  },
  {
    id: "light",
    label: "Studio Light",
    swatches: ["#f8fafc", "#2563eb", "#14b8a6"],
  },
  {
    id: "terminal",
    label: "Terminal",
    swatches: ["#03120b", "#39ff88", "#101f17"],
  },
  {
    id: "brutalist",
    label: "Neo Brutalist",
    swatches: ["#ffe34f", "#111111", "#3764ff"],
  },
];

export const DEFAULT_THEME = "swiss";

export function resolveTheme(themeId) {
  return themes.find((theme) => theme.id === themeId)?.id || DEFAULT_THEME;
}
