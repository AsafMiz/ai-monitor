import { NextResponse } from 'next/server';

interface ServiceCheck {
  name: string;
  status: 'ok' | 'error' | 'unconfigured';
  latency?: number;
  message?: string;
}

async function checkSupabase(): Promise<ServiceCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { name: 'Supabase', status: 'unconfigured', message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      return { name: 'Supabase', status: 'ok', latency };
    }
    return { name: 'Supabase', status: 'error', latency, message: `HTTP ${res.status}` };
  } catch (e) {
    return { name: 'Supabase', status: 'error', latency: Date.now() - start, message: (e as Error).message };
  }
}

async function checkSupabaseAuth(): Promise<ServiceCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { name: 'Supabase Auth', status: 'unconfigured', message: 'NEXT_PUBLIC_SUPABASE_URL not set' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      return { name: 'Supabase Auth', status: 'ok', latency };
    }
    return { name: 'Supabase Auth', status: 'error', latency, message: `HTTP ${res.status}` };
  } catch (e) {
    return { name: 'Supabase Auth', status: 'error', latency: Date.now() - start, message: (e as Error).message };
  }
}

async function checkRailwayApi(): Promise<ServiceCheck> {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    return { name: 'FastAPI (Railway)', status: 'unconfigured', message: 'API_URL not set' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      return { name: 'FastAPI (Railway)', status: 'ok', latency, message: `v${data.version || '?'}` };
    }
    return { name: 'FastAPI (Railway)', status: 'error', latency, message: `HTTP ${res.status}` };
  } catch (e) {
    return { name: 'FastAPI (Railway)', status: 'error', latency: Date.now() - start, message: (e as Error).message };
  }
}

function checkStripe(): ServiceCheck {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secret && !publishable) {
    return { name: 'Stripe', status: 'unconfigured', message: 'STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set' };
  }

  const missing: string[] = [];
  if (!secret) missing.push('STRIPE_SECRET_KEY');
  if (!webhook) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!publishable) missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (!priceId) missing.push('STRIPE_PRICE_ID');

  if (missing.length > 0) {
    return { name: 'Stripe', status: 'error', message: `Missing: ${missing.join(', ')}` };
  }

  return { name: 'Stripe', status: 'ok', message: secret?.startsWith('sk_live_') ? 'Live mode' : 'Test mode' };
}

function checkOpenAI(): ServiceCheck {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { name: 'OpenAI', status: 'unconfigured', message: 'OPENAI_API_KEY not set (checked on Railway)' };
  }
  return { name: 'OpenAI', status: 'ok' };
}

export async function GET() {
  const checks = await Promise.all([
    checkSupabase(),
    checkSupabaseAuth(),
    checkRailwayApi(),
    Promise.resolve(checkStripe()),
    Promise.resolve(checkOpenAI()),
  ]);

  const overall = checks.every((c) => c.status === 'ok')
    ? 'healthy'
    : checks.some((c) => c.status === 'error')
      ? 'degraded'
      : 'partial';

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    services: checks,
  });
}
