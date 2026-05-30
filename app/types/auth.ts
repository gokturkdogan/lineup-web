import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
}

/** `POST /auth/login` başarı cevabının `data` alanı (register ile aynı). */
export type LoginResponse = AuthTokens

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
 * `POST /auth/register/player` istek gövdesi.
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/register-player.md
 */
export interface RegisterPlayerPayload {
  inviteToken: string
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

/**
 * `POST /auth/forgot-password` istek gövdesi.
 * Public endpoint; hesap var/yok ayırt edilmeksizin her durumda 204 döner.
 */
export interface ForgotPasswordPayload {
  email: string
}

/**
 * `POST /auth/reset-password` istek gövdesi.
 * `token` mail'deki bağlantının query parametresinden gelir (TTL 30 dk).
 */
export interface ResetPasswordPayload {
  token: string
  newPassword: string
}
