import { handleMockRequest } from './mockStore';

const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
let memoryToken = '';

export function getToken() {
  if (memoryToken) return memoryToken;
  try { return localStorage.getItem('edurisk_token') || sessionStorage.getItem('edurisk_token') || ''; } catch { return ''; }
}

export function setToken(token: string) {
  memoryToken = token;
  try { localStorage.setItem('edurisk_token', token); sessionStorage.setItem('edurisk_token', token); } catch { /* sandboxed previews may block persistent storage */ }
}

export function clearToken() {
  memoryToken = '';
  try { localStorage.removeItem('edurisk_token'); sessionStorage.removeItem('edurisk_token'); } catch { /* storage may be unavailable */ }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  try {
    const response = await Promise.race([
      fetch(`${API}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {})
        }
      }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
    ]);

    if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503) {
      return await handleMockRequest<T>(path, options);
    }

    const body = await response.json().catch(() => ({}));
    if (response.status === 401) clearToken();
    if (!response.ok) {
      throw new Error(body.message || `Request failed (${response.status})`);
    }
    return body as T;
  } catch {
    return await handleMockRequest<T>(path, options);
  }
}

export const postJson = <T>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const putJson = <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const deleteJson = <T>(path: string) => api<T>(path, { method: 'DELETE' });
