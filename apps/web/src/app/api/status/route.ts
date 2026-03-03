import { NextResponse } from 'next/server';

interface ServiceCheck {
  name: string;
  status: 'ok' | 'error' | 'unconfigured';
  latency?: number;
  message?: string;
  description: string;
  hint?: string;
  icon: string;
}

async function checkSupabase(): Promise<ServiceCheck> {
  const base = { name: 'Supabase Database', icon: 'database', description: 'PostgreSQL database with pgvector, Row Level Security, and real-time subscriptions.' };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ...base, status: 'unconfigured', message: 'Environment variables not set', hint: 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) return { ...base, status: 'ok', latency };
    return { ...base, status: 'error', latency, message: `Responded with HTTP ${res.status}`, hint: 'Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is correct and the project is not paused.' };
  } catch (e) {
    return { ...base, status: 'error', latency: Date.now() - start, message: (e as Error).message, hint: 'The Supabase project may be paused or the URL is incorrect.' };
  }
}

async function checkSupabaseAuth(): Promise<ServiceCheck> {
  const base = { name: 'Supabase Auth', icon: 'shield', description: 'User authentication with email/password, OAuth providers, and JWT token management.' };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ...base, status: 'unconfigured', message: 'Environment variables not set', hint: 'Requires NEXT_PUBLIC_SUPABASE_URL to be configured.' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) return { ...base, status: 'ok', latency };
    return { ...base, status: 'error', latency, message: `Auth service returned HTTP ${res.status}`, hint: 'Verify the Supabase project has Auth enabled and the anon key is valid.' };
  } catch (e) {
    return { ...base, status: 'error', latency: Date.now() - start, message: (e as Error).message, hint: 'Auth endpoint is unreachable. Check the Supabase project status.' };
  }
}

async function checkRailwayApi(): Promise<ServiceCheck> {
  const base = { name: 'FastAPI Backend', icon: 'server', description: 'Python API server handling agent CRUD, workspace management, and Stripe billing logic.' };
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    return { ...base, status: 'unconfigured', message: 'API_URL not set', hint: 'Deploy the API to Railway, then set API_URL in Vercel to your Railway public URL.' };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      return { ...base, status: 'ok', latency, message: `v${data.version || '0.1.0'}` };
    }
    return { ...base, status: 'error', latency, message: `Health check returned HTTP ${res.status}`, hint: 'The API is deployed but returning errors. Check Railway logs for details.' };
  } catch (e) {
    return { ...base, status: 'error', latency: Date.now() - start, message: (e as Error).message, hint: 'Cannot reach the API. Verify the Railway deployment is running and the URL is correct.' };
  }
}

function checkStripe(): ServiceCheck {
  const base = { name: 'Stripe Billing', icon: 'credit-card', description: 'Subscription management with $100/mo Pro plan, webhook event processing, and customer portal.' };
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secret && !publishable) {
    return { ...base, status: 'unconfigured', message: 'Stripe keys not configured', hint: 'Go to Stripe Dashboard > Developers > API keys and copy your keys into Vercel env vars.' };
  }

  const missing: string[] = [];
  if (!secret) missing.push('STRIPE_SECRET_KEY');
  if (!webhook) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!publishable) missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (!priceId) missing.push('STRIPE_PRICE_ID');

  if (missing.length > 0) {
    return { ...base, status: 'error', message: `Missing ${missing.length} key${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`, hint: 'Add the missing keys in Vercel > Project > Settings > Environment Variables.' };
  }

  const mode = secret?.startsWith('sk_live_') ? 'Live' : 'Sandbox';
  return { ...base, status: 'ok', message: `${mode} mode` };
}

function checkOpenAI(): ServiceCheck {
  const base = { name: 'OpenAI', icon: 'brain', description: 'GPT-4o-mini language model powering agent reasoning, conversation, and task execution.' };
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { ...base, status: 'unconfigured', message: 'API key not set', hint: 'Set OPENAI_API_KEY on Railway. Get a key at platform.openai.com > API keys.' };
  }
  return { ...base, status: 'ok', message: 'Key configured' };
}

export const dynamic = 'force-dynamic';

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
