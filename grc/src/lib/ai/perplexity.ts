/**
 * Perplexity API client
 * All queries are grounded exclusively in ISO document chunks retrieved from Vectorize.
 * The model is instructed never to use general knowledge.
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

const SYSTEM_PROMPT = `You are a GRC compliance assistant specialising in ISO 27001:2022 and ISO 42001:2023.

STRICT RULES:
1. Answer ONLY using the document excerpts provided in the context below.
2. Do NOT use general knowledge or training data.
3. Cite the specific clause or control number in every response (e.g. "ISO 27001 clause 6.1.2" or "ISO 42001 control A.6.1").
4. If the answer is not found in the provided context, respond: "This information is not available in the provided ISO documentation."
5. Never speculate or infer beyond what the documents state.`

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function queryPerplexity(
  userQuery: string,
  isoContext: string,
  apiKey: string
): Promise<string> {
  const messages: PerplexityMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `ISO DOCUMENT CONTEXT:\n\n${isoContext}\n\n---\n\nQUESTION: ${userQuery}`,
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
      temperature: 0.1, // Low temperature for factual, grounded responses
    }),
  })

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
