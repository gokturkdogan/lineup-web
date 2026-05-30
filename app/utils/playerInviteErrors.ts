import { ApiError } from '~/types/api'
import {
  PlayerInviteError,
  type PlayerInviteErrorView,
} from '~/types/player'

const GENERIC_VIEW: PlayerInviteErrorView = PlayerInviteError.generic().toView()

/**
 * Bilinen davet hatalarını UI görünümüne çevirir.
 * Backend entegrasyonunda ApiError mesaj/kodu burada eşlenir.
 */
export function toPlayerInviteErrorView(error: unknown): PlayerInviteErrorView {
  if (error instanceof PlayerInviteError) {
    return error.toView()
  }

  if (error instanceof ApiError) {
    const normalized = error.message.toLowerCase()

    if (
      error.status === 403
      || normalized.includes('email not verified')
      || normalized.includes('e-posta doğrula')
    ) {
      return PlayerInviteError.emailNotVerified().toView()
    }

    if (error.status === 429) {
      return PlayerInviteError.inviteLimitReached().toView()
    }

    return PlayerInviteError.generic(error.message).toView()
  }

  return GENERIC_VIEW
}
