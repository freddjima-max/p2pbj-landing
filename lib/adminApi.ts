const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://p2pbj-backend.onrender.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('p2pbj_admin_token');
}

export function clearToken() {
  localStorage.removeItem('p2pbj_admin_token');
  localStorage.removeItem('p2pbj_admin_user');
}

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('p2pbj_admin_token');
    localStorage.removeItem('p2pbj_admin_user');
    if (typeof window !== 'undefined') window.location.href = '/admin';
    throw new Error('Session expirée, veuillez vous reconnecter');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = <T = any>(path: string) => req<T>(path);
const post = <T = any>(path: string, body?: any) =>
  req<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const del  = <T = any>(path: string, body?: any) =>
  req<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined });
const patch = <T = any>(path: string, body?: any) =>
  req<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

// ── Auth ──────────────────────────────────────────────────────────────────────

export const sendOtp = (phone: string) =>
  post('/api/v1/auth/send-otp', { phone });

export const verifyOtp = async (phone: string, code: string) => {
  const data = await post<{ accessToken: string; refreshToken: string; user: any }>('/api/v1/auth/verify-otp', { phone, code });
  const token = data.accessToken;
  if (token)    localStorage.setItem('p2pbj_admin_token', token);
  if (data.user) localStorage.setItem('p2pbj_admin_user', JSON.stringify(data.user));
  return data;
};

export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem('p2pbj_admin_user');
  return s ? JSON.parse(s) : null;
};

// ── KPIs / Analytics ──────────────────────────────────────────────────────────

export const fetchKPIs      = () => get('/api/v1/admin/kpis');
export const fetchAnalytics = () => get('/api/v1/admin/analytics');

// ── KYC ──────────────────────────────────────────────────────────────────────

export const fetchPendingKyc = async () => {
  const d = await get<{ requests: any[] }>('/api/v1/kyc/pending');
  return d.requests ?? [];
};

export const reviewKyc = (userId: string, decision: 'approved' | 'rejected', rejectReason?: string) =>
  post(`/api/v1/kyc/review/${userId}`, { decision, rejectReason });

// ── Annonces review ───────────────────────────────────────────────────────────

export const fetchPendingReview = async () => {
  const d = await get<{ annonces: any[] }>('/api/v1/admin/pending-review');
  return d.annonces ?? [];
};

export const reviewAnnonce = (annonceId: string, action: 'approve' | 'reject', note?: string) =>
  post(`/api/v1/admin/pending-review/${annonceId}`, { action, note });

export const fetchModeration = async () => {
  const d = await get<{ annonces: any[] }>('/api/v1/admin/moderation');
  return d.annonces ?? [];
};

export const moderateAnnonce = (annonceId: string, action: string) =>
  post(`/api/v1/admin/moderation/${annonceId}`, { action });

// ── Finances / Escrow ─────────────────────────────────────────────────────────

export const fetchEscrows = async (status?: string) => {
  const q = status ? `?status=${status}` : '';
  const d = await get<{ escrows: any[] }>(`/api/v1/admin/escrows${q}`);
  return d.escrows ?? [];
};

export const releaseEscrow = (id: string) => post(`/api/v1/admin/escrows/${id}/release`);
export const refundEscrow  = (id: string) => post(`/api/v1/admin/escrows/${id}/refund`);

// ── Litiges ───────────────────────────────────────────────────────────────────

export const fetchReports = async (status?: string) => {
  const q = status ? `?status=${status}` : '';
  const d = await get<{ reports: any[] }>(`/api/v1/admin/reports${q}`);
  return d.reports ?? [];
};

export const resolveReport = (id: string, action: string) =>
  post(`/api/v1/admin/reports/${id}/resolve`, { action });

// ── Agents & Utilisateurs ─────────────────────────────────────────────────────

export const fetchAgents = async () => {
  const d = await get<{ agents: any[] }>('/api/v1/admin/agents');
  return d.agents ?? [];
};

export const setUserRole = (userId: string, role: string) =>
  patch(`/api/v1/admin/users/${userId}/role`, { role });

export const banUser   = (userId: string, reason: string) =>
  post(`/api/v1/admin/users/${userId}/ban`, { reason });

export const unbanUser = (userId: string) =>
  del(`/api/v1/admin/users/${userId}/ban`);

export const fetchUserByPhone = (phone: string) =>
  get(`/api/v1/users/by-phone/${encodeURIComponent(phone)}`);
