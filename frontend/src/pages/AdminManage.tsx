'use client';

import { useState, useMemo, useEffect} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import axios from "axios";
const db_url = import.meta.env.VITE_DEVELOPMENT_DB_URL;

type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
};

type SortableUserKeys = "full_name" | "email" | "role";

export default function AdminManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableUserKeys;
    direction: "ascending" | "descending";
  } | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("Fetching from:", `${db_url}/admin/pending`);

  axios.get(`${db_url}/admin/pending`)
    .then((res) => {
      console.log("Got pending users", res.data);
      setPendingUsers(res.data);
    })
    .catch((err) => {
      console.error("Error fetching pending users:", err);
    })
    .finally(() => setLoading(false));

  //   const dummyUsers: User[] = [
  //   { user_id: 1, full_name: "Alice Johnson", email: "alice@example.com", role: "PENDING_APPROVAL" },
  //   { user_id: 2, full_name: "Bob Smith", email: "bob@example.com", role: "PENDING_APPROVAL" },
  //   { user_id: 3, full_name: "Charlie Lee", email: "charlie@example.com", role: "PENDING_APPROVAL" },
  // ];
  // setPendingUsers(dummyUsers);
  // setLoading(false);

}, []);

const acceptUser = async (user_id: number) => {
  try {
    const res = await axios.post(`${db_url}/admin/approve/${user_id}`);
    console.log("User accepted:", res.data);

    setPendingUsers(prev => prev.filter(user => user.user_id !== user_id));
  } catch (err) {
    console.error("Error accepting user:", err);
  }
};

const denyUser = async (user_id: number) => {
  try {
    const res = await axios.post(`${db_url}/admin/deny/${user_id}`);
    console.log("User denied:", res.data);

    setPendingUsers(prev => prev.filter(user => user.user_id !== user_id));
  } catch (err) {
    console.error("Error denying user:", err);
  }
};


  const filteredAndSortedData = useMemo(() => {
    let data = [...pendingUsers];

    if (searchQuery) {
      data = data.filter((user) =>
        ["full_name", "email"].some((key) =>
          user[key as keyof User].toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key].toString().toLowerCase();
        const bVal = b[sortConfig.key].toString().toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [pendingUsers, searchQuery, sortConfig]);

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
                    <Button variant="ghost" onClick={() => requestSort("full_name")} className="hover:bg-[#e6eee8] hover:text-[#52796f]">
                      Name
                      {getSortIcon("full_name")}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-[#52796f] font-medium">
                        Loading pending users...
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-[#52796f] font-medium">
                        No pending users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((user) => (
                      <TableRow key={user.user_id} className="border-b border-[#f4f6f3] hover:bg-[#f4f6f3]">
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              className="bg-[#84a98c] hover:bg-[#6b8e7b] text-white"
                              onClick={() => acceptUser(user.user_id).then(() => alert(`${user.full_name} accepted`))}
                            >
                              Accept
                            </Button>
                            <Button
                              className="bg-[#d1495b] hover:bg-[#a8323c] text-white"
                              onClick={() => denyUser(user.user_id).then(() => alert(`${user.full_name} denied`))}
                            >
                              Deny
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
