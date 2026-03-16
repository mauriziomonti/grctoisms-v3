import { NextRequest, NextResponse } from 'next/server'

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

    // In next-on-pages with Next.js 14, process.env contains Cloudflare bindings
    const env = process.env as unknown as {
      AI?: { run: (model: string, input: { text: string }) => Promise<{ data: number[][] }> }
      VECTORIZE?: {
        query: (vec: number[], opts: { topK: number; returnMetadata: string }) => Promise<{
          matches: Array<{ score: number; metadata?: Record<string, string> }>
        }>
      }
      PERPLEXITY_API_KEY?: string
    }

    const apiKey = env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 503 })
    }

    type Chunk = { articleNumber: string; articleTitle: string; text: string; score: number }
    const chunks: Chunk[] = []

    if (env.AI && env.VECTORIZE) {
      try {
        const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
        const results = await env.VECTORIZE.query(embedding.data[0], { topK: 5, returnMetadata: 'all' })
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
      } catch (e) {
        console.error('Vectorize error:', e)
      }
    }

    const gdprContext = chunks.length > 0
      ? chunks.map((c, i) => `[${i + 1}] ${c.articleNumber}${c.articleTitle ? ` — ${c.articleTitle}` : ''}\n${c.text}`).join('\n\n')
      : 'No specific document context retrieved.'

    const res = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
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

    if (!res.ok) throw new Error(`Perplexity error ${res.status}: ${await res.text()}`)
    const data = await res.json() as { choices: Array<{ message: { content: string } }> }

    return NextResponse.json({
      answer: data.choices[0].message.content,
      sources: chunks.map(c => ({
        articleNumber: c.articleNumber,
        articleTitle: c.articleTitle,
        excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? '…' : ''),
        score: Math.round(c.score * 1000) / 1000,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/ai]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
