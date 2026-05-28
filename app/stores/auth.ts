import { defineStore } from 'pinia'
import { authService } from '~/services/auth.service'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '~/services/api/api.client'
import { decodeJwtPayload } from '~/utils/jwt'
import type {
  AccessTokenClaims,
  AuthTokens,
  LoginPayload,
  RegisterOwnerPayload,
} from '~/types/auth'
import type { User, UserRole } from '~/types/user'

const USER_COOKIE = 'lineup_user'
const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 gün

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user && !!useAuthStore().token,
    /**
     * Reading the cookie inside a getter keeps the store in sync with the
     * source-of-truth (`useCookie`) across SSR + hydration.
     */
    token(): string | null {
      return (
        useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
          sameSite: 'lax',
          secure: !import.meta.dev,
          path: '/',
        }).value ?? null
      )
    },
  },

  actions: {
    /**
     * Restore session from cookies. Safe to call on every app boot.
     */
    hydrate() {
      const userCookie = useCookie<User | null>(USER_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })
      if (userCookie.value && !this.user) {
        this.user = userCookie.value
      }
    },

    async login(payload: LoginPayload) {
      this.loading = true
      this.error = null
      try {
        const { accessToken, user } = await authService.login(payload)
        this._persist(accessToken, user)
      } catch (err) {
        const message =
          (err as { message?: string } | undefined)?.message ??
          'Giriş yapılamadı. Lütfen tekrar deneyin.'
        this.error = message
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Kulüp sahibi (OWNER) kaydı.
     *
     * Cevap yalnızca token çiftini içerir; user bilgisi:
     * - JWT claim'lerinden (`sub`, `organizationId`, `email`, `role`)
     * - Formdan gelen ad / soyad değerlerinden
     * birleştirilerek lokal olarak oluşturulur. Böylece ek bir `/users/me`
     * isteği gerekmez ve kayıt sonrası anında uygulama açılır.
     */
    async register(payload: RegisterOwnerPayload) {
      this.loading = true
      this.error = null
      try {
        const tokens = await authService.registerOwner(payload)
        const user = this._buildUserFromTokens(tokens, payload)
        this._setTokens(tokens)
        this._setUser(user)
      } catch (err) {
        const message =
          (err as { message?: string } | undefined)?.message ??
          'Kayıt yapılamadı. Lütfen tekrar deneyin.'
        this.error = message
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this._setTokens(null)
      this._setUser(null)
      this.error = null
    },

    // -------------------------------------------------------------------
    // Persistence helpers
    // -------------------------------------------------------------------

    _persist(token: string | null, user: User | null) {
      const tokenCookie = useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })
      const userCookie = useCookie<User | null>(USER_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })

      tokenCookie.value = token
      userCookie.value = user
      this.user = user
    },

    _setTokens(tokens: AuthTokens | null) {
      const accessCookie = useCookie<string | null>(ACCESS_TOKEN_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })
      const refreshCookie = useCookie<string | null>(REFRESH_TOKEN_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })

      accessCookie.value = tokens?.accessToken ?? null
      refreshCookie.value = tokens?.refreshToken ?? null
    },

    _setUser(user: User | null) {
      const userCookie = useCookie<User | null>(USER_COOKIE, {
        sameSite: 'lax',
        secure: !import.meta.dev,
        path: '/',
        maxAge: USER_COOKIE_MAX_AGE,
      })
      userCookie.value = user
      this.user = user
    },

    _buildUserFromTokens(
      tokens: AuthTokens,
      payload: RegisterOwnerPayload,
    ): User {
      const claims = decodeJwtPayload<AccessTokenClaims>(tokens.accessToken)
      return {
        id: claims?.sub ?? '',
        organizationId: claims?.organizationId ?? '',
        email: claims?.email ?? payload.email,
        role: (claims?.role as UserRole) ?? 'OWNER',
        name: payload.firstName,
        surname: payload.lastName,
        avatarUrl: null,
      }
    },
  },
})
