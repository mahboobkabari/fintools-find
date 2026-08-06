# FinTool Master Design System Standard

**Document Version**: 2.0.0  
**Status**: Mandatory Production Standard  
**Design Vision**: Institutional Fintech Application (Stripe, Apple, Mercury, Linear, Ramp, Vercel, CRED, TradingView Standard)  
**Scope**: Universal UI/UX Foundation for All Calculators & Platform Pages

---

## 1. Brand Philosophy & Product Vision

FinTool is NOT a blog, documentation site, or simple calculator directory. FinTool is an institutional-grade financial decision application designed to give users instant financial clarity, absolute trust, and actionable decision confidence.

### Core Design Principles
1. **First 5-Second Clarity**: The user's primary decision target (calculator inputs, results, and key takeaway) MUST be visible above the fold within 5 seconds.
2. **Visual Intelligence Over Wall of Text**: Transform prose into visual components, dynamic charts, progress indicators, timelines, and interactive comparison cards.
3. **Zero-Lag Tactile Physics**: Financial inputs (sliders, preset chips, toggles) must react with immediate feedback, spring counters, and smooth track fills.
4. **Absolute Privacy as a Feature**: 100% client-side execution with zero server logging and instant URL scenario encoding (`?amount=...`).
5. **Universal Accessibility (WCAG AA)**: Designed for high contrast, full keyboard navigation, screen readers, and touch-first devices.

---

## 2. Color System Architecture

FinTool uses a semantic color architecture optimized for financial data visualization and dark/light contrast.

```css
/* Color System Design Tokens */
:root {
  /* Brand Primary */
  --color-primary: #2563EB;          /* Blue 600 - Primary actions, active sliders, hero gradients */
  --color-primary-hover: #1D4ED8;    /* Blue 700 - Hover state */
  --color-primary-light: rgba(37, 99, 235, 0.1); /* Primary subtle background fill */

  /* Accents */
  --color-accent-sky: #0EA5E9;       /* Sky 500 - Secondary highlights, timeline icons */
  --color-accent-amber: #F59E0B;     /* Amber 500 - Interest burden indicators, warning alerts */

  /* Semantic Financial Indicators */
  --color-success: #10B981;          /* Emerald 500 - Principal repayment, safe affordability, tax savings */
  --color-warning: #F59E0B;          /* Amber 500 - Moderate risk, interest payments */
  --color-danger: #EF4444;           /* Red 500 - High financial stress, high risk */

  /* Neutrals & Canvas Surfaces */
  --color-background: #F8FAFC;       /* Slate 50 - Page canvas background */
  --color-surface-card: #FFFFFF;     /* Pure White - Primary surface cards */
  --color-surface-soft: #F1F5F9;     /* Slate 100 - Secondary input background & badge fill */
  --color-border: #E2E8F0;           /* Slate 200 - Hairline card borders & dividers */
  --color-border-hover: #CBD5E1;     /* Slate 300 - Interactive hover border */

  /* Typography Inks */
  --color-text-ink: #0F172A;         /* Slate 900 - Primary headings & values */
  --color-text-body: #334155;        /* Slate 700 - Body copy */
  --color-text-muted: #64748B;       /* Slate 500 - Secondary labels & unit text */

  /* Dark Mode Preparation Tokens */
  --color-dark-surface: #0F172A;     /* Slate 900 - Dark glassmorphism cards */
  --color-dark-border: rgba(255, 255, 255, 0.1);
}
```

---

## 3. Typography Hierarchy

FinTool pairs geometric headings with legible body copy and tabular monetary numbers.

- **Headings (`font-heading`)**: `Plus Jakarta Sans`, sans-serif (Weights: 600, 700, 800).
- **Body Copy (`font-sans`)**: `Inter`, sans-serif (Weights: 400, 500, 600).
- **Monetary & Numbers (`font-mono`)**: `JetBrains Mono`, monospace (Weights: 500, 600, 700).

### Typography Scale Matrix
| Role | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|
| **Display / Mega EMI** | `44px` / `52px` | `1.1` | `800 (ExtraBold)` | `-0.02em` |
| **Page H1 Title** | `36px` / `48px` | `1.2` | `800 (ExtraBold)` | `-0.02em` |
| **Section H2 Title** | `24px` / `32px` | `1.3` | `700 (Bold)` | `-0.01em` |
| **Card H3 Title** | `18px` / `24px` | `1.35` | `700 (Bold)` | `0.00em` |
| **Body Standard** | `15px` / `22px` | `1.5` | `400 (Regular)` / `500` | `0.00em` |
| **Caption / Badge** | `12px` / `16px` | `1.4` | `600 (SemiBold)` | `+0.05em (UPPER)` |

---

## 4. Spacing System Design Tokens

Strict 4px/8px grid system for container margins, paddings, and card gaps:

- `space-1` = `4px`
- `space-2` = `8px`
- `space-3` = `12px`
- `space-4` = `16px`
- `space-5` = `20px`
- `space-6` = `24px`
- `space-8` = `32px`
- `space-12` = `48px`
- `space-16` = `64px`

---

## 5. Border Radius System

