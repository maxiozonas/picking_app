import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Unwrap Laravel JSON response envelopes.
 *
 * Laravel's JsonResource wraps single resources in { data: {...} }.
 * AuthResource adds another layer: { success: true, data: { ... } }.
 * Paginated responses have { data: [...], meta: {...} } — leave those untouched.
 */
function unwrapLaravelEnvelope(response: AxiosResponse): AxiosResponse {
  const body = response.data

  // Leave paginated responses intact — they have data[] + meta
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray(body.data) &&
    body.meta != null
  ) {
    return response
  }

  // Unwrap { success: true, data: { ... } } (double-wrapped resources like auth)
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    'data' in body
  ) {
    response.data = body.data
    return response
  }

  // Unwrap { data: { ... } } (single Laravel resource)
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data !== null &&
    typeof body.data === 'object' &&
    !Array.isArray(body.data)
  ) {
    response.data = body.data
    return response
  }

  return response
}

// Response interceptor — unwrap envelope + handle auth errors
api.interceptors.response.use(
  (response) => unwrapLaravelEnvelope(response),
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state - ProtectedRoute will redirect to /login on next render
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api
