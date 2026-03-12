import { AxiosError } from 'axios'

export type ApiFieldErrors = Record<string, string[]>

export class ApiError extends Error {
  status?: number
  code?: string
  fields?: ApiFieldErrors

  constructor(message: string, options: { status?: number; code?: string; fields?: ApiFieldErrors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.fields = options.fields
  }
}

type BackendErrorBody = {
  message?: string
  error?: string
  errors?: ApiFieldErrors
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorBody | undefined
    const status = error.response?.status

    return new ApiError(
      data?.message ?? data?.error ?? 'No pudimos completar la solicitud. Volve a intentar.',
      {
        status,
        fields: data?.errors,
      },
    )
  }

  return new ApiError('Ocurrio un error inesperado. Revisa la conexion y reintenta.')
}
