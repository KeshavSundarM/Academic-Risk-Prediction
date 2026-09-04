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
  const response = await Promise.race([fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } }), new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('The API is taking too long to respond. Check that the server is running.')), 12000))]);
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) clearToken();
  if (!response.ok) {
    if (response.status === 404 && API === '/api') throw new Error('The API is not deployed with this frontend. Deploy from the repository root or set VITE_API_URL to your Express API.');
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body as T;
}
export const postJson = <T>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const putJson = <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const deleteJson = <T>(path: string) => api<T>(path, { method: 'DELETE' });
