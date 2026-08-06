# 0-AI_RULES.md — AI Engineering Operating Manual

**Project:** FinTool — Free Financial Calculator Hub  
**Repository:** Permanent Operating Constitution & Engineering Guidelines  
**Scope:** Mandatory for all AI assistants (Gemini, Claude, GPT, etc.) operating on this codebase across all past, present, and future sessions.

---

## 1. Purpose

This document establishes the permanent, non-negotiable engineering standards and operational workflows for any AI assistant working on the **FinTool** codebase. 

Because this project is built entirely through sequential AI-driven prompt sessions, **consistency is our highest operational priority**. This manual eliminates architectural drift, token degradation, code duplication, and design system erosion across hundreds of development sessions. Every AI model must operate as a Senior Staff / Principal Software Engineer adhering to top-tier software engineering discipline.

---

## 2. Source of Truth

The following foundational markdown documents constitute the **Permanent Constitution** of this repository. They take absolute precedence over any AI assumptions, defaults, or external preferences:

1. [1-PRD.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/1-PRD.md) — Product vision, scope, 10-section page hierarchy, and monetization strategy.
2. [2-technical-architecture.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/2-technical-architecture.md) — Astro static engine, island hydration, content collections, and Cloudflare Workers pipeline.
3. [3-security-and-access.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/3-security-and-access.md) — Zero-backend security posture, account protections, and privacy compliance.
4. [4-feature-tickets.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/4-feature-tickets.md) — Execution-level ticket backlog and prioritization framework.
5. [design_system.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/design_system.md) — Institutional publication aesthetics, color tokens, typography scale, and layout rules.
6. [0-AI_RULES.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/0-AI_RULES.md) — This operating manual.

**Rule:** If a user request or AI hypothesis conflicts with these files, the constitution wins. Never modify foundational architecture without explicit, written user instruction.

---

## 3. Project Philosophy

* **Production-First Standard:** Every single commit must be deployable to Cloudflare production. No broken builds, no broken routes, no incomplete pages.
* **Maintainability over Speed:** Writing clean, modular, heavily typed code takes priority over quick hacky fixes. Adding tool #180 must feel as fast and easy as adding tool #1.
* **Reusable Architecture:** Never invent ad-hoc inline math, ad-hoc CSS colors, or ad-hoc input state handlers. Use `/src/calculators/core/`, `/src/utils/`, and established component primitives.
* **Zero Shortcuts & Zero Placeholders:** No `TODO` comments, no dummy mock functions, no placeholder text ("Lorem ipsum"), and no unformatted output numbers.
* **Client-Side Privacy Standard:** 100% of calculations execute inside the user's browser. Zero user data is transmitted to or stored on any server.

---

## 4. AI Working & Command Rules

1. **Understand Before Coding:** Inspect existing schemas, utilities, and components using file viewing tools before writing new code. Never guess function signatures or component prop names.
2. **Path Aliases Standard:** Always use clean path aliases (`@/`, `@components/`, `@calculators/`, `@utils/`, `@data/`) in TypeScript/Astro imports. Never use deep relative imports (`../../../../components/`).
3. **Never Guess Requirements:** If a financial formula, currency behavior, or feature requirement is ambiguous, check standard references (RBI/IRS formulas) or ask the user before writing code.
4. **Scope Control:** Never touch or refactor unrelated files outside the active ticket scope.
5. **Command Execution Safety & Anti-Polling Protocol:** 
   * **NEVER execute `cd` commands** in terminal tools. Use explicit `Cwd` parameters.
   * Provide adequate `WaitMsBeforeAsync` time (5000ms–10000ms) for background tasks.
   * **NEVER poll `manage_task` status in a loop.** Rely on background task notifications to resume execution.
   * Perform silent log inspections on task outputs before summarizing status to the user.
6. **Context Window Protection:** For complex tickets, split implementation into discrete steps:
   * **Step A:** Engine & Vitest Test Creation (`math.js` + `test.js` + verify `npm test`).
   * **Step B:** Preact Island & Content Creation (`Widget.jsx` + `slug.md` + verify `npm run build`).
