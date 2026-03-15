/**
 * Cloudflare Vectorize client
 * Handles embedding queries and retrieving relevant ISO document chunks.
 */

export interface VectorMatch {
  id: string
  score: number
  metadata?: {
    standard: string   // 'iso-27001' | 'iso-27002' | 'iso-42001'
    clause: string     // e.g. '6.1.2'
    text: string       // the actual chunk text
    page?: number
  }
}

/**
 * Search Vectorize for chunks relevant to the user query.
 * Returns top-k matches as formatted context string for the AI prompt.
 */
export async function searchISODocuments(
  query: string,
  vectorize: any, // Cloudflare Vectorize binding
  topK = 5
): Promise<string> {
  // TODO: generate embedding for the query
  // const embedding = await generateEmbedding(query)

  // TODO: query Vectorize index
  // const results = await vectorize.query(embedding, { topK, returnMetadata: true })

  // TODO: format results as context string
  // return formatChunks(results.matches)

  return '[Vectorize search stub — embedding pipeline coming soon]'
}

/**
 * Format vector matches into a readable context block for the AI prompt.
 */
export function formatChunks(matches: VectorMatch[]): string {
  return matches
    .map(
      (m, i) =>
        `[${i + 1}] ${m.metadata?.standard?.toUpperCase()} — ${m.metadata?.clause}\n${m.metadata?.text}`
    )
    .join('\n\n')
}
