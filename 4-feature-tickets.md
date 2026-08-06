# Feature Tickets — Calculator Directory
**Doc 4 of 4 (Foundation Docs)** · Companion to `1-PRD.md`, `2-technical-architecture.md`, `3-security-and-access.md`

> ⚠️ **Heads-up before we start:** is naye session mein mere paas aapka purana `tool_slugs.csv` (194 tools ki poori list) file mein nahi hai — sirf category-wise counts hain jo humne pehle discuss kiye the. Maine neeche **poora ticket system + prioritization framework** bana diya hai, aur **Batch 1 (pehle 12 tools) ke fully-written tickets** bhi de diye hain jo PRD ke §7 loop follow karte hain — inse aap turant start kar sakte ho.
>
> Baaki 182 tools ke tickets ek hi format follow karenge (template niche hai). Agar aap `tool_slugs.csv` ya category list yahan paste/upload kar do, toh main sabhi 194 ka pura ticket backlog ek exact, ready-to-paste table mein bana dunga — abhi guess karke likhna galat hoga.

---

## 1. Purpose of this document

PRD §7 ka rule tha: **ek tool = fully shipped before next tool** (calculator + content + SEO + internal linking). Ye document us rule ko **execution-level tickets** mein todta hai, taaki Antigravity/Gemini agent ko har baar ek clear, self-contained checklist di ja sake — copy-paste karke "is ticket ko complete karo" bol sakte ho.

Each ticket = one tool = one PR = one deploy.

---

## 2. Ticket template (use this for every one of the 194 tools)

```markdown
### TICKET-### · [Tool Name]

**Slug:** /calculators/[category]/[tool-slug]
**Category:** [category name]
**Priority:** P0 / P1 / P2
**Status:** ☐ Not started · ☐ In progress · ☐ In review · ☐ Shipped

---

#### A. Calculator logic
- [ ] Formula confirmed (write it out, cite standard source e.g. RBI/IRS formula if applicable)
- [ ] Inputs defined (field name, type, min/max, default, currency-aware?)
- [ ] Outputs defined (primary result + breakdown, e.g. table/chart)
- [ ] Edge cases handled (zero, negative, max values, div-by-zero)
- [ ] Vitest: 1 verified example (known correct answer) passes

#### B. Content (per PRD §6.1 structure)
- [ ] Introduction (100–150 words, what it is / who it's for)
- [ ] Kaise use karein (numbered steps)
- [ ] Features (bullet list)
- [ ] Benefits (bullet list)
- [ ] Formula explained in plain language
- [ ] FAQs (min 5, schema-ready)
- [ ] Disclaimer (not financial advice)

#### C. SEO (same PR, not later)
- [ ] Primary keyword decided + title tag (<60 chars)
- [ ] Meta description (<155 chars)
- [ ] H1 = tool name, H2s = content sections above
- [ ] Schema.org: WebApplication + FAQPage JSON-LD
- [ ] OG image / social preview
- [ ] URL added to sitemap.xml (auto via Astro content collection)

#### D. Internal linking
- [ ] "Related tools" block: min 3 links to live tools (same category first, then adjacent)
- [ ] Add this tool as a "related tool" on 2–3 already-shipped pages it's relevant to

#### E. Ship checklist
- [ ] Astro build passes locally
- [ ] Lighthouse: Performance/SEO/Accessibility all ≥ 90
- [ ] Pushed to GitHub → Cloudflare Workers auto-deploy verified live
- [ ] Google Search Console: URL inspected + indexing requested
```

---

## 3. Prioritization framework

Har tool ko P0/P1/P2 mila hai in factors se:

| Factor | Weight | Logic |
|---|---|---|
| Search volume (India + global) | High | EMI/SIP-type "everyone searches this" tools first |
| Build complexity | Medium | Simple formula tools first — momentum aur quick wins matter jab solo build ho |
| AdSense-friendliness | Medium | High-intent financial tools tend to get better RPM |
| Internal-linking value | Low-Medium | Tools that many other tools can link to (hub tools) go earlier |

- **P0** — Build first 20–25 tools. Highest search volume + simplest builds. These also become your **hub pages** that most "related tools" blocks will point back to.
- **P1** — Next ~80 tools. Broadens category coverage, still solid volume.
- **P2** — Remaining ~90 tools. Long-tail, niche, or higher-complexity (multi-variable) tools — better once site has domain authority.

---

## 4. Batch 1 — Fully written tickets (start here)

These 12 are picked as P0: highest search intent + simplest formulas + strong hub potential (Loan & Investment categories, jo aapke original list mein sabse pehle the).

