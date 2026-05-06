import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import { AlertCircle, Pill } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPasswordWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-50 px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-3 text-xl font-bold text-gray-900">
            Invalid reset link — please request a new one
          </h1>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            Back to forgot password
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormData) => {
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid form");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await resetPasswordWithToken(token, parsed.data.newPassword);
      toast.success("Password reset successful");
      navigate("/dashboard");
    } catch (err: any) {
      setError("This reset link is invalid or has expired.");
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
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}{" "}
              <Link to="/forgot-password" className="font-medium underline">
                Request a new one
              </Link>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              {...register("newPassword")}
            />
            {errors.newPassword?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#0f6e56] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c5a47] disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
