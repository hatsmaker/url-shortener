import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Url {
  id: string
  originalUrl: string
  shortCode: string
  userId?: string
  title?: string
  description?: string
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface CreateUrlRequest {
  originalUrl: string
  customCode?: string
  title?: string
  description?: string
}

export interface UpdateUrlRequest {
  customCode?: string
  title?: string
  description?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
}

// URLs API
export const urlsApi = {
  create: (data: CreateUrlRequest) => api.post<Url>('/urls', data),
  getMyUrls: (limit = 50, offset = 0) => 
    api.get<Url[]>(`/urls/my?limit=${limit}&offset=${offset}`),
  update: (id: string, data: UpdateUrlRequest) => 
    api.patch<Url>(`/urls/${id}`, data),
  delete: (id: string) => api.delete(`/urls/${id}`),
  getAnalytics: (shortCode: string) => 
    api.get(`/urls/${shortCode}/analytics`),
}

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
}

// Users API
export const usersApi = {
  getProfile: () => api.get<User>('/users/profile'),
}

export default api 