# Product Requirements Document (PRD)

**Project (working title):** FinTool — Free Financial Calculator Hub
**Domain:** TBD (to be purchased via Hostinger)
**Owner / Builder:** Mahboob (solo builder)
**Document version:** 1.0
**Status:** Draft — foundational doc, precedes Technical Architecture, Security & Access, and Feature Tickets

---

## 1. Executive Summary

FinTool is a free, ad-supported website offering a large library of financial, loan, investment, tax, and life-planning calculators (194 tools across 16 categories at time of writing — see Appendix A). The site's sole revenue source is **Google AdSense**. There is no login, no payments, and no backend in v1 — every calculator runs client-side in the browser.

The defining constraint on this PRD is **how** the site gets built, not just what it contains: tools are shipped **one at a time**, and each tool is only considered "done" when its calculator, its on-page content, its SEO metadata, and its internal links are all live together. The site never has "calculator-only" pages waiting for content to be added later.

---

## 2. Problem Statement & Opportunity

- People searching "EMI calculator," "SIP calculator," "income tax calculator," etc. want a fast, free, no-signup tool — this is one of the highest-intent, evergreen search categories on the web.
- Most competing calculator sites fall into two failure modes: (a) bare calculator widgets with almost no content, which Google increasingly deprioritizes and which AdSense can reject as "thin content," or (b) bloated, ad-stuffed pages with poor Core Web Vitals and bad UX.
- The opportunity is a **fast, static, genuinely useful site** where every tool page also teaches the user something (how the number is calculated, how to use it, what it means) — which satisfies both the user and Google's content-quality/E-E-A-T bar for financial (YMYL) content, while staying light enough to load instantly.

---

## 3. Goals & Success Metrics

**Primary goal:** Sustainable AdSense revenue from organic search traffic.

| Goal | Metric | Notes |
|---|---|---|
| Get approved for AdSense | AdSense account approved | Requires enough substantive pages + legal pages before applying (see §12) |
| Grow organic traffic | Indexed pages, GSC clicks/impressions | Track weekly per tool cohort |
| Monetize traffic | AdSense RPM, total revenue | Track per page/category to find highest-value tools |
| Keep pages fast | Core Web Vitals (LCP, INP, CLS) — all "Good" | Non-negotiable; static site should make this easy |
| Build topical authority | Domain becomes known for "[category] calculators" | Internal linking + category hub pages drive this |

**Non-goal for v1:** revenue from anything other than display ads. Premium/paid tools are explicitly deferred (see §6.2).

---

## 4. Target Users & Markets

The tool list spans both **India-specific** instruments (PPF, NSC, EPF, HRA, GST, Atal Pension Yojana, VPF, SIP) and **US-specific** instruments (401(k), IRA, FAFSA, Roth Conversion, FICA), plus globally-relevant ones (EMI, compound interest, crypto, budgeting). This means:

- **Primary audience:** retail users in India and the US searching for a specific calculator, usually with strong purchase/decision intent (buying a home, planning taxes, starting a SIP).
- **Site language:** English by default — broadest reach, best AdSense RPM, and serves both markets without fragmenting content. Hinglish/localized variants are a possible future phase, not v1.
- **Device mix:** assume majority mobile traffic (typical for this niche) — mobile-first UI is a hard requirement, not an afterthought.

---

## 5. Product Scope

### 5.1 In scope (v1)
- 194 calculator tools across 16 categories (Appendix A), built incrementally.
- For every published tool: calculator + full content block + SEO metadata + internal links (see §7).
- Category hub pages (e.g., `/tools/loan-calculators/`) listing all tools in that category — critical for internal linking and topical SEO clustering.
- Homepage listing/linking all categories and highlighting popular tools.
- Legal/trust pages required for AdSense: Privacy Policy, Terms of Use, About, Contact, Disclaimer (§12).
- Basic on-site search or filter across tools (nice-to-have, not blocking).

### 5.2 Out of scope (v1)
- User accounts, saved calculations, login.
- Paid/premium tools or any payment integration.
- Mobile app.
- Non-English localization.
- Server-side computation, database, or user data storage of any kind.
- Editorial blog/guides section (may be considered later for additional AdSense inventory and backlinks, but not part of the initial build loop).

### 5.3 Information architecture

```
/                          → Homepage (category grid, featured tools)
/tools/                    → All-tools index
/tools/<category-slug>/    → Category hub (e.g. /tools/loan-calculators/)
/tools/<tool-slug>/        → Individual calculator page (e.g. /tools/emi-calculator/)
/about/
/contact/
/privacy-policy/
/terms/
/disclaimer/
```

