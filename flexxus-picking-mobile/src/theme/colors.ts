export const colors = {
  bg: '#0B0D0F',
  bgMuted: '#111418',
  surface: '#131518',
  surfaceElevated: '#1A1D22',
  surfaceStrong: '#20242B',
  text: '#E2E6EC',
  textMuted: '#828899',
  textSoft: '#A7AFBE',
  border: '#252830',
  accent: '#E33F2F',
  accentPressed: '#C73628',
  accentSoft: 'rgba(227, 63, 47, 0.14)',
  success: '#3FAF72',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#57A6FF',
  overlay: 'rgba(8, 10, 12, 0.84)',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const

export type ColorToken = keyof typeof colors
