# FinTool Beta Deployment Checklist & Runbook

**Deployment Target**: Cloudflare Pages / Static CDN  
**Framework**: Astro 4.x (Static Mode)  
**Build Command**: `npm run build` (`astro check && astro build`)  
**Output Directory**: `dist/`  
**Node.js Version**: `18.x` or `20.x`  
**Date Generated**: August 6, 2026

---

## 1. Pre-Deployment Configuration Audit

The following configuration assets have been implemented and verified in the repository:

- [x] **`robots.txt`** (`public/robots.txt`): Permissive crawler directives (`Allow: /`) and explicit sitemap declaration pointing to `https://fintool.org/sitemap-index.xml`.
- [x] **`sitemap.xml`** (`@astrojs/sitemap`): Automatically generates `sitemap-index.xml` and `sitemap-0.xml` during production build (`npm run build`).
- [x] **`site.webmanifest`** (`public/site.webmanifest`): PWA Web App Manifest configured with `display: standalone`, `theme_color: #0052ff`, and maskable SVG icon links.
- [x] **Favicons & PWA Icons**: `public/favicon.svg` registered in `<head>` via `BaseLayout.astro`.
- [x] **Open Graph Social Image**: `public/og-default.svg` created and linked dynamically as fallback in `BaseLayout.astro` (`og:image` and `twitter:image`).
- [x] **Canonical URLs**: Built dynamically per page via `BaseLayout.astro` using `canonicalUrl || Astro.url.href`.
- [x] **Environment Variables**: `.env.example` created specifying `PUBLIC_SITE_URL=https://fintool.org`.
- [x] **Security & Caching Headers** (`public/_headers`):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`
  - `/*.html`: `Cache-Control: public, max-age=0, must-revalidate`

---

## 2. Required Cloudflare Pages Deployment Steps

### Step 1: Connect Git Repository
1. Log into **Cloudflare Dashboard** $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Select repository: `Tools Website/FinTool`.

### Step 2: Build Settings Configuration
- **Framework Preset**: `Astro`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Root Directory**: `/` (Leave empty or set to root)
- **Environment Variables**:
  - `NODE_VERSION`: `20.11.0`
  - `PUBLIC_SITE_URL`: `https://fintool.org`

### Step 3: Custom Domain & SSL/TLS Setup
1. In Cloudflare Pages project settings, click **Custom Domains** $\rightarrow$ **Set up a custom domain**.
2. Enter: `fintool.org` (and `www.fintool.org`).
3. Ensure SSL/TLS encryption mode is set to **Full (strict)** in Cloudflare SSL settings.
4. Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.

---

## 3. Optional Performance & Security Optimizations

- [ ] **Brotli Compression**: Enable in Cloudflare Speed settings $\rightarrow$ Optimization $\rightarrow$ Brotli (Active by default).
- [ ] **Early Hints**: Enable Cloudflare Early Hints (`Link: </_astro/...>; rel=preload`) to accelerate HTTP/103 asset preloading.
- [ ] **Cloudflare Web Analytics**: (Optional) Enable privacy-first, cookie-less Cloudflare Web Analytics (no PII tracking).
- [ ] **Cloudflare Crawl Delay / Bot Management**: Configure Bot Fight Mode to block malicious scrapers while permitting search engines (Googlebot, Bingbot).

---

## 4. Post-Deployment Verification Checklist

Run these manual and automated checks immediately following deployment:

- [ ] **SSL & Domain Check**: Verify `https://fintool.org/` resolves cleanly with valid SSL certificate.
- [ ] **100% Client-Side Privacy Audit**: Open browser Developer Tools $\rightarrow$ Network tab $\rightarrow$ perform calculations on `emi-calculator`, `income-tax-calculator`, and `401k-calculator`. Verify **0 outbound HTTP POST/GET requests** containing financial input numbers.
- [ ] **Security Headers Audit**: Test target domain on [securityheaders.com](https://securityheaders.com) to confirm `A+` grade (HSTS, CSP, X-Frame-Options, Referrer-Policy).
- [ ] **Sitemap Verification**: Access `https://fintool.org/sitemap-index.xml` and verify all 43 pages (28 tools + 4 category pages + 9 governance pages) are indexed.
- [ ] **Robots.txt Inspection**: Access `https://fintool.org/robots.txt` and confirm valid sitemap URL declaration.
- [ ] **Open Graph Preview**: Test homepage and tool pages on [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and Twitter Card Validator to confirm preview cards render title, description, and `og-default.svg`.
- [ ] **Custom 404 Verification**: Access `https://fintool.org/random-non-existent-page` and confirm standard 404 page renders cleanly with search links and HTTP 404 status.
- [ ] **Google Search Console**: Submit `https://fintool.org/sitemap-index.xml` to Google Search Console for automated indexing.
