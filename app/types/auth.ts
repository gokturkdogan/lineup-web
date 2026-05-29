import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

/**
 * `POST /auth/register/owner` istek gövdesi.
 * API alan adları camelCase (firstName / lastName) olduğu için aynen yansıtılır.
 */
export interface RegisterOwnerPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

/**
 * `POST /auth/register/owner` başarı cevabının `data` alanı.
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  /** Access token ömrü — saniye cinsinden (ör. 900 = 15 dk). */
  accessTokenExpiresIn: number
  tokenType: 'Bearer'
}

/**
 * Access token JWT payload claim'leri.
 * `iat` ve `exp` zaman damgaları opsiyoneldir; UI için ihtiyaç olduğunda kullanılır.
 */
export interface AccessTokenClaims {
  sub: string
  organizationId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthState {
  token: string | null
  user: User | null
}

/**
 * `POST /auth/verify-email` istek gövdesi.
 * `token` mail'deki bağlantının query parametresinden gelir (opaque, tek kullanımlık).
 */
export interface VerifyEmailPayload {
  token: string
}
