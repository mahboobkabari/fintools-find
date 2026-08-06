# Technical Architecture Document

**Project:** FinTool — Free Financial Calculator Hub
**Document version:** 1.0
**Depends on:** `1-PRD.md`
**Precedes:** `3-security-and-access.md`, `4-feature-tickets.md`

---

## 1. Architecture Goals

Every decision below is judged against the PRD's actual constraints, not generic "best practice":

1. **Zero/near-zero running cost** — solo, ad-funded project; no backend or database to pay for or maintain.
2. **Fast to ship one tool at a time** — adding tool #45 should feel exactly as easy as adding tool #5. This is the single most important architectural property.
3. **SEO- and Core Web Vitals-first** — every page is static HTML at the edge, minimal JS.
4. **AI-agent-friendly** — you're building this with Antigravity using mostly Gemini models, occasionally Claude. The stack should be something these models have deep, reliable training coverage of, so generated code is consistent and low-error across 194 incremental sessions.
5. **Genuinely static** — consistent with how growagardencalculators.online was already rebuilt (WordPress → static HTML/CSS/JS for the same SEO/CWV reasons). No backend, no database, no server-rendering needed — everything a calculator needs (user inputs + reference constants like tax slabs) can be computed in the browser.

---

## 2. Stack Decision

### 2.1 Options considered

| Option | Why not chosen as primary |
|---|---|
| **Hand-rolled static HTML/CSS/JS** (like the calculators site) | Works, but with 194 near-identical page structures, copy-pasting HTML per tool becomes error-prone and slow to maintain — exactly the kind of repetitive work the tool-by-tool loop needs to avoid. |
| **Next.js (static export)** | Heavier than needed; brings a React runtime and conventions built for app-like products, not a content+widget site. |
| **11ty (Eleventy)** | A legitimate alternative — pure static output, very lightweight. Passed over mainly because Astro gives the same static-first output *plus* a cleaner interactive-widget story (see below) and currently has broader/more consistent coding-agent familiarity. |

### 2.2 Chosen stack: **Astro**

- Astro's default output is `output: 'static'` — it compiles to plain HTML/CSS/JS, no server required. This matches the "fully static" philosophy directly.
- **Content Collections**: each calculator's content (Intro, How to Use, Features, Benefits, FAQ, Formula explanation) lives as one Markdown file per tool, validated against a shared schema. This maps 1:1 onto the PRD §6.1 page structure and onto the "one tool = one unit of work" build loop.
- **Islands architecture**: the page is static HTML by default; only the calculator widget itself ships JS to the browser (an "island"). The FAQ, intro, related-tools links, etc. cost zero JS. This is what actually protects Core Web Vitals as the site scales to 194 pages.
- **Routing**: dynamic routes (`getStaticPaths()`) generate all 194 tool pages and 16 category pages from the content collection automatically — you don't hand-write 194 route files.

**Result:** adding a new tool means adding one Markdown content file + one small calculator JS module. Everything else (routing, layout, SEO tags, schema, sitemap entry, internal links) is generated automatically by the existing system. This is the technical backbone that makes PRD §7's loop realistic at tool #150 as much as tool #5.

---

## 3. High-Level Architecture

```
 Local machine (Antigravity, Gemini/Claude models)
        │  git commit + push
        ▼
     GitHub repo (main branch)
        │  triggers on push
        ▼
 Cloudflare (Workers & Pages dashboard, Git-connected build)
        │  runs: npm install && npm run build
        │  deploys: /dist as static assets on a Worker
        ▼
   Cloudflare global edge network (CDN)
        │
        ▼
      Visitor's browser  ←── Hostinger-purchased domain, DNS via Cloudflare
```

No database, no API server, no auth layer. The only "backend" is Cloudflare's edge serving pre-built static files — which is also why security surface area is minimal (detailed in `3-security-and-access.md`).

### 3.1 A note on Cloudflare Pages vs. Workers

