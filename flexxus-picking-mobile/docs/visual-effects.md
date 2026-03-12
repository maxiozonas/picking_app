# Visual Effects System

## Purpose

This document describes the "Industrial Command Center" visual effects system used throughout the mobile app to maintain visual parity with the desktop application. These effects create the ambient, technical aesthetic that defines the Flexxus Picking experience.

---

## Overview

The visual effects system consists of three layered components:

1. **Ambient Glow Accents** - Subtle colored gradients positioned at screen corners
2. **Grid Overlay** - Technical texture that frames the content area
3. **Background Color** - Deep near-black base (`colors.bg`)

These effects are automatically applied by the `Screen` component, which should be used for all app screens.

---

## Component Reference

### Screen Component

**Location**: `src/components/ui/Screen.tsx`

**Purpose**: Provides consistent layout, typography, and visual effects across all screens.

**Usage**:
```tsx
import { Screen } from '../../components/ui/Screen'

export function MyScreen() {
  return (
    <Screen
      eyebrow="Section label"
      title="Screen Title"
      subtitle="Optional subtitle text"
      scrollable={true} // or false for non-scrollable screens
      footer={<FooterContent />}
    >
      {/* Screen content */}
    </Screen>
  )
}
```

**Props**:
- `title?: string` - Main heading using Barlow Condensed display font
- `eyebrow?: string` - Small uppercase label above title (uses accent color)
- `subtitle?: string` - Descriptive text below title (uses muted text color)
- `scrollable?: boolean` - Whether content should be scrollable (default: false)
- `footer?: ReactNode` - Optional footer content with top border

**Features**:
- Automatic ambient glow effects (top-right and bottom-left)
- Automatic grid overlay with 8px inset
- Safe area handling for notched devices
- Consistent header spacing (xl padding below header)
- Scroll content padding for scrollable screens

---

## Visual Effects Specification

### 1. Ambient Glow Accents

The glow effects create a subtle, colored ambient lighting effect that matches the desktop application's glow aesthetic.

#### Top Glow (Warm Accent)

**Purpose**: Adds warm brand color accent to upper-right quadrant

**Implementation**:
```tsx
const styles = StyleSheet.create({
  glowTop: {
    position: 'absolute',
    top: -140,        // Positioned partially off-screen
    right: -40,       // Offset from right edge
    width: 240,       // Circle diameter
    height: 240,
    backgroundColor: colors.accentSoft, // rgba(227, 63, 47, 0.14)
    borderRadius: radius.pill, // 999px for perfect circle
  },
})
```

**Color**: `colors.accentSoft` = `rgba(227, 63, 47, 0.14)` (14% opacity red)

**Rationale**:
- Matches desktop's primary color (#E33F2F)
- Low opacity (14%) ensures subtlety
- Off-screen positioning creates ambient feel without competing with content

#### Bottom Glow (Cool Accent)

**Purpose**: Adds cool complementary accent to lower-left quadrant

**Implementation**:
```tsx
const styles = StyleSheet.create({
  glowBottom: {
    position: 'absolute',
    bottom: -120,    // Positioned partially off-screen
    left: -80,       // Offset from left edge
    width: 240,      // Circle diameter
    height: 240,
    backgroundColor: 'rgba(87, 166, 255, 0.08)', // Cool blue
    borderRadius: radius.pill, // 999px for perfect circle
  },
})
```

**Color**: `'rgba(87, 166, 255, 0.08)'` (8% opacity blue)

**Rationale**:
- Cool blue complements warm red top glow
- Even lower opacity (8%) for visual balance
- Different positioning prevents symmetry that feels artificial

**Layering**: Both glows are rendered first (behind grid overlay) to create depth.

---

### 2. Grid Overlay

The grid overlay creates a framed, technical texture that matches the desktop's CSS grid pattern.

#### Mobile Grid Implementation

**Purpose**: Creates a technical "terminal" feel by framing content area

**Implementation**:
```tsx
const styles = StyleSheet.create({
  grid: {
    position: 'absolute',
    inset: 0,        // Full screen coverage
    borderWidth: 1,  // Single-pixel border
    borderColor: 'rgba(130, 136, 153, 0.05)', // 5% opacity gray
    margin: spacing.sm, // 8px inset from edges
    borderRadius: radius.lg, // 14px rounded corners
  },
})
```

