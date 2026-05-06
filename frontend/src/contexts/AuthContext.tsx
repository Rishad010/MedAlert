// frontend/src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, authAPI } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin"; // 👈 added
  phone?: string;                      // add
  notifications?: {                    // add
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;         // 👈 added — convenience flag for route guards & UI
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setAuthSession: (authData: {
    token: string;
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  }) => void;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("/auth/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const setAuthSession = (authData: {
    token: string;
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  }) => {
    const { token, ...userData } = authData;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setAuthSession(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      setAuthSession(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      setAuthSession(response.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "This reset link is invalid or has expired.",
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  // Derived — no extra state needed, just reads user.role
  const isAdmin = user?.role === "admin"; // 👈 added

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        setAuthSession,
        resetPasswordWithToken,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}