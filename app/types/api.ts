/**
 * Generic shapes used by the REST API. Tighten these once endpoints are
 * finalised by the backend team.
 */

export interface ApiErrorBody {
  message?: string
  code?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly data?: ApiErrorBody

  constructor(status: number, message: string, data?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = data?.code
    this.data = data
  }
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}