7. **Deterministic & Concise Responses:** State changes clearly, link files using GitHub markdown links (`[file](file://...)`), and present concrete technical rationale.

---

## 5. Coding & Frontend Standards

### TypeScript & JavaScript
* Use strict ES6+ JavaScript for calculator math modules (`/src/calculators/`) and TypeScript (`.ts` / `.tsx` / `.astro`) for components and schemas.
* Pure functional math logic: Every calculator must export a pure, side-effect-free function: `calculate(inputs) => outputs`.
* Zero DOM coupling inside math engines: Never reference `document`, `window`, or HTML elements inside `/src/calculators/` logic files.

### Astro 5 Content Collections & Routing
* Enforce strict Zod validation in `src/content/config.ts`. Note that in Astro 5, `entry.slug` or `entry.id` is a top-level collection property. Always extract slugs using `const slug = entry.slug || entry.data.slug || entry.id`.
* Keep structural metadata (titles, categories, FAQs, related tool overrides) in frontmatter; place narrative long-form markdown in body text rendered via `<Content />`.
* All tool pages must use `ToolLayout.astro` to enforce exact PRD §6.1 section ordering.

### JSX & Component Rules
* JSX comments MUST use `{/* Comment */}` syntax. Never use HTML comments `<!-- Comment -->` in JSX/Preact files.
* JSON-LD scripts in Astro components MUST include the `is:inline` directive: `<script type="application/ld+json" is:inline set:html={JSON.stringify(schema)} />`.

### Tailwind CSS & Styling
* Use design system tokens mapped in `tailwind.config.mjs` (`bg-primary`, `bg-surface-dark`, `text-semantic-up`, `rounded-pill`, `rounded-xl`).
* Never hardcode arbitrary hex colors (e.g. `#1a202c`) or non-standard border radii inline.
* Display headlines MUST sit at weight 400 (`font-display font-normal`). Never apply `font-bold` to Display headings.
* All numerical outputs (EMI values, rates, maturity values, table figures) MUST use JetBrains Mono (`font-mono`).

### Formatting & Utilities
* Format every monetary figure using `formatCurrency(amount, currency, locale)` from `@utils/formatters.js`.
* Format percentages using `formatPercent(rate)`.
* Sanitize all user numeric inputs with `parseNumber(input)`.

---

## 6. Repository Architecture & Layout Contract

### Folder Structure
```
/src
  /calculators
    /core                        → Shared math primitives (pmt, fv, cagr, amortization)
    /[category]                  → Category engines (e.g. loans/emi.js, investment/sip.js)
    /[category]/__tests__        → Vitest formula correctness test suites
  /components
    /calculators                 → Interactive Island widgets (Preact / Vanilla)
    FormInputNumber.astro, ToolLayout.astro, FaqSection.astro, RelatedTools.astro, AdSlot.astro...
  /content
    /tools                       → Astro Content Collection markdown files (.md)
    config.ts                    → Zod collection schema
  /data/tax-rates                → Versioned, immutable reference constants (in-2025-26.js)
  /layouts/BaseLayout.astro      → Root HTML shell, fonts, OpenGraph, JSON-LD
  /pages/tools/[category]/[tool] → Canonical tool routing template (/tools/[category]/[tool]/)
  /styles/global.css             → CSS custom properties & base typography
/public                          → robots.txt, _headers, favicons
/scripts/create-tool.js          → Automation scaffolding CLI
```

### File Creation & Modification Rules
* **New Tools:** Scaffolded via `node scripts/create-tool.js <slug> <title> <category> <priority>`.
* **Dynamic Linking:** `RelatedTools.astro` MUST dynamically query Astro content collections by category to prevent $O(N^2)$ manual frontmatter edits across 200 tools.
* **Reference Data Immutability:** Files in `/src/data/tax-rates/` must export versioned, immutable objects (e.g., `TAX_SLABS_IN_2025_26`). Annual tax updates must add new versioned files rather than mutating historical data.

---

## 7. Calculator Development Rules

Every calculator tool shipped to production MUST strictly fulfill all 12 points of the **PRD §7 Shipping Loop**:

