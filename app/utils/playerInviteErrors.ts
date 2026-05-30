import { ApiError } from '~/types/api'
import {
  PlayerInviteError,
  type PlayerInviteErrorView,
} from '~/types/player'

const GENERIC_VIEW: PlayerInviteErrorView = PlayerInviteError.generic().toView()

/**
 * Bilinen davet hatalarını UI görünümüne çevirir.
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/invite.md
 */
export function toPlayerInviteErrorView(error: unknown): PlayerInviteErrorView {
  if (error instanceof PlayerInviteError) {
    return error.toView()
  }

  if (error instanceof ApiError) {
    if (error.errorCode === 'EMAIL_NOT_VERIFIED') {
      return PlayerInviteError.emailNotVerified().toView()
    }

    return PlayerInviteError.generic(error.message).toView()
  }

  return GENERIC_VIEW
}
