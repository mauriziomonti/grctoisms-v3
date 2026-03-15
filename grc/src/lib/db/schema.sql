-- GRC App — Cloudflare D1 Schema
-- Run via: wrangler d1 execute grc-db --file=src/lib/db/schema.sql

-- ── Controls ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS controls (
  id          TEXT PRIMARY KEY,          -- e.g. '27001-A.5.1'
  standard    TEXT NOT NULL,             -- 'ISO 27001' | 'ISO 42001'
  clause      TEXT NOT NULL,             -- e.g. 'A.5.1'
  title       TEXT NOT NULL,
  status      TEXT DEFAULT 'not-started', -- 'not-started' | 'in-progress' | 'compliant' | 'not-applicable'
  owner       TEXT,
  evidence    TEXT,
  notes       TEXT,
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ── Risk Register ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risks (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  asset         TEXT,
  threat        TEXT,
  vulnerability TEXT,
  likelihood    INTEGER CHECK(likelihood BETWEEN 1 AND 5),
  impact        INTEGER CHECK(impact BETWEEN 1 AND 5),
  risk_score    INTEGER GENERATED ALWAYS AS (likelihood * impact) VIRTUAL,
  treatment     TEXT,                    -- 'accept' | 'mitigate' | 'transfer' | 'avoid'
  owner         TEXT,
  status        TEXT DEFAULT 'open',     -- 'open' | 'in-treatment' | 'closed'
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- ── Policies ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS policies (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  version     TEXT NOT NULL DEFAULT '1.0',
  content     TEXT,
  owner       TEXT,
  status      TEXT DEFAULT 'draft',      -- 'draft' | 'approved' | 'retired'
  review_date TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ── Audit Log ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL,             -- 'create' | 'update' | 'delete'
  changed_by  TEXT,
  changed_at  TEXT DEFAULT (datetime('now')),
  diff        TEXT                       -- JSON diff of changes
);