1. **Pure Math Engine:** Written in `/src/calculators/<category>/<slug>.js` using TVM primitives.
2. **Vitest Unit Test:** Created in `/src/calculators/<category>/__tests__/<slug>.test.js` asserting output against a hand-verified benchmark. Must pass `npm test`.
3. **Interactive Widget Island:** Created in `/src/components/calculators/` with real-time range sliders, numeric fields, mobile-responsive layout, and visual breakdown bars.
4. **Zod Frontmatter Schema:** Validated in `/src/content/tools/<slug>.md`.
5. **1,000+ Words Unique Content:** High-quality YMYL intro, step-by-step instructions, features, benefits, and worked example with LaTeX formulas.
6. **Minimum 5 Search FAQs:** Valid questions with answers emitting `FAQPage` JSON-LD schema.
7. **WebApplication Schema:** Auto-injected in head.
8. **Universal Disclaimer:** Included via `ToolLayout.astro`.
9. **Dynamic Related Tools:** Cross-linked via `RelatedTools.astro`.
10. **Canonical Route:** Accessible under `/tools/[category]/[tool-slug]/`.
11. **Passing Build:** Passes `npm run build` with **0 errors and 0 warnings**.
12. **Search Console Submission:** URL ready for indexing.

---

## 8. UI & Design System Rules

* **Single Accent Color:** `Primary Blue` (`#0052ff`) is reserved exclusively for primary CTA pills (`.button-calculate`), the wordmark, and inline brand links (max 1–2 blue moments per section).
* **Surface Modes:** Homepage Hero & Pre-Footer CTA band use `Surface Dark` (`#0a0b0d`). All tool and content pages stay in Light mode (`Canvas` `#ffffff`).
* **Result Semantics:** `Semantic-Up` (`#05b169`, green) and `Semantic-Down` (`#cf202f`, red) are text-only colors for financial outcomes. Never use them as button backgrounds.
* **Geometry Standard:** Pill geometry (`100px`) for all CTAs and badges; `24px` radius (`rounded-xl`) for cards and panels; full circle (`rounded-full`) for icons. Sharp 0px corners are forbidden.
* **Single Shadow Tier:** Soft drop (`0 4px 12px rgba(0,0,0,0.04)`) is the only shadow tier allowed.

---

## 9. Performance & Accessibility Rules

### Performance
* **Core Web Vitals Targets:** Mobile LCP < 2.5s, INP < 200ms, CLS < 0.1.
* **Zero JS by Default:** Non-interactive sections ship 0 KB client JS.
* **Island Hydration Directive:** Use `client:visible` or `client:idle` for interactive widgets. Never use `client:load` on below-the-fold elements.
* **DOM Node Optimization:** Breakdown tables with > 60 rows MUST implement client-side pagination or collapsible schedule views to prevent mobile DOM node explosion and INP degradation.
* **Font Delivery:** Preload self-hosted WOFF2 font files or use Google Fonts with `font-display: swap`.

### Accessibility (WCAG AAA Baseline)
* **Form Inputs:** Every text input must have an explicit `<label for="...">` or `aria-label`.
* **Range Sliders:** All range sliders must provide `aria-label`, `min`, `max`, and `value`.
* **Touch Targets:** All primary buttons (`.button-calculate`), search inputs, and sliders must maintain a minimum 44px height tap zone.
* **Screen Readers:** Interactive result summary panels must include `aria-live="polite"` so calculated outputs are announced dynamically.

---

## 10. SEO Rules

* **Canonical Route Hierarchy:** Always `/tools/[category]/[tool-slug]/` (with trailing slash).
* **Dynamic Internal Mesh:** Category hubs link to all tools; tool pages link back to hub and sideways to related tools via `RelatedTools.astro`.
* **Automated Schemas:** `WebApplication`, `FAQPage`, and `BreadcrumbList` JSON-LD schemas MUST be emitted on every tool page.
* **Header Hierarchy:** Exactly one `<h1>` per page (Tool Title), followed by structured `<h2>` and `<h3>` headings.
* **Unique Content Requirement:** Never copy-paste boilerplate text across tools. Each tool must feature unique worked examples and contextual FAQs.

---

## 11. Security Rules

