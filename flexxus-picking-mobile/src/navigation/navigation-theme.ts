import { DefaultTheme } from '@react-navigation/native'

import { colors } from '../theme'

export const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
    primary: colors.accent,
    text: colors.text,
    notification: colors.accent,
  },
}
