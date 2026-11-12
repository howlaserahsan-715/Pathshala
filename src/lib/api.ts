import type { UserProfile } from '../types';

export interface ApiError extends Error {
  status?: number;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    ...init,
  });

  let payload: any = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `অনুরোধ ব্যর্থ হয়েছে (${response.status})`) as ApiError;
    error.status = response.status;
    throw error;
  }
  return payload as T;
}

export const api = {
  /* auth */
  me: () => request<{ user: UserProfile | null }>('/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (input: { name: string; email: string; password: string; targetExam: string }) =>
    request<{ user: UserProfile; firstUser?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  requestReset: (email: string) =>
    request<{ ok: boolean; message: string }>('/auth/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  /* profile */
  updateProfile: (patch: Partial<UserProfile>) =>
    request<{ user: UserProfile }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  /* per-user data */
  getData: <T,>(kind: 'errors' | 'revisions' | 'planner' | 'settings') =>
    request<{ kind: string; data: T | null; updatedAt: number | null }>(`/me/data/${kind}`),
  putData: (kind: 'errors' | 'revisions' | 'planner' | 'settings', data: unknown) =>
    request<{ ok: boolean }>(`/me/data/${kind}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    }),

  /* public content */
  questions: () => request<{ questions: any[] }>('/questions'),
  announcements: () => request<{ announcements: any[] }>('/announcements'),
  leaderboard: () => request<{ users: UserProfile[] }>('/leaderboard'),

  /* admin */
  admin: {
    users: () => request<{ users: Record<string, UserProfile> }>('/admin/users'),
    updateUser: (email: string, patch: { role?: string; status?: string }) =>
      request<{ ok: boolean }>(`/admin/users/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    resetPassword: (email: string, password: string) =>
      request<{ ok: boolean }>(`/admin/users/${encodeURIComponent(email)}/password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    deleteUser: (email: string) =>
      request<{ ok: boolean }>(`/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
    resetRequests: () =>
      request<{ requests: Array<{ id: string; email: string; requested_at: string }> }>(
        '/admin/reset-requests',
      ),
    addQuestion: (question: unknown) =>
      request<{ ok: boolean; id: string }>('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(question),
      }),
    deleteQuestion: (id: string) =>
      request<{ ok: boolean }>(`/admin/questions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    addAnnouncement: (announcement: unknown) =>
      request<{ ok: boolean; id: string }>('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify(announcement),
      }),
    deleteAnnouncement: (id: string) =>
      request<{ ok: boolean }>(`/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
};
