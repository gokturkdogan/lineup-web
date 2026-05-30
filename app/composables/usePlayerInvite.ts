import { playersService } from '~/services/players.service'
import { toPlayerInviteErrorView } from '~/utils/playerInviteErrors'
import type { PlayerInviteErrorView } from '~/types/player'

type InviteStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Oyuncu davet bağlantısı — modal açılışında fetch, kapanışta reset.
 */
export function usePlayerInvite() {
  const status = ref<InviteStatus>('idle')
  const inviteUrl = ref<string | null>(null)
  const inviteError = ref<PlayerInviteErrorView | null>(null)

  let requestId = 0

  async function fetchInviteLink() {
    const currentRequest = ++requestId

    status.value = 'loading'
    inviteUrl.value = null
    inviteError.value = null

    try {
      const result = await playersService.createInviteLink()
      if (currentRequest !== requestId) return

      inviteUrl.value = result.url
      status.value = 'ready'
    } catch (error) {
      if (currentRequest !== requestId) return

      inviteError.value = toPlayerInviteErrorView(error)
      status.value = 'error'
    }
  }

  function reset() {
    requestId += 1
    status.value = 'idle'
    inviteUrl.value = null
    inviteError.value = null
  }

  return {
    status,
    inviteUrl,
    inviteError,
    fetchInviteLink,
    reset,
  }
}
