import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type {
  ParticipationStatus,
  Urgency,

  SortableKeys,
} from "@/types/type";
import { volunteers } from "@/types/data";


export default function VolunteerHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ParticipationStatus | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: "ascending" | "descending" } | null>({ key: 'eventDate', direction: 'descending' });

  const flattenedData = useMemo(() => {
    return volunteers.flatMap((volunteer) =>
      volunteer.events.map((event) => ({
        ...volunteer,
        ...event,
      }))
    );
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let data = [...flattenedData];

    if (searchTerm) {
      data = data.filter((item) =>
        ["name", "eventName", "location"].some((key) =>
          item[key]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (urgencyFilter !== "all") {
      data = data.filter((item) => item.urgency === urgencyFilter);
    }

    if (sortConfig !== null) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [flattenedData, searchTerm, statusFilter, urgencyFilter, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" aria-label="No sort applied" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 text-[#84a98c]" aria-label="Sorted ascending" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-[#84a98c]" aria-label="Sorted descending" />;
  };

  return (
    <div className="bg-[var(--color-ash_gray-500)] min-h-screen py-10">
    <div className="container max-w-screen-3xl mx-auto py-10 px-10 bg-[var(--color-ash_gray-900)]">
      <h1 className="text-3xl font-bold mb-6 text-[#354f52]">Volunteer Participation History</h1>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm focus:ring-[#84a98c] focus:border-[#84a98c]"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ParticipationStatus | "all")}>
          <SelectTrigger className="w-[180px] focus:ring-[#84a98c] focus:border-[#84a98c]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Attended">Attended</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as Urgency | "all")}>
          <SelectTrigger className="w-[180px] focus:ring-[#84a98c] focus:border-[#84a98c]">
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
      <div className="rounded-md border border-[#cad2c5]">
        <Table>
          <TableCaption>A list of volunteer participation history.</TableCaption>
          <TableHeader>
            <TableRow className="border-b border-[#cad2c5]">
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("name")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Volunteer Name
                  {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("email")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Email
                  {getSortIcon("email")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("eventName")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Event Name
                  {getSortIcon("eventName")}
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Required Skills</TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("urgency")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Urgency
                  {getSortIcon("urgency")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("eventDate")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Event Date
                  {getSortIcon("eventDate")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("status")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((item, index) => (
              <TableRow key={`${item.email}-${item.eventName}-${item.eventDate}`} className="border-b border-[#f4f6f3] hover:bg-[#f4f6f3]">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell className="font-medium text-[#354f52]">{item.eventName}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.requiredSkills.join(", ")}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.urgency === "High" ? "destructive" : item.urgency === "Medium" ? "secondary" : "default"}
                    className={item.urgency === "Medium" ? "bg-[#cad2c5] text-[#354f52] hover:bg-[#a0af97]" : 
                              item.urgency === "Low" ? "bg-[#e6eee8] text-[#52796f] hover:bg-[#ceddd1]" : ""}
                  >
                    {item.urgency}
                  </Badge>
                </TableCell>
                <TableCell>{item.eventDate}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === "Cancelled" ? "outline" : "default"}
                    className={item.status === "Confirmed" ? "bg-[#82a78a] hover:bg-[#638e6c]" :
                              item.status === "Attended" ? "bg-[#52796f] hover:bg-[#426159]" :
                              "border-[#cad2c5] text-[#354f52] hover:bg-[#f4f6f3]"}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
    </div>
  );
}