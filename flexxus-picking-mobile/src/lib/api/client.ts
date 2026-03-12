import Constants from 'expo-constants'
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { queryClient } from '../../app/queryClient'
import { unwrapLaravelEnvelope } from './envelope'
import { normalizeApiError } from './errors'
import { useAuthStore } from '../../stores/auth-store'

const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrapLaravelEnvelope(response.data)
    return response
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearSession()
      queryClient.clear()
    }

    return Promise.reject(normalizeApiError(error))
  },
)
