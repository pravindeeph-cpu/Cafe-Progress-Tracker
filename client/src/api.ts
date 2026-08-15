const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiList<T>(resource: string, query?: Record<string, string | number>): Promise<T[]> {
  const qs = query ? '?' + new URLSearchParams(query as Record<string, string>).toString() : '';
  return request<T[]>(`/${resource}${qs}`);
}

export function apiCreate<T>(resource: string, data: Partial<T>): Promise<T> {
  return request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) });
}

export function apiUpdate<T>(resource: string, id: number, data: Partial<T>): Promise<T> {
  return request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function apiDelete(resource: string, id: number): Promise<void> {
  return request<void>(`/${resource}/${id}`, { method: 'DELETE' });
}

export function getDashboard() {
  return request('/dashboard');
}

export function getFinancialSummary() {
  return request('/financial/summary');
}

export function getSettings() {
  return request('/settings');
}

export function updateSettings(data: Record<string, string | number>) {
  return request('/settings', { method: 'PUT', body: JSON.stringify(data) });
}

export function getGates() {
  return request('/gates');
}
