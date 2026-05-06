import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminAPI } from "../../services/api";

export function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await adminAPI.getStats()).data,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => (await adminAPI.getAnalytics()).data,
  });

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6">Loading overview...</div>;
  }

  const kpis = [
    { label: "Total Users", value: stats?.totalUsers || 0 },
    { label: "Active Orders", value: stats?.totalOrders || 0 },
    { label: "Low Stock Alerts", value: stats?.lowStockCount || 0 },
    { label: "Reminders Sent", value: analytics?.totalRemindersSent || 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Admin Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#0f6e56]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-base font-semibold">Reminders sent — last 7 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.remindersByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f6e56" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-base font-semibold">New signups — last 7 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.newUsersByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1f9d79" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-base font-semibold">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2">Order ID</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order: any) => (
                <tr key={order._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{order._id}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{order.user?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">{order.user?.email || "-"}</div>
                  </td>
                  <td className="px-3 py-2">{order.items?.length || 0}</td>
                  <td className="px-3 py-2">₹{order.totalAmount || 0}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-[#ecf7f3] px-2 py-0.5 text-xs text-[#0f6e56]">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <a className="text-[#0f6e56] hover:underline" href="/admin/orders">
                      View
                    </a>
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
