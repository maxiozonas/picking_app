import type { PropsWithChildren, ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, radius, spacing, theme } from '../../theme'

type ScreenProps = PropsWithChildren<{
  title?: string
  eyebrow?: string
  subtitle?: string
  scrollable?: boolean
  footer?: ReactNode
}>
function BackgroundDecor() {
  return (
    <>
      <View style={styles.gridFrame} />
      <View style={styles.gridInset} />
      <View style={styles.glowTop} />
      <View style={styles.glowMiddle} />
      <View style={styles.glowBottom} />
    </>
  )
}

export function Screen({ children, title, eyebrow, subtitle, scrollable, footer }: ScreenProps) {
  const content = (
    <View style={styles.content}>
      {(eyebrow || title || subtitle) && (
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={[styles.title, subtitle ? styles.titleWithSubtitle : null]}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {children}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      <BackgroundDecor />
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : content}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 1.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 34,
    lineHeight: 34,
  },
  titleWithSubtitle: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    maxWidth: 360,
  },
  footer: {
    backgroundColor: colors.overlayStrong,
    borderTopColor: 'rgba(130, 136, 153, 0.08)',
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -20,
    width: 220,
    height: 220,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
  },
  glowMiddle: {
    position: 'absolute',
    top: 140,
    left: '18%',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.pill,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.pill,
  },
  gridFrame: {
    position: 'absolute',
    inset: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(130, 136, 153, 0.07)',
    borderRadius: radius.lg,
  },
  gridInset: {
    position: 'absolute',
    inset: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(130, 136, 153, 0.035)',
    borderRadius: radius.md,
  },
})
