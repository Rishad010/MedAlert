import { useEffect, useState } from "react";
import { api } from "../services/api";

// AdminDashboard.tsx
// Single-file React admin dashboard for your pharmacy backend.
// - Tailwind classes used for styling (no custom CSS required)
// - Expects backend endpoints:
//    GET  /api/pharmacy/orders        (returns array of orders)
//    PUT  /api/pharmacy/orders/:id/status  (body: { status, courier?, trackingId? })
// - Auth: Bearer token read from localStorage.key 'token' OR enter token in the UI.

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>(
    localStorage.getItem("token") || ""
  );
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let t: any;
    if (autoRefresh) {
      t = setInterval(fetchOrders, 10000); // every 10s
    }
    return () => clearInterval(t);
  }, [autoRefresh]);

  const authHeaders = () => {
    const tkn = token || localStorage.getItem("token") || "";
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  };

  async function fetchOrders() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/pharmacy/orders", { headers: authHeaders() });
      setOrders(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }

  function saveToken() {
    localStorage.setItem("token", token);
    fetchOrders();
  }

  const filtered = orders
    .filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        o.customerName?.toLowerCase().includes(s) ||
        o._id?.toString().toLowerCase().includes(s) ||
        (o.phone || "").includes(s) ||
        (o.items || [])
          .map((it: any) => `${it.name} ${it.sku}`.toLowerCase())
          .join(" ")
          .includes(s)
      );
    })
    .filter((o) => (statusFilter ? o.status === statusFilter : true));

  async function updateStatus(
    orderId: string,
    newStatus: string,
    courier?: string,
    trackingId?: string
  ) {
    try {
      setLoading(true);
      await api.put(
        `/pharmacy/orders/${orderId}/status`,
        { status: newStatus, courier, trackingId },
        { headers: authHeaders() }
      );
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Pharmacy Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste API token (or leave if stored)"
              className="px-3 py-2 border rounded-md text-sm w-80"
            />
            <button
              onClick={saveToken}
              className="rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
            >
              Save & Refresh
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
          </div>
        </header>

        <section className="mb-6 rounded-lg border border-emerald-200/50 bg-white/95 p-4 shadow-[0_8px_30px_-8px_rgba(15,110,86,0.12)] backdrop-blur-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, order id, phone, medicine..."
              className="px-3 py-2 border rounded-md w-80 text-sm"
            />
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Received">Received</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button
              onClick={fetchOrders}
              className="rounded-md bg-primary-800 px-3 py-2 text-sm text-white hover:bg-primary-900"
            >
              Refresh
            </button>
            <div className="ml-auto text-sm text-gray-600">
              Found: {filtered.length}
            </div>
          </div>
        </section>

        <main>
          <div className="overflow-x-auto rounded-lg border border-emerald-200/50 bg-white/95 shadow-[0_8px_30px_-8px_rgba(15,110,86,0.12)] backdrop-blur-sm">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-primary-100/80 text-left">
                  <th className="px-4 py-3 text-sm">Order ID</th>
                  <th className="px-4 py-3 text-sm">Customer</th>
                  <th className="px-4 py-3 text-sm">Items</th>
                  <th className="px-4 py-3 text-sm">Total</th>
                  <th className="px-4 py-3 text-sm">Status</th>
                  <th className="px-4 py-3 text-sm">Created</th>
                  <th className="px-4 py-3 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      Loading orders...
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}

                {filtered.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="px-4 py-3 text-sm">{o._id}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(o.items || [])
                        .map((it: any) => `${it.name} x${it.quantity}`)
                        .slice(0, 3)
                        .join(", ")}
                      {o.items && o.items.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{o.items.length - 3} more
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">₹{o.totalAmount}</td>
                    <td className="px-4 py-3 text-sm">{o.status}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="rounded bg-primary-600 px-2 py-1 text-sm text-white hover:bg-primary-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(o._id, nextStatus(o.status))
                          }
                          className="rounded bg-primary-500 px-2 py-1 text-sm text-white hover:bg-primary-600"
                        >
                          {nextActionText(o.status)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={updateStatus}
          />
        )}

        {error && <div className="mt-4 text-red-600">Error: {error}</div>}

        <footer className="mt-8 text-center text-sm text-gray-500">
          MedAlert Pharmacy Admin — simple dashboard for orders & shipping
        </footer>
      </div>
    </div>
  );
}

function nextStatus(current: string) {
  if (!current) return "Received";
  if (current === "Received") return "Packed";
  if (current === "Packed") return "Shipped";
  if (current === "Shipped") return "Delivered";
  return "Delivered";
}

function nextActionText(current: string) {
  if (!current) return "Receive";
  if (current === "Received") return "Mark Packed";
  if (current === "Packed") return "Mark Shipped";
  if (current === "Shipped") return "Mark Delivered";
  return "Done";
}

function OrderModal({ order, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.tracking?.courier || "");
  const [trackingId, setTrackingId] = useState(
    order.tracking?.trackingId || ""
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      await onUpdate(order._id, status, courier, trackingId);
    } catch (err) {
      console.error(err);
      alert("Failed to save status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl rounded-xl border border-emerald-200/60 bg-white/95 p-6 shadow-[0_20px_50px_-12px_rgba(15,110,86,0.25)] backdrop-blur-md">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Order {order._id}</h2>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Customer</h3>
            <div className="text-sm">{order.customerName}</div>
            <div className="text-xs text-gray-500">{order.phone}</div>

            <h3 className="mt-3 font-medium">Address</h3>
            <div className="text-sm">{order.address.line1}</div>
            <div className="text-sm">
              {order.address.city} - {order.address.pincode}
            </div>
            <div className="text-sm">{order.address.state}</div>

            <h3 className="mt-3 font-medium">Prescription</h3>
            {order.prescription ? (
              <a
                href={order.prescription.fileUrl || order.prescription}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary-600 underline hover:text-primary-700"
              >
                View uploaded prescription
              </a>
            ) : (
              <div className="text-sm text-gray-500">
                No prescription uploaded
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium">Items</h3>
            <ul className="text-sm list-disc ml-5">
              {order.items.map((it: any) => (
                <li key={it.sku}>
                  {it.name} ({it.sku}) × {it.quantity} — ₹
                  {it.price * it.quantity}
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <div className="text-sm">Subtotal: ₹{order.totalAmount}</div>
              <div className="text-sm">Payment: {order.paymentMethod}</div>
              <div className="text-sm">Status: {order.status}</div>
            </div>

            <div className="mt-4">
              <label className="block text-sm">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 px-3 py-2 border rounded w-full text-sm"
              >
                <option>Received</option>
                <option>Packed</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>

              <label className="block text-sm mt-3">Courier (optional)</label>
              <input
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="mt-1 px-3 py-2 border rounded w-full text-sm"
              />

              <label className="block text-sm mt-3">
                Tracking ID (optional)
              </label>
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="mt-1 px-3 py-2 border rounded w-full text-sm"
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-emerald-200/80 bg-white px-4 py-2 hover:bg-primary-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
