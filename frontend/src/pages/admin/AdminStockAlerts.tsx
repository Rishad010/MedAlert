import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../services/api";

const daysUntil = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

export function AdminStockAlerts() {
  const { data } = useQuery({
    queryKey: ["admin", "stock-alerts"],
    queryFn: async () => (await adminAPI.getStockAlerts()).data,
  });

  const rows = useMemo(() => {
    const list = (data || []).map((item: any) => {
      const d = daysUntil(item.expiryDate);
      const lowStock = item.stock <= 10;
      const expiringSoon = d <= 30;
      const critical = item.stock <= 3 || d <= 7;
      let alertType = "Low Stock";
      if (critical) alertType = "Critical";
      else if (expiringSoon) alertType = "Expiring Soon";

      return {
        ...item,
        alertType,
        sortRank: critical ? 0 : expiringSoon ? 1 : 2,
      };
    });

    return list.sort(
      (a: any, b: any) =>
        a.sortRank - b.sortRank || a.stock - b.stock || +new Date(a.expiryDate) - +new Date(b.expiryDate),
    );
  }, [data]);

  const lowStockCount = rows.filter((r: any) => r.stock <= 10).length;
  const expiringCount = rows.filter((r: any) => daysUntil(r.expiryDate) <= 30).length;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Stock Alerts</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
        <span className="mr-4 font-medium">Total low stock: {lowStockCount}</span>
        <span className="font-medium">Total expiring soon: {expiringCount}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">User name</th>
              <th className="px-3 py-2">User email</th>
              <th className="px-3 py-2">Medicine name</th>
              <th className="px-3 py-2">Stock remaining</th>
              <th className="px-3 py-2">Expiry date</th>
              <th className="px-3 py-2">Alert type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row._id} className="border-t border-gray-100">
                <td className="px-3 py-2">{row.user?.name || "-"}</td>
                <td className="px-3 py-2">{row.user?.email || "-"}</td>
                <td className="px-3 py-2 font-medium">{row.name}</td>
                <td className="px-3 py-2">{row.stock}</td>
                <td className="px-3 py-2">{new Date(row.expiryDate).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      row.alertType === "Critical"
                        ? "bg-red-100 text-red-700"
                        : row.alertType === "Expiring Soon"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {row.alertType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
