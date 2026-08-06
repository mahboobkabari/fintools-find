# Security & Access Document

**Project:** FinTool — Free Financial Calculator Hub
**Document version:** 1.0
**Depends on:** `1-PRD.md`, `2-technical-architecture.md`
**Precedes:** `4-feature-tickets.md`

---

## 1. Scope Note

This document is intentionally lighter than a typical SaaS security doc. Per the Technical Architecture: **no backend, no database, no user accounts, no authentication system, no server processing user data.** The entire site is pre-built static HTML/CSS/JS served from Cloudflare's edge. That single fact eliminates most of the usual attack surface (SQL injection, auth bypass, session hijacking, server-side data breaches all require a server holding data — there isn't one).

What actually matters for a project shaped like this is: **account security** (Cloudflare, GitHub, Hostinger, AdSense — a handful of solo-owned accounts that each hold real value and could cause real damage if compromised), **content integrity** (this is a YMYL financial site — a hijacked or subtly altered calculator is a trust and liability problem), and **third-party data/consent compliance** (AdSense collects data on your behalf, and that has real legal requirements).

---

## 2. Threat Model Summary

| Risk | Why it matters here | Severity |
|---|---|---|
| Cloudflare account compromised | Attacker could redirect the domain, inject malicious JS into every page, or take the site offline | High |
| GitHub account/repo compromised | Attacker could push malicious code that auto-deploys to production on the next build | High |
| Hostinger (registrar) account compromised | Attacker could change DNS/nameservers or transfer the domain away entirely | High |
| AdSense account compromised | Attacker could redirect ad revenue, or policy-violating changes could get the account banned | Medium |
| A calculator formula is wrong | Users get bad financial numbers; trust and legal exposure on a YMYL site | Medium |
| Third-party script (AdSense/analytics) misbehaves or is loaded insecurely | Could inject unwanted content or leak more data than intended | Low–Medium |
| Site defacement via XSS | Very low risk since there's no user-generated content or server rendering — all content is author-controlled Markdown | Low |

There is deliberately **no row here for "user data breach"** — because in the v1 architecture, no user data is ever collected or stored by this site's own systems.

---

## 3. Account & Access Security

Every account below is solo-owned. Treat each one as a single point of failure and protect it accordingly.

| Account | Holds / controls | Required protections |
|---|---|---|
| **Cloudflare** | DNS, the Worker serving the entire site, SSL/TLS, WAF settings | 2FA (authenticator app, not SMS), strong unique password, recovery codes stored securely offline |
| **GitHub** | Source code, deploy trigger (push to `main` = production deploy) | 2FA required, branch protection on `main` (see §4.2), no personal access tokens with unnecessarily broad scope |
| **Hostinger** | Domain registration | 2FA, registrar/transfer lock enabled, WHOIS privacy enabled |
| **Google AdSense** | Ad revenue, publisher reputation | 2FA on the underlying Google account, review AdSense policy center periodically for violations |
| **Google Search Console** | Indexing control, can affect how the site appears/whether it's indexed at all | 2FA on the underlying Google account |

**General rule:** every account here should use a password manager–generated unique password and app-based 2FA. Since this is a solo project, there's no team-access complexity to manage — but that also means there's no one else to notice if one of these accounts is compromised, so proactive protection matters more, not less.

---

## 4. Source Code & Deployment Security

### 4.1 Repository visibility

Either a public or private GitHub repo works technically (there are no secrets embedded in the static site — see §4.3). Recommendation: **private repo**, simply because there's no upside to publishing the source of a monetized site, and it avoids any temptation to accidentally commit something sensitive later without a second thought.

### 4.2 Branch protection

- Treat `main` as production: every push auto-deploys via Cloudflare (per Technical Architecture §12).
- Enable GitHub branch protection on `main`: require a pull request before merging (even solo, this creates a moment to catch mistakes), and disallow force-pushes to `main`.
- Do development on feature branches, use Cloudflare's automatic preview deployments (Technical Architecture §12) to visually check a change before merging.

### 4.3 Secrets management

