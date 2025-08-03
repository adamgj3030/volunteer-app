/*
 *  frontend/src/pages/AdminReports.tsx
 *  ───────────────────────────────────
 *  • Centred container (max-w-4xl)
 *  • Ash-Gray bg, white cards, Cambridge-Blue buttons
 *  • CSV + PDF export (PDF fixed with official autoTable call)
 *
 *  External deps (once): npm i jspdf jspdf-autotable papaparse
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

/* ---------- Types ---------- */
interface VolunteerEvent {
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
  status: string;
}
interface VolunteerRow {
  email: string;
  name: string | null;
  events: VolunteerEvent[];
}
interface EventRow {
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
  volunteers: { email: string; name: string | null; status: string }[];
}

/* ---------- Helpers ---------- */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const vRows = (vol: VolunteerRow[]) =>
  vol.flatMap((v) =>
    v.events.length
      ? v.events.map((ev) => ({
          VolunteerEmail: v.email,
          VolunteerName: v.name ?? '',
          EventName: ev.eventName,
          EventDate: ev.eventDate,
          Urgency: ev.urgency,
          Status: ev.status,
          RequiredSkills: ev.requiredSkills.join('; '),
          Location: ev.location,
        }))
      : [{
          VolunteerEmail: v.email,
          VolunteerName: v.name ?? '',
          EventName: '(none)',
          EventDate: '',
          Urgency: '',
          Status: '',
          RequiredSkills: '',
          Location: '',
        }],
  );

const eRows = (evs: EventRow[]) =>
  evs.flatMap((ev) =>
    ev.volunteers.length
      ? ev.volunteers.map((v) => ({
          EventName: ev.eventName,
          EventDate: ev.eventDate,
          Urgency: ev.urgency,
          Location: ev.location,
          RequiredSkills: ev.requiredSkills.join('; '),
          VolunteerEmail: v.email,
          VolunteerName: v.name ?? '',
          Status: v.status,
        }))
      : [{
          EventName: ev.eventName,
          EventDate: ev.eventDate,
          Urgency: ev.urgency,
          Location: ev.location,
          RequiredSkills: ev.requiredSkills.join('; '),
          VolunteerEmail: '(none)',
          VolunteerName: '',
          Status: '',
        }],
  );

/* ---------- Component ---------- */
export default function AdminReports() {
  const { token } = useAuth();

  const [volData, setVolData] = useState<VolunteerRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<'volunteers' | 'events'>('volunteers');

  /* fetch once */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/volunteer/history`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: VolunteerRow[] = await res.json();
        if (mounted) setVolData(json);
      } catch (e: any) {
        if (mounted) {
          setVolData([]);
          setErr(e.message ?? 'Fetch failed');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  /* derive event-centric view */
  const evtData: EventRow[] = useMemo(() => {
    if (!volData) return [];
    const map: Record<string, EventRow> = {};
    volData.forEach((v) =>
      v.events.forEach((ev) => {
        const key = `${ev.eventName}|${ev.eventDate}`;
        const row =
          map[key] ??
          (map[key] = {
            eventName: ev.eventName,
            description: ev.description,
            location: ev.location,
            requiredSkills: ev.requiredSkills,
            urgency: ev.urgency,
            eventDate: ev.eventDate,
            volunteers: [],
          });
        row.volunteers.push({ email: v.email, name: v.name, status: ev.status });
      }),
    );
    return Object.values(map);
  }, [volData]);

  /* export handlers */
  const doCSV = useCallback(() => {
    if (mode === 'volunteers' && volData?.length) {
      downloadCSV(Papa.unparse(vRows(volData)), 'volunteer_report.csv');
    }
    if (mode === 'events' && evtData.length) {
      downloadCSV(Papa.unparse(eRows(evtData)), 'event_report.csv');
    }
  }, [mode, volData, evtData]);

  const doPDF = useCallback(() => {
    const rows = mode === 'volunteers' ? vRows(volData ?? []) : eRows(evtData);
    if (!rows.length) return;

    const pdf = new jsPDF({ orientation: 'landscape' });
    const header = Object.keys(rows[0]);
    const body = rows.map((r) => header.map((k) => r[k as keyof typeof r]));

    pdf.setFontSize(14);
    pdf.text(
      mode === 'volunteers'
        ? 'Volunteer Participation Report'
        : 'Event Assignment Report',
      14,
      18,
    );

    autoTable(pdf, { startY: 24, head: [header], body, styles: { fontSize: 8 } });

    const filename =
      mode === 'volunteers' ? 'volunteer_report.pdf' : 'event_report.pdf';

    pdf.save(filename);            // reliable download
  }, [mode, volData, evtData]);

  /* card renders */
  const VolCard = (v: VolunteerRow) => (
    <Card key={v.email} className="mb-6 bg-white shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>{v.name || '(no name)'} — {v.email}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {v.events.length === 0 && <p>No participation yet.</p>}
        {v.events.map((ev) => (
          <div key={ev.eventName + ev.eventDate} className="border-t pt-2">
            <p className="font-medium">{ev.eventName}</p>
            <p className="text-sm">{ev.eventDate} — {ev.location}</p>
            <p className="text-sm">Urgency: {ev.urgency} | Status: {ev.status}</p>
            <p className="text-sm">Skills: {ev.requiredSkills.join(', ') || '—'}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const EvtCard = (e: EventRow) => (
    <Card key={e.eventName + e.eventDate} className="mb-6 bg-white shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>{e.eventName} — {e.eventDate}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{e.location} | Urgency: {e.urgency}</p>
        <p className="text-sm">Skills: {e.requiredSkills.join(', ') || '—'}</p>
        {e.volunteers.length === 0
          ? <p>No volunteers assigned.</p>
          : e.volunteers.map((v) => (
              <p key={v.email} className="border-t pt-1 text-sm">
                {v.name || '(no name)'} — {v.email} ({v.status})
              </p>
            ))}
      </CardContent>
    </Card>
  );

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-6">
      {/* centred container */}
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-charcoal-100)]">
            Administrative Reports
          </h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              className={
                mode === 'volunteers'
                  ? 'bg-[var(--color-cambridge_blue-500)] text-white'
                  : 'text-[var(--color-charcoal-400)] hover:bg-[var(--color-ash_gray-700)]'
              }
              onClick={() => setMode('volunteers')}
            >
              Volunteers
            </Button>
            <Button
              variant="ghost"
              className={
                mode === 'events'
                  ? 'bg-[var(--color-cambridge_blue-500)] text-white'
                  : 'text-[var(--color-charcoal-400)] hover:bg-[var(--color-ash_gray-700)]'
              }
              onClick={() => setMode('events')}
            >
              Events
            </Button>

            <Button onClick={doCSV} disabled={loading || !!err}>
              CSV
            </Button>
            <Button onClick={doPDF} disabled={loading || !!err}>
              PDF
            </Button>
          </div>
        </div>

        {/* body */}
        {loading && <p>Loading…</p>}
        {err && !loading && (
          <p className="text-sm text-[var(--color-cambridge_blue-500)]">{err}</p>
        )}

        {mode === 'volunteers' && volData?.map(VolCard)}
        {mode === 'events' && evtData.map(EvtCard)}

        {!loading && !err && (
          (mode === 'volunteers' && volData?.length === 0) ||
          (mode === 'events' && evtData.length === 0)
        ) && <p>No data found.</p>}
      </div>
    </main>
  );
}
