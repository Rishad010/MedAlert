import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI, pharmacyAPI } from "../../services/api";

const statusTabs = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Received" },
  { label: "Processing", value: "Packed" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
];

export function AdminOrders() {
  const [status, setStatus] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    status: "Received",
    courier: "",
    trackingId: "",
  });
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: async () =>
      (await adminAPI.getOrders(status === "All" ? undefined : status)).data,
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; status: string; courier?: string; trackingId?: string }) =>
      pharmacyAPI.updateOrderStatus(params.id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setEditingId(null);
    },
  });

  const rows = useMemo(() => data || [], [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              status === tab.value ? "bg-[#0f6e56] text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Order ID</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Items count</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Courier</th>
              <th className="px-3 py-2">Tracking ID</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order: any) => (
              <tr key={order._id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{order._id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{order.user?.name || order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.user?.email}</div>
                </td>
                <td className="px-3 py-2">{order.items?.length || 0}</td>
                <td className="px-3 py-2">₹{order.totalAmount || 0}</td>
                <td className="px-3 py-2">{order.tracking?.courier || "-"}</td>
                <td className="px-3 py-2">{order.tracking?.trackingId || "-"}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-[#ecf7f3] px-2 py-0.5 text-xs text-[#0f6e56]">
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {editingId === order._id ? (
                    <div className="space-y-2">
                      <select
                        value={formState.status}
                        onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1"
                      >
                        <option value="Received">Received</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <input
                        value={formState.courier}
                        onChange={(e) => setFormState({ ...formState, courier: e.target.value })}
                        placeholder="Courier"
                        className="w-full rounded border border-gray-300 px-2 py-1"
                      />
                      <input
                        value={formState.trackingId}
                        onChange={(e) =>
                          setFormState({ ...formState, trackingId: e.target.value })
                        }
                        placeholder="Tracking ID"
                        className="w-full rounded border border-gray-300 px-2 py-1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateMutation.mutate({
                              id: order._id,
                              status: formState.status,
                              courier: formState.courier,
                              trackingId: formState.trackingId,
                            })
                          }
                          className="rounded bg-[#0f6e56] px-2 py-1 text-xs text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(order._id);
                        setFormState({
                          status: order.status || "Received",
                          courier: order.tracking?.courier || "",
                          trackingId: order.tracking?.trackingId || "",
                        });
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
