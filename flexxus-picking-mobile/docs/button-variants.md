# Button Component Variants

## Overview

The Button component provides multiple variants to support different UI contexts and actions throughout the mobile app. All variants share consistent touch target sizing, border radius, and press feedback patterns.

## Available Variants

### `primary` (Default)
**Purpose**: Main actions and primary call-to-action buttons.

**Visual Style**:
- Background: `colors.accent` (#E33F2F)
- Text: `colors.white` (#FFFFFF)
- Border: Accent color (solid)
- Pressed: `colors.accentPressed` (#C73628)

**Use Cases**:
- Login screen: "Ingresar al picking"
- Orders: "Start Picking", "Confirm Action"
- Forms: Primary submission actions
- Modals: Primary confirmation

**Example**:
```tsx
<Button label="Ingresar al picking" onPress={handleLogin} variant="primary" />
```

---

### `secondary`
**Purpose**: Alternative actions and complementary options.

**Visual Style**:
- Background: `colors.surfaceElevated` (#1A1D22)
- Text: `colors.text` (#E2E6EC)
- Border: `colors.border` (#252830)
- Pressed: `colors.surfaceStrong` (#20242B)

**Use Cases**:
- "Cancel", "Go Back"
- Alternative choices in modals
- Non-destructive secondary actions
- Navigation alternatives

**Example**:
```tsx
<Button label="Cancelar" onPress={handleCancel} variant="secondary" />
```

---

### `ghost`
**Purpose**: Low-emphasis tertiary actions.

**Visual Style**:
- Background: Transparent
- Text: `colors.textMuted` (#828899)
- Border: Transparent
- Pressed: `colors.surfaceElevated` (#1A1D22)

**Use Cases**:
- "Skip", "Dismiss"
- Low-priority actions
- Non-critical options

**Example**:
```tsx
<Button label="Omitir" onPress={handleSkip} variant="ghost" />
```

---

### `danger`
**Purpose**: Destructive actions and irreversible operations.

**Visual Style**:
- Background: `colors.danger` (#EF4444)
- Text: `colors.white` (#FFFFFF)
- Border: Danger color (solid)
- Pressed: Darker red (#D63B3B)

**Use Cases**:
- "Delete", "Remove"
- "Cancel Order"
- Destructive data operations
- Irreversible state changes

**Example**:
```tsx
<Button label="Eliminar pedido" onPress={handleDelete} variant="danger" />
```

---

### `outline` (New)
**Purpose**: Secondary actions that need visual emphasis but less than primary.

**Visual Style**:
- Background: Transparent
- Text: `colors.accent` (#E33F2F)
- Border: `colors.accent` (#E33F2F)
- Pressed: `colors.accentSoft` (rgba(227, 63, 47, 0.14))

**Use Cases**:
- "View Details", "View Order"
- "Reintentar" (Retry)
- Informational actions
- Secondary actions in cards or lists

**Why This Variant?**:
- Provides visual hierarchy between primary and ghost actions
- Matches desktop outline button pattern for visual parity
- Creates clear affordance for interactive elements
- Accent border draws attention without competing with primary buttons

**Example**:
```tsx
<Button label="Ver detalles" onPress={viewDetails} variant="outline" />
```

**Implementation Notes**:
- Added in Phase 5 of mobile visual refactor
- Uses `accentSoft` for pressed state to provide subtle feedback
- Maintains touch target accessibility with 54px minimum height

---

## Link Variant Decision (NOT Implemented)

### Evaluation
After evaluating LoginScreen and PendingOrdersScreen for tertiary text-only actions, the decision was made **NOT** to implement a `link` variant.

### Rationale

1. **Native UX Patterns**: Native mobile apps typically use `Text` with `onPress` for inline actions rather than button-like link components. This follows platform conventions for iOS and Android.

2. **No Current Use Case**: Review of existing screens revealed no clear need for a link variant:
   - LoginScreen: Only has primary action ("Ingresar al picking")
   - PendingOrdersScreen: Uses primary/outline actions in cards, no inline text actions
   - ErrorState: Uses action buttons for retry/cancel

3. **Desktop vs Mobile Difference**: Desktop web apps use link-style buttons for tertiary actions (e.g., "Forgot password"). Native mobile apps achieve the same goal with touchable text, which feels more natural on touch interfaces.

4. **Alternative Pattern**: If future needs arise, use this pattern instead:
   ```tsx
   <Text
     onPress={handleAction}
     style={{ color: colors.accent, fontFamily: theme.typography.fontFamily.body }}
   >
     Action text
   </Text>
   ```

### Reversible Decision
This decision can be revisited if:
- A clear use case emerges during screen-level implementation
- Stakeholder feedback indicates need for link-style buttons
- Desktop parity requirements demand exact variant matching

---

## Common Props

All variants support these props:

```typescript
type ButtonProps = {
  label: string           // Button text (required)
  onPress?: () => void    // Press handler (required for interactive buttons)
  loading?: boolean       // Show loading spinner (default: false)
  disabled?: boolean      // Disable interaction (default: false)
  variant?: ButtonVariant // Visual style (default: 'primary')
  icon?: ReactNode        // Optional icon to display before label
}
```

---

## Accessibility

### Touch Targets
- **Minimum height**: 54px (exceeds iOS 44px and Android 48px guidelines)
- **Border radius**: 10px (`theme.radius.md`) from Phase 4 design token alignment
- **Press feedback**: All variants provide visual feedback on press

### Disabled State
- Opacity reduced to 0.5
- Press feedback disabled
- Loading spinner replaces icon (if present)

### Loading State
- ActivityIndicator shown with appropriate text color
- Button remains disabled during loading
- Press feedback disabled

---

## Design System Alignment

### Phase 4: Design Token Alignment
- Border radius: Uses `theme.radius.md` (10px) for all buttons
- Spacing: Uses `theme.spacing.lg` for horizontal padding
- Typography: Uses `theme.typography.fontFamily.display` (Barlow Condensed)

### Phase 5: Component Variant Alignment
- Added `outline` variant for desktop parity
- Evaluated `link` variant (decided against)
- Documented all variants with usage guidelines

---

## Migration Notes

### Before Phase 5
Button component had 4 variants: `primary`, `secondary`, `ghost`, `danger`

### After Phase 5
Button component has 5 variants: `primary`, `secondary`, `ghost`, `danger`, `outline` (NEW)

### Breaking Changes
None. The `outline` variant is additive. Existing code continues to work unchanged.

---

## Future Considerations

1. **Button Sizing**: Current minimum height is 54px for touch accessibility. If visual parity requires smaller buttons to match desktop (36px), evaluate accessibility trade-offs.

2. **Link Variant**: Monitor usage patterns during screen-level implementation. If inline text actions become common, reconsider link variant implementation.

3. **Additional Variants**: Future variants could include:
   - `success`: Green background for positive actions
   - `warning`: Yellow background for caution actions
   - `info`: Blue background for informational actions

---

## Related Documentation

- [Design Tokens](./design-tokens.md) - Border radius and spacing system
- [Visual Effects](./visual-effects.md) - Glow and grid patterns
- [Typography](../theme/typography.ts) - Font families and sizes
- AGENTS.md - Project conventions and patterns
