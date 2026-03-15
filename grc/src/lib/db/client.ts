/**
 * Cloudflare D1 database client
 * Typed query helpers for controls, risks, and policies.
 */

export type ControlStatus = 'not-started' | 'in-progress' | 'compliant' | 'not-applicable'
export type RiskTreatment = 'accept' | 'mitigate' | 'transfer' | 'avoid'
export type PolicyStatus = 'draft' | 'approved' | 'retired'

export interface Control {
  id: string
  standard: string
  clause: string
  title: string
  status: ControlStatus
  owner?: string
  evidence?: string
  notes?: string
  updated_at: string
}

export interface Risk {
  id: string
  title: string
  description?: string
  asset?: string
  threat?: string
  vulnerability?: string
  likelihood: number
  impact: number
  risk_score: number
  treatment?: RiskTreatment
  owner?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Policy {
  id: string
  title: string
  version: string
  content?: string
  owner?: string
  status: PolicyStatus
  review_date?: string
  created_at: string
  updated_at: string
}

// ── Controls ──────────────────────────────────────────────────────────────────

export async function getControls(db: any, standard?: string): Promise<Control[]> {
  const query = standard
    ? `SELECT * FROM controls WHERE standard = ? ORDER BY clause`
    : `SELECT * FROM controls ORDER BY standard, clause`
  const result = standard
    ? await db.prepare(query).bind(standard).all()
    : await db.prepare(query).all()
  return result.results as Control[]
}

export async function updateControl(db: any, id: string, updates: Partial<Control>) {
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  const values = [...Object.values(updates), new Date().toISOString(), id]
  await db.prepare(`UPDATE controls SET ${fields}, updated_at = ? WHERE id = ?`).bind(...values).run()
}

// ── Risks ─────────────────────────────────────────────────────────────────────

export async function getRisks(db: any): Promise<Risk[]> {
  const result = await db.prepare(`SELECT * FROM risks ORDER BY risk_score DESC`).all()
  return result.results as Risk[]
}

export async function createRisk(db: any, risk: Omit<Risk, 'risk_score' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString()
  await db.prepare(`
    INSERT INTO risks (id, title, description, asset, threat, vulnerability, likelihood, impact, treatment, owner, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(risk.id, risk.title, risk.description, risk.asset, risk.threat, risk.vulnerability,
          risk.likelihood, risk.impact, risk.treatment, risk.owner, risk.status, now, now).run()
}

// ── Policies ──────────────────────────────────────────────────────────────────

export async function getPolicies(db: any): Promise<Policy[]> {
  const result = await db.prepare(`SELECT * FROM policies ORDER BY title`).all()
  return result.results as Policy[]
}
