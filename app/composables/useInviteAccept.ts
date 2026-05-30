import { invitesService } from '~/services/invites.service'
import {
  isEmailAlreadyRegisteredError,
  toRegisterPlayerErrorMessage,
} from '~/utils/registerPlayerErrors'

export type InviteAcceptStatus = 'loading' | 'invalid' | 'ready'

const MIN_INVITE_TOKEN_LENGTH = 20

export interface InviteAcceptFormPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

/**
 * Davet kabul sayfası — token doğrulama + oyuncu kaydı.
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/invite.md
 * @see https://github.com/gokturkdogan/lineup-api/blob/main/docs/register-player.md
 */
export function useInviteAccept() {
  const route = useRoute()
  const router = useRouter()
  const { registerPlayer, loading } = useAuth()

  const inviteToken = ref<string | null>(null)
  const organizationName = ref('')
  const status = ref<InviteAcceptStatus>('loading')
  const submitError = ref<string | null>(null)

  let requestId = 0

  function readTokenFromRoute(): string | null {
    const token = route.query.token
    if (typeof token !== 'string') return null
    return token.trim() || null
  }

  async function validateInviteToken() {
    const currentRequest = ++requestId
    const token = readTokenFromRoute()

    submitError.value = null

    if (!token || token.length < MIN_INVITE_TOKEN_LENGTH) {
      inviteToken.value = null
      organizationName.value = ''
      status.value = 'invalid'
      return
    }

    inviteToken.value = token
    status.value = 'loading'

    try {
      const result = await invitesService.validateInvite(token)
      if (currentRequest !== requestId) return

      organizationName.value = result.organizationName
      status.value = 'ready'
    } catch {
      if (currentRequest !== requestId) return

      organizationName.value = ''
      status.value = 'invalid'
    }
  }

  async function submitRegistration(payload: InviteAcceptFormPayload) {
    if (!inviteToken.value || status.value !== 'ready' || loading.value) return

    submitError.value = null

    try {
      await registerPlayer({
        inviteToken: inviteToken.value,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        password: payload.password,
      })

      await router.replace({ path: '/login', query: { registered: '1' } })
    } catch (error) {
      submitError.value = toRegisterPlayerErrorMessage(error)

      if (isEmailAlreadyRegisteredError(error)) {
        return { emailConflict: true as const }
      }

      throw error
    }
  }

  watch(
    () => route.query.token,
    () => {
      void validateInviteToken()
    },
  )

  onMounted(() => {
    void validateInviteToken()
  })

  return {
    inviteToken,
    organizationName,
    status,
    submitError,
    loading,
    validateInviteToken,
    submitRegistration,
  }
}
