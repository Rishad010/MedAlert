import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../services/api";

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: async () => (await adminAPI.getUsers(search)).data,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminAPI.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Users</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0f6e56] focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Medicine count</th>
              <th className="px-3 py-2">Joined date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              (data || []).map((user: any) => (
                <tr key={user._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">{user.medicineCount}</td>
                  <td className="px-3 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleMutation.mutate(user._id)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
