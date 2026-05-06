// frontend/src/components/Layout.tsx
import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Pill, Bell, LogOut, Menu, X, ShoppingBag, ShieldCheck, Settings, Bot } from "lucide-react"; // 👈 added ShoppingBag, ShieldCheck
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth(); // 👈 added isAdmin
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Medicines", href: "/medicines", icon: Pill },
    { name: "Reminders", href: "/reminders", icon: Bell },
    { name: "Pharmacy", href: "/pharmacy", icon: ShoppingBag },
    { name: "MedBot", href: "/assistant", icon: Bot },
    { name: "Settings", href: "/settings", icon: Settings },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => location.pathname === href;

  // Everything below this line is UNCHANGED — copy your existing JSX as-is
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-emerald-950/40 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex w-full max-w-xs flex-1 flex-col border-r border-emerald-200/60 bg-white/95 shadow-[4px_0_24px_-8px_rgba(15,110,86,0.12)] backdrop-blur-md">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-shrink-0 items-center px-4 py-4">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                MedAlert
              </span>
            </div>
          </div>
          <div className="mt-5 h-0 flex-1 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isAdminLink = item.name === "Admin Panel";
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      isAdminLink
                        ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        : isActive(item.href)
                        ? "bg-primary-100 text-primary-800 shadow-sm ring-1 ring-primary-200/60"
                        : "text-gray-600 hover:bg-primary-50/90 hover:text-primary-900"
                    } group flex w-full items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      !isAdminLink ? "text-base lg:text-sm px-2 py-2 rounded-md" : ""
                    }`}
                  >
                    <Icon className={`${isAdminLink ? "mr-2 h-4 w-4" : "mr-4 h-6 w-6"}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-emerald-100/80 bg-primary-50/50 p-4">
            <div className="group block flex-shrink-0">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-primary-900">
                    {user?.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-emerald-200/60 bg-white/90 shadow-[4px_0_30px_-10px_rgba(15,110,86,0.15)] backdrop-blur-md">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center">
                <Pill className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  MedAlert
                </span>
              </div>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isAdminLink = item.name === "Admin Panel";
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`${
                      isAdminLink
                        ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        : isActive(item.href)
                        ? "bg-primary-100 text-primary-800 shadow-sm ring-1 ring-primary-200/60"
                        : "text-gray-600 hover:bg-primary-50/90 hover:text-primary-900"
                    } group flex w-full items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      !isAdminLink ? "px-2 py-2 rounded-md" : ""
                    }`}
                  >
                    <Icon className={`${isAdminLink ? "mr-2 h-4 w-4" : "mr-3 h-6 w-6"}`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User info + sign out — unchanged */}
          <div className="flex flex-shrink-0 border-t border-emerald-100/80 bg-primary-50/40 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-primary-900">
                    {user?.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {user?.email}
                  </p>
                  {isAdmin && ( // 👈 subtle admin badge in the sidebar footer
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ring-1 ring-primary-200/50">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-primary-100/60 hover:text-primary-900 rounded-md transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content — completely unchanged */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-emerald-100/80 bg-white/85 shadow-[0_8px_24px_-12px_rgba(15,110,86,0.12)] backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="border-r border-emerald-100/80 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <div className="flex items-center">
                <Pill className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  MedAlert
                </span>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="rounded-full bg-primary-50/80 p-1 text-gray-500 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Sign out"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}