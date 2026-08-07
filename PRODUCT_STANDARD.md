# Fintools Find Master Product Quality Standard & Release Playbook

**Document Version**: 1.0.0  
**Authority Level**: Highest Internal Authority for Release Gate Approval  
**Perspective**: VP of Product (Stripe / Apple / CRED Fintech Quality Benchmark)  
**Passing Threshold**: **95 / 100 Minimum Score Required for Production Launch**

---

## 1. Product Philosophy & Core Tenets

Fintools Find exists to eliminate financial anxiety and replace it with absolute clarity, delight, and decision confidence.

### What Makes a Calculator Feel Premium?
1. **Instant Response Physics**: Sliders, preset chips, and input fields calculate instantly without network latency or UI lag.
2. **Tactile Craftsmanship**: Custom fill tracks, spring-animated numeric roll counters, glassmorphism cards, and refined typography.
3. **No Fluff & No Distractions**: Zero intrusive ads, zero popup popovers, zero forced sign-ups, and zero clutter.

### What Creates Absolute Trust?
1. **100% Client-Side Sandbox Guarantee**: Calculations execute strictly inside the user's browser memory. Zero input logging.
2. **Quant-Grade Methodological Transparency**: Displaying exact annuity equations ($P$, $r$, $n$) and links to authoritative source methodology.
3. **Institutional EEAT Credentials**: Explicit "Reviewed by Quant Team" badges, author attribution, and publication timestamps.

---

## 2. The 6-Stage User Journey Protocol

Every calculator must deliver a flawless experience through 6 distinct stages:

1. **First 5 Seconds**: The user immediately sees the title, trust badges, preset buttons, and primary calculator workspace above the fold.
2. **First Interaction**: Clicking a preset chip or moving a slider triggers instant visual feedback and smooth spring value transitions.
3. **First Calculation**: The Monthly Result card and Donut Chart update dynamically in real time without screen flicker or layout shift.
4. **First Insight**: The user encounters an empowering financial insight (e.g. *"Prepaying 1 extra EMI saves ₹2.41 Lakhs!"*) that transforms raw math into action.
5. **First Share**: Clicking **Share Scenario** copies a parameter-encoded URL (`?amount=5000000`) for effortless collaboration.
6. **First Return Visit**: Saved URL hash parameter hydration restores the exact calculation state instantly.

---

## 3. Standard Information Hierarchy Flow

Every tool MUST strictly adhere to this exact structural flow:

```
1. Hero Header & EEAT Trust Pills
   ↓
2. Quick Preset Scenario Cards (1-Tap Fill)
   ↓
3. Calculator Input Workspace & Custom Sliders
   ↓
4. Mega Result Dashboard & 3-Card Summary Grid
   ↓
5. Animated Visualizations (Donut Chart & Amortization Table)
   ↓
6. Financial Coaching Engine (Prepayment Coach & FOIR Affordability Gauge)
   ↓
7. Dynamic Financial Intelligence Cards (Sensitivity & Multipliers)
   ↓
8. Process Architecture Timeline ("How It Works")
   ↓
9. Target Borrower Personas ("Who Should Use This")
   ↓
10. Practical Worked Case Studies
   ↓
11. Comparative Analysis (e.g., Reducing Balance vs. Flat Rate)
   ↓
12. Mathematical Engine (LaTeX Formula & Variable Cards)
   ↓
13. Statutory Tax Relief Callouts (Section 80C / 24b)
   ↓
14. Actionable EMI Reduction Strategies (Internal Tool Links)
   ↓
15. Common Mistakes Warning Cards
   ↓
16. Interactive Preact FAQ Accordion
   ↓
17. Related Tool Hub Cards
```

---

## 4. 100-Point Product Quality Release Checklist

Before any calculator branch is merged into `main`, it must satisfy all 100 Quality Gate Checkpoints:

### UX & User Journey (Checkpoints 01–15)
- [ ] 01. Calculator inputs visible above the fold on mobile and desktop.
- [ ] 02. One-tap preset scenario chips provided for instant benchmarking.
- [ ] 03. Sliders update values smoothly with zero visual stutter.
- [ ] 04. Text inputs format numbers dynamically (e.g. `₹50,00,000`).
- [ ] 05. Manual text entry handles blur, min, max, and invalid input safety.
- [ ] 06. Results update synchronously with input mutations.
- [ ] 07. Primary KPI result emphasized with mega typography.
- [ ] 08. Secondary summary metrics organized in clean grid cards.
- [ ] 09. Interactive toggle provided for full schedule table.
- [ ] 10. Prepayment coach displays actionable interest/time savings.
- [ ] 11. Affordability gauge computes FOIR ratio dynamically.
- [ ] 12. Share button copies parameter-encoded URL to clipboard.
- [ ] 13. Toast notification confirms link copy success.
- [ ] 14. Reset button restores initial tool defaults.
- [ ] 15. No forced logins, sign-up popups, or email gates.

