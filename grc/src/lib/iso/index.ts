/**
 * ISO data interface
 * This is the contract the app uses to request control/clause information.
 * Currently backed by Cloudflare Vectorize (RAG).
 * Later: swap in or supplement with structured JSON from the /data module.
 */

export type ISOStandard = 'iso-27001' | 'iso-27002' | 'iso-42001'

export interface ISOControl {
  id: string           // e.g. 'A.5.1'
  standard: ISOStandard
  title: string
  description?: string // populated when data/ module is loaded
}

export interface ISOClause {
  id: string           // e.g. '6.1.2'
  standard: ISOStandard
  title: string
  description?: string
}

/**
 * Get a single control by ID and standard.
 * When the data/ module is populated, this returns structured data directly.
 * Until then, it returns a stub.
 */
export async function getControl(standard: ISOStandard, id: string): Promise<ISOControl | null> {
  // TODO: load from data/ module JSON when available
  // import controlsData from `../../../data/${standard}/controls.json`
  // return controlsData.find(c => c.id === id) ?? null
  return null
}

/**
 * Search controls by keyword.
 */
export async function searchControls(standard: ISOStandard, query: string): Promise<ISOControl[]> {
  // TODO: search structured data/ module
  return []
}

/**
 * Get a clause by ID.
 */
export async function getClause(standard: ISOStandard, clauseId: string): Promise<ISOClause | null> {
  // TODO: load from data/ module JSON when available
  return null
}
