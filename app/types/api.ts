/**
 * REST API zarf (envelope) yapısı ve ortak hata tipleri.
 * Sunucu tüm cevapları aşağıdaki sarmalayıcıyla döner.
 */

export interface ApiEnvelope<T> {
  data: T
  message: string
  meta: Record<string, unknown>
}

export interface ApiErrorMeta {
  statusCode?: number
  path?: string
  method?: string
  timestamp?: string
  errors?: string[]
  errorCode?: string
}

export interface ApiErrorBody {
  data?: null
  message?: string
  meta?: ApiErrorMeta
}

/**
 * Tüm HTTP hatalarını tek bir tip altında toplar. `axios` hata nesnesinin
 * yerine bu sınıf fırlatılır — UI katmanı sadece `ApiError`'ı tanır.
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly errors: string[]
  public readonly path?: string
  public readonly errorCode?: string
  public readonly data?: ApiErrorBody

  constructor(status: number, message: string, data?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = data?.meta?.errors ?? []
    this.path = data?.meta?.path
    this.errorCode = data?.meta?.errorCode
    this.data = data
  }
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}
