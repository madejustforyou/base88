export type BrainTVFreshness = {
  ok: boolean;
  state: 'FRESH' | 'STALE' | 'INVALID';
  error?: string;
  age_s?: number;
  view_id?: string;
  served_house?: string;
  view?: Record<string, unknown>;
};

const SENSITIVE = /(?:password|passphrase|secret|private[_-]?key|api[_-]?key|access[_-]?token|authorization|cookie|credential|webhook[_-]?secret|session[_-]?key)/i;

export function stripSecrets(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[DEPTH_LIMIT]';
  if (Array.isArray(value)) return value.slice(0, 250).map(x => stripSecrets(x, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value).slice(0, 500)) {
      if (!SENSITIVE.test(k)) out[k] = stripSecrets(v, depth + 1);
    }
    return out;
  }
  return typeof value === 'string' ? value.slice(0, 12000) : value;
}

export function validateAuthoritativeTV(input: unknown, nowSeconds: number): BrainTVFreshness {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, state: 'INVALID', error: 'NOT_AN_OBJECT' };
  const v = input as Record<string, unknown>;
  const rawTime = v.generated_ts;
  const generated = typeof rawTime === 'number' ? rawTime : (typeof rawTime === 'string' && rawTime.trim() !== '' ? Number(rawTime) : NaN);
  if (!Number.isFinite(generated) || generated <= 0) return { ok: false, state: 'INVALID', error: 'MISSING_OR_INVALID_GENERATED_TS' };
  if (generated > nowSeconds + 5) return { ok: false, state: 'INVALID', error: 'FUTURE_GENERATED_TS' };
  const age = nowSeconds - generated;
  const viewId = typeof v.view_id === 'string' && v.view_id.trim() ? v.view_id.slice(0, 150) : undefined;
  if (!viewId) return { ok: false, state: 'INVALID', error: 'MISSING_VIEW_ID' };
  const house = typeof v.served_house === 'string' ? v.served_house : typeof v.house === 'string' ? v.house : '';
  if (house !== 'WH' && house !== 'BH') return { ok: false, state: 'INVALID', error: 'UNKNOWN_SOURCE_HOUSE' };
  const base = { age_s: Math.round(Math.max(age, 0) * 10) / 10, view_id: viewId, served_house: house };
  if (age > 120) return { ok: false, state: 'STALE', error: 'STALE_VIEW_REJECTED', ...base };
  return { ok: true, state: 'FRESH', ...base, view: stripSecrets(v) as Record<string, unknown> };
}