- **Pills / Badges**: `rounded-full` (`9999px`)
- **Large Surface Containers**: `rounded-3xl` (`24px` / `1.5rem`)
- **Cards & Dashboard Panels**: `rounded-2xl` (`16px` / `1rem`)
- **Form Inputs & Inner Items**: `rounded-xl` (`12px` / `0.75rem`)
- **Small Buttons & Badges**: `rounded-lg` (`8px` / `0.5rem`)

---

## 6. Shadow System

- **Soft Card Shadow (`shadow-soft`)**: `0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)`
- **Glassmorphism Glow (`shadow-glass`)**: `0 20px 40px -15px rgba(37, 99, 235, 0.25)`
- **Elevated Hover Shadow**: `0 12px 28px -4px rgba(15, 23, 42, 0.12)`

---

## 7. Motion & Transition System

- **Standard Duration**: `300ms`
- **Standard Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (Spring-like smoothness)
- **Interactive Transitions**:
  - **Card Hover Elevation**: `transform: scale(1.01)` or `translateY(-2px)`
  - **Donut Chart Arc Transition**: `stroke-dashoffset 500ms ease-out`
  - **Accordion Expand**: `max-height 300ms ease-in-out`
- **Reduced Motion Support**:
  `@media (prefers-reduced-motion: reduce)` disables all transforms and smooth transitions.

---

## 8. Responsive Grid & Layout Rules

### Viewport Adaptation Matrix
- **`320px` – `375px` (Mobile Small)**: 1 column, full-width inputs, 16px padding.
- **`390px` – `767px` (Mobile Standard)**: 1 column, 2-column preset chips.
- **`768px` – `1023px` (Tablet)**: 2-column worked case studies, side-by-side comparison cards.
- **`1024px` – `1439px` (Desktop)**: 12-column workspace layout with sticky results panel.
- **`1440px+` (Ultra-wide)**: Max-width capped at `1200px` centered.

---

## 9. Component Registry & Reusability Rules

### Core Design System Components
1. **Hero Header Component**: Compact title + pill metadata trust badges.
2. **One-Tap Scenario Preset Card**: Selectable 1-click preset benchmark cards.
3. **Interactive Slider & Input Component**: Custom gradient fill track + formatted input box.
4. **Mega Result Dashboard**: Gradient hero EMI display + 3 companion KPI cards.
5. **Vector SVG Donut Chart (`EmiDonutChart`)**: Real-time principal vs interest visual ring.
6. **Prepayment Savings Coach Card**: Intelligent advice displaying interest/tenure saved.
7. **Affordability Gauge (FOIR Engine)**: SVG circular gauge with Safe/Caution/Stress badges.
8. **Dynamic Financial Intelligence Cards**: Rate sensitivity, interest multiplier, and tenure tradeoff cards.
9. **Process Architecture Timeline**: 4-step icon-driven repayment lifecycle.
10. **Use Case Persona Cards**: Target borrower cards (Home, Car, Personal, Education).
11. **Worked Case Study Cards**: Side-by-side practical calculation examples.
12. **Comparison Cards**: Reducing Balance vs Flat Rate comparison panels.
13. **Formula Component**: Dark LaTeX math block with parameter cards ($P$, $r$, $n$).
14. **Statutory Tax Relief Callout Cards**: Glassmorphism tax deduction blocks.
15. **Common Mistakes Warning Cards**: Amber alert blocks.
16. **WCAG AA FAQ Accordion (`FaqAccordion`)**: Preact accordion with full ARIA bindings.
17. **Tool Hub Cards (`RelatedTools`)**: Grid of related calculator links.

---

## 10. Financial Visual Language Standard

- **Principal Capital**: Represented by `#2563EB` (Blue 600) — Stability & Trust.
- **Interest Payments**: Represented by `#F59E0B` (Amber 500) — Cost & Burden.
- **Prepayment Savings / Wealth Growth**: Represented by `#10B981` (Emerald 500) — Positive Financial Health.
- **Debt Risk / FOIR Stress**: Represented by `#EF4444` (Red 500) — High Risk Warning.

---

## 11. Strict Naming Conventions

- **Component Filenames**: PascalCase (e.g. `EmiFlagshipWidget.jsx`, `EmiDonutChart.jsx`).
- **CSS Utility Classes**: Tailwind semantic classes (`bg-canvas`, `border-hairline`, `text-ink`, `text-body`, `text-muted`).
- **Folder Organization**:
  - `src/components/calculators/primitives/` — Reusable interactive Preact widgets & charts.
  - `src/components/content/` — Flagship Astro page layout presenters.
  - `src/calculators/core/` — Pure JavaScript mathematical calculation engines.

---

## 12. Permanent Governance Rules

1. **Mandatory Reuse First**: Before creating any new component for future calculators, developers MUST inspect `DESIGN_SYSTEM.md` and reuse existing primitive components (`FormInputNumber`, `EmiDonutChart`, `FaqAccordion`, `AmortizationTable`).
2. **Zero Formula & Math Modifications**: Calculation engines must remain decoupled from presentation components.
3. **Strict Quality Gate**: Every new calculator adoption must pass `astro check`, `vitest run`, and `astro build` with 0 errors.
