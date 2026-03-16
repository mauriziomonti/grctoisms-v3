/**
 * POST /api/ai
 * The core GDPR AI query endpoint.
 *
 * Flow:
 * 1. Receive { question: string } in request body
 * 2. Embed the question via Workers AI (@cf/baai/bge-base-en-v1.5)
 * 3. Search Vectorize index "gdpr-documents" for top-5 relevant chunks
 * 4. Build a grounded prompt and call Perplexity
 * 5. Return { answer, sources } — never fabricated content
 *
 * Bindings required (set in Cloudflare Pages dashboard + wrangler.toml):
 *   AI          — Workers AI
 *   VECTORIZE   — Vectorize index "gdpr-documents"
 *   PERPLEXITY_API_KEY — environment variable (secret)
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchGdprVectorize, formatGdprContext, GdprChunk } from '@/lib/ai/vectorize'
import { queryGdprPerplexity, GdprSource } from '@/lib/ai/perplexity'

export const runtime = 'edge'

// Cloudflare edge env type
interface CloudflareEnv {
  AI: {
    run: (model: string, input: { text: string }) => Promise<{ data: number[][] }>
  }
  VECTORIZE: {
    query: (
      vector: number[],
      options: { topK: number; returnMetadata: 'all' | boolean }
    ) => Promise<{ matches: Array<{ id: string; score: number; metadata?: Record<string, string | number> }> }>
  }
  PERPLEXITY_API_KEY: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string }
    const question = body.question?.trim()

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      )
    }

    // Cloudflare injects bindings via the request context
    // @ts-expect-error — Cloudflare Pages edge env
    const env = process.env as unknown as CloudflareEnv

    // Guard: check required bindings exist
    if (!env.AI || !env.VECTORIZE) {
      return NextResponse.json(
        { error: 'Required Cloudflare bindings (AI, VECTORIZE) are not configured.' },
        { status: 503 }
      )
    }

    const apiKey = env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PERPLEXITY_API_KEY environment variable is not set.' },
        { status: 503 }
      )
    }

    // 1. Search Vectorize for the most relevant GDPR chunks
    const chunks: GdprChunk[] = await searchGdprVectorize(question, env, 5)

    if (chunks.length === 0) {
      return NextResponse.json({
        answer:
          'No relevant GDPR documentation was found for your question. Please try rephrasing.',
        sources: [],
      })
    }

    // 2. Format chunks into grounded context
    const gdprContext = formatGdprContext(chunks)

    // 3. Map to source objects for the response
    const sources: GdprSource[] = chunks.map((c) => ({
      articleNumber: c.articleNumber,
      articleTitle: c.articleTitle,
      excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? '…' : ''),
      score: Math.round(c.score * 1000) / 1000,
    }))

    // 4. Call Perplexity with grounded context
    const result = await queryGdprPerplexity(question, gdprContext, sources, apiKey)

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/ai] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/ai — health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'GDPR AI query',
    description: 'POST { question } to query GDPR documentation via Vectorize + Perplexity',
  })
}
