/**
 * Perplexity API client — GDPR Scout
 * All answers are grounded exclusively in GDPR document chunks from Vectorize.
 * The model is strictly prohibited from using general knowledge.
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

const GDPR_SYSTEM_PROMPT = `You are a GDPR compliance assistant.

STRICT RULES:
1. Answer ONLY using the GDPR document excerpts provided in the context below.
2. Do NOT use general knowledge or your training data under any circumstances.
3. Cite the specific GDPR Article number in every response (e.g. "Article 5(1)(a)", "Article 13(1)(c)").
4. If the answer is not found in the provided context, respond exactly: "This information is not available in the provided GDPR documentation."
5. Never speculate, infer, or expand beyond what the document excerpts explicitly state.
6. Structure your answer clearly: state the rule, cite the article, then explain its practical implication as written in the text.`

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GdprAiResponse {
  answer: string
  sources: GdprSource[]
}

export interface GdprSource {
  articleNumber: string
  articleTitle: string
  excerpt: string
  score: number
}

export async function queryGdprPerplexity(
  userQuery: string,
  gdprContext: string,
  sources: GdprSource[],
  apiKey: string
): Promise<GdprAiResponse> {
  const messages: PerplexityMessage[] = [
    { role: 'system', content: GDPR_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `GDPR DOCUMENT CONTEXT:\n\n${gdprContext}\n\n---\n\nQUESTION: ${userQuery}`,
    },
  ]

  const res = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages,
      temperature: 0.1,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Perplexity API error ${res.status}: ${errText}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }

  return {
    answer: data.choices[0].message.content,
    sources,
  }
}
