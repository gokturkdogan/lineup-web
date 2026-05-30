import {
  PlayerInviteError,
  type PlayerInviteLink,
  type SendPlayerInvitePayload,
} from '~/types/player'

const MOCK_DELAY_MS = 1200
const MOCK_SEND_DELAY_MS = 800

/**
 * Dev mock — hata senaryosu önizlemesi.
 * `EMAIL_NOT_VERIFIED` | `INVITE_LIMIT_REACHED` | `null` (başarılı akış)
 */
const MOCK_CREATE_INVITE_ERROR: 'EMAIL_NOT_VERIFIED' | 'INVITE_LIMIT_REACHED' | null = null

/**
 * Oyuncu / takım davet endpoint'leri.
 * Backend hazır olunca mock kaldırılır; imza aynı kalır.
 */
export const playersService = {
  /**
   * Tek kullanımlık veya süreli davet bağlantısı üretir.
   * TODO: `POST /players/invites` ile değiştirilecek.
   */
  async createInviteLink(): Promise<PlayerInviteLink> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

    if (MOCK_CREATE_INVITE_ERROR === 'EMAIL_NOT_VERIFIED') {
      throw PlayerInviteError.emailNotVerified()
    }

    if (MOCK_CREATE_INVITE_ERROR === 'INVITE_LIMIT_REACHED') {
      throw PlayerInviteError.inviteLimitReached()
    }

    return {
      url: 'https://lineup.app/join/mock-invite-a8f3k2',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },

  /**
   * Davet bağlantısını hedef e-postaya gönderir.
   * TODO: `POST /players/invites/send` ile değiştirilecek.
   */
  async sendInviteByEmail(payload: SendPlayerInvitePayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_SEND_DELAY_MS))
    // TODO: POST /players/invites/send — payload.email, payload.inviteUrl
    void payload
  },
}