* **Zero Backend Exposure:** No API keys, database credentials, or server tokens in static code.
* **Client-Side Isolation:** No user inputs sent to any third-party endpoints.
* **AdSlot Protection:** `AdSlot.astro` containers must maintain a minimum 32px (`spacing.xl`) separation from calculator inputs and calculate buttons to prevent accidental clicks.
* **Security Response Headers:** Enforced in `public/_headers` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).

---

## 12. Testing & Quality Rules

Before declaring any feature complete, the AI MUST execute and verify:
1. `npm test` — 100% of Vitest unit tests pass with explicit rounding or `toBeCloseTo()` assertions.
2. `npm run build` — Astro static compiler & TypeScript diagnostics pass with **0 errors and 0 warnings**.
3. Mobile Viewport Check — Sliders, buttons, and tables adapt fluidly to screen widths down to 320px.
4. Edge Case Handling — Verify zero, negative, string, and overflow inputs without NaN crashes.

---

## 13. Git & Execution Workflow

* **Strict Serialization:** **One ticket = One tool = One commit = One deploy.**
* **Never Build in Parallel:** Never start Tool #N+1 until Tool #N is fully tested, built, and merged.
* **Clean Commit Messages:** Follow standard conventional commits (e.g., `feat(loans): add EMI calculator with amortization engine`).

---

## 14. Self-Review Checklist

Before delivering any completed task, every AI assistant MUST verify:

- [ ] Does the implementation adhere strictly to [1-PRD.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/1-PRD.md) and [design_system.md](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/design_system.md)?
- [ ] Is the math engine functional, pure, and tested in Vitest (`npm test`)?
- [ ] Is all numerical output formatted via `formatCurrency()` or `formatPercent()` in JetBrains Mono font?
- [ ] Are all 10 mandatory PRD §6.1 sections present on the tool page?
- [ ] Does `npm run build` execute cleanly with 0 errors and 0 warnings?
- [ ] Are `WebApplication`, `FAQPage`, and `BreadcrumbList` schemas present in `<head>`?
- [ ] Are input controls touch-friendly (≥44px height) with proper ARIA labels?
- [ ] Has zero user data collection or server storage been introduced?

---

## 15. Prohibited Behaviors ("NEVER DO")

* ❌ **NEVER** build multiple calculators in parallel with placeholder content.
* ❌ **NEVER** use `TODO` comments or temporary mock data in committed code.
* ❌ **NEVER** use HTML comments `<!-- -->` inside JSX files (use `{/* */}`).
* ❌ **NEVER** omit `is:inline` on JSON-LD script tags in Astro files.
* ❌ **NEVER** execute `cd` terminal commands (use `Cwd` parameter).
* ❌ **NEVER** poll `manage_task` status in a loop (wait for background event notifications).
* ❌ **NEVER** use deep relative import paths like `../../../../components/` (use `@components/`).
* ❌ **NEVER** introduce inline hex colors or hardcoded font families outside design system tokens.
* ❌ **NEVER** import heavy external UI/math libraries when vanilla JS or core primitives suffice.
* ❌ **NEVER** bold Display headlines (`font-display` sits at weight 400).
* ❌ **NEVER** place ad slots adjacent to interactive calculator buttons.
* ❌ **NEVER** bypass Vitest test verification before shipping a calculator engine.
* ❌ **NEVER** modify existing foundational markdown files without explicit user instruction.

---

## 16. Definition of Done

A task or ticket is officially **DONE** when and only when:

1. **Calculator Engine:** Pure JS function passes Vitest benchmark tests (`npm test`).
2. **Interactive Island:** Responsive UI widget hydrates cleanly with real-time feedback and dynamic ARIA live updates.
3. **Substantive Content:** 1,000+ words of unique markdown content + worked examples + 5 FAQs live in Content Collections.
4. **SEO & Schemas:** Canonical URL, meta tags, and JSON-LD schemas validated.
5. **Internal Mesh:** Links to category hub and related tools active.
6. **Static Build:** `npm run build` succeeds with **0 errors and 0 warnings**.
7. **Production Ready:** Committed to Git and ready for Cloudflare auto-deployment.

---
*This document is permanent and immutable across all future AI development sessions.*
