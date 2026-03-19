AI-powered Governance, Risk & Compliance platform built on ISO 27001, ISO 42001, and GDPR.

**Live:** [grctoisms.com](https://grctoisms.com)

## Architecture

grctoisms-v3/
├── index.html              ← Landing page (monti.app)
├── about.html              ← About page
├── customers.html          ← Customers page
├── news.html               ← News page
├── app.html                ← Your GRC page
├── gdpr-scout.html         ← GDPR Scout page
├── styles.css              ← Shared CSS
├── grctoisms-logo.png      ← Logo
├── CNAME                   ← monti.app
├── grc/                    ← Your GRC module (app.monti.app)
└── gdpr-scout/             ← GDPR Scout module (gdpr-scout.monti.app)
```

### Stack

| Layer | Technology |
|---|---|
| Landing pages | HTML/CSS → Cloudflare Pages |
         -------------
         | GRC app | Next.js 15 + TypeScript → Cloudflare Pages |
         | GDPR Scout | Next.js 15 + TypeScript → Cloudflare Pages |
         | Database | Cloudflare D1 (SQLite at edge) |
         | Vector search | Cloudflare Vectorize |
         | AI | Perplexity API (grounded on ISO/GDPR source documents) |
         -------------
| Source control | GitHub (private repo) |
| Domain | grctoisms.com (Cloudflare DNS) |
