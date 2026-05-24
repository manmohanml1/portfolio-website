export const themes = [
  {
    id: "spatial",
    label: "Spatial",
    swatches: ["#edf5ff", "#2864ff", "#00a7c8"],
  },
  {
    id: "interstellar",
    label: "Interstellar",
    swatches: ["#050816", "#7dd3fc", "#c084fc"],
  },
  {
    id: "light",
    label: "Light",
    swatches: ["#f8fafc", "#2563eb", "#14b8a6"],
  },
  {
    id: "dark",
    label: "Dark",
    swatches: ["#09090b", "#f8fafc", "#71717a"],
  },
  {
    id: "aurora",
    label: "Aurora",
    swatches: ["#f2fff8", "#00a66f", "#8b5cf6"],
  },
  {
    id: "terminal",
    label: "Terminal",
    swatches: ["#03120b", "#39ff88", "#101f17"],
  },
  {
    id: "monochrome",
    label: "Mono",
    swatches: ["#f5f5f0", "#111111", "#d4d4d4"],
  },
  {
    id: "sunset",
    label: "Sunset",
    swatches: ["#fff4e8", "#f97316", "#ec4899"],
  },
  {
    id: "glass",
    label: "Glass",
    swatches: ["#eef7ff", "#60a5fa", "#ffffff"],
  },
  {
    id: "graphite",
    label: "Graphite",
    swatches: ["#111827", "#94a3b8", "#facc15"],
  },
];

export const DEFAULT_THEME = "spatial";

export function resolveTheme(themeId) {
  return themes.find((theme) => theme.id === themeId)?.id || DEFAULT_THEME;
}
