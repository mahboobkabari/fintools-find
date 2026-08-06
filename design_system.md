# Design System — Calculator Directory

## Overview

This site reads like an institutional financial publication that happens to host calculators — quiet white canvas, editorial spacing, almost monochromatic. The single brand voltage is **Primary Blue** (`{colors.primary}` — #0052ff), used scarcely: every primary CTA pill, the wordmark, and inline emphasis links. Beyond that one blue, the system is white canvas + ink + soft-gray elevation bands + a deep near-black editorial canvas (`{colors.surface-dark}` — #0a0b0d) reserved for the homepage hero and one pre-footer CTA band.

Type pairs a **Display** face for headlines with a **Sans** face for body, captions, and navigation. Display sits at **weight 400** — not the bold 700+ typical of finance-tool sites. The choice signals editorial calm and institutional trust rather than "urgent calculator" energy — the reader should feel like they've landed on a source they can trust with their loan numbers, not a flashy widget.

The page rhythm rotates three modes: bright white editorial sections, soft-gray elevation bands, and a **full-bleed dark editorial hero** on the homepage carrying layered "calculator result" mockup cards — this replaces what would otherwise be a generic tool-grid hero, and is the brand's strongest signature pattern. Individual tool pages stay in the light mode throughout (the calculator itself is the hero there — see §Calculator-Specific Components) and reserve the dark treatment for the homepage and the pre-footer CTA only.

**Key Characteristics:**
- Single accent color: `{colors.primary}` (#0052ff) carries every primary CTA, wordmark, and inline brand link. Used scarcely — one or two blue moments per section.
- Modest display weight — Display face at weight 400, never 700+.
- Editorial pill geometry: every CTA is `{rounded.pill}` (100px), every icon glyph is `{rounded.full}`, every card is `{rounded.xl}` (24px). Sharp corners absent.
- Full-bleed dark homepage hero with floating calculator-result mockup cards — the site's signature visual moment.
- Result semantics: `{colors.semantic-up}` (#05b169) and `{colors.semantic-down}` (#cf202f) — text color only, never a background fill, used for positive/negative calculator outcomes (e.g. "interest saved" vs "total interest paid").
- 96px section rhythm — generous editorial pacing; every numeric output rendered in a monospace figure font.

## Colors

### Brand & Accent
- **Primary Blue** (`{colors.primary}` — #0052ff): The single brand color. Every primary CTA pill, wordmark, inline brand links.
- **Primary Blue Active** (`{colors.primary-active}` — #003ecc): Press-state darken on the primary pill.
- **Primary Blue Disabled** (`{colors.primary-disabled}` — #a8b8cc): Faded-blue tint for disabled CTAs (e.g. "Calculate" before required fields are filled).
- **Accent Amber** (`{colors.accent-amber}` — #f4b000): A small sub-brand accent used very sparingly — "Popular tool" glyph fills, category icon accents inside feature cards. Illustrative-only, never an action color.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): The default page floor for every tool and content page.
- **Surface Soft** (`{colors.surface-soft}` — #f7f7f7): Subtle alternating band surface — table stripes, secondary sections.
- **Surface Strong** (`{colors.surface-strong}` — #eef0f3): Light-gray fill behind secondary buttons, search pills, category icon plates.
- **Surface Dark** (`{colors.surface-dark}` — #0a0b0d): Deep near-black canvas — reserved for the homepage hero and the pre-footer CTA band only.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #16181c): One step lighter, used for the floating calculator-result mockup cards inside the dark hero.

### Hairlines
- **Hairline** (`{colors.hairline}` — #dee1e6): Default 1px divider on white surfaces — table rows, card outlines.
- **Hairline Soft** (`{colors.hairline-soft}` — #eef0f3): Lighter divider, same hex as `{colors.surface-strong}`.

### Text
- **Ink** (`{colors.ink}` — #0a0b0d): Display headings, primary nav, body emphasis.
- **Body** (`{colors.body}` — #5b616e): Default running text — slightly cool gray, used for all explainer content (Intro / How to use / FAQs).
- **Muted** (`{colors.muted}` — #7c828a): Sub-titles, breadcrumbs, footer secondary, disclaimers.
- **On Primary** (`{colors.on-primary}` — #ffffff): White text on Primary Blue CTAs.
- **On Dark** (`{colors.on-dark}` — #ffffff): White text on the dark hero/CTA band.
- **On Dark Soft** (`{colors.on-dark-soft}` — #a8acb3): Muted off-white for secondary text on dark.

### Calculator Result Semantics
- **Semantic Up** (`{colors.semantic-up}` — #05b169): Favourable outcome — savings, returns, interest saved, maturity gain. Text color only, never a background.
- **Semantic Down** (`{colors.semantic-down}` — #cf202f): Cost/negative outcome — total interest paid, tax owed. Text color only, never a background.
- These replace what a trading platform would call "price up/down" — same restraint applies: colour communicates meaning, it never fills a shape.

## Typography

### Font Family
The system runs a **Display** face for hero headlines only, a **Sans** face for everything else (body, nav, captions, buttons), and a **Mono** face for every numerical value a calculator produces. Fallback stack: `-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

- **Display → Inter**, weight 400, letter-spacing −1.5%. Homepage hero and section heads only.
- **Sans → Inter**, weight 400/600/700. Body copy, nav, FAQs, buttons, labels.
- **Mono → JetBrains Mono** (or Geist Mono), weight 500. Every calculator output: EMI amount, maturity value, percentage rates, table figures.

The display/body split is functional: Display carries hero headlines only; Sans carries everything else — including every tool page's H1, since tool pages stay in light editorial mode, not the dark hero mode.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-mega}` | 80px | 400 | 1.0 | -2px | Homepage hero h1 only |
| `{typography.display-lg}` | 52px | 400 | 1.0 | -1.3px | Category-page section heads |
| `{typography.display-md}` | 44px | 400 | 1.09 | -1px | Tool-page h1, CTA-band headline |
| `{typography.display-sm}` | 36px | 400 | 1.11 | -0.5px | Sub-section heads (Sans) |
| `{typography.title-lg}` | 32px | 400 | 1.13 | -0.4px | Card-group titles |
| `{typography.title-md}` | 18px | 600 | 1.33 | 0 | Component titles, tool-card names |
| `{typography.title-sm}` | 16px | 600 | 1.25 | 0 | List labels, FAQ questions |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body — Intro, Features, Benefits |
| `{typography.body-strong}` | 16px | 700 | 1.5 | 0 | Emphasized body |
| `{typography.body-sm}` | 14px | 400 | 1.5 | 0 | Footer body |
| `{typography.caption}` | 13px | 400 | 1.5 | 0 | Disclaimers, fine print |
| `{typography.caption-strong}` | 12px | 600 | 1.5 | 0 | Badge pill labels |
| `{typography.number-display}` | 18px | 500 | 1.4 | 0 | Table figures, inline rate/percent values — Mono |
| `{typography.result-mega}` | 40px | 500 | 1.1 | -0.5px | The calculator's headline output figure — Mono |
| `{typography.button}` | 16px | 600 | 1.15 | 0 | Standard CTA pill |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top-nav menu items |

### Principles
- **Display weight stays at 400.** Even the calculator's own tool-name headline (`{typography.display-md}`) never goes bold — the calm-institutional voice extends onto every tool page, not just the homepage.
- **Negative letter-spacing on display only.** Body, table, and mono tokens stay at 0 tracking.
- **Mono on every number.** EMI figures, maturity values, percentages, table rows — anything numeric renders in the Mono face so digits align and read as "precise data," never as decoration.

### Note on Font Substitutes
No licensing constraint here (unlike a proprietary-typeface brand) — Inter and JetBrains Mono are open-source and used directly, no substitution step needed.

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.base}` 16px · `{spacing.md}` 20px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- **Section padding:** `{spacing.section}` (96px) between major editorial bands on content/category pages.
- **Card internal padding:** `{spacing.xl}` (32px) for feature cards and calculator-result mockup cards.

### Grid & Container
- **Max content width:** ~1200px centered. Homepage hero full-bleed dark.
- **Editorial body:** Single 12-column grid for Intro/How-to/FAQ content.
- **Tool-listing grids:** 3-up feature-card grid at desktop for category pages.
- **Tool page:** Calculator inputs + result panel sit in a 2-column split (not full-bleed dark — this stays in light editorial mode; see §Calculator-Specific Components) directly under a light `{typography.display-md}` h1, then explainer content resumes the 96px editorial rhythm below.
- **Footer:** 6-column link list at desktop.

### Whitespace Philosophy
Generous editorial pacing — closer to a financial publication than a utility widget. 96px between content bands; cards inside bands sit 24px apart. The one place density is allowed is inside the calculator panel itself and its output table — everywhere else, the page breathes.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Homepage hero h1 80→40px; feature-card grid 1-up; calculator inputs stack above result card; nav collapses to hamburger; layered result mockup cards collapse to a single card. |
| Tablet | 640–1024px | Hero h1 64px; feature-card grid 2-up; calculator moves to 2-column. |
| Desktop | 1024–1280px | Full hero h1 80px; feature-card grid 3-up; full calculator 2-column layout. |
| Wide | > 1280px | Content caps at 1200px; homepage hero full-bleed. |

#### Touch Targets
- Primary CTA pill (`button-calculate`, `button-primary`) at 44px height — WCAG AAA.
- Larger homepage hero pill at 56px.
- Category icon circles at 32px, padded to an effective 48px tap zone inside their row.
- Search pill at 44px height.

#### Collapsing Strategy
- Top nav switches to a hamburger sheet below 768px; the "Calculate"/search entry point stays visible.
- Homepage hero h1 steps down 80 → 64 → 52 → 44 → 36px on the smallest screens.
- Layered calculator-result mockup cards in the dark hero collapse from 2–3 stacked to a single card on mobile.
- On tool pages, the result panel re-orders to sit directly beneath the primary input on mobile — never pushed to the bottom of a long stack.
- Breakdown/amortization tables become horizontally scrollable.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Most surfaces (≈80%) |
| Hairline border | 1px `{colors.hairline}` | Feature card outlines, table rows on white |
| Soft drop | `0 4px 12px rgba(0, 0, 0, 0.04)` | Single shadow tier — hovered cards, the sticky result panel |
| Editorial | Full-bleed dark hero with layered mockups | Homepage hero depth |

This system deliberately runs **one shadow tier**, not several — depth on the light pages comes from hairline borders and whitespace, not stacked shadows.

### Decorative Depth
- **Layered calculator-result mockup cards inside the dark homepage hero** is the signature decorative pattern — a `{component.result-card-dark}` floats above the near-black base, often with a second smaller card overlapping at a slight angle, showing a sample EMI/SIP output.
- Tool pages themselves carry no decorative depth — the working calculator and its live result panel are the only "floating" elements, and only at Level 2 (soft drop).

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Reserved, essentially unused |
| `{rounded.xs}` | 4px | Inline tags, table cells |
| `{rounded.sm}` | 8px | Compact rows |
| `{rounded.md}` | 12px | Form inputs, sliders |
| `{rounded.lg}` | 16px | Mid-size cards |
| `{rounded.xl}` | 24px | Feature cards, calculator panel, result panel, mockup cards |
| `{rounded.pill}` | 100px | All CTA buttons, search pill, badges |
| `{rounded.full}` | 9999px | Category icon circles, avatars |

Pill for every interactive control, 24px card-radius for containers, full circle for icons. Sharp corners absent — same discipline as the reference this system extends, applied consistently across both marketing and tool pages.

## Components

### Top Navigation

**`top-nav-light`** — Default top nav on every tool/content page. Background `{colors.canvas}`, text `{colors.ink}`, height 64px. Layout: site wordmark left, category mega-menu (Loans · Investment · Tax · Retirement · Real Estate · …) center, search-icon pill right (site has no login/signup — every tool is free and account-less).

**`top-nav-on-dark`** — Top nav over the homepage dark hero only. Background `{colors.surface-dark}`, text `{colors.on-dark}`. Same layout.

### Buttons

**`button-calculate`** — The signature Primary Blue pill, used as the calculator's main action.
Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}` (16px/600), padding 12px × 20px, height 44px, rounded `{rounded.pill}`.

**`button-calculate-active`** — Press state. Background `{colors.primary-active}`.

**`button-calculate-disabled`** — Faded blue tint, `{colors.primary-disabled}`, shown before required fields are filled. Cursor not-allowed.

**`button-secondary-light`** — Soft-gray secondary on white surfaces ("Reset", "View table"). Background `{colors.surface-strong}`, text `{colors.ink}`, same pill geometry.

**`button-secondary-dark`** — Used on the dark hero/CTA band. Background `{colors.surface-dark-elevated}`, text `{colors.on-dark}`, same pill geometry.

**`button-outline-on-dark`** — Transparent pill, 1px white border, text `{colors.on-dark}`. Homepage hero secondary CTA ("Browse all tools").

**`button-tertiary-text`** — Inline text link. Transparent background, text `{colors.primary}`, type `{typography.button}`.

**`button-pill-cta`** — Larger homepage hero pill ("Try the EMI Calculator"). Same blue palette, 56px height, 16px × 32px padding.

### Hero Bands

**`hero-band-dark`** — The homepage's signature full-bleed dark hero. Background `{colors.surface-dark}`, text `{colors.on-dark}`, layered `result-card-dark` mockups. Headline in `{typography.display-mega}` (80px/400) — e.g. "Every financial calculator you'll ever need" — subhead in `{typography.body-md}`, two CTAs (`button-pill-cta` + `button-outline-on-dark`).

**`hero-band-light`** — Used at the top of every category page (e.g. "Loan & EMI Calculators"). Background `{colors.canvas}`, text `{colors.ink}`. Same skeleton, light palette, `{typography.display-lg}`.

### Calculator-Specific Components

**`calculator-panel`** — The working input panel on every tool page. Background `{colors.canvas}`, 1px `{colors.hairline}` border, rounded `{rounded.xl}`, padding `{spacing.xl}`. Holds `text-input-numeric`, `slider-input`, `select-dropdown` as needed.

**`text-input-numeric`** — Primary numeric input (loan amount, investment amount). Background `{colors.canvas}`, text `{colors.ink}` in Mono, rounded `{rounded.md}` (12px), padding 14px × 16px, height 48px, 1px `{colors.hairline}` border — thickens to 2px `{colors.primary}` on focus.

**`slider-input`** — Paired slider (rate %, tenure), mirrors the numeric input above it. Track `{colors.surface-strong}`, filled portion `{colors.primary}`, thumb white with blue ring, rounded `{rounded.full}`.

**`result-panel`** — The sticky live-result card on tool pages. Background `{colors.canvas}`, elevation Level "Soft drop," rounded `{rounded.xl}`, padding `{spacing.xl}`. Headline figure at `{typography.result-mega}` in `{colors.semantic-up}` (favourable figures like "Total Savings") or `{colors.ink}` (neutral figures like "EMI Amount") — never `{colors.semantic-down}` as the lead figure unless the tool is explicitly a cost calculator.

**`result-card-dark`** — The floating homepage-hero mockup card, showing a sample calculator output. Background `{colors.surface-dark-elevated}`, text `{colors.on-dark}`, rounded `{rounded.xl}`, padding `{spacing.xl}`. Shown as 2–3 stacked cards at a slight rotation on desktop, collapsing to one on mobile.

**`breakdown-table`** — Amortization / year-by-year output table. Background `{colors.canvas}`, header row `{colors.surface-soft}` in `{typography.caption-strong}`, body rows in `{typography.number-display}` (Mono), alternating stripe at `{colors.surface-soft}` 50%, 1px `{colors.hairline}` row dividers, horizontally scrollable on mobile.

### Cards

**`feature-card`** — Used in 3-up grids for "Features"/"Benefits" sections and category tool-grids. Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.title-md}`, rounded `{rounded.xl}`, padding `{spacing.xl}`, 1px `{colors.hairline}` border.

**`tool-listing-card`** — Card on category/index pages linking to a calculator. Same skeleton as `feature-card`; icon in `asset-icon-circular`, tool name at `{typography.title-md}`, one-line description at `{typography.body-sm}` in `{colors.muted}`. Whole card is a link.

**`related-tools-chip`** — Internal-linking component (PRD's mandatory related-tools block). Background `{colors.surface-strong}`, text `{colors.primary}`, type `{typography.nav-link}`, rounded `{rounded.pill}`, padding `{spacing.xs} {spacing.lg}`.

**`asset-icon-circular`** — Circular plate behind category/tool icons. Background `{colors.surface-strong}`, rounded `{rounded.full}`, 32px diameter.

### Pricing / Comparison (future-proofing, per PRD §12 future paid-tier note)

**`pricing-tier-card`** — Standard tier card, held in reserve for if/when a paid tier is introduced. Background `{colors.canvas}`, rounded `{rounded.xl}`, padding 32px, 1px hairline border.

**`pricing-tier-featured`** — The featured tier — visual inversion (dark surface, light text) signals "highlighted choice" without a coloured ribbon, consistent with the rest of the system's restraint.

### Forms

**`select-dropdown`** — Tenure unit, currency, tax regime toggles. Background `{colors.canvas}`, border `{colors.hairline}`, text `{typography.body-md}`, rounded `{rounded.md}`, padding `{spacing.sm} {spacing.md}`.

**`search-input-pill`** — Site-wide tool finder in the nav. Background `{colors.surface-strong}`, rounded `{rounded.pill}`, padding 12px × 20px, height 44px.

**`toggle-switch`** — Binary options ("Old vs New tax regime", "Monthly vs Yearly"). Track `{colors.surface-strong}` (off) / `{colors.primary}` (on), thumb white, rounded `{rounded.full}`.

### Tags & Badges

**`badge-pill`** — Small uppercase pill for section labels ("FREE TO USE", "NO SIGN-UP") and "Popular tool" tags. Background `{colors.surface-strong}`, text `{colors.ink}`, type `{typography.caption-strong}`, rounded `{rounded.pill}`.

### CTA / Footer

**`cta-band-dark`** — Pre-footer band ("Explore all 194 calculators"). Background `{colors.surface-dark}`, text `{colors.on-dark}`, vertical padding 96px. Centered headline + `button-pill-cta` + `button-outline-on-dark`.

**`footer-light`** — Closing white-canvas footer. Background `{colors.canvas}`, text `{colors.body}`. 6-column link list mirroring the nav's categories (doubles as an internal-linking surface for SEO) + legal links row (Privacy/Terms/Disclaimer/Contact per PRD §12).

**`footer-link`** — Individual footer link. Transparent background, text `{colors.body}`.

**`legal-band`** — Bottom strip beneath footer columns. All text `{colors.muted}` at `{typography.caption}`.

### Ad Placement

**`ad-slot`** — Bounded, clearly-separated AdSense container. Background `{colors.surface-soft}`, rounded `{rounded.md}`, generous `{spacing.xl}` margin above/below so it never touches the calculator panel or the primary CTA — protects both UX and AdSense policy compliance.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for primary CTAs, wordmark, and inline accent links only — one or two blue moments per section.
- Set every CTA as `{rounded.pill}` (100px); every category/tool icon as `{rounded.full}`.
- Keep Display headlines at weight 400, on both the homepage hero and every tool-page h1.
- Render every numerical value — EMI, maturity amount, tax owed, table rows — in the Mono face via `{typography.number-display}` or `{typography.result-mega}`.
- Reserve the dark hero treatment for the homepage and the one pre-footer CTA band; keep every tool and category page in light editorial mode.
- Use `{colors.semantic-up}` / `{colors.semantic-down}` as text-only cues on calculator results — never as a background fill.

### Don't
- Don't introduce a second action color — Primary Blue is the only CTA color; semantic up/down are result-meaning only, never buttons.
- Don't bold Display copy — it sits at weight 400; bolding shifts the brand voice toward "urgent fintech," which this system deliberately avoids.
- Don't add extra shadow tiers — the system runs one shadow tier plus hairline borders.
- Don't use sharp `{rounded.none}` (0px) on any CTA or icon.
- Don't mix Display and Sans inside the same headline.
- Don't use `{colors.semantic-up}`/`{colors.semantic-down}` as a button or badge background.
- Don't place an `ad-slot` directly adjacent to the calculator panel or `button-calculate` — both a UX and an AdSense-policy risk.
- Don't extract a CTA color from a third-party widget (cookie consent, ad iframe) — the brand's CTA color is what appears on the actual "Calculate" button, nowhere else.

## Iteration Guide

1. Focus on one component at a time when building in Antigravity/Gemini — reference these token keys directly in prompts.
2. New CTAs default to `{rounded.pill}`; new icon plates default to `{rounded.full}`; cards default to `{rounded.xl}`.
3. Variants (e.g. `button-calculate-disabled`) live as separate entries, not conditional props buried in one component.
4. Use `{token.refs}` everywhere in code/CSS variables — never inline hex, so a future palette tweak is a one-file change.
5. Hover state is intentionally undocumented at this stage — only Default, Active/Pressed, and Disabled are specified; add hover later if analytics show it's needed.
6. Display 400 for headlines, Sans 400/600/700 for everything else, Mono 500 on every number — no exceptions.
7. Primary Blue stays scarce — audit any page that has more than two blue moments per section.

## Known Gaps

- Hover states beyond Default/Active/Disabled are not specified — add once real usage data suggests where they matter.
- Animation/transition timings are out of scope for this document.
- Form validation states beyond focus (e.g. inline error styling) need a follow-up pass once the calculator input library is chosen in Technical Architecture.
- Accent Amber usage is illustrative-only (category glyphs, "Popular" badges) — do not expand its role without revisiting the "single accent color" principle above.
