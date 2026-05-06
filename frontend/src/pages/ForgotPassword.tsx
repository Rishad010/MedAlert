import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Pill } from "lucide-react";
import { authAPI } from "../services/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid email");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(parsed.data.email);
      setSuccessEmail(parsed.data.email);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Pill className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">MedAlert</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {successEmail ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-fit rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-700" />
            </div>
            <p className="text-sm text-gray-700">
              Check your email — we've sent a password reset link to{" "}
              <span className="font-semibold">{successEmail}</span>. It expires in 15 minutes.
            </p>
            <Link to="/login" className="text-sm font-medium text-emerald-700 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#0f6e56] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c5a47] disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
