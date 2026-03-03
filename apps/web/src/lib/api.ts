function normalizeUrl(url: string): string {
  const cleaned = url.replace(/^[\s\u200B\u200C\u200D\uFEFF\u00A0]+/, '').replace(/[\s\u200B\u200C\u200D\uFEFF\u00A0]+$/, '').replace(/\/+$/, '');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
}

const IS_LOCAL = process.env.LOCAL_DEV === 'true' || process.env.NEXT_PUBLIC_LOCAL_DEV === 'true';

function getApiUrl(): string {
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (raw) return normalizeUrl(raw);
  if (IS_LOCAL) return 'http://localhost:8000';
  throw new Error(
    'API_URL is not set. Set API_URL in your environment variables. ' +
    'For local development, set LOCAL_DEV=true.'
  );
}

const API_URL = getApiUrl();

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error: ${res.status}`);
  }

  return res.json();
}

export async function apiAuthFetch<T = unknown>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
