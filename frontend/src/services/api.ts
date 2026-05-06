import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  me: () => api.get('/auth/me'),
  updateProfile: (data: {        // add this
    name?: string;
    phone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  }) => api.patch('/auth/profile', data),
}

export const medicinesAPI = {
  getAll: () => api.get('/medicines'),
  getById: (id: string) => api.get(`/medicines/${id}`),
  create: (data: any) => api.post('/medicines', data),
  update: (id: string, data: any) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

export const remindersAPI = {
  getAll: () => api.get('/reminders'),
  acknowledge: (id: string) => api.put(`/reminders/${id}/acknowledge`),
}

export const pharmacyAPI = {
  // Products
  getProducts: () => api.get('/pharmacy/products'),

  // Orders
  placeOrder: (data: {
    customerName: string;
    phone: string;
    address: { line1: string; city: string; state: string; pincode: string };
    items: { sku: string; name: string; quantity: number; price: number }[];
    totalAmount: number;
    paymentMethod?: string;
    prescriptionUrl?: string;
  }) => api.post('/pharmacy/orders', data),

  // Admin only
  getAllOrders: () => api.get('/pharmacy/orders'),
  updateOrderStatus: (
    id: string,
    data: { status: string; courier?: string; trackingId?: string }
  ) => api.put(`/pharmacy/orders/${id}/status`, data),
}

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (search?: string) =>
    api.get("/admin/users", { params: search ? { search } : {} }),
  toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/status`),
  getOrders: (status?: string) =>
    api.get("/admin/orders", { params: status && status !== "All" ? { status } : {} }),
  getStockAlerts: () => api.get("/admin/stock-alerts"),
  getAnalytics: () => api.get("/admin/analytics"),
}

export const pushAPI = {
  subscribe: (subscription: PushSubscriptionJSON) =>
    api.post("/push/subscribe", { subscription }),
  unsubscribe: () => api.delete("/push/unsubscribe"),
};

export const assistantAPI = {
  // Streaming is handled directly with fetch in the component,
  // but we export the URL helper for consistency
  chatUrl: () => `${API_BASE_URL}/assistant/chat`,
};