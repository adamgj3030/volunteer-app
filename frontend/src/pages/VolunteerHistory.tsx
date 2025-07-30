import { fetchVolunteerHistory } from "@/lib/api";
import { useState, useMemo, useEffect } from "react";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import type {
  ParticipationStatus,
  Urgency,
  SortableKeys,
  Volunteer
} from "@/types/type";

export default function VolunteerHistory() {
  const [searchTerm,    setSearchTerm]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState<ParticipationStatus | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "all">("all");

  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "ascending" | "descending";
  }>({
    key: "eventDate",
    direction: "descending",
  });

  /* ---------- fetch volunteer history ---------- */
  const [volunteerData, setVolunteerData] = useState<Volunteer[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchVolunteerHistory();
        setVolunteerData(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    }
    loadHistory();
  }, []);

  /* ---------- flatten: one volunteer-event per row ---------- */
  interface FlattenedEvent {
    email: string;
    name: string;
    eventName: string;
    description: string;
    location: string;
    requiredSkills: string[];
    urgency: Urgency;
    eventDate: string;
    status: ParticipationStatus;
  }

  const flattened = useMemo<FlattenedEvent[]>(() => {
    return volunteerData.flatMap((vol) =>
      vol.events.map((evt) => ({
        email:          vol.email,
        name:           vol.name,
        eventName:      evt.eventName,
        description:    evt.description,
        location:       evt.location,
        requiredSkills: evt.requiredSkills,
        urgency:        evt.urgency,
        eventDate:      evt.eventDate,
        status:         evt.status,
      }))
    );
  }, [volunteerData]);

  /* ---------- filter & sort ---------- */
  const filteredAndSorted = useMemo(() => {
    let data = [...flattened];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((row) => row.name.toLowerCase().includes(term));
    }

    if (statusFilter !== "all") {
      data = data.filter((row) => row.status === statusFilter);
    }

    if (urgencyFilter !== "all") {
      data = data.filter((row) => row.urgency === urgencyFilter);
    }

    data.sort((a, b) => {
      const A = a[sortConfig.key];
      const B = b[sortConfig.key];
      if (A < B) return sortConfig.direction === "ascending" ? -1 : 1;
      if (A > B) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return data;
  }, [flattened, searchTerm, statusFilter, urgencyFilter, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    setSortConfig((current) => {
      const direction =
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending";
      return { key, direction };
    });
  };

  const getSortIcon = (key: SortableKeys) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-2 h-4 w-4 text-[#84a98c]" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-[#84a98c]" />
    );
  };

  /* ---------- UI ---------- */
  return (
    <div className="bg-[var(--color-ash_gray-500)] min-h-screen py-10">
      <div className="container max-w-screen-3xl mx-auto bg-[var(--color-ash_gray-900)] p-10">
        <h1 className="text-3xl font-bold mb-6 text-[#354f52]">
          Volunteer Participation History
        </h1>

        {/* filters */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search by volunteer name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as ParticipationStatus | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Attended">Attended</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={urgencyFilter}
            onValueChange={(v) => setUrgencyFilter(v as Urgency | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* table */}
        <div className="rounded-md border border-[#cad2c5]">
          <Table>
            <TableCaption>A list of volunteer participation history.</TableCaption>
            <TableHeader>
              <TableRow className="border-b border-[#cad2c5]">
                {(
                  [
                    ["name", "Volunteer Name"],
                    ["email", "Email"],
                    ["eventName", "Event Name"],
                    ["urgency", "Urgency"],
                    ["eventDate", "Event Date"],
                    ["status", "Status"],
                  ] as const
                ).map(([key, label]) => (
                  <TableHead key={key}>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort(key)}
                      className="hover:bg-[#e6eee8]"
                    >
                      {label}
                      {getSortIcon(key)}
                    </Button>
                  </TableHead>
                ))}
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Required Skills</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndSorted.map((item) => (
                <TableRow
                  key={`${item.email}-${item.eventName}-${item.eventDate}`}
                  className="border-b hover:bg-[#f4f6f3]"
                >
                  {/* 1  Volunteer Name */}
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {/* 2  Email */}
                  <TableCell>{item.email}</TableCell>
                  {/* 3  Event Name */}
                  <TableCell className="font-medium text-[#354f52]">
                    {item.eventName}
                  </TableCell>
                  {/* 4  Urgency */}
                  <TableCell>
                    <Badge
                      variant={
                        item.urgency === "High"
                          ? "destructive"
                          : item.urgency === "Medium"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {item.urgency}
                    </Badge>
                  </TableCell>
                  {/* 5  Event Date */}
                  <TableCell>{item.eventDate}</TableCell>
                  {/* 6  Status */}
                  <TableCell>
                    <Badge
                      variant={item.status === "Cancelled" ? "outline" : "default"}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  {/* 7  Description */}
                  <TableCell>{item.description}</TableCell>
                  {/* 8  Location */}
                  <TableCell>{item.location}</TableCell>
                  {/* 9  Required Skills */}
                  <TableCell>{item.requiredSkills.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
