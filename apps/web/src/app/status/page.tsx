'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ServiceCheck {
  name: string;
  status: 'ok' | 'error' | 'unconfigured';
  latency?: number;
  message?: string;
}

interface StatusResponse {
  status: 'healthy' | 'degraded' | 'partial';
  timestamp: string;
  services: ServiceCheck[];
}

function StatusIcon({ status }: { status: ServiceCheck['status'] | 'loading' }) {
  if (status === 'loading') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
    );
  }
  if (status === 'ok') {
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'error') {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
    </svg>
  );
}

function StatusBadge({ status }: { status: ServiceCheck['status'] | 'loading' }) {
  const styles = {
    loading: 'bg-gray-100 text-gray-600',
    ok: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
    unconfigured: 'bg-yellow-50 text-yellow-700',
  };
  const labels = {
    loading: 'Checking...',
    ok: 'Connected',
    error: 'Error',
    unconfigured: 'Not configured',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function OverallBanner({ status, loading }: { status?: StatusResponse['status']; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 flex items-center gap-4">
        <div className="w-8 h-8 rounded-full border-3 border-gray-300 border-t-blue-500 animate-spin" />
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Checking services...</h2>
          <p className="text-sm text-gray-500">Testing connectivity to all services</p>
        </div>
      </div>
    );
  }

  const config = {
    healthy: { bg: 'bg-green-50 border-green-200', color: 'text-green-800', sub: 'text-green-600', label: 'All systems operational', desc: 'Every service is connected and responding.' },
    degraded: { bg: 'bg-red-50 border-red-200', color: 'text-red-800', sub: 'text-red-600', label: 'Service issues detected', desc: 'One or more services are not responding.' },
    partial: { bg: 'bg-yellow-50 border-yellow-200', color: 'text-yellow-800', sub: 'text-yellow-600', label: 'Partially configured', desc: 'Some services still need to be set up.' },
  };

  const c = config[status || 'degraded'];

  return (
    <div className={`rounded-xl border ${c.bg} p-6`}>
      <h2 className={`text-lg font-semibold ${c.color}`}>{c.label}</h2>
      <p className={`text-sm ${c.sub} mt-1`}>{c.desc}</p>
    </div>
  );
}

function ServiceCard({ service, loading }: { service?: ServiceCheck; loading: boolean }) {
  const status = loading ? 'loading' : (service?.status || 'loading');
  const name = service?.name || '';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-start justify-between gap-4 transition-all hover:shadow-sm">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5">
          <StatusIcon status={status} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
            <StatusBadge status={status} />
          </div>
          {service?.message && (
            <p className="text-xs text-gray-500 mt-1 truncate">{service.message}</p>
          )}
        </div>
      </div>
      {service?.latency != null && (
        <span className="text-xs text-gray-400 whitespace-nowrap font-mono">{service.latency}ms</span>
      )}
    </div>
  );
}

const PLACEHOLDER_SERVICES = ['Supabase', 'Supabase Auth', 'FastAPI (Railway)', 'Stripe', 'OpenAI'];

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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <nav className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            AI Monitor
          </Link>
          <span className="text-sm font-medium text-gray-500">System Status</span>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Service Status</h1>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          <OverallBanner status={data?.status} loading={loading} />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to fetch status: {error}
            </div>
          )}

          <div className="space-y-3">
            {loading && !data
              ? PLACEHOLDER_SERVICES.map((name) => (
                  <ServiceCard key={name} service={{ name, status: 'ok' }} loading={true} />
                ))
              : data?.services.map((service) => (
                  <ServiceCard key={service.name} service={service} loading={false} />
                ))}
          </div>

          {lastChecked && (
            <p className="text-xs text-gray-400 text-center pt-4">
              Last checked at {lastChecked}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
