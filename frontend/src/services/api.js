import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');

      if (tokens.refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });
          localStorage.setItem('tokens', JSON.stringify({
            ...tokens,
            access: data.access,
          }));
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    const message = error.response?.data?.error 
      || error.response?.data?.detail 
      || 'Something went wrong';
    
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Auth APIs ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getUsers: (params) => api.get('/auth/users/', { params }),
  updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
};

// ─── Product APIs ────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  getCategories: () => api.get('/products/categories/'),
  getByCategory: (categoryId, params) => api.get(`/products/categories/${categoryId}/`, { params }),
  getFeatured: () => api.get('/products/featured/'),
  // Admin
  adminList: (params) => api.get('/products/admin/', { params }),
  adminCreate: (data) => api.post('/products/admin/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminUpdate: (id, data) => api.patch(`/products/admin/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminDelete: (id) => api.delete(`/products/admin/${id}/`),
  adminCategories: () => api.get('/products/admin/categories/'),
  adminCreateCategory: (data) => api.post('/products/admin/categories/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminUpdateCategory: (id, data) => api.patch(`/products/admin/categories/${id}/`, data),
  adminDeleteCategory: (id) => api.delete(`/products/admin/categories/${id}/`),
  getLowStock: () => api.get('/products/admin/low-stock/'),
};

// ─── Cart APIs ───────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart/'),
  add: (product_id, quantity = 1) => api.post('/cart/add/', { product_id, quantity }),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}/`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}/`),
  clear: () => api.delete('/cart/clear/'),
};

// ─── Order APIs ──────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders/create/', data),
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}/`),
  // Notifications
  getNotifications: () => api.get('/orders/notifications/'),
  markNotificationRead: (id) => api.patch(`/orders/notifications/${id}/read/`),
  // Admin
  adminList: (params) => api.get('/orders/admin/', { params }),
  adminDetail: (id) => api.get(`/orders/admin/${id}/`),
  adminProcessing: (id, data) => api.patch(`/orders/admin/${id}/processing/`, data),
  adminDelivered: (id) => api.patch(`/orders/admin/${id}/delivered/`),
  adminDashboard: () => api.get('/orders/admin/dashboard/'),
};

// ─── Payment APIs ────────────────────────────────────────────
export const paymentAPI = {
  createCheckout: (orderId) => api.post('/payments/create-checkout-session/', { order_id: orderId }),
  verify: (sessionId) => api.post('/payments/verify/', { session_id: sessionId }),
  getStatus: (orderId) => api.get(`/payments/status/${orderId}/`),
  refund: (paymentId) => api.post(`/payments/refund/${paymentId}/`),
};

// ─── Supplier APIs ───────────────────────────────────────────
export const supplierAPI = {
  // Admin
  getAll: (params) => api.get('/suppliers/', { params }),
  create: (data) => api.post('/suppliers/', data),
  update: (id, data) => api.patch(`/suppliers/${id}/`, data),
  delete: (id) => api.delete(`/suppliers/${id}/`),
  getPurchases: (params) => api.get('/suppliers/purchases/', { params }),
  createPurchase: (data) => api.post('/suppliers/purchases/', data),
  // Supplier Order Fulfillment
  dashboard: () => api.get('/suppliers/dashboard/'),
  getOrders: (params) => api.get('/suppliers/orders/', { params }),
  acceptOrder: (id) => api.patch(`/suppliers/orders/${id}/accept/`),
  rejectOrder: (id) => api.patch(`/suppliers/orders/${id}/reject/`),
  shipOrder: (id, data) => api.patch(`/suppliers/orders/${id}/shipped/`, data),
};

// ─── Complaint APIs ──────────────────────────────────────────
export const complaintAPI = {
  create: (data) => api.post('/complaints/create/', data),
  getAll: () => api.get('/complaints/'),
  getById: (id) => api.get(`/complaints/${id}/`),
  // Admin
  adminList: (params) => api.get('/complaints/admin/', { params }),
  adminUpdate: (id, data) => api.patch(`/complaints/admin/${id}/`, data),
};

// ─── Recommendation APIs ─────────────────────────────────────
export const recommendationAPI = {
  getRelated: (productId) => api.get(`/recommendations/related/${productId}/`),
  getTrending: () => api.get('/recommendations/trending/'),
  getForUser: () => api.get('/recommendations/for-you/'),
};

// ─── Report APIs ─────────────────────────────────────────────
export const reportAPI = {
  sales: (params) => api.get('/reports/sales/', { params }),
  products: () => api.get('/reports/products/'),
  customers: () => api.get('/reports/customers/'),
};