### Visual Design & Polish (Checkpoints 16–30)
- [ ] 16. Typography strictly follows `Plus Jakarta Sans` + `Inter` + `JetBrains Mono`.
- [ ] 17. Color palette uses semantic tokens (`--color-primary`, `--color-success`, etc.).
- [ ] 18. Card borders use subtle 1px hairline styling (`#E2E8F0`).
- [ ] 19. Surface containers use `rounded-3xl` (24px) border radius.
- [ ] 20. Inner cards use `rounded-2xl` (16px) border radius.
- [ ] 21. Buttons and badges use `rounded-full` (9999px) border radius.
- [ ] 22. Card hover states elevate smoothly (`scale-[1.01]`).
- [ ] 23. Dark glassmorphism cards provide contrast for financial highlights.
- [ ] 24. No plain unformatted text paragraphs longer than 3 lines.
- [ ] 25. Whitespace rhythm consistent across all 17 page sections.
- [ ] 26. Custom slider fill track highlights active percentage range.
- [ ] 27. Donut chart SVG includes glowing stroke highlights.
- [ ] 28. FOIR gauge SVG stroke animates smooth color transitions.
- [ ] 29. Icon badges use consistent background tints (`bg-primary/10`).
- [ ] 30. Zero layout shifts during page render or state updates.

### Accessibility (WCAG AA) (Checkpoints 31–42)
- [ ] 31. Text-to-background contrast ratio $\ge 4.5:1$ across all cards.
- [ ] 32. All interactive buttons include `focus:ring-2 focus:ring-primary`.
- [ ] 33. All inputs have associated `<label>` tags with matching `htmlFor`.
- [ ] 34. Range sliders include explicit `aria-label` attributes.
- [ ] 35. SVG visual charts include `role="img"` and descriptive `aria-label`.
- [ ] 36. Accordions use `aria-expanded` and `aria-controls` bindings.
- [ ] 37. Amortization toggle uses `aria-expanded` and `aria-controls`.
- [ ] 38. Numeric output areas include `aria-live="polite"`.
- [ ] 39. Full keyboard navigation operable via `Tab`, `Space`, and `Enter`.
- [ ] 40. Touch targets on mobile measure at least $44 \times 44\text{px}$.
- [ ] 41. Screen reader announcements provided for state updates.
- [ ] 42. Respects `@media (prefers-reduced-motion: reduce)`.

### Performance & Engineering (Checkpoints 43–55)
- [ ] 43. Lighthouse Performance Score $\ge 95$ on mobile and desktop.
- [ ] 44. Cumulative Layout Shift (CLS) equal to `0.00`.
- [ ] 45. First Contentful Paint (FCP) $< 1.0\text{s}$.
- [ ] 46. Interaction to Next Paint (INP) $< 50\text{ms}$.
- [ ] 47. Math logic isolated in pure function modules under `src/calculators/core/`.
- [ ] 48. Zero duplicate calculation logic across widgets.
- [ ] 49. Hydration scoped strictly to interactive Preact islands.
- [ ] 50. Static page pre-rendering supported via Astro SSG.
- [ ] 51. Zero console errors or warnings during runtime.
- [ ] 52. Code bundle size optimized with minimal JS footprint.
- [ ] 53. All Vitest unit tests pass (`npm test` 100% green).
- [ ] 54. TypeScript / Astro type check passes (`astro check` 0 errors).
- [ ] 55. Production static build compiles cleanly (`npm run build`).

### Trust, SEO & EEAT (Checkpoints 56–70)
- [ ] 56. Page title follows standard pattern (`[Tool Name]: [Primary Keyword]`).
- [ ] 57. Compelling meta description between 140–160 characters.
- [ ] 58. Canonical URL defined explicitly.
- [ ] 59. Open Graph (`og:title`, `og:description`, `og:image`) configured.
- [ ] 60. JSON-LD `WebApplication` schema generated.
- [ ] 61. JSON-LD `BreadcrumbList` schema generated.
- [ ] 62. JSON-LD `FAQPage` schema generated.
- [ ] 63. "Reviewed by Quant Team" trust badge rendered in hero.
- [ ] 64. Publication and update dates formatted clearly.
- [ ] 65. Privacy guarantee badge rendered ("100% Client-Side").
- [ ] 66. Mathematical formula displayed with LaTeX formatting.
- [ ] 67. Variable parameters ($P$, $r$, $n$) explicitly defined.
- [ ] 68. Academic or statutory references cited where applicable.
- [ ] 69. Editorial policy link included in footer.
- [ ] 70. Zero placeholder text (`Lorem Ipsum`) anywhere on page.