The v1 architecture needs almost no secrets — there's no database password, no API key required for the site to function. The few identifiers that do exist (Google Search Console verification, an eventual AdSense publisher ID, an eventual GA4 measurement ID) are not truly secret — they're meant to be embedded in public page source — but should still be handled cleanly:

- If a Cloudflare API token is ever used locally (e.g., for manual `wrangler deploy`), scope it to the minimum required permission (Workers Scripts: Edit, for this project only) rather than using the Global API Key.
- Never commit any token/key to the repo, even a low-sensitivity one. If GitHub Actions or any automation is added later, use GitHub's encrypted repository Secrets, not hardcoded values.
- Keep a `.gitignore` covering `node_modules/`, any local `.env` file, and editor/OS cruft.

### 4.4 Dependency hygiene

- Commit `package-lock.json` so builds are reproducible.
- Run `npm audit` periodically (e.g., monthly, or whenever adding a new dependency) and address anything high/critical.
- Keep the dependency list small and deliberate — per the Technical Architecture's framework-free calculator approach, most tools shouldn't need new npm packages at all, which is itself a security benefit (smaller dependency surface = fewer things that can go wrong or get compromised upstream).

---

## 5. Domain & DNS Security

- **Registrar lock:** enable transfer lock at Hostinger so the domain can't be moved to another registrar without explicit unlock.
- **DNS delegation:** nameservers point from Hostinger to Cloudflare (per Technical Architecture §12) — this means Cloudflare, not Hostinger, is the practical control point for where traffic goes. Protecting the Cloudflare account (§3) is therefore just as important as protecting the registrar account.
- **DNSSEC:** enable it in Cloudflare once the domain is added — it's a free toggle and prevents a class of DNS-spoofing attacks.
- **Monitor DNS changes:** Cloudflare's dashboard shows a change log; check it periodically, since an unexpected DNS record is one of the first signs of account compromise.

---

## 6. Client-Side / Site Security

- **HTTPS:** enforced automatically by Cloudflare (universal SSL); confirm "Always Use HTTPS" and a strict minimum TLS version are set in the Cloudflare dashboard.
- **Security headers:** Cloudflare Workers with Static Assets supports a `_headers` file (placed in the static output directory, e.g. `public/_headers`, so it ships with every build) to set response headers without writing any Worker code. Recommended baseline:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

- **Content-Security-Policy:** worth adding once the exact set of third-party script domains is finalized (Google AdSense, Cloudflare Web Analytics, and GA4 if added later) — a CSP is easy to write too strictly and break ads/analytics by accident, so build it *after* those integrations are in place and test thoroughly rather than guessing the policy up front.
- **XSS surface:** effectively minimal in v1 — every piece of content on the site comes from author-written Markdown in the repo (Technical Architecture §5), not from user input rendered back to other users. This changes the moment any user-input feature is added (contact form, comments, search) — see §8.

---

## 7. Third-Party Scripts, Data Collection & Consent

This is the one area where "no backend" doesn't mean "no compliance obligations" — because AdSense and analytics collect data *on the visitor's device*, regardless of whether this site's own servers store anything.

- **Cloudflare Web Analytics** (Technical Architecture §11): cookieless, doesn't require consent under GDPR/ePrivacy — this is exactly why it was chosen as the default.
- **Google AdSense:** sets cookies and may use them for ad personalization. Google's **EU User Consent Policy** requires publishers to obtain consent from EEA/UK visitors before using cookies for ads, even if the site isn't specifically targeted at EU users — any EU visitor triggers the requirement. Practical approach: implement **Google Funding Choices** (a free, Google-provided consent management tool built specifically for AdSense publishers) once AdSense is live, rather than building a custom consent banner.
- **Google Analytics 4** (if added later per Technical Architecture §11): would need Consent Mode v2 configured alongside the same consent banner — this is one reason GA4 was deferred rather than included in v1.
- **Privacy Policy accuracy:** the Privacy Policy required for AdSense approval (PRD §12) must actually describe what's collected: Cloudflare Web Analytics (cookieless usage stats) and Google AdSense (cookies, possible ad personalization, link to Google's own privacy practices). Keep this updated any time an analytics/ads integration changes — an inaccurate privacy policy is itself an AdSense policy risk.

---

## 8. The One Likely Exception: Contact Form

