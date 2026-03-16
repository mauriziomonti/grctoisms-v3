/**
 * POST /api/ai
 * GDPR AI query endpoint — Vectorize + Perplexity
 * Bindings accessed via getRequestContext() inside handler only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

const GDPR_SYSTEM_PROMPT = `You are a GDPR compliance assistant.

STRICT RULES:
1. Answer ONLY using the GDPR document excerpts provided in the context below.
2. Do NOT use general knowledge or your training data under any circumstances.
3. Cite the specific GDPR Article number in every response (e.g. "Article 5(1)(a)", "Article 13(1)(c)").
4. If the answer is not found in the provided context, respond exactly: "This information is not available in the provided GDPR documentation."
5. Never speculate, infer, or expand beyond what the document excerpts explicitly state.`

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'GDPR AI query' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string }
    const question = body.question?.trim()

    if (!question) {
      return NextResponse.json({ error: 'Missing required field: question' }, { status: 400 })
    }

    // getRequestContext() must be called inside the handler, not at module level
    const { env } = getRequestContext() as {
      env: {
        AI?: { run: (model: string, input: { text: string }) => Promise<{ data: number[][] }> }
        VECTORIZE?: {
          query: (vec: number[], opts: { topK: number; returnMetadata: string }) => Promise<{
            matches: Array<{ score: number; metadata?: Record<string, string> }>
          }>
        }
        PERPLEXITY_API_KEY?: string
      }
    }

    const apiKey = env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'PERPLEXITY_API_KEY is not configured.' }, { status: 503 })
    }

    // 1. Vectorize search (if bindings available)
    type Chunk = { articleNumber: string; articleTitle: string; text: string; score: number }
    const chunks: Chunk[] = []

    if (env.AI && env.VECTORIZE) {
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
      const queryVector = embedding.data[0]
      const results = await env.VECTORIZE.query(queryVector, { topK: 5, returnMetadata: 'all' })

      for (const m of results.matches) {
        if (m.metadata?.text) {
          chunks.push({
            articleNumber: m.metadata.articleNumber ?? 'Unknown',
            articleTitle: m.metadata.articleTitle ?? '',
            text: m.metadata.text,
            score: m.score,
          })
        }
      }
    }

    // 2. Build context
    const gdprContext = chunks.length > 0
      ? chunks.map((c, i) => `[${i + 1}] ${c.articleNumber}${c.articleTitle ? ` — ${c.articleTitle}` : ''}\n${c.text}`).join('\n\n')
      : 'No specific document context retrieved.'

    // 3. Call Perplexity
    const perplexityRes = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: GDPR_SYSTEM_PROMPT },
          { role: 'user', content: `GDPR DOCUMENT CONTEXT:\n\n${gdprContext}\n\n---\n\nQUESTION: ${question}` },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text()
      throw new Error(`Perplexity error ${perplexityRes.status}: ${errText}`)
    }

    const data = await perplexityRes.json() as { choices: Array<{ message: { content: string } }> }

    const sources = chunks.map((c) => ({
      articleNumber: c.articleNumber,
      articleTitle: c.articleTitle,
      excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? '…' : ''),
      score: Math.round(c.score * 1000) / 1000,
    }))

    return NextResponse.json({ answer: data.choices[0].message.content, sources })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/ai] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