### TICKET-001 · EMI Calculator
**Slug:** /calculators/loans/emi-calculator · **Category:** Loan & EMI · **Priority:** P0
- Formula: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`
- Inputs: Loan amount, interest rate (%/yr), tenure (yrs/months toggle)
- Output: EMI, total interest, total payment, amortization chart
- Related tools (once live): Loan Amortization Calculator, Home Loan Calculator, Personal Loan Calculator

### TICKET-002 · SIP Calculator
**Slug:** /calculators/investment/sip-calculator · **Category:** Investment · **Priority:** P0
- Formula: `FV = P × [((1+i)^n − 1) / i] × (1+i)`
- Inputs: Monthly investment, expected return %, tenure (yrs)
- Output: Maturity value, invested amount, est. returns (pie chart)
- Related tools: Lumpsum Calculator, Step-up SIP Calculator, SWP Calculator

### TICKET-003 · Home Loan / Mortgage Calculator
**Slug:** /calculators/loans/home-loan-calculator · **Priority:** P0
- Same core as EMI but with property-tax/insurance add-on fields (US-style) or processing-fee field (India-style) — confirm target market before building
- Related tools: EMI Calculator, Loan Eligibility, Refinance Calculator

### TICKET-004 · Lumpsum Investment Calculator
**Slug:** /calculators/investment/lumpsum-calculator · **Priority:** P0
- Formula: `FV = P × (1+r)^n`
- Related tools: SIP Calculator, Step-up SIP Calculator

### TICKET-005 · Personal Loan Calculator
**Slug:** /calculators/loans/personal-loan-calculator · **Priority:** P0
- Same amortization engine as EMI, reusable calc module (per Technical Architecture §"shared calc utils")
- Related tools: EMI Calculator, Loan Eligibility Calculator

### TICKET-006 · Loan Amortization Calculator
**Slug:** /calculators/loans/loan-amortization-calculator · **Priority:** P0
- Output: full month-by-month table (principal vs interest split), downloadable
- Related tools: EMI Calculator, Prepayment Calculator

### TICKET-007 · SWP Calculator (Systematic Withdrawal Plan)
**Slug:** /calculators/investment/swp-calculator · **Priority:** P0
- Reverse of SIP: corpus depletes with periodic withdrawal + growth
- Related tools: SIP Calculator, Retirement Corpus Calculator

### TICKET-008 · Car Loan Calculator
**Slug:** /calculators/loans/car-loan-calculator · **Priority:** P0
- Same amortization engine + optional down-payment/trade-in field
- Related tools: EMI Calculator, Personal Loan Calculator

### TICKET-009 · Loan Eligibility Calculator
**Slug:** /calculators/loans/loan-eligibility-calculator · **Priority:** P0
- Formula basis: FOIR (Fixed Obligation to Income Ratio) — inputs: income, existing EMIs, tenure, rate
- Related tools: EMI Calculator, Home Loan Calculator

### TICKET-010 · Step-up SIP Calculator
**Slug:** /calculators/investment/step-up-sip-calculator · **Priority:** P0
- SIP with annual % increase in contribution — needs a loop/iterative calc (flag for dev: not a closed-form formula)
- Related tools: SIP Calculator, Lumpsum Calculator

### TICKET-011 · Loan Prepayment Calculator
**Slug:** /calculators/loans/loan-prepayment-calculator · **Priority:** P0
- Output: interest saved + tenure reduced, compares "with prepayment" vs "without"
- Related tools: Loan Amortization Calculator, EMI Calculator

### TICKET-012 · Education Loan Calculator
**Slug:** /calculators/loans/education-loan-calculator · **Priority:** P0
- Same amortization engine + optional "moratorium period" field (interest-only phase during study years)
- Related tools: EMI Calculator, Personal Loan Calculator

---

## 5. Batch 2+ — how they'll be generated

Jab aap tool_slugs.csv (ya category list) de doge, main:
1. Har row ko upar wale template mein map karunga
2. P0/P1/P2 assign karunga §3 ke framework se
3. Ek single master table bana dunga: `Ticket# | Tool | Slug | Category | Priority | Depends-on/Related`
4. "Batch" groups bana dunga (batch of ~10) taaki aap PRD ke tool-by-tool loop follow karte hue systematically kaam kar sako

Batch 1 ke 12 tools abhi bhi valid hain — wahi order rakhna chahenge chahe CSV kuch aur bhi ho, kyunki ye highest-search-volume + hub tools hain.

---

## 6. Definition of Done (applies to every ticket)

A ticket is only "Shipped" when **all** of these are true — matches PRD §7's non-negotiable rule:
1. Calculator works correctly (test passes)
2. Full content block is live (not "TODO" placeholders)
3. SEO metadata + schema present
4. Internal links both ways (to and from) are live
5. Deployed and indexed (or index requested)

Agla tool tabhi start hoga jab current ticket in 5 points pe green ho — ye PRD ka core discipline hai, isko yahan bhi enforce kar diya hai.