Every tool page links up to its category hub and sideways to 3–6 related tools (§7). Every category hub links to all tools within it and back to the homepage. This creates a deliberate internal-linking mesh rather than an orphaned list of pages.

---

## 6. Core Feature: The Individual Calculator Tool Page

This is the atomic unit of the product. **A tool is not "shipped" until every section below exists.** This spec is what every future feature ticket will be checked against.

### 6.1 Required page sections (in order)

1. **H1 + short intro (1–2 lines)** — what the calculator does, stated plainly, above the fold.
2. **The calculator widget itself** — interactive, client-side, instant results, no page reload. Mobile-friendly inputs (sliders + number fields).
3. **Introduction** (~150–250 words) — what this calculator is, why it matters, who uses it.
4. **How to use it** — numbered steps, plain language, matches the actual inputs on the widget.
5. **Features** — what the calculator supports (e.g., "supports step-up SIP," "shows year-by-year breakdown").
6. **Benefits** — why using this tool helps the user (time saved, better decisions, avoiding common mistakes).
7. **How it's calculated** — the underlying formula, in words and/or a simple worked example. This is the single highest-value section for both SEO (featured snippets) and E-E-A-T (shows the site isn't a black box).
8. **FAQs** — 4–8 real questions, marked up with FAQ schema.
9. **Disclaimer** — short, standard line: results are estimates, not financial advice, consult a professional. (Legal requirement given YMYL nature — see §12.)
10. **Related tools** — 3–6 internally-linked tools from the same or adjacent category.

### 6.2 Functional requirements
- Calculations run entirely client-side (no API calls needed for standard formulas).
- Reasonable default values pre-filled so the widget is useful with zero input.
- Input validation (no negative loan amounts, sensible min/max ranges) with inline error messages.
- Results update live or on a clear "Calculate" action — designer's call per tool, but must be consistent site-wide.
- Where relevant, show a breakdown (e.g., amortization table, year-wise SIP growth) — this doubles as extra unique content per page, which helps against thin-content risk across 194 similar-looking tools.

### 6.3 SEO requirements per page (applied at publish time, not later)
- Unique `<title>` and meta description per tool (no templated duplicates).
- Semantic heading hierarchy (single H1, structured H2s matching §6.1 sections).
- Schema.org markup: `FAQPage` for the FAQ block, `HowTo` or `WebApplication` for the calculator itself where applicable.
- Canonical tag, clean slug (already generated — see Appendix A), and inclusion in `sitemap.xml` at publish time.
- Submit to Google Search Console for indexing as part of the publish checklist, not a separate later task.

---

## 7. Development Philosophy: Tool-by-Tool Iterative Build

This is the operating model for the whole project and should be treated as a hard constraint by anyone (human or AI) working on this repo.

**Never build multiple tools in parallel with unfinished content.** The loop per tool is:

1. **Pick** the next tool from the prioritized backlog (defined in `4-feature-tickets.md`).
2. **Build** the calculator (HTML/CSS/JS, client-side logic, validation).
3. **Write** all content sections from §6.1 for that specific tool.
4. **Add** SEO metadata + schema markup for that tool.
5. **Link** it — add it to its category hub, add 3–6 related-tool links, add it to the sitemap.
6. **QA** — verify calculation accuracy against a manual example, test mobile layout, check Core Web Vitals.
7. **Ship** — commit, push to GitHub, Cloudflare auto-deploys, submit URL to Search Console.
8. **Only then** move to the next tool.

Rationale: this avoids the classic "half-built calculator site" trap (100+ bare widgets with no content, which is both bad for users and a real risk factor for AdSense rejection), and it means the site is always in a publishable, revenue-earning state — it never needs a "big launch," it just keeps growing.

---

## 8. Monetization Strategy (Google AdSense)

- **Revenue model:** display ads only, v1. No affiliate links, no sponsored content, no premium tier (explicitly deferred — see §5.2).
- **Ad placement principle:** enough ad inventory to earn, without harming UX or violating AdSense policy on ad density / accidental clicks. Typical safe placements: below the intro, in the sidebar (desktop) or between content blocks (mobile), and near — but not inside — the calculator widget itself (avoid placing ads where a misclick could look like part of the tool).
- **Content depth requirement:** AdSense reviews for "valuable, original content" — the §6.1 structure exists specifically so no page is ever just a bare widget.
- **Before applying for AdSense:** have a meaningful number of fully-built tool pages live (not a bare handful) plus all required legal/trust pages (§12) — exact tool count threshold is a judgment call, but "10 tools with placeholder content" is worse than "20 tools fully built."
- **Future (not v1):** if traffic/revenue justifies it, consider a small set of premium/advanced tools (e.g., downloadable reports, saved scenarios) as a second revenue stream. No commitment made to this now.

