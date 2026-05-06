import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pill, Eye, EyeOff, Info, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { BackToLanding } from "../components/BackToLanding";

type LoginFormData = {
  email: string;
  password: string;
};

export function Login() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [demoType, setDemoType] = useState<"admin" | "user" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const demo = searchParams.get("demo");
    if (demo === "admin") {
      setValue("email", "admin@medalert.com");
      setValue("password", "Admin@123");
      setDemoType("admin");
      setShowDemoBanner(true);
    } else if (demo === "user") {
      setValue("email", "demo@medalert.app");
      setValue("password", "demo123");
      setDemoType("user");
      setShowDemoBanner(true);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (formData: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackToLanding />
      <div className="flex min-h-screen items-center justify-center bg-primary-50 py-12 px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="flex items-center">
                <Pill className="h-12 w-12 text-primary-600" />
                <span className="ml-2 text-3xl font-bold text-gray-900">
                  MedAlert
                </span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleLogin)}>
            {showDemoBanner && (
              <div className="flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                  <p className="text-sm text-green-800">
                    {demoType === "admin"
                      ? "Admin demo credentials have been pre-filled. Just click Sign in to explore the admin panel."
                      : "Demo credentials have been pre-filled. Click Sign in to explore MedAlert with sample data including medicines, reminders, and dashboard analytics."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoBanner(false)}
                  className="text-green-700 hover:text-green-900"
                  aria-label="Dismiss demo info"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-danger-50 p-4">
                <div className="text-sm text-danger-700">{error}</div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  {...register("email")}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
