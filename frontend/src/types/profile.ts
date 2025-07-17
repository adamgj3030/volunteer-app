export interface SkillOption {
  id: number;
  name: string;
  level?: string; // optional display
}

export interface StateOption {
  code: string; // 2-char
  name: string;
}

export interface VolunteerProfile {
  user_id: number;
  full_name: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string; // 2-char code
  zipcode: string; // digits only (5 or 9)
  preferences?: string | null;
  skills: number[]; // skill ids
  availability: string[]; // YYYY-MM-DD
}

export type VolunteerProfileInput = Omit<VolunteerProfile, 'user_id'>;