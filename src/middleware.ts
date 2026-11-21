import { NextRequest, NextResponse } from 'next/server'
import { stagingIsIsolated } from './lib/staging-isolation'

/**
 * Production Supabase variables are currently inherited by this Vercel preview.
 * Block the entire authenticated data surface until a distinct staging project
 * has been explicitly configured. This check runs before business API routes.
 */
export function middleware(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview' || stagingIsIsolated())
    return NextResponse.next()

  const path = request.nextUrl.pathname
  if (path.startsWith('/api/')) {
    return NextResponse.json(
      {error:'Base88 private preview features are disabled until staging is isolated.'},
      {status:503, headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}}
    )
  }
  // Do not let the preview sign customers into a shared production Supabase
  // project or render a business dashboard using a production session.
  const destination = request.nextUrl.clone()
  destination.pathname = '/preview-staging-required'
  destination.search = ''
  return NextResponse.rewrite(destination,{status:503})
}

export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
    '/dashboard',
    '/business-drafts/:path*',
    '/agents/:path*',
  ],
}
