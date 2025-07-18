import type { AuthUser, LoginResponse } from '@/types/auth';
import type { VolunteerProfile, VolunteerProfileInput, SkillOption, StateOption } from '@/types/profile';

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

function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// ---------------------------------------------------------------------------
// Registration --------------------------------------------------------------
// ---------------------------------------------------------------------------
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await fetch(buildUrl('/auth/register'), {
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

// ---------------------------------------------------------------------------
// Auth / Session -----------------------------------------------------------
// ---------------------------------------------------------------------------
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Login failed'), { code: data.error, detail: data });
  }
  return data as LoginResponse;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(buildUrl('/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let msg = 'Failed to restore session';
    try {
      const j = await res.json();
      msg = j.message || j.error || msg;
    } catch {/* ignore */}
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }

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

// ---------------------------------------------------------------------------
// States & Skills ----------------------------------------------------------
// ---------------------------------------------------------------------------
export async function fetchStates(): Promise<StateOption[]> {
  const res = await fetch(buildUrl('/states/'));
  if (!res.ok) throw new Error('Failed to load states');
  const json = await res.json();
  return json.states as StateOption[];
}

export async function fetchSkills(): Promise<SkillOption[]> {
  const res = await fetch(buildUrl('/skills/'));
  if (!res.ok) throw new Error('Failed to load skills');
  const json = await res.json();
  return json.skills as SkillOption[];
}

// ---------------------------------------------------------------------------
// Volunteer Profile --------------------------------------------------------
// ---------------------------------------------------------------------------
function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMyProfile(token: string): Promise<VolunteerProfile | null> {
  const res = await fetch(buildUrl('/volunteer/profile/me'), {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  const json = await res.json();
  return (json.profile ?? null) as VolunteerProfile | null;
}

export async function saveMyProfile(token: string, input: VolunteerProfileInput): Promise<VolunteerProfile> {
  const res = await fetch(buildUrl('/volunteer/profile/me'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) {
    const err: any = new Error(json?.error || 'Profile save failed');
    err.fields = json?.fields;
    throw err;
  }
  return json.profile as VolunteerProfile;
}

export async function patchMyProfile(token: string, partial: Partial<VolunteerProfileInput>): Promise<VolunteerProfile> {
  const res = await fetch(buildUrl('/volunteer/profile/me'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(partial),
  });
  const json = await res.json();
  if (!res.ok) {
    const err: any = new Error(json?.error || 'Profile update failed');
    err.fields = json?.fields;
    throw err;
  }
  return json.profile as VolunteerProfile;
}