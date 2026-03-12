# Design Tokens Reference

This document defines the design token system used in the `flexxus-picking-mobile` app, including border radius values and spacing scale. These tokens ensure visual consistency and enable systematic updates across the application.

## Border Radius Tokens

Border radius values define the roundness of corners across all UI components. These values are aligned with the desktop application's "Industrial Command Center" aesthetic while maintaining mobile-appropriate softness.

| Token | Value | Usage | Rationale |
|-------|-------|-------|-----------|
| `radius.sm` | 6px | Small rounded corners - buttons, inputs, badges | Tighter than previous 10px for desktop parity. Provides subtle rounding without softening the industrial aesthetic. |
| `radius.md` | 10px | Medium rounded corners - cards, panels | Previously 16px. Balanced middle-ground between desktop's tight corners and mobile's need for visual softness. |
| `radius.lg` | 14px | Large rounded corners - large cards, modals | Previously 22px. Largest standard radius for prominent containers. Maintains softness while aligning closer to desktop. |
| `radius.pill` | 999px | Pill-shaped elements - tags, buttons | Creates fully rounded ends. Used for pill buttons and tags. |

### Migration from Previous Values

The border radius system was updated in March 2026 to align with desktop design:

| Token | Before | After | Change |
|-------|--------|-------|--------|
| `radius.sm` | 10px | **6px** | -40% (tighter corners) |
| `radius.md` | 16px | **10px** | -37.5% (medium tightness) |
| `radius.lg` | 22px | **14px** | -36% (noticeably tighter but still soft) |

**Rationale for alignment**: The desktop application uses a tighter, more industrial aesthetic with smaller border radius values (~4-8px). The mobile app's previous values (10, 16, 22) created a noticeably softer, more casual appearance. The new values (6, 10, 14) bridge this gap while maintaining sufficient softness for mobile touch targets and visual comfort.

### Implementation

```typescript
// flexxus-picking-mobile/src/theme/spacing.ts
import { radius } from '../theme'

// Usage in components
const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md, // 10px
  },
  button: {
    borderRadius: radius.sm, // 6px
  },
  modal: {
    borderRadius: radius.lg, // 14px
  },
})
```

## Spacing Scale

The spacing scale defines consistent values for padding, margins, and gaps. This scale is based on a 4px base unit, following common design system conventions.

| Token | Value | Usage Examples |
|-------|-------|----------------|
| `spacing.xxs` | 4px | Tight spacing - icon padding, tiny gaps |
| `spacing.xs` | 8px | Small spacing - compact element gaps |
| `spacing.sm` | 12px | Medium-small spacing - card padding, gap between related items |
| `spacing.md` | 16px | Medium spacing - standard card padding, comfortable gaps |
| `spacing.lg` | 20px | Medium-large spacing - generous card padding |
| `spacing.xl` | 24px | Large spacing - section padding, major gaps |
| `spacing.xxl` | 32px | Extra-large spacing - screen-edge padding, major section breaks |
| `spacing.xxxl` | 40px | Massive spacing - hero section padding, dramatic spacing |

### Spacing Best Practices

1. **Always use spacing tokens** - Never hardcode numeric spacing values
2. **Match desktop spacing where appropriate** - Most spacing values align with desktop's 8px base scale
3. **Respect touch targets** - Interactive elements need ≥44px height (iOS) or ≥48px (Android)
4. **Maintain visual rhythm** - Use consistent spacing within components (e.g., all card padding uses `spacing.md`)

### Spacing Hierarchy

- **Tight** (xxs, xs): Inner-component spacing, icon padding, dense layouts
- **Comfortable** (sm, md, lg): Default spacing for most UI elements
- **Generous** (xl, xxl, xxxl): Section breaks, screen margins, major whitespace

### Mobile-Specific Adaptations

The mobile app uses the same base scale as desktop but applies larger values for certain use cases:

- **Card padding**: `spacing.lg` (20px) on mobile vs desktop's 16px - accounts for touch targets
- **Screen margins**: `spacing.md` (16px) minimum - maintains safe area from device edges
- **Button height**: 54px minimum - exceeds iOS/Android touch target guidelines for accessibility

These adaptations prioritize touch ergonomics while maintaining visual consistency with desktop.

### Implementation

```typescript
// flexxus-picking-mobile/src/theme/spacing.ts
import { spacing } from '../theme'

// Usage in components
const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,      // 20px
    marginBottom: spacing.md, // 16px
  },
  button: {
    paddingHorizontal: spacing.xl, // 24px
    paddingVertical: spacing.md,   // 16px
  },
  screen: {
    padding: spacing.md,      // 16px screen margin
  },
})
```

## Alignment with Desktop

This design token system achieves visual parity with the desktop application through:

1. **Tighter border radius** - New values (6, 10, 14) are significantly closer to desktop's aesthetic than previous values (10, 16, 22)
2. **Consistent spacing scale** - Same 4px base unit and similar scale progression
3. **Mobile-appropriate adaptations** - Larger touch targets and padding where needed for usability

### Desktop Comparison

| Element | Desktop | Mobile (Before) | Mobile (After) | Status |
|---------|---------|-----------------|----------------|--------|
| Small radius | ~4-6px | 10px | **6px** | ✅ Aligned |
| Medium radius | ~6-8px | 16px | **10px** | ✅ Close alignment |
| Large radius | ~8-10px | 22px | **14px** | ✅ Reasonable alignment |
| Spacing base | 4px | 4px | **4px** | ✅ Exact match |

## Maintenance

When updating design tokens:

1. **Update this document** - Document the rationale for any changes
2. **Update theme files** - Modify values in `src/theme/spacing.ts`
3. **Test visual impact** - Run app on physical devices to verify changes
4. **Consider platform differences** - Document any mobile-specific adaptations
5. **Maintain semantic naming** - Use `sm/md/lg` rather than pixel values in component code

## Future Considerations

- **Typography scale**: Font sizes and line heights are defined in `src/theme/typography.ts`
- **Color tokens**: Semantic colors (accent, surface, text) are defined in `src/theme/colors.ts`
- **Animation timing**: Transition durations should be standardized (not yet implemented)
- **Shadow system**: Elevation shadows could be tokenized for consistency (currently inline)

## References

- Design spec: `sdd/mobile-visual-refactor-desktop-parity/spec`
- Implementation tasks: `sdd/mobile-visual-refactor-desktop-parity/tasks`
- Technical design: `sdd/mobile-visual-refactor-desktop-parity/design`