The PRD's information architecture includes a `/contact/` page. A traditional contact form needs *something* to receive the submission — which is the one place "zero backend" may need a small, deliberate exception. Options, cheapest/simplest first:

1. **`mailto:` link** — zero infrastructure, zero spam-filtering needed on your end, but slightly worse UX (opens the visitor's email client).
2. **Third-party form backend** (e.g., a free-tier hosted form-submission service) — visitor fills a normal HTML form, submission is POSTed to the third party, which emails it to you. No code on your side beyond the form's `action` attribute. Pair with **Cloudflare Turnstile** (free CAPTCHA alternative) to cut spam.
3. **A single-purpose Cloudflare Worker function**, only for this one form — the smallest possible amount of "real backend" if you want submissions to flow fully through infrastructure you control.

Recommendation for v1: **option 1 or 2** — avoid writing and maintaining custom backend code for what is a low-traffic, non-critical page. This decision doesn't need to be made now; flag it as a feature ticket when the Contact page is actually built.

---

## 9. Data Privacy Summary

What this site does **not** do in v1, stated plainly (useful both for your own clarity and as source material for the Privacy Policy):

- No accounts, no login, no passwords stored.
- No calculator inputs are ever sent to or stored on any server — every calculation happens entirely in the visitor's browser and is discarded when they close the tab.
- No first-party database of any kind.
- The only data collected is: (a) cookieless aggregate analytics via Cloudflare, and (b) whatever Google AdSense/GA4 collect directly for ad delivery and personalization, per §7 — none of which this site's own infrastructure ever touches or stores.

---

## 10. Backup & Recovery

This architecture gets backup and rollback almost for free:

- **Code/content:** the entire site — every tool's content, every calculator's logic — is version-controlled in Git. Any previous state is recoverable with `git revert` or a checkout of an earlier commit.
- **Deployments:** Cloudflare keeps a history of deployments; a bad deploy can be rolled back to the previous version directly from the dashboard, independent of also reverting the git history.
- **No database to back up** — because there isn't one. This is a direct, deliberate benefit of the static, no-backend architecture.

---

## 11. Incident Response (lightweight)

| Scenario | Response |
|---|---|
| A calculator is found to have a wrong formula | Fix the calculator module, add/correct the Vitest test that should have caught it (Technical Architecture §6.1), redeploy, update `updatedDate` on the affected tool's content file |
| Cloudflare/GitHub/Hostinger account shows unrecognized activity | Immediately rotate the password, revoke active sessions/tokens, re-enable/verify 2FA, check DNS records and recent deploys for tampering |
| Site is defaced or serving unexpected content | Roll back to the last known-good Cloudflare deployment (§10) immediately, then investigate how it happened (likely a compromised GitHub or Cloudflare account, or a bad merge) |
| AdSense account flagged/suspended | Review the AdSense policy center for the specific reason, fix the underlying issue (often ad placement or content policy related), file an appeal through Google's process |

---

## 12. Security Checklist

**One-time setup (before or shortly after first deploy):**
- [ ] 2FA enabled on Cloudflare, GitHub, Hostinger, and the Google account used for AdSense/Search Console
- [ ] Registrar transfer lock + WHOIS privacy enabled at Hostinger
- [ ] DNSSEC enabled in Cloudflare
- [ ] GitHub repo set to private, branch protection enabled on `main`
- [ ] `_headers` file with the baseline security headers (§6) committed
- [ ] `package-lock.json` committed

**Ongoing (light-touch, not per-tool):**
- [ ] `npm audit` checked periodically
- [ ] DNS change log glanced at occasionally
- [ ] Privacy Policy re-checked any time an analytics/ads integration is added or changed
- [ ] AdSense policy center checked occasionally once monetized

---

## 13. Open Questions

1. Which contact-form approach (§8) to use — deferred to when that page is actually built.
2. Whether/when to layer GA4 + Consent Mode v2 on top of Cloudflare Web Analytics — deferred until there's a concrete need for deeper behavioral data (Technical Architecture §11).
3. Exact CSP policy — deferred until AdSense and any additional third-party scripts are actually integrated, so the policy is written against reality rather than guessed in advance.