### Content & Financial Coaching (Checkpoints 71–85)
- [ ] 71. Single `<h1>` tag per page.
- [ ] 72. Proper heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
- [ ] 73. 4-step process architecture timeline included.
- [ ] 74. 4 target borrower persona cards included.
- [ ] 75. Key benefits listed with green checkmark indicators.
- [ ] 76. Key features listed with blue icon indicators.
- [ ] 77. Minimum 2 practical worked case studies with key takeaways.
- [ ] 78. Side-by-side comparative analysis card included.
- [ ] 79. Statutory tax relief provisions explained (e.g. Sec 80C/24b).
- [ ] 80. Minimum 5 actionable optimization strategies provided.
- [ ] 81. Direct internal links included to related loan tools.
- [ ] 82. Common mistakes warning card rendered in amber/red.
- [ ] 83. FAQ section contains at least 5 structured Q&As.
- [ ] 84. Dynamic financial intelligence cards calculate multipliers.
- [ ] 85. Rate sensitivity card shows exact savings for 0.5% lower rate.

### Responsiveness Across 6 Viewports (Checkpoints 86–100)
- [ ] 86. Verified on `320px` viewport (iPhone SE small).
- [ ] 87. Verified on `375px` viewport (Standard mobile).
- [ ] 88. Verified on `390px` viewport (iPhone 13/14 Pro).
- [ ] 89. Verified on `768px` viewport (iPad Portrait tablet).
- [ ] 90. Verified on `1024px` viewport (Desktop / iPad Landscape).
- [ ] 91. Verified on `1440px` viewport (Ultra-wide desktop).
- [ ] 92. Zero horizontal scrolling at any viewport width.
- [ ] 93. Preset cards wrap gracefully on 320px screens.
- [ ] 94. Sliders maintain comfortable drag width on mobile.
- [ ] 95. Input text boxes resize cleanly without numeric clipping.
- [ ] 96. Amortization schedule table scrolls horizontally inside container.
- [ ] 97. Sticky results panel behaves smoothly on desktop (`lg:col-span-6`).
- [ ] 98. Touch targets spaced with minimum 8px gap.
- [ ] 99. Typography scales down fluidly on mobile viewports.
- [ ] 100. Related tools grid adapts from 1 column on mobile to 3 on desktop.

---

## 5. Product Review & Scoring Framework (Out of 100)

Every calculator must be evaluated against this weighted 100-point rubric:

| Evaluation Category | Weight | Minimum Required | Focus & Criteria |
|---|---|---|---|
| **UX & Journey** | **20 Pts** | 19 Pts | First 5s clarity, preset responsiveness, smooth slider physics, intuitive workspace flow. |
| **Visual Design & Polish** | **20 Pts** | 19 Pts | Design system compliance, typography hierarchy, card borders, whitespace rhythm. |
| **Trust & EEAT** | **15 Pts** | 14 Pts | Client-side privacy guarantee, Quant review badges, transparent LaTeX math formulas. |
| **Performance & Engineering** | **10 Pts** | 10 Pts | 0 errors, 100% Vitest green, SSG compilation, 0 layout shifts. |
| **Accessibility (WCAG AA)** | **10 Pts** | 10 Pts | Contrast $\ge 4.5:1$, ARIA labels, focus rings, keyboard/screen-reader operable. |
| **Content Quality** | **10 Pts** | 9.5 Pts | Case studies, tax relief callouts, common mistakes, zero fluff. |
| **Financial Coaching & Delight** | **10 Pts** | 9.5 Pts | Prepayment coach, FOIR gauge, dynamic intelligence cards, URL scenario sharing. |
| **Responsiveness** | **5 Pts** | 5 Pts | Tested on all 6 viewports (320px–1440px), zero horizontal overflow. |
| **TOTAL SCORE** | **100 Pts** | **95 Pts** | **PASS THRESHOLD = 95 / 100** |

---

## 6. Permanent Governance Rule

No calculator pull request may be merged into `main` unless it achieves a verified score of **$\ge 95 / 100$** on `PRODUCT_STANDARD.md`.
