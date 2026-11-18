---
name: RoomieMatch
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fd'
  surface-container: '#ebeef7'
  surface-container-high: '#e5e8f2'
  surface-container-highest: '#dfe2ec'
  on-surface: '#181c23'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3138'
  inverse-on-surface: '#eef0fa'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4c42e9'
  primary: '#493ee5'
  on-primary: '#ffffff'
  primary-container: '#635bff'
  on-primary-container: '#fefaff'
  inverse-primary: '#c3c0ff'
  secondary: '#326852'
  on-secondary: '#ffffff'
  secondary-container: '#b5efd2'
  on-secondary-container: '#386e58'
  tertiary: '#006851'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f8367'
  on-tertiary-container: '#effff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#321ed2'
  secondary-fixed: '#b5efd2'
  secondary-fixed-dim: '#9ad3b7'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#17503b'
  tertiary-fixed: '#93f5d3'
  tertiary-fixed-dim: '#77d8b8'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#00513e'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#dfe2ec'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  currency-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a welcoming, dependable, and vibrant consumer marketplace environment tailored to Vietnamese university students navigating shared housing in Ho Chi Minh City. Balancing Airbnb-grade polish with the casual warmth of Gen Z lifestyle platforms, the aesthetic prioritizes trust, emotional reassurance, and social compatibility.

### Design Principles
- **Approachable Authenticity:** Grounded in genuine student interactions, prioritizing high-legibility Vietnamese diacritics, clear identity verification, and transparent cost indicators over ornamental clutter.
- **Calm Warmth:** Clean, structured light-mode interfaces paired with gentle mint highlights and soft surfaces, avoiding clinical corporate coldness while maintaining high organizational clarity.
- **Low Cognitive Overhead:** Simple decision flows, bite-sized lifestyle tags, and explicit compatibility scoring allow quick comparison between rooms and prospective roommates.

## Colors

The color palette centers on `#635BFF`, an energetic modern violet that conveys digital fluency and forward momentum. Paired with soft organic mint (`#B8F2D5`) and deep forest green (`#16866A`), it signals both discovery and verified security.

### Palette Architecture
- **Primary (`#635BFF`):** Brand anchors, primary actions, active navigational states, and high-emphasis matching scores. Hover state shifts to `#4D43DB`.
- **Secondary (`#B8F2D5`):** Expressive lifestyle callouts, badge fills, subtle card tints, and friendly micro-moments.
- **Tertiary (`#16866A`):** Verification badges, success states, confirmed booking signals, and positive compatibility callouts.
- **Neutral Canvas (`#FAFAF8`):** An off-white canvas that minimizes eye fatigue during long browsing sessions.
- **Surface (`#FFFFFF`):** High-level card and sheet containers floating against the warmer neutral canvas.
- **Text Layers:** `#20242B` for high-contrast headlines and body text; `#69707A` for metadata, subtitle contexts, and secondary timestamps.
- **Outlines (`#E9E9EF`):** Low-contrast architectural borders maintaining boundary definition without creating visual noise.

## Typography

The typographic hierarchy relies entirely on `Be Vietnam Pro` to guarantee natural diacritic spacing and optimal legibility for tone marks (hỏi, ngã, nặng, sắc, huyền). 

### Layout Behavior
- Display and Headline weights are reserved for discovery hubs, landing headers, and profile hero titles.
- Line heights are slightly widened (+2px to +4px over standard English typography) to prevent overlapping diacritics in stacked Vietnamese sentences.
- Currency styling (`currency-md`) standardizes format conventions with non-breaking spaces and the Vietnamese đồng symbol (e.g., `3.500.000 ₫/tháng`).

## Layout & Spacing

The design system implements a standard 8pt grid with responsive adaptations across mobile (4 columns), tablet (8 columns), and desktop (12 columns).

