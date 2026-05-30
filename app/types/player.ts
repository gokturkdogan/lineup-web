export interface PlayerInviteLink {
  url: string
  expiresAt?: string
}

export interface SendPlayerInvitePayload {
  email: string
  inviteUrl: string
}

export type PlayerInviteErrorCode =
  | 'EMAIL_NOT_VERIFIED'
  | 'INVITE_LIMIT_REACHED'
  | 'GENERIC'

export type PlayerInviteErrorAction =
  | 'resend-verification'
  | 'retry'
  | 'contact-support'

/** UI katmanına yansıtılacak hata görünümü */
export interface PlayerInviteErrorView {
  code: PlayerInviteErrorCode
  title: string
  message: string
  actionLabel?: string
  action?: PlayerInviteErrorAction
}

export class PlayerInviteError extends Error {
  readonly code: PlayerInviteErrorCode
  readonly title: string
  readonly actionLabel?: string
  readonly action?: PlayerInviteErrorAction

  constructor(options: {
    code: PlayerInviteErrorCode
    title: string
    message: string
    actionLabel?: string
    action?: PlayerInviteErrorAction
  }) {
    super(options.message)
    this.name = 'PlayerInviteError'
    this.code = options.code
    this.title = options.title
    this.actionLabel = options.actionLabel
    this.action = options.action
  }

  toView(): PlayerInviteErrorView {
    return {
      code: this.code,
      title: this.title,
      message: this.message,
      actionLabel: this.actionLabel,
      action: this.action,
    }
  }

  static emailNotVerified(): PlayerInviteError {
    return new PlayerInviteError({
      code: 'EMAIL_NOT_VERIFIED',
      title: 'E-posta doğrulaması gerekli',
      message:
        'Oyuncu davet edebilmeniz için önce e-postanızı onaylamanız gerekmektedir.',
      actionLabel: 'Doğrulama e-postası gönder',
      action: 'resend-verification',
    })
  }

  static inviteLimitReached(): PlayerInviteError {
    return new PlayerInviteError({
      code: 'INVITE_LIMIT_REACHED',
      title: 'Davet limitine ulaşıldı',
      message:
        'Bu ay oluşturabileceğiniz davet bağlantısı limitine ulaştınız. Daha sonra tekrar deneyin.',
      actionLabel: 'Tekrar dene',
      action: 'retry',
    })
  }

  static generic(message?: string): PlayerInviteError {
    return new PlayerInviteError({
      code: 'GENERIC',
      title: 'İşlem tamamlanamadı',
      message: message ?? 'Davet bağlantısı oluşturulamadı. Lütfen tekrar dene.',
      actionLabel: 'Tekrar dene',
      action: 'retry',
    })
  }
}
