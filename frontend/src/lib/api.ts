export interface RegisterPayload {
  email: string;
  password: string;
  role: 'volunteer' | 'admin';
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  role: 'volunteer' | 'admin';
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

import type { AuthUser, LoginResponse } from '@/types/auth';

function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // if you ever send cookies; harmless otherwise
  });

  const data = await res.json();
  if (!res.ok) {
    // data.error may be 'email_unconfirmed', 'invalid_login', etc.
    throw Object.assign(new Error(data.message || 'Login failed'), { code: data.error, detail: data });
  }
  return data as LoginResponse;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(buildUrl('/auth/me'), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to restore session');
  const json = await res.json();
  return json.user as AuthUser;
}

export async function resendConfirmation(email: string): Promise<void> {
  await fetch(buildUrl('/auth/resend-confirmation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}