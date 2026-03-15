import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * GET /api/controls?standard=27001&clause=5.1
 * Returns controls from the structured ISO data layer.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const standard = searchParams.get('standard') // '27001' | '42001'
  const clause = searchParams.get('clause')

  // TODO: query D1 database for controls
  // const controls = await getControls({ standard, clause })

  return NextResponse.json({
    message: 'Controls endpoint stub — D1 integration coming soon',
    standard,
    clause,
  })
}

/**
 * POST /api/controls
 * Update control status (RAG, owner, evidence).
 */
export async function POST(req: NextRequest) {
  const body = await req.json()

  // TODO: update control in D1
  // await updateControl(body)

  return NextResponse.json({ message: 'Control update stub', body })
}
