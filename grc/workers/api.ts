/**
 * Cloudflare Worker — GRC API
 * Handles server-side requests with access to D1 and Vectorize bindings.
 */

export interface Env {
  DB: any                  // D1 database binding
  VECTORIZE: any           // Vectorize index binding
  PERPLEXITY_API_KEY: string
  AUTH_SECRET: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://app.monti.app',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Route: health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders })
    }

    // TODO: add route handlers for /api/controls, /api/risks, /api/policies, /api/ai
    // These will be wired to D1 and Vectorize once the database is provisioned

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
  },
}
