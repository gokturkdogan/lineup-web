/**
 * `/invites/*` API tipleri.
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/invite.md
 */

export interface CreateInvitePayload {
  /** Varsayılan 168 (7 gün). Min 1, max 720. */
  expiresInHours?: number
}

export interface InviteRecord {
  id: string
  organizationId: string
  status: string
  expiresAt: string
  consumedAt: string | null
  createdById: string
  createdAt: string
  token: string
  inviteUrl: string
}

export interface SendInviteEmailPayload {
  inviteUrl: string
  email: string
}

export interface SendInviteEmailResult {
  emailSent: boolean
}
