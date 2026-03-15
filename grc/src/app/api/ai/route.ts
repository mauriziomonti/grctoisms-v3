import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/ai
 * Accepts a user query, retrieves relevant ISO document chunks from Vectorize,
 * and returns a grounded response from the Perplexity API.
 */
export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  // TODO: Step 1 — retrieve relevant chunks from Cloudflare Vectorize
  // const chunks = await searchVectorize(query)

  // TODO: Step 2 — call Perplexity API with chunks as grounding context
  // const response = await queryPerplexity(query, chunks)

  return NextResponse.json({
    message: 'AI endpoint stub — Vectorize + Perplexity integration coming soon',
    query,
  })
}
