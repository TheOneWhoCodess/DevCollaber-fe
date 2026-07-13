/**
 * City theme definitions.
 *
 * Each theme touches a small, consistent set of tokens: accent, background,
 * surface (glass tint), text, textMuted, a background photo, and a dark
 * overlay gradient laid on top of that photo for legibility. This keeps
 * every city feeling like a variation of the same app rather than a
 * different product, and keeps the token surface small enough that adding
 * a new city is data-entry, not code.
 *
 * `image` paths are served from /public — filenames must match exactly,
 * including case, since Windows/macOS filesystems are case-insensitive
 * but Linux deploy targets (Vercel etc.) are not.
 */

export type ThemeAnimation = "none" | "drift" | "pulse" | "flicker";

export interface CityTheme {
  id: string;
  label: string;
  /** One line describing the real-world reference the palette is drawn from. */
  reference: string;
  colors: {
    /** Primary interactive accent — sent bubbles, active states, online dot */
    accent: string;
    /** On-accent text (e.g. text inside a filled accent button/bubble) */
    onAccent: string;
    /** Page background base color (shows briefly before the photo loads) */
    background: string;
    /** Glass-panel tint, as an rgba() so liquid-glass keeps its blur */
    surface: string;
    /** Glass-panel border tint */
    surfaceBorder: string;
    /** Primary text color */
    text: string;
    /** Muted/secondary text (timestamps, labels, placeholders) */
    textMuted: string;
  };
  /** Path to the background photo/illustration, served from /public */
  image: string;
  /** CSS background-image value for the dark scrim layered over the photo, for legibility */
  overlay: string;
  animation: ThemeAnimation;
}

export const CITY_THEMES: CityTheme[] = [
  {
    id: "tokyo",
    label: "Tokyo",
    reference: "Shibuya crossing after dark",
    colors: {
      accent: "#00E5D4",
      onAccent: "#04120F",
      background: "#08090C",
      surface: "rgba(0, 229, 212, 0.06)",
      surfaceBorder: "rgba(0, 229, 212, 0.16)",
      text: "#EDEFF2",
      textMuted: "rgba(237, 239, 242, 0.35)",
    },
    image: "/tokyo.png",
    overlay:
      "linear-gradient(180deg, rgba(8,9,12,0.55) 0%, rgba(8,9,12,0.78) 60%, rgba(8,9,12,0.92) 100%)",
    animation: "flicker",
  },
  {
    id: "havana",
    label: "Havana",
    reference: "Faded coral & turquoise Malecón facades",
    colors: {
      accent: "#FF6B4A",
      onAccent: "#2A0E06",
      background: "#141311",
      surface: "rgba(255, 214, 170, 0.05)",
      surfaceBorder: "rgba(255, 214, 170, 0.14)",
      text: "#FBF3EA",
      textMuted: "rgba(251, 243, 234, 0.35)",
    },
    image: "/havana.png",
    overlay:
      "linear-gradient(180deg, rgba(20,19,17,0.55) 0%, rgba(20,19,17,0.78) 60%, rgba(20,19,17,0.92) 100%)",
    animation: "none",
  },
  {
    id: "marrakech",
    label: "Marrakech",
    reference: "Zellige tilework, indigo night market",
    colors: {
      accent: "#E8A23D",
      onAccent: "#251200",
      background: "#0D0E1C",
      surface: "rgba(232, 162, 61, 0.05)",
      surfaceBorder: "rgba(232, 162, 61, 0.15)",
      text: "#F3EEE3",
      textMuted: "rgba(243, 238, 227, 0.35)",
    },
    image: "/Marrakech.png",
    overlay:
      "linear-gradient(180deg, rgba(13,14,28,0.55) 0%, rgba(13,14,28,0.78) 60%, rgba(13,14,28,0.92) 100%)",
    animation: "none",
  },
  {
    id: "reykjavik",
    label: "Reykjavik",
    reference: "Aurora over lava rock",
    colors: {
      accent: "#7CF2C0",
      onAccent: "#04140D",
      background: "#0A0B10",
      surface: "rgba(124, 242, 192, 0.05)",
      surfaceBorder: "rgba(124, 242, 192, 0.14)",
      text: "#EAF0EE",
      textMuted: "rgba(234, 240, 238, 0.32)",
    },
    image: "/Reykjavik.png",
    overlay:
      "linear-gradient(180deg, rgba(10,11,16,0.55) 0%, rgba(10,11,16,0.78) 60%, rgba(10,11,16,0.92) 100%)",
    animation: "drift",
  },
  {
    id: "rio",
    label: "Rio de Janeiro",
    reference: "Golden hour over Copacabana",
    colors: {
      accent: "#FFC24B",
      onAccent: "#2B1600",
      background: "#120A14",
      surface: "rgba(255, 140, 120, 0.05)",
      surfaceBorder: "rgba(255, 194, 75, 0.15)",
      text: "#FBF0E8",
      textMuted: "rgba(251, 240, 232, 0.35)",
    },
    image: "/Rio.png",
    overlay:
      "linear-gradient(180deg, rgba(18,10,20,0.55) 0%, rgba(18,10,20,0.78) 60%, rgba(18,10,20,0.92) 100%)",
    animation: "pulse",
  },
  {
    id: "seoul",
    label: "Seoul",
    reference: "Hongdae neon alleyway",
    colors: {
      accent: "#FF7AD9",
      onAccent: "#210014",
      background: "#0B0B10",
      surface: "rgba(255, 122, 217, 0.05)",
      surfaceBorder: "rgba(255, 122, 217, 0.15)",
      text: "#F1EEF5",
      textMuted: "rgba(241, 238, 245, 0.35)",
    },
    image: "/Seoul.jpg",
    overlay:
      "linear-gradient(180deg, rgba(11,11,16,0.55) 0%, rgba(11,11,16,0.78) 60%, rgba(11,11,16,0.92) 100%)",
    animation: "flicker",
  },
  {
    id: "capetown",
    label: "Cape Town",
    reference: "Bo-Kaap houses beneath Table Mountain",
    colors: {
      accent: "#FF8A3D",
      onAccent: "#2A1000",
      background: "#0C1210",
      surface: "rgba(90, 200, 140, 0.05)",
      surfaceBorder: "rgba(255, 138, 61, 0.15)",
      text: "#F1F3EE",
      textMuted: "rgba(241, 243, 238, 0.35)",
    },
    image: "/CapeTown.png",
    overlay:
      "linear-gradient(180deg, rgba(12,18,16,0.55) 0%, rgba(12,18,16,0.78) 60%, rgba(12,18,16,0.92) 100%)",
    animation: "none",
  },
];

export const DEFAULT_THEME_ID = "tokyo";

export function getTheme(id: string | null | undefined): CityTheme {
  return CITY_THEMES.find((t) => t.id === id) ?? CITY_THEMES[0];
}