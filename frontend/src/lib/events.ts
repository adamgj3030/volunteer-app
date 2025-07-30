// simple fetch wrapper for the Event endpoints
export interface EventPayload {
  name: string
  description: string
  address?: string
  city?: string
  state_id: string
  zipcode?: string
  urgency: "low" | "medium" | "high"
  date: string           // ISO 8601
}

export interface Event extends EventPayload {
  event_id: number
}

const API = import.meta.env.DEVELOPMENT_DB_URL ?? "http://127.0.0.1:5000"
const BASE = `${API}/events`

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export const listUpcoming = () =>
  fetch(`${BASE}/upcoming`).then(json<Event[]>)

export const listPast = () =>
  fetch(`${BASE}/past`).then(json<Event[]>)

export const createEvent = (payload: EventPayload) =>
  fetch(`${BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(json<{ event_id: number }>())

export const updateEvent = (id: number, payload: EventPayload) =>
  fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(json<{ ok: boolean }>())
