/**
 * Cloudflare Pages Function — /api/ai
 * Runs natively on the Cloudflare edge, no Next.js wrapper.
 * Bindings (AI, VECTORIZE, PERPLEXITY_API_KEY) injected directly by Cloudflare.
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

const GDPR_SYSTEM_PROMPT = `You are a GDPR compliance assistant.

STRICT RULES:
1. Answer ONLY using the GDPR document excerpts provided in the context below.
2. Do NOT use general knowledge or your training data under any circumstances.
3. Cite the specific GDPR Article number in every response (e.g. "Article 5(1)(a)", "Article 13(1)(c)").
4. If the answer is not found in the provided context, respond exactly: "This information is not available in the provided GDPR documentation."
5. Never speculate, infer, or expand beyond what the document excerpts explicitly state.`

export async function onRequestGet() {
  return Response.json({ status: 'ok', endpoint: 'GDPR AI query' })
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()
    const question = body?.question?.trim()

    if (!question) {
      return Response.json({ error: 'Missing required field: question' }, { status: 400 })
    }

    const apiKey = env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'PERPLEXITY_API_KEY is not configured.' }, { status: 503 })
    }

    // 1. Vectorize search
    const chunks = []
    if (env.AI && env.VECTORIZE) {
      try {
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
      } catch (err) {
        console.error('Vectorize error:', err)
      }
    }

    // 2. Build context
    const gdprContext = chunks.length > 0
      ? chunks.map((c, i) =>
          `[${i + 1}] ${c.articleNumber}${c.articleTitle ? ` — ${c.articleTitle}` : ''}\n${c.text}`
        ).join('\n\n')
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
          {
            role: 'user',
            content: `GDPR DOCUMENT CONTEXT:\n\n${gdprContext}\n\n---\n\nQUESTION: ${question}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text()
      throw new Error(`Perplexity error ${perplexityRes.status}: ${errText}`)
    }

    const data = await perplexityRes.json()
    const answer = data.choices[0].message.content

    const sources = chunks.map((c) => ({
      articleNumber: c.articleNumber,
      articleTitle: c.articleTitle,
      excerpt: c.text.slice(0, 300) + (c.text.length > 300 ? '…' : ''),
      score: Math.round(c.score * 1000) / 1000,
    }))

    return Response.json({ answer, sources })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/ai] Error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
