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
import { ArrowUpDown } from "lucide-react";

type ParticipationStatus = "Confirmed" | "Attended" | "Cancelled";
type Urgency = "High" | "Medium" | "Low";

interface Event {
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: Urgency;
  eventDate: string;
  status: ParticipationStatus;
}

interface Volunteer {
  email: string;
  name: string;
  events: Event[];
}

const volunteers: Volunteer[] = [
  {
    email: "volunteer1@example.com",
    name: "John Doe",
    events: [
      {
        eventName: "Community Cleanup",
        description: "Cleaning up the local park.",
        location: "Central Park",
        requiredSkills: ["Gardening"],
        urgency: "Medium",
        eventDate: "2024-08-15",
        status: "Confirmed",
      },
      {
        eventName: "Food Drive",
        description: "Sorting and distributing food donations.",
        location: "Community Center",
        requiredSkills: ["Organization"],
        urgency: "High",
        eventDate: "2024-07-20",
        status: "Attended",
      },
    ],
  },
  {
    email: "volunteer2@example.com",
    name: "Jane Smith",
    events: [
      {
        eventName: "Animal Shelter Assistance",
        description: "Walking dogs and cleaning cages.",
        location: "City Animal Shelter",
        requiredSkills: ["Animal Care"],
        urgency: "High",
        eventDate: "2024-09-01",
        status: "Confirmed",
      },
    ],
  },
];

type SortableKeys = "name" | "email" | "eventName" | "eventDate" | "urgency" | "status";

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
      return <ArrowUp className="ml-2 h-4 w-4" aria-label="Sorted ascending" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" aria-label="Sorted descending" />;
  };

  return (
    <div className="container max-w-screen-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Volunteer Participation History</h1>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ParticipationStatus | "all")}>
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
        <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as Urgency | "all")}>
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
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of volunteer participation history.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("name")}>
                  Volunteer Name
                  {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("email")}>
                  Email
                  {getSortIcon("email")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("eventName")}>
                  Event Name
                  {getSortIcon("eventName")}
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Required Skills</TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("urgency")}>
                  Urgency
                  {getSortIcon("urgency")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("eventDate")}>
                  Event Date
                  {getSortIcon("eventDate")}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort("status")}>
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((item, index) => (
              <TableRow key={`${item.email}-${item.eventName}-${item.eventDate}`}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.eventName}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.requiredSkills.join(", ")}</TableCell>
                <TableCell>
                  <Badge variant={item.urgency === "High" ? "destructive" : item.urgency === "Medium" ? "secondary" : "default"}>
                    {item.urgency}
                  </Badge>
                </TableCell>
                <TableCell>{item.eventDate}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "Cancelled" ? "outline" : "default"}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}