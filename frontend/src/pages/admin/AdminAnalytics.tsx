import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminAPI } from "../../services/api";

export function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => (await adminAPI.getAnalytics()).data,
  });

  const cards = [
    { label: "Total Reminders Sent", value: data?.totalRemindersSent || 0 },
    { label: "Avg Adherence Rate", value: `${data?.averageAdherenceRate || 0}%` },
    { label: "Total Orders", value: data?.totalOrders || 0 },
    { label: "AI Chats", value: data?.aiChats ?? data?.totalMedicines ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#0f6e56]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-base font-semibold">Monthly reminder volume</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.remindersByDay || []}>
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
        <h3 className="mb-4 text-base font-semibold">New users over last 7 days</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.newUsersByDay || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1f9d79" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
