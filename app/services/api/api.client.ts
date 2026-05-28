import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ApiError, type ApiErrorBody } from '~/types/api'

/**
 * Cookie that stores the JWT access token. Kept in one place so server and
 * client code agree on the name.
 */
export const ACCESS_TOKEN_COOKIE = 'access_token'

/**
 * Cookie that stores the opaque refresh token (not a JWT).
 * Used by `POST /auth/refresh` when the access token expires.
 */
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

/** Karşılama ekranı — oturumsuz kullanıcının giriş noktası. */
export const WELCOME_ROUTE = '/'

/** Oturum gerektirmeyen auth sayfaları (401 yönlendirmesi atlanır). */
export const GUEST_AUTH_ROUTES = ['/', '/login', '/register'] as const

let _instance: AxiosInstance | null = null
let _redirectingToLogin = false

interface CreateApiClientOptions {
  baseURL: string
  /** Return the current access token (string) or `null` if unauthenticated. */
  getToken: () => string | null | undefined
  /** Called when the API responds with 401. */
  onUnauthorized: () => void
}

const createApiClient = ({
  baseURL,
  getToken,
  onUnauthorized,
}: CreateApiClientOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 20_000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status ?? error.response?.data?.meta?.statusCode ?? 0
      const body = error.response?.data
      const message =
        body?.message ||
        error.message ||
        'Beklenmeyen bir ağ hatası oluştu. Lütfen tekrar deneyin.'

      if (status === 401) {
        onUnauthorized()
      }

      return Promise.reject(new ApiError(status, message, body))
    },
  )

  return instance
}

/**
 * Lazily-instantiated shared Axios instance.
 *
 * Implemented as a singleton getter rather than created at import-time so
 * that `useRuntimeConfig()` and `useCookie()` are only touched inside a
 * valid Nuxt context.
 */
export const useApiClient = (): AxiosInstance => {
  if (_instance) return _instance

  const config = useRuntimeConfig()
  const tokenCookie = useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  _instance = createApiClient({
    baseURL: config.public.apiBaseUrl,
    getToken: () => tokenCookie.value,
    onUnauthorized: () => {
      tokenCookie.value = null

      const router = useRouter()
      const route = useRoute()

      if (_redirectingToLogin) return
      if (GUEST_AUTH_ROUTES.includes(route.path as (typeof GUEST_AUTH_ROUTES)[number])) return

      _redirectingToLogin = true
      router
        .replace({ path: WELCOME_ROUTE, query: { redirect: route.fullPath } })
        .finally(() => {
          _redirectingToLogin = false
        })
    },
  })

  return _instance
}

/**
 * Minimal typed helpers. Prefer these over reaching for the raw axios
 * instance in feature code.
 */
export const api = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return useApiClient()
      .get<T>(url, config)
      .then((r) => r.data)
  },
  post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return useApiClient()
      .post<T>(url, body, config)
      .then((r) => r.data)
  },
  put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return useApiClient()
      .put<T>(url, body, config)
      .then((r) => r.data)
  },
  patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
    return useApiClient()
      .patch<T>(url, body, config)
      .then((r) => r.data)
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return useApiClient()
      .delete<T>(url, config)
      .then((r) => r.data)
  },
}