Cloudflare's own current guidance (2026) is to build new static sites on **Workers with Static Assets** rather than Pages — Pages still works and isn't going away, but Cloudflare has said new investment is going into Workers, and Pages is effectively in maintenance mode. For a fully static Astro site this changes almost nothing in practice:

- `astro build` still just outputs plain files to `/dist` — no Cloudflare adapter needed, since there are no server-rendered routes.
- Instead of a "Pages project," you create a **Worker** in the Cloudflare dashboard (**Workers & Pages → Create → Connect to Git**), point it at the GitHub repo, and it auto-detects the Astro static build.
- The day-to-day workflow is identical to what "Cloudflare Pages" always offered: push to GitHub → Cloudflare builds → deploys to the edge → live. Only the underlying product name and a config file (`wrangler.jsonc`) differ.

This is the recommended path so the project isn't built on a product Cloudflare is de-prioritizing.

---

## 4. Repository Structure

```
/src
  /pages
    index.astro                    → Homepage
    tools/
      index.astro                  → All-tools index
      [category]/
        index.astro                → Category hub (loops content collection)
        [tool]/
          index.astro              → Tool page template (loops content collection)
    about.astro
    contact.astro
    privacy-policy.astro
    terms.astro
    disclaimer.astro

  /content
    /tools                         → Content Collection: one .md file per tool
      emi-calculator.md
      sip-calculator.md
      income-tax-calculator.md
      ...
    config.ts                      → Zod schema for the tool content collection

  /components
    ToolLayout.astro               → Wraps every tool page (PRD §6.1 section order)
    CategoryNav.astro
    Breadcrumbs.astro
    FaqSection.astro               → Renders FAQ + emits FAQPage schema
    RelatedTools.astro
    AdSlot.astro                   → Placeholder ad unit, wired up post-AdSense-approval
    CalculatorIsland.astro         → Generic wrapper that hydrates a tool's JS island

  /calculators                     → Client-side calculation logic, framework-free JS
    loan/
      emi.js
      home-loan.js
      ...
    investment/
      sip.js
      cagr.js
      ...
    ...(one folder per PRD category)

  /calculators/__tests__           → Vitest unit tests for calculator formulas (§8.2)

  /data
    tax-rates/
      in-2025-26.js                → Reference constants that need periodic updates
      us-2025.js

  /layouts
    BaseLayout.astro               → HTML shell, meta tags, global nav/footer

  /styles
    global.css                     → Base styles + CSS variables (design tokens land here later)

/public
  favicon.svg, /images, robots.txt

astro.config.mjs
wrangler.jsonc
package.json
```

This structure is the concrete implementation of PRD §7: **new tool → one file in `/content/tools/`, one file in `/calculators/<category>/`, optionally one entry in `/data` if it needs reference constants.** Nothing else needs to be touched by hand.

---

## 5. Content Model (Content Collection Schema)

Every field below maps directly to a PRD §6.1 page section, so content is structurally forced to be complete before a tool can build successfully (Astro validates the schema at build time).

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),                     // H1 / <title> base
    metaDescription: z.string().max(160),
    category: z.string(),                  // e.g. "loan-emi-calculators"
    slug: z.string(),                      // matches tool_slugs.csv, no leading/trailing slash
    currency: z.enum(['INR', 'USD', 'generic']).default('generic'),
    intro: z.string(),                     // §6.1.3
    howToUse: z.array(z.string()),         // §6.1.4 — ordered steps
    features: z.array(z.string()),         // §6.1.5
    benefits: z.array(z.string()),         // §6.1.6
    formulaExplanation: z.string(),        // §6.1.7
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),                                    // §6.1.8
    relatedTools: z.array(z.string()),     // slugs of 3–6 related tools, §6.1.10
    calculatorModule: z.string(),          // path under /src/calculators/, e.g. "loan/emi.js"
    publishDate: z.date(),
    updatedDate: z.date().optional(),
  }),
});

