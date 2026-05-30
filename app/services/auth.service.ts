import { api } from './api/api.client'
import type { ApiEnvelope } from '~/types/api'
import type {
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterOwnerPayload,
  RegisterPlayerPayload,
  ResetPasswordPayload,
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
  /**
   * Oturum açma.
   *
   * Cevap yalnızca token çiftini içerir (`ApiEnvelope<AuthTokens>`); user bilgisi
   * JWT claim'lerinden lokal olarak oluşturulur.
   */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const envelope = await api.post<
      ApiEnvelope<AuthTokens>,
      LoginPayload
    >('/auth/login', payload)
    return envelope.data
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
   * Davet linki ile oyuncu (PLAYER) kaydı.
   * Başarıda token çifti döner — ayrı login gerekmez.
   *
   * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/register-player.md
   */
  async registerPlayer(payload: RegisterPlayerPayload): Promise<AuthTokens> {
    const envelope = await api.post<
      ApiEnvelope<AuthTokens>,
      RegisterPlayerPayload
    >('/auth/register/player', payload)
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

  /**
   * Şifre sıfırlama bağlantısı talebi. Public endpoint — e-posta sayımını
   * (enumeration) önlemek için hesap var/yok ayırt edilmeksizin her zaman
   * `204` döner. UI nötr bir başarı mesajı göstermeli.
   */
  forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    return api.post<void, ForgotPasswordPayload>('/auth/forgot-password', payload)
  },

  /**
   * Parola sıfırlama. Public endpoint; başarıda `204` döner ve kullanıcının
   * tüm cihazlardaki oturumları (refresh token'lar) iptal edilir. Token TTL'i
   * 30 dakikadır; geçersiz/süresi dolmuş tüm durumlar tek bir 400 ile döner.
   */
  resetPassword(payload: ResetPasswordPayload): Promise<void> {
    return api.post<void, ResetPasswordPayload>('/auth/reset-password', payload)
  },
}
