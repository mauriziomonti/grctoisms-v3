-- GDPR Scout — Cloudflare D1 Schema
-- Run via: wrangler d1 execute gdpr-scout-db --remote --file=gdpr-scout/src/lib/db/schema.sql

-- ── GDPR Article Assessment ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id          TEXT PRIMARY KEY,
  article     TEXT NOT NULL,             -- e.g. 'Art. 13'
  title       TEXT NOT NULL,             -- e.g. 'Information to be provided'
  status      TEXT DEFAULT 'not-started', -- 'not-started' | 'in-progress' | 'compliant' | 'not-applicable'
  owner       TEXT,
  evidence    TEXT,
  notes       TEXT,
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ── Record of Processing Activities (ROPA) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ropa (
  id                  TEXT PRIMARY KEY,
  activity_name       TEXT NOT NULL,
  purpose             TEXT,
  legal_basis         TEXT,              -- e.g. 'Consent' | 'Legitimate interest' | 'Contract'
  data_categories     TEXT,              -- JSON array of data types
  data_subjects       TEXT,              -- e.g. 'Employees' | 'Customers'
  recipients          TEXT,              -- Third parties receiving data
  retention_period    TEXT,
  third_country       TEXT,              -- Transfers outside EEA
  safeguards          TEXT,
  owner               TEXT,
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);

-- ── Breach Register ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS breaches (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT,
  date_discovered     TEXT,
  date_occurred       TEXT,
  data_affected       TEXT,
  subjects_affected   INTEGER,
  severity            TEXT,              -- 'low' | 'medium' | 'high'
  notified_authority  INTEGER DEFAULT 0, -- boolean
  notified_subjects   INTEGER DEFAULT 0, -- boolean
  status              TEXT DEFAULT 'open', -- 'open' | 'investigating' | 'closed'
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);

-- ── Audit Log ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL,
  changed_by  TEXT,
  changed_at  TEXT DEFAULT (datetime('now')),
  diff        TEXT
);
