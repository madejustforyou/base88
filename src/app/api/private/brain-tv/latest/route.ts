import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { request as httpsRequest } from 'node:https';
import { validateAuthoritativeTV } from '@/lib/brain-tv/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function respond(value: Record<string, unknown>, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

async function fetchMutualTLS(url: URL, cert: string, key: string, ca: string): Promise<{ status: number; data: unknown }> {
  return await new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method: 'GET',
      cert, key, ca,
      rejectUnauthorized: true,
      timeout: 7000,
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    }, response => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > 512 * 1024) {
          request.destroy(new Error('TV_BODY_TOO_LARGE'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        try { resolve({ status: response.statusCode ?? 502, data: JSON.parse(Buffer.concat(chunks).toString('utf8')) }); }
        catch { reject(new Error('TV_RESPONSE_NOT_JSON')); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('TV_REQUEST_TIMEOUT')));
    request.on('error', reject);
    request.end();
  });
}

export async function GET(req: NextRequest) {
  const bearer = req.headers.get('authorization') ?? '';
  if (!/^Bearer [A-Za-z0-9._~-]+$/.test(bearer)) return respond({ ok: false, state: 'UNAUTHORIZED' }, 401);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ownerIds = (process.env.BRAIN_TV_OWNER_IDS ?? '').split(',').map(x => x.trim()).filter(Boolean);
  if (!supabaseUrl || !supabaseAnon || ownerIds.length === 0)
    return respond({ ok: false, state: 'UNCONFIGURED', error: 'OWNER_AUTH_NOT_COMMISSIONED' }, 503);

  try {
    const auth = createClient(supabaseUrl, supabaseAnon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await auth.auth.getUser(bearer.slice(7));
    if (error || !data?.user) return respond({ ok: false, state: 'UNAUTHORIZED' }, 401);
    if (!ownerIds.includes(data.user.id)) return respond({ ok: false, state: 'FORBIDDEN' }, 403);
  } catch { return respond({ ok: false, state: 'UNAUTHORIZED' }, 401); }

  const rawUrl = process.env.BRAIN_TV_HUB_MTLS_URL;
  const cert = process.env.BRAIN_TV_CLIENT_CERT_PEM;
  const key = process.env.BRAIN_TV_CLIENT_KEY_PEM;
  const ca = process.env.BRAIN_TV_TRUSTED_CA_PEM;
  if (!rawUrl || !cert || !key || !ca)
    return respond({ ok: false, state: 'UNCONFIGURED', error: 'PRIVATE_HQ_BRIDGE_NOT_COMMISSIONED' }, 503);

  let url: URL;
  try {
    url = new URL(rawUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search || url.pathname !== '/tv')
      return respond({ ok: false, state: 'UNCONFIGURED', error: 'INVALID_PRIVATE_TV_ENDPOINT' }, 503);
  } catch { return respond({ ok: false, state: 'UNCONFIGURED', error: 'INVALID_PRIVATE_TV_ENDPOINT' }, 503); }

  try {
    const upstream = await fetchMutualTLS(url, cert, key, ca);
    if (upstream.status !== 200)
      return respond({ ok: false, state: 'OFFLINE', error: upstream.status === 503 ? 'UPSTREAM_TV_REJECTED_OR_STALE' : 'UPSTREAM_ERROR', upstream_http: upstream.status }, 503);
    const checked = validateAuthoritativeTV(upstream.data, Date.now() / 1000);
    return respond({ ...checked, fetched_at: new Date().toISOString(), notice: 'Read-only source data; not a trade authorization' }, checked.ok ? 200 : 503);
  } catch {
    return respond({ ok: false, state: 'OFFLINE', error: 'PRIVATE_HQ_TRANSPORT_FAILED' }, 503);
  }
}