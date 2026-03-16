/**
 * Vectorize search helper — GDPR Scout
 * Embeds the user query using Workers AI (@cf/baai/bge-base-en-v1.5)
 * then searches the gdpr-documents Vectorize index.
 */

export interface VectorizeMatch {
  id: string
  score: number
  metadata?: {
    articleNumber?: string
    articleTitle?: string
    text?: string
    chunkIndex?: number
  }
}

export interface GdprChunk {
  articleNumber: string
  articleTitle: string
  text: string
  score: number
}

/**
 * Search Vectorize for the top-k most relevant GDPR chunks.
 * env.AI    — Workers AI binding (for embeddings)
 * env.VECTORIZE — Vectorize binding
 */
export async function searchGdprVectorize(
  query: string,
  env: {
    AI: {
      run: (model: string, input: { text: string }) => Promise<{ data: number[][] }>
    }
    VECTORIZE: {
      query: (vector: number[], options: {
        topK: number
        returnMetadata: 'all' | boolean
        returnValues?: boolean
      }) => Promise<{ matches: VectorizeMatch[] }>
    }
  },
  topK = 5
): Promise<GdprChunk[]> {
  // 1. Embed the user query with the same model used during ingestion
  const embeddingResult = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: query,
  })

  const queryVector = embeddingResult.data[0]

  // 2. Query Vectorize
  const results = await env.VECTORIZE.query(queryVector, {
    topK,
    returnMetadata: 'all',
  })

  // 3. Map matches to typed chunks
  return results.matches
    .filter((m) => m.metadata?.text)
    .map((m) => ({
      articleNumber: m.metadata?.articleNumber ?? 'Unknown',
      articleTitle: m.metadata?.articleTitle ?? '',
      text: m.metadata?.text ?? '',
      score: m.score,
    }))
}

/**
 * Format Vectorize chunks into a context string for the LLM prompt.
 */
export function formatGdprContext(chunks: GdprChunk[]): string {
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.articleNumber}${c.articleTitle ? ` — ${c.articleTitle}` : ''}\n${c.text}`
    )
    .join('\n\n')
}
