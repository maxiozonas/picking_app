import { colors } from './colors'
import { fontFamily, fontSize, lineHeight } from './typography'
import { radius, spacing } from './spacing'

export const theme = {
  colors,
  spacing,
  radius,
  typography: {
    fontFamily,
    fontSize,
    lineHeight,
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.22,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    accent: {
      shadowColor: colors.accent,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  },
} as const

export type AppTheme = typeof theme
