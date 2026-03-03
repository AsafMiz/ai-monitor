'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ServiceCheck {
  name: string;
  status: 'ok' | 'error' | 'unconfigured';
  latency?: number;
  message?: string;
  description: string;
  hint?: string;
  icon: string;
}

interface StatusResponse {
  status: 'healthy' | 'degraded' | 'partial';
  timestamp: string;
  services: ServiceCheck[];
}

function PulseRing({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  );
}

function ServiceIcon({ icon, status }: { icon: string; status: string }) {
  const color = status === 'ok' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-amber-400';
  const bg = status === 'ok' ? 'bg-emerald-500/10' : status === 'error' ? 'bg-red-500/10' : 'bg-amber-500/10';

  const icons: Record<string, JSX.Element> = {
    database: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7c0 1.657-3.582 3-8 3S4 8.657 4 7m16 0c0-1.657-3.582-3-8-3S4 5.343 4 7m16 0v10c0 1.657-3.582 3-8 3s-8-1.343-8-3V7m16 5c0 1.657-3.582 3-8 3s-8-1.343-8-3" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    server: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
    'credit-card': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    brain: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  };

  return (
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
      {icons[icon] || icons.server}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-3 w-48 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceCheck }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = service.status !== 'ok' && (service.hint || service.message);

  const statusColors = {
    ok: 'border-emerald-500/20 bg-emerald-500/[0.03]',
    error: 'border-red-500/20 bg-red-500/[0.03]',
    unconfigured: 'border-amber-500/20 bg-amber-500/[0.03]',
  };

  const badgeStyles = {
    ok: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    error: 'bg-red-500/10 text-red-400 ring-red-500/20',
    unconfigured: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  };

  const badgeLabels = {
    ok: 'Operational',
    error: 'Error',
    unconfigured: 'Not Configured',
  };

  return (
    <div
      className={`rounded-2xl border ${statusColors[service.status]} backdrop-blur-sm transition-all duration-300 ${hasDetails ? 'cursor-pointer hover:border-white/10' : ''}`}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <ServiceIcon icon={service.icon} status={service.status} />
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-semibold text-white">{service.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${badgeStyles[service.status]}`}>
                  {badgeLabels[service.status]}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{service.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {service.latency != null && (
              <span className="text-xs text-white/30 font-mono tabular-nums">{service.latency}ms</span>
            )}
            {service.message && service.status === 'ok' && (
              <span className="text-xs text-white/30">{service.message}</span>
            )}
            {hasDetails && (
              <svg className={`w-4 h-4 text-white/20 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-14 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
            {service.message && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] uppercase tracking-wider text-white/25 font-medium shrink-0 mt-0.5 w-12">Error</span>
                <p className="text-xs text-red-400/90 font-mono">{service.message}</p>
              </div>
            )}
            {service.hint && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] uppercase tracking-wider text-white/25 font-medium shrink-0 mt-0.5 w-12">Fix</span>
                <p className="text-xs text-white/50 leading-relaxed">{service.hint}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OverallBanner({ status, loading, counts }: { status?: StatusResponse['status']; loading: boolean; counts: { ok: number; error: number; unconfigured: number } }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex items-center gap-5">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin" />
        <div>
          <h2 className="text-lg font-semibold text-white/80">Running diagnostics...</h2>
          <p className="text-sm text-white/30 mt-0.5">Testing connectivity to all services</p>
        </div>
      </div>
    );
  }

  const config = {
    healthy: { border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5', accent: 'text-emerald-400', sub: 'text-emerald-400/60', label: 'All Systems Operational', pulse: 'bg-emerald-500' },
    degraded: { border: 'border-red-500/20', glow: 'shadow-red-500/5', accent: 'text-red-400', sub: 'text-red-400/60', label: 'Service Issues Detected', pulse: 'bg-red-500' },
    partial: { border: 'border-amber-500/20', glow: 'shadow-amber-500/5', accent: 'text-amber-400', sub: 'text-amber-400/60', label: 'Partially Configured', pulse: 'bg-amber-500' },
  };

  const c = config[status || 'degraded'];

  return (
    <div className={`rounded-2xl border ${c.border} bg-white/[0.02] p-8 shadow-lg ${c.glow}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PulseRing color={c.pulse} />
          <div>
            <h2 className={`text-lg font-semibold ${c.accent}`}>{c.label}</h2>
            <p className={`text-sm ${c.sub} mt-0.5`}>
              {counts.ok} connected{counts.error > 0 ? ` \u00b7 ${counts.error} error${counts.error > 1 ? 's' : ''}` : ''}{counts.unconfigured > 0 ? ` \u00b7 ${counts.unconfigured} pending setup` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_COUNT = 5;

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: StatusResponse = await res.json();
      setData(json);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const counts = data
    ? {
        ok: data.services.filter((s) => s.status === 'ok').length,
        error: data.services.filter((s) => s.status === 'error').length,
        unconfigured: data.services.filter((s) => s.status === 'unconfigured').length,
      }
    : { ok: 0, error: 0, unconfigured: 0 };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/30">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      {/* Top gradient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative">
        <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <nav className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[11px] font-bold">
                AI
              </div>
              <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                AI Monitor
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30 font-mono uppercase tracking-widest">System Status</span>
            </div>
          </nav>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Service Status</h1>
              <p className="text-sm text-white/30 mt-1">Real-time connectivity checks for all platform services.</p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.07] hover:text-white/70 disabled:opacity-40 transition-all duration-200"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            <OverallBanner status={data?.status} loading={loading} counts={counts} />

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-400">Failed to fetch status</p>
                    <p className="text-xs text-red-400/60 mt-1 font-mono">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {loading && !data
                ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => <LoadingCard key={i} />)
                : data?.services.map((service) => (
                    <ServiceCard key={service.name} service={service} />
                  ))}
            </div>

            {lastChecked && (
              <p className="text-[11px] text-white/20 text-center pt-6 font-mono tracking-wide">
                Last checked at {lastChecked}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
