# monti.app — GRC Platform

AI-powered Governance, Risk & Compliance platform built on ISO 27001, ISO 42001, and GDPR.

**Live:** [monti.app](https://monti.app)

---

## Architecture

```
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
| GRC app | Next.js 15 + TypeScript → Cloudflare Pages |
| GDPR Scout | Next.js 15 + TypeScript → Cloudflare Pages |
| Database | Cloudflare D1 (SQLite at edge) |
| Vector search | Cloudflare Vectorize |
| AI | Perplexity API (grounded on ISO/GDPR source documents) |
| Source control | GitHub (private repo) |
| Domain | monti.app (Cloudflare DNS) |

---

## Modules

### Your GRC (`app.monti.app`)
ISO 27001:2022 and ISO 42001:2023 compliance workspace.

- Controls tracker (93 Annex A controls + ISO 42001)
- Risk register
- Policy library
- AI-assisted gap analysis (grounded in ISO source documents)

**D1 Database:** `grc-db`
**Vectorize Index:** `iso-documents` (1536 dimensions)

### GDPR Scout (`gdpr-scout.monti.app`)
GDPR compliance assessment and data mapping workspace.

- Gap assessment (99 GDPR articles)
- Record of Processing Activities (ROPA)
- Breach register
- AI assistant (grounded in GDPR EU 2016/679)

**D1 Database:** `gdpr-scout-db`
**Vectorize Index:** `gdpr-documents` (768 dimensions, `@cf/baai/bge-base-en-v1.5`)

---

## Build & Deploy

### Prerequisites

- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account with Workers paid plan (for D1 + Vectorize)
- Python 3.x (for Vectorize pipeline scripts)

### First-time setup

#### 1. Clone the repo
```bash
git clone https://github.com/mauriziomonti/grctoisms-v3.git
cd grctoisms-v3
```

#### 2. Authenticate Wrangler
```bash
wrangler login
```

#### 3. Fix npm global permissions (macOS)
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

### Landing pages (`monti.app`)

Deployed automatically by Cloudflare Pages on every push to `main`.
No build step required — pure HTML/CSS.

**Manual deploy:** Push to GitHub → Cloudflare Pages auto-deploys.

---

### GRC Module (`app.monti.app`)

#### First-time infrastructure setup

```bash
# Create D1 database
wrangler d1 create grc-db
# → Paste database_id into grc/wrangler.toml

# Run schema migration
wrangler d1 execute grc-db --remote --file=grc/src/lib/db/schema.sql

# Create Vectorize index
wrangler vectorize create iso-documents --dimensions=1536 --metric=cosine
```

#### Build and deploy

```bash
cd grc
npm install
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name grc-app --commit-dirty=true
```

#### Cloudflare dashboard settings (one-time)

1. **Workers & Pages → grc-app → Settings → Environment Variables**
   - `PERPLEXITY_API_KEY` (secret)
   - `AUTH_SECRET` (secret) — generate with `openssl rand -base64 32`

2. **Workers & Pages → grc-app → Settings → Functions → Compatibility Flags**
   - Add `nodejs_compat`

3. **Workers & Pages → grc-app → Custom Domains**
   - Add `app.monti.app`

4. **Workers & Pages → grc-app → Settings → Bindings**
   - D1 Database: `DB` → `grc-db`
   - Vectorize Index: `VECTORIZE` → `iso-documents`

#### ISO document pipeline (when PDFs available)

Upload ISO 27001, 27002, and 42001 PDFs to `grc/data/` (not committed — licensed content).
Run the embedding pipeline:
```bash
python3 grc/scripts/build-vectorize.py \
  --account-id YOUR_ACCOUNT_ID \
  --api-token YOUR_API_TOKEN \
  --index-name iso-documents
```

---

### GDPR Scout Module (`gdpr-scout.monti.app`)

#### First-time infrastructure setup

```bash
# Create D1 database
wrangler d1 create gdpr-scout-db
# → Paste database_id into gdpr-scout/wrangler.toml

# Run schema migration (from repo root)
wrangler d1 execute gdpr-scout-db --remote --file=gdpr-scout/src/lib/db/schema.sql

# Create Vectorize index
wrangler vectorize create gdpr-documents --dimensions=768 --metric=cosine
```

#### Build and deploy

```bash
cd gdpr-scout
npm install
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name gdpr-scout --commit-dirty=true
```

#### Cloudflare dashboard settings (one-time)

1. **Workers & Pages → gdpr-scout → Settings → Environment Variables**
   - `PERPLEXITY_API_KEY` (secret)
   - `AUTH_SECRET` (secret) — generate with `openssl rand -base64 32`

2. **Workers & Pages → gdpr-scout → Settings → Functions → Compatibility Flags**
   - Add `nodejs_compat`

3. **Workers & Pages → gdpr-scout → Custom Domains**
   - Add `gdpr-scout.monti.app`

4. **Workers & Pages → gdpr-scout → Settings → Bindings**
   - D1 Database: `DB` → `gdpr-scout-db`
   - Vectorize Index: `VECTORIZE` → `gdpr-documents`

#### GDPR document pipeline (one-time)

Fetches GDPR text from EUR-Lex (public law, no licence required), chunks by article, embeds, and uploads to Vectorize.

```bash
# From repo root
python3 -m venv venv
source venv/bin/activate
pip install requests

python3 gdpr-scout/scripts/build-vectorize.py \
  --account-id YOUR_ACCOUNT_ID \
  --api-token YOUR_API_TOKEN \
  --index-name gdpr-documents

deactivate
```

Required API token permissions:
- Account → Cloudflare Workers AI → Edit
- Account → Vectorize → Edit

---

## Ongoing deployment

For every code change:

```bash
# Landing pages — just push to GitHub, Cloudflare auto-deploys
git add . && git commit -m "your message" && git push

# GRC app
cd grc
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name grc-app --commit-dirty=true

# GDPR Scout
cd gdpr-scout
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name gdpr-scout --commit-dirty=true
```

> **TODO:** Set up GitHub Actions CI/CD to automate module deployments on push.

---

## Environment variables

Never commit secrets. Copy `.env.example` to `.env.local` in each module directory.

| Variable | Description |
|---|---|
| `PERPLEXITY_API_KEY` | Perplexity API key for AI queries |
| `AUTH_SECRET` | JWT signing secret (min 32 chars) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Workers AI + Vectorize) |

---

## Legal notes

- **ISO documents** (27001, 27002, 42001) are licensed content. PDFs must not be committed to the repo. Used internally as RAG source only.
- **GDPR text** is public EU law. Freely usable without licence restrictions.
- Structured data extracted from ISO documents must be authored in your own words. Raw ISO text is served at runtime via Vectorize only.

---

## Roadmap

- [ ] AI query endpoints (Vectorize + Perplexity integration)
- [ ] Tailwind CSS styling for GRC app and GDPR Scout
- [ ] GitHub Actions CI/CD pipeline
- [ ] ISO document Vectorize pipeline
- [ ] Authentication (login/user management)
- [ ] ISO structured data module (`grc/data/`)
- [ ] GDPR Scout — ROPA management UI
- [ ] GRC app — controls tracker UI