---

## 9. Tech & Deployment Overview

*(Full detail belongs in `2-technical-architecture.md`; summarized here for product context.)*

- **Coding environment:** Antigravity (local, on Mahboob's laptop), models used primarily Gemini (3.6/3.5 Flash, 3.1 Pro), with Claude Sonnet/Opus 4.6 (Thinking) available for higher-reasoning tasks.
- **Version control:** GitHub — every tool ships as a commit/PR against the loop in §7.
- **Hosting:** Cloudflare Pages, auto-deployed from GitHub on push.
- **Domain:** purchased via Hostinger, DNS pointed to Cloudflare.
- **Architecture implication:** since deploys are static and instant, the tool-by-tool loop (§7) maps naturally to one commit = one live, complete feature. No staged rollouts needed for v1.

---

## 10. Compliance, Legal & Trust Pages

Required for AdSense approval and for basic legal coverage of a YMYL (Your Money Your Life) niche:

- **Privacy Policy** — must disclose use of cookies/ads (Google AdSense + any analytics), and needs updating if EU traffic is expected (Google's EU consent policy may require a consent management banner).
- **Terms of Use.**
- **Disclaimer** — every calculator is an estimate, not financial/legal/tax advice; also linked from every individual tool page (§6.1).
- **About / Contact** — establishes a real entity behind the site, which helps both AdSense trust and Google's E-E-A-T signals for financial content.

These should exist **before** the first AdSense application, not be back-filled later.

---

## 11. Non-Functional Requirements

- **Performance:** static-first architecture, minimal JS per page, Core Web Vitals in "Good" range on mobile. This is a stated priority given the prior experience migrating growagardencalculators.online to static HTML/CSS/JS for exactly this reason.
- **Accessibility:** usable calculator inputs via keyboard, adequate color contrast, readable font sizes on mobile.
- **SEO technical baseline:** sitemap.xml kept current with every publish, robots.txt correctly configured, no duplicate/thin pages, structured data validated (Google Rich Results Test) before each tool ships.
- **Security:** no user data collected or stored (no accounts, no server-side processing), so attack surface is minimal by design — detailed further in `3-security-and-access.md`.
- **Maintainability:** consistent page template/component structure across all 194 tools so the tool-by-tool loop stays fast rather than getting slower as the library grows.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 194 similar-looking calculator pages read as "doorway pages" / thin content to Google or AdSense | §6.1's mandatory content structure per tool; unique worked examples and FAQ per tool, not templated filler |
| AdSense rejection due to insufficient content at time of application | Don't apply until a solid batch of tools are *fully* built per §7's definition of done |
| Calculation errors create liability or user distrust | QA step in §7's loop; visible disclaimer on every page (§6.1, §12) |
| Burnout / stalled progress trying to build too much at once | The one-tool-at-a-time loop is the core mitigation — small, always-shippable increments |
| Competitive niche, hard to rank initially | Prioritize highest-intent, most-searched tools first (defined in feature tickets backlog) so early wins compound via internal linking and topical authority |

---

## 13. Assumptions

- No backend/database is needed for v1 — all calculators are computable client-side from user input plus static reference data (e.g., current-year tax slabs) hardcoded/updated in the codebase.
- Currency: tools will generally default to the currency implied by the instrument (₹ for PPF/EPF/GST, $ for 401(k)/IRA/FAFSA) rather than forcing one currency site-wide — to be confirmed in Technical Architecture.
- Site language is English only for v1 (see §4).
- Design system, exact color palette, typography, and "look and feel" are intentionally **not** covered in this PRD — per your instruction, that's a later "System Design" doc, after PRD → Technical Architecture → Security → Feature Tickets.

---

## 14. Open Questions

1. Final site name / domain — pending Hostinger purchase.
2. Exact ad placement density — to be finalized once the first few tools are live and real layouts exist to test against.
3. Whether a lightweight blog/guides section gets added later for extra AdSense inventory and backlink potential (explicitly out of scope for now, per §5.2).

---

## Appendix A: Master Tool List

Full list of all 194 tools with category and finalized URL slug already generated and delivered separately as `tool_slugs.csv` (16 categories, slugs in `/tools/<slug>/` format, ready to be turned into the priority-ordered backlog in `4-feature-tickets.md`).
