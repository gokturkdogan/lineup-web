import { invitesService } from '~/services/invites.service'
import { toPlayerInviteErrorView } from '~/utils/playerInviteErrors'
import { ApiError } from '~/types/api'
import type { PlayerInviteErrorView } from '~/types/player'

type InviteStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface SendInviteEmailOutcome {
  emailSent: boolean
}

/**
 * Oyuncu davet bağlantısı — modal açılışında fetch, kapanışta reset.
 */
export function usePlayerInvite() {
  const status = ref<InviteStatus>('idle')
  const inviteUrl = ref<string | null>(null)
  const inviteExpiresAt = ref<string | null>(null)
  const inviteError = ref<PlayerInviteErrorView | null>(null)

  let requestId = 0

  async function fetchInviteLink() {
    const currentRequest = ++requestId

    status.value = 'loading'
    inviteUrl.value = null
    inviteExpiresAt.value = null
    inviteError.value = null

    try {
      const result = await invitesService.createInvite()
      if (currentRequest !== requestId) return

      inviteUrl.value = result.url
      inviteExpiresAt.value = result.expiresAt ?? null
      status.value = 'ready'
    } catch (error) {
      if (currentRequest !== requestId) return

      inviteError.value = toPlayerInviteErrorView(error)
      status.value = 'error'
    }
  }

  async function sendInviteEmail(email: string): Promise<SendInviteEmailOutcome> {
    if (!inviteUrl.value) {
      throw new Error('Davet bağlantısı henüz oluşturulmadı.')
    }

    return invitesService.sendInviteEmail({
      inviteUrl: inviteUrl.value,
      email: email.trim(),
    })
  }

  function getSendEmailErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message
    }

    return 'Davet gönderilemedi. Lütfen tekrar dene.'
  }

  function reset() {
    requestId += 1
    status.value = 'idle'
    inviteUrl.value = null
    inviteExpiresAt.value = null
    inviteError.value = null
  }

  return {
    status,
    inviteUrl,
    inviteExpiresAt,
    inviteError,
    fetchInviteLink,
    sendInviteEmail,
    getSendEmailErrorMessage,
    reset,
  }
}
