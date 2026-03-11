# Desktop UI Theme Spec

**Domain**: `flexxus-picking-desktop` / UI Theme  
**Last Updated**: 2026-03-11  
**Change**: dark-theme-red-palette

---

## Overview

The desktop admin app (`flexxus-picking-desktop/`) uses a **permanent dark theme** with a CSS custom property-driven color system. There is no light/dark toggle — all color tokens are defined in `:root` inside `src/index.css` using HSL triplets (no `hsl()` wrapper), and Tailwind is configured to map semantic color names to those CSS variables.

---

## Color Token Architecture

### Single Source of Truth: `src/index.css`

All semantic tokens are CSS custom properties. Tailwind maps color utilities (`bg-primary`, `text-primary`, etc.) to these vars via `tailwind.config.js`.

### Current Token Values

| CSS Variable | HSL Value | Hex (approx) | Purpose |
|---|---|---|---|
| `--primary` | `5 75% 54%` | #E33F2F | Corporate red — buttons, links, active nav, focus rings |
| `--primary-foreground` | `0 0% 98%` | ~#FAFAFA | Near-white text on primary backgrounds |
| `--ring` | `5 75% 54%` | #E33F2F | Focus rings (matches primary) |
| `--background` | `216 14% 5%` | ~#0B0D11 | Deep near-black page background |
| `--surface` | `218 12% 8%` | ~#111418 | Card surfaces |
| `--surface-elevated` | `218 11% 11%` | ~#16191E | Elevated panels |
| `--foreground` | `214 12% 90%` | ~#E2E4E8 | Warm near-white text |
| `--muted-foreground` | `214 8% 52%` | ~#7F8590 | Secondary/muted text |
| `--destructive` | `0 72% 51%` | ~#E03030 | Error states — error alerts, cancelled status |
| `--border` | `216 10% 16%` | ~#222730 | Borders |
| `--input` | *(same as border)* | — | Input borders |

---

## Requirements

### Requirement: CSS-TOKEN-01 — Primary Accent Color Token

