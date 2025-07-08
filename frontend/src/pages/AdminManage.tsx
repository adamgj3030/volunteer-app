'use client';

import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type User = {
  user_id: number;
  name: string;
  email: string;
  role: string;
};

type SortableUserKeys = "name" | "email" | "role";

export default function AdminManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableUserKeys;
    direction: "ascending" | "descending";
  } | null>(null);

  const manageData: User[] = [
    { user_id: 0, name: "Jason Quach", email: "jtquach@uh.edu", role: "Admin" },
    { user_id: 1, name: "Adam", email: "adam@uh.edu", role: "Admin" },
    { user_id: 2, name: "Katie", email: "katie@uh.edu", role: "Member" },
  ];

  const filteredAndSortedData = useMemo(() => {
    let data = [...manageData];

    if (searchQuery) {
      data = data.filter((user) =>
        ["name", "email"].some((key) =>
          user[key as keyof User].toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key].toLowerCase();
        const bVal = b[sortConfig.key].toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [manageData, searchQuery, sortConfig]);

  const requestSort = (key: SortableUserKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableUserKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUp className="ml-2 h-4 w-4 text-[#84a98c]" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-[#84a98c]" />;
  };

  return (
    <div className="bg-[var(--color-ash_gray-500)] min-h-screen py-10">
      <div className="flex justify-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 bg-[var(--color-ash_gray-900)] rounded-md shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-[#354f52] text-center">Admin Management</h1>

          <div className="flex justify-center mb-6">
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm focus:ring-[#84a98c] focus:border-[#84a98c]"
            />
          </div>

          <div className="rounded-md border border-[#cad2c5] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#cad2c5]">
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("name")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                      Name
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
                    <Button variant="ghost" onClick={() => requestSort("role")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                      Role
                      {getSortIcon("role")}
                    </Button>
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((user) => (
                  <TableRow key={user.user_id} className="border-b border-[#f4f6f3] hover:bg-[#f4f6f3]">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          className="bg-[#84a98c] hover:bg-[#6b8e7b] text-white"
                          onClick={() => alert(`Accepted ${user.name}`)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => alert(`Denied ${user.name}`)}
                        >
                          Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
