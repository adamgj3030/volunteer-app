import {useState} from 'react';

export default function AdminManage() {

    const manageData = [{
        user_id: 0, 
        name: "Jason Quach",
        email: "jtquach@uh.edu",
        role: "Admin",
    }, {
        user_id: 1,
        name: "Adam",
        email: "adam@uh.edu",
        role: "Admin"
    }, {
        user_id: 2,
        name: "Katie",
        email: "katie@uh.edu",
        role: "Member",
    }]

    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = manageData.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase())
                        || user.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-4">
            <h1 className="text-black font-bold">Admin Management</h1>

            <input
                type="text"
                placeholder="Search by name or email"
                className="border border-black px-3 py-2 rounded mb-4 text-black"
                value={searchQuery}
                onChange={(search) => setSearchQuery(search.target.value)}/>

            <table className="min-w-full border border-black text-left text-sm">
                <thead className="bg-gray-100 font-bold">
                    <tr className="">
                        <th className="px-4 py-2 border border-black text-center">Name</th>
                        <th className="px-4 py-2 border border-black text-center">Email</th>
                        <th className="px-4 py-2 border border-black text-center">Role </th>
                        <th className="pix-4 py-2 border border-black text-center">Action</th>
                    </tr>
                </thead>

                <tbody> 

                    {filteredData.map((user) => (
                        <tr key={user.user_id}>
                            <td className="text-center border border-black">{user.name}</td>
                            <td className="text-center border border-black">{user.email}</td>
                            <td className="text-center border border-black">{user.role}</td>
                            <td className="text-center border border-black">
                                <div className="flex justify-center gap-2">
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded border border-black"
                                        onClick={() => alert(`Accept clicked for ${user.name}`)}>
                                        Accept
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded border border-black"
                                        onClick={() => alert(`Deny clicked for ${user.name}`)}>
                                        Deny
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}


                </tbody>
            </table>
        </div>
    )
}