import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, pushAPI } from "../services/api";

// Reads VAPID public key from Vite env — add to your frontend .env:
// VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notifEmail, setNotifEmail] = useState(user?.notifications?.email ?? true);
  const [notifSms, setNotifSms] = useState(user?.notifications?.sms ?? false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [pushEnabled, setPushEnabled] = useState(user?.notifications?.push ?? false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  // Save name, phone, email/sms toggles
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await authAPI.updateProfile({
        name,
        phone,
        notifications: { email: notifEmail, sms: notifSms },
      });
      updateUser(res.data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Enable push: ask permission → subscribe → send to backend
  const handleEnablePush = async () => {
    setPushLoading(true);
    setPushError("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications are not supported in this browser.");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied. Please allow it in browser settings.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      await pushAPI.subscribe(subscription.toJSON());
      updateUser({ notifications: { ...user?.notifications, push: true } as any });
      setPushEnabled(true);
    } catch (err: any) {
      setPushError(err.message ?? "Failed to enable push notifications.");
    } finally {
      setPushLoading(false);
    }
  };

  // Disable push: unsubscribe from backend
  const handleDisablePush = async () => {
    setPushLoading(true);
    setPushError("");
    try {
      await pushAPI.unsubscribe();
      updateUser({ notifications: { ...user?.notifications, push: false } as any });
      setPushEnabled(false);
    } catch (err: any) {
      setPushError(err.message ?? "Failed to disable push notifications.");
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg space-y-6 rounded-xl border border-emerald-200/50 bg-white/95 p-6 shadow-[0_8px_30px_-8px_rgba(15,110,86,0.12)] backdrop-blur-sm">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* Name */}
      <div>
        <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="settings-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-emerald-200/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="settings-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone number <span className="text-gray-400">(for SMS alerts)</span>
        </label>
        <input
          id="settings-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91XXXXXXXXXX"
          className="w-full rounded-lg border border-emerald-200/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Email & SMS toggles */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Notification channels</p>
        <div className="space-y-2">
          {[
            { label: "Email", value: notifEmail, setter: setNotifEmail },
            { label: "SMS", value: notifSms, setter: setNotifSms },
          ].map(({ label, value, setter }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4 accent-primary-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Push notifications — separate section */}
      <div className="space-y-2 rounded-lg border border-emerald-100/80 bg-primary-50/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Browser push notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {pushEnabled ? "Currently enabled on this device." : "Get dose reminders directly in your browser."}
            </p>
          </div>
          <button
            onClick={pushEnabled ? handleDisablePush : handleEnablePush}
            disabled={pushLoading}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
              pushEnabled
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {pushLoading ? "..." : pushEnabled ? "Disable" : "Enable"}
          </button>
        </div>
        {pushError && <p className="text-xs text-red-500">{pushError}</p>}
      </div>

      {/* Feedback */}
      {success && <p className="text-sm font-medium text-primary-700">Settings saved!</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}