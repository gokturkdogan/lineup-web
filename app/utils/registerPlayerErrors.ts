import { ApiError } from '~/types/api'

const KNOWN_MESSAGES: Record<string, string> = {
  'This email is already registered.': 'Bu e-posta zaten kayıtlı.',
  'This invite link has expired.': 'Davet bağlantısının süresi dolmuş.',
  'This invite link has already been used.': 'Bu bağlantı zaten kullanılmış.',
  'This invite link is no longer valid.': 'Bağlantı artık geçerli değil.',
  'This invite link is invalid or has already been used.': 'Geçersiz davet bağlantısı.',
  'Invite is invalid or expired.': 'Bu davet bağlantısı geçersiz veya süresi dolmuş.',
}

/**
 * Oyuncu kayıt hatalarını kullanıcıya gösterilecek metne çevirir.
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/register-player.md
 */
export function toRegisterPlayerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return KNOWN_MESSAGES[error.message] ?? error.message
  }

  return 'Kayıt tamamlanamadı. Lütfen tekrar dene.'
}

export function isEmailAlreadyRegisteredError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409
}
