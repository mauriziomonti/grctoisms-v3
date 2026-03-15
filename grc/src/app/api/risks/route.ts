import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * GET /api/risks
 * Returns all risks from the risk register.
 */
export async function GET() {
  // TODO: query D1 for risks
  return NextResponse.json({ message: 'Risk register endpoint stub — D1 integration coming soon' })
}

/**
 * POST /api/risks
 * Create or update a risk entry.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  // TODO: insert/update risk in D1
  return NextResponse.json({ message: 'Risk create/update stub', body })
}
