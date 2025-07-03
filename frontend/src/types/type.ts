export type ParticipationStatus = "Confirmed" | "Attended" | "Cancelled";
export type Urgency = "High" | "Medium" | "Low";

export interface Event {
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: Urgency;
  eventDate: string;
  status: ParticipationStatus;
}

export interface Volunteer {
  email: string;
  name: string;
  events: Event[];
}

export type SortableKeys =
  | "name"
  | "email"
  | "eventName"
  | "eventDate"
  | "urgency"
  | "status";