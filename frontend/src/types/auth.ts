export type UserRole = 'VOLUNTEER' | 'ADMIN_PENDING' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  email_confirmed: boolean;
  email_confirmed_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser & { redirect?: string; admin_pending?: boolean };
}