import { useState } from 'react';

export default function AdminManage() {
  const manageData = [
    { user_id: 0, name: "Jason Quach", email: "jtquach@uh.edu", role: "Admin" },
    { user_id: 1, name: "Adam", email: "adam@uh.edu", role: "Admin" },
    { user_id: 2, name: "Katie", email: "katie@uh.edu", role: "Member" },
    { user_id: 3, name: "Jon", email: "jon@uh.edu", role: "Member" }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = manageData.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0
  });

  const handleSort = (key: "name" | "email") => {
    if (sortKey === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc")); // flips sort direction
    } else { 
        setSortKey(key)
        setSortDirection("asc");
    }
  }

  return (
    <div className="min-h-screen bg-cambridge_blue-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-dark_slate_gray-600">
          Admin Management
        </h1>

        <input
          type="text"
          placeholder="Search by name or email"
          className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg border border-cambridge_blue-300 text-dark_slate_gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-hookers_green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full text-sm text-left text-dark_slate_gray-700 border border-hookers_green-500 bg-white">
            <thead className="bg-hookers_green-500 text-dark_slate_gray-900 font-semibold">
              <tr>
                <th className="px-4 py-3 text-center border border-cambridge_blue-300"
                    onClick={() => handleSort("name")}>Name {sortKey === "name" ? (sortDirection === "asc" ? "🔼" : "🔽") : ""}</th>
                <th className="px-4 py-3 text-center border border-cambridge_blue-300"
                    onClick={() => handleSort("email")}>Email {sortKey === "email" ? (sortDirection === "asc" ? "🔼" : "🔽") : ""}</th>
                <th className="px-4 py-3 text-center border border-cambridge_blue-300">Role</th>
                <th className="px-4 py-3 text-center border border-cambridge_blue-300">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((user) => (
                <tr key={user.user_id} className="bg-cambridge_blue-800">
                  <td className="text-center px-4 py-2 border border-cambridge_blue-300 text-white">{user.name}</td>
                  <td className="text-center px-4 py-2 border border-cambridge_blue-300 text-white">{user.email}</td>
                  <td className="text-center px-4 py-2 border border-cambridge_blue-300 text-white">{user.role}</td>
                  <td className="text-center px-4 py-2 border border-cambridge_blue-300 text-white">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-hookers_green-500 hover:bg-hookers_green-600 text-white font-semibold py-1.5 px-3 rounded-lg"
                        onClick={() => alert(`Accept clicked for ${user.name}`)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg"
                        onClick={() => alert(`Deny clicked for ${user.name}`)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
