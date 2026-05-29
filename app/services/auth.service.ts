import { api } from './api/api.client'
import type { ApiEnvelope } from '~/types/api'
import type {
  AuthTokens,
  LoginPayload,
  LoginResponse,
  RegisterOwnerPayload,
  VerifyEmailPayload,
} from '~/types/auth'

/**
 * `/auth/*` endpoint'leri için ince, özellik odaklı sarmalayıcı.
 * Pinia store'larını ham HTTP detaylarından izole eder.
 *
 * API tüm cevapları `{ data, message, meta }` zarfı içinde döndürdüğü için
 * burada zarfın `data` alanını açar; çağıran katmanlar sadece payload'ı görür.
 */
export const authService = {
  login(payload: LoginPayload) {
    return api.post<LoginResponse, LoginPayload>('/auth/login', payload)
  },

  /**
   * Kulüp sahibi (OWNER) kaydı.
   *
   * @see docs: https://github.com/gokturkdogan/lineup-api/blob/main/docs/register-owner.md
   */
  async registerOwner(payload: RegisterOwnerPayload): Promise<AuthTokens> {
    const envelope = await api.post<
      ApiEnvelope<AuthTokens>,
      RegisterOwnerPayload
    >('/auth/register/owner', payload)
    return envelope.data
  },

  /**
   * E-posta doğrulama. Public endpoint — auth header gerekmez,
   * token tek başına yetki görevi görür. Başarıda `204 No Content` döner.
   * Token tek kullanımlıktır; istek yalnızca bir kez atılmalıdır.
   */
  verifyEmail(payload: VerifyEmailPayload): Promise<void> {
    return api.post<void, VerifyEmailPayload>('/auth/verify-email', payload)
  },

  /**
   * Doğrulama e-postasını yeniden gönderir. Authorization header gerektirir
   * (interceptor otomatik ekler). Kullanıcı sayımını (enumeration) önlemek
   * için her durumda `204` döner.
   */
  resendVerification(): Promise<void> {
    return api.post<void>('/auth/verify-email/resend')
  },
}
