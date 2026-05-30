import { api } from './api/api.client'
import type { ApiEnvelope } from '~/types/api'
import type {
  CreateInvitePayload,
  InviteRecord,
  SendInviteEmailPayload,
  SendInviteEmailResult,
} from '~/types/invite'
import type { PlayerInviteLink } from '~/types/player'

/**
 * `/invites/*` endpoint'leri — owner/admin davet linki üretimi ve mail gönderimi.
 *
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/invite.md
 */
export const invitesService = {
  /**
   * Evrensel tek kullanımlık davet linki üretir (`POST /invites`).
   * OWNER/ADMIN + doğrulanmış e-posta gerekir.
   */
  async createInvite(payload: CreateInvitePayload = {}): Promise<PlayerInviteLink> {
    const envelope = await api.post<
      ApiEnvelope<InviteRecord>,
      CreateInvitePayload
    >('/invites', payload)

    const { inviteUrl, expiresAt, id } = envelope.data

    return {
      url: inviteUrl,
      expiresAt,
      id,
    }
  },

  /**
   * Üretilmiş davet linkini e-posta ile iletir (`POST /invites/send-email`).
   * `emailSent: false` → SMTP hatası; link hâlâ geçerlidir, manuel paylaşım mümkün.
   */
  async sendInviteEmail(payload: SendInviteEmailPayload): Promise<SendInviteEmailResult> {
    const envelope = await api.post<
      ApiEnvelope<SendInviteEmailResult>,
      SendInviteEmailPayload
    >('/invites/send-email', payload)

    return envelope.data
  },
}