export const collections = { tools };
```

`currency` resolves the PRD's open question directly: India-specific instruments (PPF, EPF, GST…) default `INR`, US-specific ones (401(k), IRA, FAFSA…) default `USD`, and instrument-agnostic ones (compound interest, ROI…) use `generic` with a selectable currency symbol in the widget.

The disclaimer (§6.1.9) is **not** a per-tool field — it's a single shared component rendered identically on every tool page, so its wording only ever needs to be maintained in one place.

---

## 6. Calculator Logic Architecture

- Each tool's math lives in its own small JS module under `/src/calculators/<category>/<tool>.js`, exporting a pure function: `calculate(inputs) → results`. Pure functions with no DOM dependency mean they're trivially testable.
- The **widget UI** (`CalculatorIsland.astro`) is a thin, mostly-shared component: renders inputs based on a simple config, calls the tool's `calculate()` function on input/submit, renders results. Only genuinely custom UI (e.g., an amortization table) needs tool-specific markup beyond that shared shell.
- No framework (React/Vue) needed for this — plain JS + Astro's island hydration keeps the per-page JS payload tiny, which is what actually protects Core Web Vitals across 194 pages. If a specific tool later needs richer interactivity, a single Preact/Alpine.js island can be added *for that tool only* without pulling a framework into every page.

### 6.1 Testing calculator correctness

Financial calculators are YMYL content — a wrong formula is a trust and liability problem, not just a bug. Recommendation: **Vitest** unit tests per calculator module, each asserting output against one manually-verified worked example (e.g., "₹10L loan, 8.5% p.a., 20 years → EMI ≈ ₹8,678"). This is lightweight (no browser, no CI infrastructure needed beyond `npm test`) but catches formula errors before they ever go live — worth the small extra step in the per-tool loop (§10 below).

---

## 7. SEO & Schema Implementation

All of this is generated from the content collection — never hand-written per page:

- **Meta tags**: `title`/`metaDescription` fields → `<title>` and `<meta name="description">` in `BaseLayout.astro`.
- **Canonical URL**: self-referencing canonical, derived from `slug`.
- **JSON-LD schema**:
  - `FaqSection.astro` emits `FAQPage` schema from the `faqs` array.
  - Tool pages emit `WebApplication` (or `SoftwareApplication`) schema for the calculator itself.
  - `Breadcrumbs.astro` emits `BreadcrumbList` schema (Home → Category → Tool).
- **Sitemap**: `@astrojs/sitemap` integration auto-generates `sitemap.xml` from every static route at build time — it updates itself every time a new tool ships, no manual step.
- **robots.txt**: static file in `/public`, allow-all, points to the sitemap.
- **Indexing workflow**: after each tool ships (per the loop in §10), manually submit the new URL via Google Search Console's URL Inspection tool for faster indexing — the sitemap alone will get it crawled eventually, but manual submission is worth the 30 seconds for a new page.

---

## 8. Styling Approach

- **Tailwind CSS** via `@astrojs/tailwind`, for two reasons: (1) it purges unused classes automatically, keeping CSS payload small across 194 pages; (2) both Gemini and Claude have very strong, consistent Tailwind knowledge, which matters a lot when an AI agent is writing UI code across dozens of separate sessions — utility classes reduce visual drift between tools built weeks apart.
- Per the PRD, **exact colors/fonts/"vibe" are deliberately not decided here** — that's the later System Design doc. This architecture just establishes *where* those decisions plug in: `tailwind.config.mjs` theme tokens + CSS variables in `global.css`. Until that doc exists, the site uses safe, minimal neutral defaults so tools can still ship.

---

## 9. Data & Content Freshness

Some calculators depend on reference data that changes over time (income tax slabs, GST rates, standard deduction amounts, etc.). These live as plain JS/JSON files under `/src/data/`, versioned by year (e.g., `in-2025-26.js`), imported by the relevant calculator module. When rates change (e.g., a new Union Budget), the fix is: update the data file, bump `updatedDate` in the affected tool's content file, commit, push. No migration, no database update — this is a direct benefit of the static/no-backend approach.

---

## 10. Performance Budget

Concrete targets, checked before each tool ships (part of the QA step in the loop below):

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s on mobile |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| JS shipped per tool page | Small enough that the calculator island stays the dominant cost — no unrelated framework weight |
| Images | WebP/AVIF, lazy-loaded below the fold |
| Fonts | Self-hosted WOFF2, `font-display: swap` |

Astro's static-first + islands approach makes hitting these targets the *default* outcome rather than something to fight for — the main discipline required is not accidentally pulling in a heavy client-side dependency for a single tool.

---

## 11. Analytics & Ads Integration

- **Analytics:** Cloudflare Web Analytics as the default — it's cookieless/privacy-friendly, which means **no cookie consent banner is required to start**, keeping the initial build simpler. Google Analytics 4 (with Consent Mode v2) can be added later if deeper behavioral data is needed, at the cost of adding a consent banner.
- **Ads:** `AdSlot.astro` is a placeholder component built into the tool page template from day one, positioned per the PRD §8 placement principles (never inside/overlapping the calculator widget itself). It renders empty/inert until the AdSense account is approved and real ad unit codes are dropped in — meaning ad integration is a config change, not a re-architecture, once approval comes through.

---

## 12. Environments & Deployment Pipeline

- **Source control:** GitHub, single `main` branch as production. Feature branches/PRs get automatic Cloudflare **preview deployments** (a unique preview URL per branch) — this doubles as a staging environment without any extra setup.
- **Build command:** `npm run build` → outputs to `/dist`.
- **Deploy target:** Cloudflare Worker with Static Assets (see §3.1), connected directly to the GitHub repo via the Cloudflare dashboard — every push to `main` auto-builds and deploys.
- **Domain:** registered at Hostinger; DNS delegated to Cloudflare (change nameservers at Hostinger to the ones Cloudflare assigns when you add the site) so the custom domain can be attached to the Worker and you get Cloudflare's CDN/SSL/DDoS protection on top.
- **No environment variables/secrets needed** for v1 — no API keys, no database credentials, nothing sensitive to manage (elaborated in `3-security-and-access.md`).

---

## 13. Per-Tool Development Recipe (technical realization of PRD §7)

This is the concrete checklist for Antigravity/you to follow for every single tool:

1. Add `src/content/tools/<slug>.md` — fill every schema field (title, intro, howToUse, features, benefits, formulaExplanation, faqs, relatedTools, calculatorModule, currency).
2. Add `src/calculators/<category>/<tool>.js` — pure `calculate(inputs)` function.
3. Add a Vitest test for that function against one hand-verified example.
4. If the tool needs reference constants (tax slabs etc.), add/update the relevant file in `src/data/`.
5. Run `npm run dev`, visually check the page renders correctly (widget + all §6.1 sections + related tools links resolve).
6. Run `npm run build` locally to catch schema/type errors before pushing.
7. Commit with a clear message (e.g., `feat: add EMI calculator`), push to a feature branch, check the Cloudflare preview deployment.
8. Merge to `main` → auto-deploys to production.
9. Submit the new URL in Google Search Console.
10. Move to the next tool on the prioritized backlog (defined in `4-feature-tickets.md`).

Nothing in this list requires touching routing, sitemap, schema markup, or navigation by hand — those are all generated from steps 1–2 automatically, which is the entire point of this architecture.

---

## 14. Open Technical Decisions

1. Exact Tailwind theme token names/values — deferred to the System Design doc, but the plug points are established (§8).
2. Whether related-tools linking should ever move from manually-curated (current plan) to partly auto-suggested by category/tag once there are enough tools to make auto-suggestions reliably relevant.
3. Whether a lightweight GitHub Action (e.g., Lighthouse CI on PRs) gets added later for automated performance regression checks — not blocking for v1 given Cloudflare's preview deployments already allow manual checking.
