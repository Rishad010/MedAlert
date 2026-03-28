import { useQuery } from "@tanstack/react-query";
import {
  Pill,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardAPI } from "../services/api";
import { format } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardAPI.getStats().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Medicines",
      value: dashboardData?.totalMedicines || 0,
      icon: Pill,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
    },
    {
      name: "Low Stock",
      value: dashboardData?.lowStock || 0,
      icon: AlertTriangle,
      color: "text-warning-600",
      bgColor: "bg-warning-100",
    },
    {
      name: "Expiring Soon",
      value: dashboardData?.expiringSoon || 0,
      icon: Calendar,
      color: "text-danger-600",
      bgColor: "bg-danger-100",
    },
    {
      name: "Adherence Rate",
      value: `${dashboardData?.adherencePercent || 0}%`,
      icon: TrendingUp,
      color: "text-success-600",
      bgColor: "bg-success-100",
    },
  ];

  const adherenceData = [
    { name: "Missed", value: 100 - (dashboardData?.adherencePercent || 0) },
    { name: "Taken", value: dashboardData?.adherencePercent || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your medication management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Adherence Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Adherence Trend (Last 14 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "MMM dd")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    format(new Date(value), "MMM dd, yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="acknowledged"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Taken"
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adherence Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Overall Adherence
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adherenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {adherenceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Missed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Taken</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reminders */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Reminders
        </h3>
        {dashboardData?.recentReminders?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentReminders.map((reminder: any) => (
              <div
                key={reminder._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {reminder.acknowledged ? (
                      <CheckCircle className="h-5 w-5 text-success-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.medicine?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reminder.medicine?.dosage} •{" "}
                      {format(new Date(reminder.sentAt), "MMM dd, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    reminder.acknowledged
                      ? "bg-success-100 text-success-800"
                      : "bg-warning-100 text-warning-800"
                  }`}
                >
                  {reminder.acknowledged ? "Taken" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No recent reminders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by adding medicines to receive reminders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
