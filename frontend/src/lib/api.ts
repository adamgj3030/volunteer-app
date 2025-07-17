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