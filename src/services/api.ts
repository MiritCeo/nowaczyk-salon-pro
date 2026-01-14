import axios from 'axios';

// ============================================
// TRYB TESTOWY - WYŁĄCZ LOGOWANIE
// ============================================
const TEST_MODE_NO_AUTH = false; // ⚠️ ZMIEŃ NA false PO TESTOWANIU!
// ============================================

// API URL - automatycznie wykrywa środowisko
// W produkcji używa względnej ścieżki, w developmentie pełnego URL
const getApiUrl = () => {
  // Jeśli jesteśmy w przeglądarce i nie jesteśmy na localhost, użyj względnej ścieżki
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost/nowaczyk-salon-pro/api';
    }
    // W produkcji użyj względnej ścieżki
    return '/api';
  }
  return '/api';
};

const API_URL = getApiUrl();

// Konfiguracja axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Interceptor - dodaj token do każdego żądania
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor - obsługa błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TRYB TESTOWY - nie przekierowuj na login
    if (TEST_MODE_NO_AUTH) {
      console.log('🧪 TRYB TESTOWY: Ignoruję błąd 401');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Unauthorized - wyloguj użytkownika
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/login', { email, password }),
  
  logout: () => 
    api.post('/logout'),
  
  me: () => 
    api.get('/me'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard'),
};

// Clients API
export const clientsAPI = {
  getAll: (params?: { search?: string; sort_by?: string; sort_order?: string }) => 
    api.get('/clients', { params }),
  
  getOne: (id: string) => 
    api.get(`/clients/${id}`),
  
  create: (data: any) => 
    api.post('/clients', data),
  
  update: (id: string, data: any) => 
    api.put(`/clients/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/clients/${id}`),
};

// Cars API
export const carsAPI = {
  getAll: (params?: { client_id?: string }) => 
    api.get('/cars', { params }),
  
  getOne: (id: string) => 
    api.get(`/cars/${id}`),
  
  create: (data: any) => 
    api.post('/cars', data),
  
  update: (id: string, data: any) => 
    api.put(`/cars/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/cars/${id}`),
};

// Services API
export const servicesAPI = {
  getAll: (params?: { active_only?: boolean; category?: string; search?: string }) => 
    api.get('/services', { params }),
  
  getOne: (id: string) => 
    api.get(`/services/${id}`),
  
  create: (data: any) => 
    api.post('/services', data),
  
  update: (id: string, data: any) => 
    api.put(`/services/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/services/${id}`),
};

// Employees API
export const employeesAPI = {
  getAll: () => 
    api.get('/employees'),
  create: (data: any) =>
    api.post('/employees', data),
  update: (id: string, data: any) =>
    api.put(`/employees/${id}`, data),
  delete: (id: string) =>
    api.delete(`/employees/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params?: { 
    status?: string; 
    client_id?: string; 
    employee_id?: string; 
    date?: string;
    start_date?: string;
    end_date?: string;
    filter?: 'today' | 'tomorrow' | 'upcoming';
  }) => 
    api.get('/appointments', { params }),
  
  getOne: (id: string) => 
    api.get(`/appointments/${id}`),
  
  create: (data: any) => 
    api.post('/appointments', data),
  
  update: (id: string, data: any) => 
    api.put(`/appointments/${id}`, data),
  
  updateStatus: (id: string, status: string) => 
    api.patch(`/appointments/${id}/status`, { status }),
  
  delete: (id: string) => 
    api.delete(`/appointments/${id}`),
  
  getStats: () => 
    api.get('/appointments/stats'),
};

export default api;