**Characteristics**:
- Single-pixel border (not a full grid pattern)
- 8px inset from screen edges (`spacing.sm`)
- 14px border radius (`radius.lg`) for soft corners
- 5% opacity for subtlety (doesn't compete with content)

**Rationale for Border Approach**:
- Simpler and more performant on native platforms
- Creates similar visual effect to desktop's CSS grid
- Easier to maintain and adjust
- Platform-appropriate adaptation

#### Desktop Grid Comparison

**Desktop Implementation** (for reference):
```css
.bg-grid {
  background-image:
    linear-gradient(rgba(100, 110, 130, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 110, 130, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

**Key Differences**:
- Desktop uses CSS linear-gradient to create a 32px grid pattern
- Mobile uses single-pixel border with inset spacing
- Both achieve the same "industrial terminal" aesthetic
- Mobile approach is optimized for React Native performance

---

### 3. Background Color

**Implementation**: `colors.bg` (defined in theme)

**Purpose**: Provides deep, dark base for content

**Characteristics**:
- Near-black background (matches desktop `--background: 216 14% 5%`)
- High contrast with text and UI elements
- Creates immersive "command center" feel

---

## Layering and Rendering Order

The visual effects are layered in this order (bottom to top):

1. **Background Color** (`colors.bg`) - Base layer
2. **Top Glow** (`glowTop`) - Positioned off-screen top-right
3. **Bottom Glow** (`glowBottom`) - Positioned off-screen bottom-left
4. **Grid Overlay** (`grid`) - On top of glows
5. **Safe Area Content** - Screen content (highest z-index)

This layering ensures:
- Glows create ambient backdrop
- Grid frames the content area
- Content remains readable with high contrast
- Effects don't interfere with touch targets

---

## Usage Guidelines

### When to Use Screen Component

**DO** use the `Screen` component for:
- All top-level screen components
- Modal screens that need full visual effects
- Any screen that's part of the main navigation flow

**DO NOT** use the `Screen` component for:
- Inline components (cards, sheets, dialogs)
- Overlay views that shouldn't have background effects
- Test components or previews

### Custom Background Patterns

If you need to create a custom screen with different visual effects:

1. **Copy the pattern** from `BackgroundDecor()` in Screen.tsx
2. **Adjust colors/positions** to match your design intent
3. **Document the changes** in this file
4. **Get design review approval** before merging

**Example**:
```tsx
function CustomBackgroundDecor() {
  return (
    <>
      <View style={customStyles.glowTop} />
      <View style={customStyles.glowBottom} />
      <View style={customStyles.grid} />
    </>
  )
}
```

### Visual Effect Intensities

**DO NOT** modify glow intensities or grid spacing without design review.

Current values are carefully tuned:
- Top glow: 14% opacity (warm accent)
- Bottom glow: 8% opacity (cool accent)
- Grid border: 5% opacity (subtle texture)

If you need different intensities:
1. Create a design mockup showing the intended effect
2. Get stakeholder approval
3. Update this documentation with the new values
4. Ensure consistency across all affected screens

---

## Platform Considerations

### Mobile vs Desktop

| Aspect | Desktop (Web) | Mobile (React Native) |
|--------|---------------|----------------------|
| **Grid Pattern** | CSS linear-gradient (32px) | Single-pixel border (8px inset) |
| **Glow Position** | Centered, 500px circle | Dual-positioned (top-right, bottom-left), 240px circles |
| **Glow Color** | `bg-primary/5` (5% opacity) | `accentSoft` (14%) + cool blue (8%) |
| **Blur Effect** | `blur-[120px]` CSS filter | No blur (solid circles) |
| **Performance** | GPU-accelerated CSS | Native rendering (optimized) |

**Rationale**: The mobile implementation is a platform-appropriate adaptation that achieves the same visual aesthetic through native patterns.

---

## Screens Using This Pattern

All current screens use the `Screen` component consistently:

- ✅ `LoginScreen` (`src/screens/auth/LoginScreen.tsx`)
- ✅ `PendingOrdersScreen` (`src/screens/orders/PendingOrdersScreen.tsx`)
- ✅ `OrderDetailScreen` (`src/screens/orders/OrderDetailScreen.tsx`)

**Audit Date**: 2026-03-12
**Consistency**: 100% (3/3 screens)

---

## Maintenance and Updates

### When to Update This Document

Update this document when:
- New visual effects are added
- Glow intensities or positions change
- Grid pattern implementation changes
- New screens are added that don't use `Screen` component
- Platform-specific adaptations are made

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-12 | Initial documentation (Phase 6 implementation) |

---

## Related Documentation

- **Design Tokens**: `docs/design-tokens.md` - Border radius and spacing values
- **Login Screen Parity**: `docs/login-screen-parity.md` - Visual comparison with desktop
- **Orders Screen Parity**: `docs/orders-screen-parity.md` - Visual comparison with desktop
- **Button Variants**: `docs/button-variants.md` - Button component documentation

---

## Code Reference

**Main Implementation**: `src/components/ui/Screen.tsx`

**Key Functions**:
- `BackgroundDecor()` - Renders glow effects and grid overlay
- `Screen()` - Main screen component with effects, layout, and typography

**Theme Dependencies**:
- `colors.bg` - Background color
- `colors.accentSoft` - Top glow color
- `radius.lg` - Grid border radius (14px)
- `radius.pill` - Glow circle radius (999px)
- `spacing.sm` - Grid inset spacing (8px)

---

## Design Rationale

### Why Visual Effects Matter

The "Industrial Command Center" aesthetic serves multiple purposes:

1. **Brand Identity** - Distinctive visual language that differentiates Flexxus Picking
2. **User Focus** - Subtle effects don't distract from primary tasks
3. **Professional Feel** - Technical aesthetic reinforces precision and reliability
4. **Desktop Parity** - Consistent experience across platforms

### Design Principles

1. **Subtlety First** - Effects should be felt, not explicitly noticed
2. **Performance Matters** - Native rendering ensures smooth 60fps
3. **Consistency is Key** - All screens follow the same pattern
4. **Platform Appropriate** - Native implementation, not web emulation

---

## Troubleshooting

### Glow Effects Not Visible

**Symptom**: Glow circles are not visible on screen

**Possible Causes**:
1. Background color is too light (glows blend in)
2. Content opacity is too high (blocks glows)
3. Z-index issue (content renders on top of glows)

**Solutions**:
- Verify `colors.bg` is deep near-black
- Check content doesn't have high-opacity backgrounds
- Ensure `BackgroundDecor()` renders before content in JSX

### Grid Border Not Visible

**Symptom**: Grid overlay border is not visible

**Possible Causes**:
1. Border opacity too low (5% is very subtle)
2. Border radius too large (curves are indistinguishable)
3. Screen background color conflicts with border

**Solutions**:
- Increase opacity to 0.08 or 0.10 temporarily for debugging
- Reduce `radius.lg` to see corners more clearly
- Check screen background is `colors.bg`, not overriding color

### Performance Issues

**Symptom**: Screen rendering feels slow or janky

**Possible Causes**:
1. Too many absolute-positioned elements
2. Large glow circles causing GPU overdraw
3. Grid border causing layout thrashing

**Solutions**:
- Profile with React DevTools Profiler
- Consider reducing glow circle size (240px → 200px)
- Ensure `position: 'absolute'` is only used for background effects

---

## Appendix: Desktop Comparison

### Desktop LoginPage Visual Effects

**File**: `flexxus-picking-desktop/src/pages/LoginPage.tsx`

```tsx
{/* Ambient glow */}
<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
  <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
</div>

{/* Background with grid */}
<div className="bg-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
  {/* Content */}
</div>
```

**Key Characteristics**:
- Single centered glow (500px circle, 5% opacity, 120px blur)
- CSS grid pattern (32px spacing, 3.5% opacity)
- Full-screen coverage

### Mobile Adaptation

**File**: `flexxus-picking-mobile/src/components/ui/Screen.tsx`

```tsx
function BackgroundDecor() {
  return (
    <>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.grid} />
    </>
  )
}
```

**Key Adaptations**:
- Dual-positioned glows (warm top-right, cool bottom-left)
- Smaller circles (240px) for mobile screen sizes
- Higher opacity (8-14%) to compensate for smaller size
- No blur (solid circles render better on native)
- Border-based grid (simpler, more performant)

**Visual Parity**: ✅ Achieved through different means

---

## Contact and Approval

**Design Review**: All visual effects changes require design review before merging.

**Documentation Maintainer**: Frontend team

**Last Updated**: 2026-03-12 (Phase 6: Visual Effects Systematization)
