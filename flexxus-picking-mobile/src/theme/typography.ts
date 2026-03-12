// Custom fonts matching desktop "Industrial Command Center" aesthetic
// Fonts are loaded via expo-font in AppBootstrap.tsx
export const fontFamily = {
  body: 'IBM Plex Sans', // Primary font for body text, labels, UI elements
  display: 'Barlow Condensed', // Display font for headings, titles, emphasis
  mono: 'IBM Plex Mono', // Monospace font for codes, IDs, technical data
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
} as const

export const lineHeight = {
  tight: 1.1,
  base: 1.35,
  relaxed: 1.5,
} as const