The `--primary` CSS custom property in `src/index.css` MUST be set to `5 75% 54%` (HSL representation of #E33F2F).

#### Scenario: Primary token renders the correct red

- GIVEN the production build of the desktop app is loaded in a browser
- WHEN any element styled with `bg-primary`, `text-primary`, or `border-primary` is inspected
- THEN the computed color resolves to approximately #E33F2F (HSL 5° 75% 54%)
- AND no amber (#F59E0B) color value is present on any of those elements

---

### Requirement: CSS-TOKEN-02 — Primary Foreground Color Token

The `--primary-foreground` CSS custom property in `src/index.css` MUST be set to `0 0% 98%` (near-white).

#### Scenario: Text on primary backgrounds is legible

- GIVEN any element using `bg-primary` with child text styled `text-primary-foreground`
- WHEN the element is rendered
- THEN the text color resolves to near-white (~#FAFAFA)
- AND the contrast ratio between the text and the #E33F2F background MUST meet WCAG AA (≥ 4.5:1)

#### Scenario: Dark text is no longer used on primary backgrounds

- GIVEN the production build
- WHEN any button or badge using `bg-primary text-primary-foreground` is inspected
- THEN no near-black text appears on a red-primary background

---

### Requirement: CSS-TOKEN-03 — Ring (Focus) Color Token

The `--ring` CSS custom property in `src/index.css` MUST be set to `5 75% 54%` matching `--primary`.

#### Scenario: Focus rings appear in red

- GIVEN a focusable input or button element
- WHEN the element receives keyboard focus
- THEN the focus ring outline renders in approximately #E33F2F
- AND no amber focus ring color (#F59E0B) is present

---

### Requirement: CSS-TOKEN-04 — Destructive Token Unchanged

The `--destructive` CSS custom property MUST NOT be modified by palette changes. Its value SHALL remain at `0 72% 51%` (approximately #E03030).

#### Scenario: Error states retain their original destructive color

- GIVEN any element with class `bg-destructive` or `text-destructive`
- WHEN the element is inspected
- THEN its computed color matches the `--destructive` value
- AND the computed color does NOT equal the `--primary` value (#E33F2F)

---

### Requirement: CSS-TOKEN-05 — No Incidental Token Changes

All CSS custom properties in `src/index.css` other than `--primary`, `--primary-foreground`, and `--ring` MUST remain unchanged during palette-only changes. This includes: `--background`, `--surface`, `--surface-elevated`, `--foreground`, `--muted-foreground`, `--destructive`, `--border`, `--input`.

#### Scenario: Background and surface colors are unaffected

- GIVEN any palette-only change is applied
- WHEN `--background` and `--surface` computed values are inspected
- THEN they equal `216 14% 5%` and `218 12% 8%` respectively

---

### Requirement: COMPONENT-01 — No Hardcoded Legacy Amber/Yellow Classes

No `amber-*` or `yellow-*` Tailwind utility classes SHALL exist in the following source files:

- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/StatsCards.tsx`
- `src/components/orders/OrderStatusBadge.tsx`
- `src/components/orders/OrderAlerts.tsx`
- `src/components/orders/AlertTimelineModal.tsx`
- `src/components/orders/OrderActivityLog.tsx`
- `src/components/orders/OrderDetailHeader.tsx`
- `src/components/orders/OrderItemsTable.tsx`
- `src/pages/InventoryPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/components/ui/badge.tsx`

**Exception**: `src/lib/utils.test.ts` may contain `yellow-*` strings as arbitrary test data for the `cn()` utility — these are NOT real UI classes.

**Current replacement mapping (amber → red):**

| Old Class | Replacement |
|-----------|-------------|
| `text-amber-400` | `text-red-400` |
| `bg-amber-400` | `bg-red-400` |
| `bg-amber-400/10` | `bg-red-400/10` |
| `bg-amber-500/5` | `bg-red-500/5` |
| `bg-amber-500/10` | `bg-red-500/10` |
| `bg-amber-500/40` | `bg-red-500/40` |
| `border-amber-400/20` | `border-red-400/20` |
| `border-amber-500/20` | `border-red-500/20` |
| `border-amber-500/30` | `border-red-500/30` |
| `bg-yellow-500` | `bg-red-500` |
| `hover:bg-yellow-600` | `hover:bg-red-600` |

#### Scenario: No amber or yellow classes remain in source files

- GIVEN the implementation is complete
- WHEN a full-text search is run across `src/` for `amber-` and `yellow-`
- THEN zero matches are found in any `.tsx`, `.ts`, or `.css` file within the 11 listed files

#### Scenario: Components render red where amber was shown before

- GIVEN any of the 11 listed components are rendered
- WHEN a user views the Dashboard, Orders, Inventory, or a detail page
- THEN all previously amber/yellow elements appear in red tones (`red-400` / `red-500` range)

---

### Requirement: COMPONENT-02 — Badge Warning Variant Uses Red

The `warning` variant in `src/components/ui/badge.tsx` MUST use red background colors (`bg-red-500` and `hover:bg-red-600`).

#### Scenario: Warning badge renders red

- GIVEN a `<Badge variant="warning">` component is rendered
- WHEN the element is inspected
- THEN the background color matches Tailwind's `red-500` (#ef4444)

#### Scenario: Warning badge hover state renders darker red

- GIVEN a `<Badge variant="warning">` is rendered and hovered
- THEN the background color matches Tailwind's `red-600` (#dc2626)

---

### Requirement: TYPE-01 — StatCard Accent TypeScript Type

The TypeScript union type for the `accent` prop in `src/components/dashboard/StatCard.tsx` MUST use `'red' | 'blue' | 'green'`. The literal `'amber'` MUST NOT be in the union.

The `accentMap` in `StatCard.tsx` MUST NOT contain an `amber` key. The default value for `accent` MUST be `'red'`.

#### Scenario: TypeScript compilation succeeds with no 'amber' in the accent type

- GIVEN the current implementation
- WHEN `pnpm build` or `tsc --noEmit` is run
- THEN the build completes with zero TypeScript errors
- AND the type definition for `accent` does not contain `'amber'`

#### Scenario: StatsCards passes accent="red" successfully

- GIVEN `StatsCards.tsx` passes `accent="red"` to the StatCard for "Total Pedidos"
- WHEN the component is rendered
- THEN no TypeScript errors occur and the StatCard renders with red accent colors

---

### Requirement: VISUAL-01 — Primary and Destructive Are Perceptually Distinct

Interactive primary elements (buttons, active nav, focus rings) and error/destructive elements (error alerts, cancelled status badge) MUST remain visually distinguishable through context and composition, even though their hue is similar.

**ADR**: Differentiation is achieved via UI context (interactive affordances vs. static text/icons) rather than hue separation. `--destructive` (`0 72% 51%`) is NOT changed.

#### Scenario: Primary button does not look like a destructive error

- GIVEN any page with a primary action button alongside a destructive-styled error message
- THEN the primary button and the error message are distinguishable via their surrounding UI context

#### Scenario: Active sidebar nav item does not look like a cancelled order badge

- GIVEN the Orders page with an active sidebar item and at least one "cancelled" order badge
- THEN the active nav highlight and the cancelled badge are distinguishable by shape, size, opacity treatment, or accompanying label

---

### Requirement: REGRESSION-01 — Non-Accent Colors Are Unchanged

Colors other than the primary accent (greens for success, blues for informational, grays for neutral, destructive red for errors) MUST NOT be modified by accent palette changes.

#### Scenario: Green "completed" status badge is unchanged

- GIVEN an order with `status="completed"` rendered in `OrderStatusBadge`
- THEN its color classes (`green-*`/`emerald-*`) are unchanged

#### Scenario: Blue informational elements are unchanged

- GIVEN any component rendering blue accent elements
- THEN their Tailwind classes (`blue-*`) are unchanged

#### Scenario: Utility test file is not modified

- GIVEN `src/lib/utils.test.ts` contains `bg-yellow-100 text-yellow-800` as arbitrary test strings
- WHEN any palette change is implemented
- THEN those strings in `utils.test.ts` are NOT modified

---

### Requirement: BUILD-01 — No Build Regressions from Palette Changes

After any palette change, the project MUST build successfully.

#### Scenario: Production build succeeds

- GIVEN all palette files have been modified
- WHEN `pnpm build` is run in `flexxus-picking-desktop/`
- THEN the build exits with code 0 and no TypeScript compile errors are reported

---

## Architecture Notes

### How the Theme System Works

1. **`src/index.css`** — Defines all CSS custom properties in `:root`
2. **`tailwind.config.js`** — Maps Tailwind color utilities to CSS vars (e.g., `primary: 'hsl(var(--primary))'`)
3. **Component files** — Use Tailwind utility classes that resolve through CSS vars (for `text-primary`, `bg-primary`, etc.) OR use hardcoded Tailwind color names for semantic states (e.g., `text-red-400` for warning, `text-emerald-400` for success)
4. **No shadcn/ui dark mode toggle** — The app is dark-only; `color-scheme: dark` is set globally on `html`

### Color Scale Convention

For semantic state colors (warning, in-progress, low-stock, etc.), the codebase uses **named Tailwind colors** (not arbitrary values or CSS vars):
- Warning/In-progress/Accent: `red-400` / `red-500` / `red-600`
- Success/Completed: `emerald-400` / `emerald-500`
- Informational: `blue-400` / `blue-500`
- Neutral: `gray-400` / `slate-*`

### Primary vs Destructive Differentiation Strategy

Both `--primary` (#E33F2F, HSL 5° 75% 54%) and `--destructive` (~#E03030, HSL 0° 72% 51%) are shades of red. Perceptual distinction is maintained via:
- **Context**: Primary = interactive (buttons, links, nav highlights); Destructive = static error states
- **Opacity**: Primary frequently appears with `/10`, `/20` transparent tints; Destructive appears solid
- **Shape/Size**: Primary on large interactive elements; Destructive on compact status badges

If future UX testing reveals confusion between primary and destructive, the recommended remediation is to shift `--destructive` toward `HSL(0, 60%, 42%)` (darker, less saturated) in a follow-up change.
