import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { api, clearToken, getToken, postJson, setToken } from '../services/api';

type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string, role: string) => Promise<void>; logout: () => void; };
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const token = getToken(); if (!token) { setLoading(false); return; } api<{user: User}>('/auth/me').then(r => setUser(r.user)).catch(() => clearToken()).finally(() => setLoading(false)); }, []);
  const value = useMemo(() => ({ user, loading, login: async (email: string, password: string, role: string) => { const result = await postJson<{token: string; user: User}>('/auth/login', { email, password, role }); setToken(result.token); setUser(result.user); }, logout: () => { clearToken(); setUser(null); } }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be inside AuthProvider'); return value; }
export function ProtectedRoute({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const navigate = useNavigate(); useEffect(() => { if (!loading && !user) navigate('/login'); }, [loading, user, navigate]); if (loading || !user) return <div className="boot-screen"><div className="brand-mark">E</div><span>Loading EduRisk AI…</span></div>; return <>{children}</>; }
