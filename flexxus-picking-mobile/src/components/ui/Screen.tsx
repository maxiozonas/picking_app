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

/**
 * BACKGROUND DECORATION PATTERN
 *
 * This component implements the "Industrial Command Center" visual effects that
 * provide the ambient, technical aesthetic matching the desktop application.
 *
 * The pattern consists of three layered effects:
 *
 * 1. AMBIENT GLOW ACCENTS (Top-right and Bottom-left)
 *    - Top glow: `accentSoft` (rgba(227, 63, 47, 0.14)) positioned off-screen top-right
 *      - Size: 240x240px circular gradient
 *      - Position: top: -140, right: -40 (partially off-screen)
 *      - Purpose: Warm red accent matching desktop's primary color
 *    - Bottom glow: Cool blue (rgba(87, 166, 255, 0.08)) positioned off-screen bottom-left
 *      - Size: 240x240px circular gradient
 *      - Position: bottom: -120, left: -80 (partially off-screen)
 *      - Purpose: Cool accent that complements the warm top glow
 *    - Both glows use `borderRadius: radius.pill` (999px) for perfect circles
 *    - Intensities are subtle (8-14% opacity) to avoid overwhelming content
 *
 * 2. GRID OVERLAY (Technical texture)
 *    - Implementation: Single-pixel border with inset spacing
 *    - Color: rgba(130, 136, 153, 0.05) (5% opacity gray)
 *    - Spacing: `spacing.sm` (8px) inset from all screen edges
 *    - Border radius: `radius.lg` (14px after Phase 4 refactor)
 *    - Purpose: Creates a framed, technical feel similar to desktop's CSS grid pattern
 *
 * 3. DESKTOP EQUIVALENT
 *    - Desktop uses CSS `linear-gradient` to create a 32px grid pattern:
 *      ```css
 *      background-image:
 *        linear-gradient(rgba(100, 110, 130, 0.035) 1px, transparent 1px),
 *        linear-gradient(90deg, rgba(100, 110, 130, 0.035) 1px, transparent 1px);
 *      background-size: 32px 32px;
 *      ```
 *    - Desktop uses centered ambient glow: `bg-primary/5 blur-[120px]` (500px circle)
 *    - Mobile adaptation: Border-based grid (vs CSS pattern) and dual-positioned glows
 *
 * USAGE GUIDELINES:
 * - DO NOT modify glow intensities or grid spacing without design review
 * - All new screens should use this Screen component to maintain visual consistency
 * - Custom screen backgrounds should follow this pattern for visual parity
 * - The effects are layered: grid on top, glows behind content but above background
 *
 * PLATFORM ADAPTATION:
 * - Mobile uses border-based grid (simpler, more performant on native)
 * - Desktop uses CSS gradient grid (more flexible for web)
 * - Both achieve the same "industrial terminal" aesthetic
 *
 * @see docs/visual-effects.md for comprehensive documentation and usage examples
 */
function BackgroundDecor() {
  return (
    <>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.grid} />
    </>
  )
}

export function Screen({ children, title, eyebrow, subtitle, scrollable, footer }: ScreenProps) {
  const content = (
    <View style={styles.content}>
      {(eyebrow || title || subtitle) && (
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {children}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'top', 'right', 'bottom', 'left' ]}>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.8,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.display,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    maxWidth: 420,
  },
  footer: {
    borderTopColor: 'rgba(130, 136, 153, 0.08)',
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  glowTop: {
    position: 'absolute',
    top: -140,
    right: -40,
    width: 240,
    height: 240,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(87, 166, 255, 0.08)',
    borderRadius: radius.pill,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1,
    borderColor: 'rgba(130, 136, 153, 0.05)',
    margin: spacing.sm,
    borderRadius: radius.lg,
  },
})