### Grid Configuration
- **Mobile (<768px):** 4 columns, `margin` of `1rem`, `gutter` of `1rem`. Full-width card stacks and bottom-sheet drawers.
- **Tablet (768px - 1024px):** 8 columns, `margin-md` of `2rem`, `gutter-md` of `1.5rem`. Split-screen filters and dual card arrangements.
- **Desktop (>1024px):** 12 columns, max-width constrained to `1280px`, `margin-lg` of `3rem`, `gutter-lg` of `2rem`. Persistent search parameters with responsive room and roommate listing grids.

## Elevation & Depth

Visual hierarchy leverages ambient, softly tinted drop shadows rather than heavy structural borders. This produces an open, non-intimidating interface where room photography and personality profiles take center stage.

### Shadow Tiers
- **Elevation 0 (Flat):** Used for base surfaces on `#FAFAF8`. Bordered with `#E9E9EF` (1px solid) to create soft structure.
- **Elevation 1 (Card Rest):** `0px 2px 8px rgba(32, 36, 43, 0.04), 0px 1px 2px rgba(32, 36, 43, 0.02)`. Default state for listing cards and profile summary containers.
- **Elevation 2 (Interactive Hover & Modals):** `0px 12px 24px -4px rgba(99, 91, 255, 0.08), 0px 4px 12px -2px rgba(32, 36, 43, 0.04)`. Applied to active cards, sticky search bars, and floating mobile navigation.
- **Elevation 3 (Overlays & Drawers):** `0px 20px 32px -8px rgba(32, 36, 43, 0.12)`. For match modals, filter drawers, and dialog windows.

## Shapes

With a roundedness factor of `2`, the design system maintains consistent geometry:
- Standard components (buttons, input fields, and small cards) feature an `8px` (`0.5rem`) corner radius.
- Larger elements (room detail cards, roommate personality previews) use `rounded-lg` (`16px` / `1rem`) and `rounded-xl` (`24px` / `1.5rem`).
- Status chips, university badges, and filter pills employ full pill rounding (`9999px`) to emphasize touch-friendliness and informal student energy.

## Components

### Buttons
- **Primary:** Solid `#635BFF` background with `#FFFFFF` text, `12px 20px` padding, `8px` border radius, font `label-md`. Active states transition to `#4D43DB`.
- **Secondary / Soft:** Solid `#B8F2D5` background with `#16866A` text for non-destructive actions, quick matches, and bookmark actions.
- **Outlined:** Border `1px solid #E9E9EF`, background `#FFFFFF`, text `#20242B`.

### Badges & Lifestyle Chips
- **Lifestyle Tags:** Pill shape (`9999px`), background `#FAFAF8`, border `1px solid #E9E9EF`, text `#20242B`, `4px 12px` padding. Selected state adopts `#635BFF` with white text.
- **Verified Student Badge:** `#16866A` background or `10%` green tint with tertiary green text, displaying an academic cap icon followed by university code (e.g., "Đã xác thực HCMUS").

### Cards
- **Listing Cards:** White background (`#FFFFFF`), `16px` roundedness, `1px solid #E9E9EF` outline, Elevation 1 shadow. Image carousel at `4:3` ratio, followed by student verified badge, title, localized distance to campus (e.g., "Cách ĐH KHTN CS1 800m"), and bold monthly rent.
- **Roommate Profile Cards:** Profile avatar with rounded mint compatibility ring, compatibility percentage (`92% Hợp gu`), primary sleep/study habit tags, and direct chat action.

### Form Inputs
- **Search & Filters:** Height `48px`, background `#FFFFFF`, border `1px solid #E9E9EF`, `8px` corner radius. Focus states exhibit a `2px` ring in `#635BFF` with zero offset.
- **Checkboxes & Radios:** `20px` dimension, rounded corners for checkboxes (`4px`) and circles for radios. Filled with `#635BFF` when selected.

### Compatibility Indicators
- **Score Meter:** Circular or pill-shaped indicator filled with a gradient transitioning from `#B8F2D5` to `#635BFF`. Always accompanied by clear textual feedback (e.g., "Thức khuya", "Không hút thuốc", "Thích nuôi mèo").