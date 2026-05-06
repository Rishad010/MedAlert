import { Link, NavLink, Outlet } from "react-router-dom";
import { Activity, ArrowLeft, Bell, LayoutDashboard, Package, Users } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/stock-alerts", label: "Stock Alerts", icon: Bell },
  { to: "/admin/analytics", label: "Analytics", icon: Activity },
];

export function AdminLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-600" />
      <div className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
          <div className="border-b border-gray-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f6e56]" />
              <h1 className="text-lg font-semibold text-gray-900">MedAlert</h1>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-[#e6f3ef] px-2 py-0.5 text-xs font-semibold text-[#0f6e56]">
              ADMIN
            </span>
          </div>

          <nav className="flex-1 p-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-2 rounded-md border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-l-[#0f6e56] bg-[#ecf7f3] text-[#0f6e56]"
                      : "border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-3">
            <Link
              to="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-[#0f6e56]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to app
            </Link>
          </div>
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
      </main>
    </div>
  );
}
