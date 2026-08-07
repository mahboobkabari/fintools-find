# Platform V3 Framework Engineering Guide

**Version**: 3.0.0  

---

## 1. Core Architecture Principles

1. **Declarative Definitions**: Calculators are configured via pure JS objects using `defineCalculator()`.
2. **Decoupled Math Engines**: Math calculators in `src/calculators/` contain 0 DOM or UI dependencies.
3. **Orchestrated Intelligence**: Financial Intelligence Layer automatically computes decisions, scores, warnings, and opportunities.
4. **Automatic Schema & SEO**: Canonical URLs, OpenGraph, Twitter Cards, and JSON-LD schemas (`WebApplication`, `BreadcrumbList`, `FAQPage`) are generated at build time.
5. **Static Performance**: Pre-rendered to 100% static HTML via Astro SSG with zero server runtime lag.
