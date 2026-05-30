<script setup lang="ts">
import { email as validateEmail } from '~/utils/validators'
import { playersService } from '~/services/players.service'
import { authService } from '~/services/auth.service'
import type { PlayerInviteErrorView } from '~/types/player'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const {
  status,
  inviteUrl,
  inviteError,
  fetchInviteLink,
  reset,
} = usePlayerInvite()

const copied = ref(false)
const showEmailForm = ref(false)
const targetEmail = ref('')
const emailError = ref<string | null>(null)
const sendingEmail = ref(false)
const emailSent = ref(false)
const resendStatus = ref<'idle' | 'sending' | 'sent' | 'failed'>('idle')
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

const isLoading = computed(() => status.value === 'loading')
const isReady = computed(() => status.value === 'ready' && !!inviteUrl.value)
const isError = computed(() => status.value === 'error' && !!inviteError.value)
const canSendEmail = computed(() => validateEmail(targetEmail.value) === null)

const errorVariant = computed(() => {
  const code = inviteError.value?.code
  if (code === 'EMAIL_NOT_VERIFIED') return 'warning'
  if (code === 'INVITE_LIMIT_REACHED') return 'info'
  return 'error'
})

const resetEmailForm = () => {
  showEmailForm.value = false
  targetEmail.value = ''
  emailError.value = null
  sendingEmail.value = false
  emailSent.value = false
  resendStatus.value = 'idle'
}

const close = () => {
  emit('update:modelValue', false)
}

const copyInviteLink = async () => {
  if (!inviteUrl.value) return

  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    copied.value = true

    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}

const openEmailForm = () => {
  showEmailForm.value = true
  emailSent.value = false
  emailError.value = null
}

const sendEmailInvite = async () => {
  if (!inviteUrl.value || sendingEmail.value) return

  const validationError = validateEmail(targetEmail.value)
  if (validationError) {
    emailError.value = validationError
    return
  }

  emailError.value = null
  sendingEmail.value = true
  emailSent.value = false

  try {
    await playersService.sendInviteByEmail({
      email: targetEmail.value.trim(),
      inviteUrl: inviteUrl.value,
    })
    emailSent.value = true
    targetEmail.value = ''
  } catch {
    emailError.value = 'Davet gönderilemedi. Lütfen tekrar dene.'
  } finally {
    sendingEmail.value = false
  }
}

const handleErrorAction = async (error: PlayerInviteErrorView) => {
  if (error.action === 'resend-verification') {
    if (resendStatus.value === 'sending') return

    resendStatus.value = 'sending'
    try {
      await authService.resendVerification()
      resendStatus.value = 'sent'
    } catch {
      resendStatus.value = 'failed'
    }
    return
  }

  if (error.action === 'retry') {
    resendStatus.value = 'idle'
    void fetchInviteLink()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      void fetchInviteLink()
      return
    }

    reset()
    resetEmailForm()
    copied.value = false
    if (copyResetTimer) {
      clearTimeout(copyResetTimer)
      copyResetTimer = null
    }
  },
)

onUnmounted(() => {
  if (copyResetTimer) clearTimeout(copyResetTimer)
})
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Oyuncu davet et"
    subtitle="Davet bağlantısını paylaşarak oyuncularını takıma ekle."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
    @close="close"
  >
    <div class="player-invite">
      <div
        v-if="isLoading"
        class="player-invite__state player-invite__state--loading"
        role="status"
        aria-live="polite"
      >
        <span class="player-invite__spinner" aria-hidden="true" />
        <p class="player-invite__state-title">Davet bağlantısı oluşturuluyor</p>
        <p class="player-invite__state-text">Bu işlem birkaç saniye sürebilir.</p>
      </div>

      <div
        v-else-if="isError && inviteError"
        class="player-invite__error"
        role="alert"
      >
        <div
          class="player-invite__error-card"
          :class="`player-invite__error-card--${errorVariant}`"
        >
          <span
            class="player-invite__error-icon"
            :class="`player-invite__error-icon--${errorVariant}`"
            aria-hidden="true"
          >
            <svg
              v-if="inviteError.code === 'EMAIL_NOT_VERIFIED'"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <circle cx="18" cy="6" r="4.5" fill="currentColor" stroke="#fff" stroke-width="1.4" />
              <path d="M18 4.2v3.6M16.2 6h3.6" stroke="#fff" stroke-width="1.2" stroke-linecap="round" />
            </svg>
            <svg
              v-else-if="inviteError.code === 'INVITE_LIMIT_REACHED'"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
              <path d="M12 7v6M12 16.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>

          <div class="player-invite__error-copy">
            <p class="player-invite__error-title">{{ inviteError.title }}</p>
            <p class="player-invite__error-message">{{ inviteError.message }}</p>
          </div>
        </div>

        <p
          v-if="resendStatus === 'sent'"
          class="player-invite__error-feedback player-invite__error-feedback--success"
          role="status"
          aria-live="polite"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Doğrulama e-postası gönderildi. Gelen kutunu kontrol et.
        </p>

        <p
          v-else-if="resendStatus === 'failed'"
          class="player-invite__error-feedback player-invite__error-feedback--failed"
          role="alert"
        >
          Doğrulama e-postası gönderilemedi. Lütfen tekrar dene.
        </p>

        <div class="player-invite__error-actions">
          <BaseButton
            v-if="inviteError.actionLabel"
            variant="primary"
            size="md"
            block
            :loading="resendStatus === 'sending'"
            :disabled="resendStatus === 'sending'"
            @click="handleErrorAction(inviteError)"
          >
            {{ inviteError.actionLabel }}
          </BaseButton>

          <BaseButton
            v-if="inviteError.action !== 'retry'"
            variant="secondary"
            size="md"
            block
            @click="fetchInviteLink"
          >
            Tekrar dene
          </BaseButton>
        </div>
      </div>

      <template v-else-if="isReady">
        <div class="player-invite__link-card">
          <span class="player-invite__link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <path
                d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </span>

          <div class="player-invite__link-wrap">
            <p class="player-invite__link-label">Davet bağlantısı</p>
            <p class="player-invite__link-url">{{ inviteUrl }}</p>
          </div>
        </div>

        <p class="player-invite__hint">
          Bağlantıyı kopyala veya e-posta ile paylaş.
        </p>

        <div class="player-invite__actions">
          <BaseButton
            variant="primary"
            size="md"
            block
            @click="copyInviteLink"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path
                d="M6 16V6a2 2 0 0 1 2-2h10"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            {{ copied ? 'Kopyalandı' : 'Kopyala' }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="md"
            block
            @click="openEmailForm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
              <path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            E-posta ile davet et
          </BaseButton>

          <Transition name="player-invite-email">
            <div
              v-if="showEmailForm"
              class="player-invite__email-form"
            >
              <div class="player-invite__email-row">
                <BaseInput
                  v-model="targetEmail"
                  class="player-invite__email-field"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  label="Alıcı e-posta"
                  placeholder="ornek@mail.com"
                  :error="emailError"
                  :disabled="sendingEmail"
                  @keyup.enter="sendEmailInvite"
                />

                <BaseButton
                  variant="primary"
                  size="md"
                  class="player-invite__email-send"
                  :loading="sendingEmail"
                  :disabled="!canSendEmail"
                  @click="sendEmailInvite"
                >
                  Gönder
                </BaseButton>
              </div>

              <p
                v-if="emailSent"
                class="player-invite__email-success"
                role="status"
                aria-live="polite"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                  <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Davet e-postası gönderildi.
              </p>
            </div>
          </Transition>
        </div>
      </template>
    </div>
  </BaseModal>
</template>

<style scoped lang="scss">
.player-invite {
  @include stack($space-md);
}

.player-invite__state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  gap: $space-sm;
  padding: $space-xl $space-md;
}

.player-invite__state-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: $radius-xl;
  margin-bottom: $space-1;

  &--error {
    color: $color-error;
    background: rgba($color-error, 0.08);
  }
}

.player-invite__spinner {
  width: 40px;
  height: 40px;
  margin-bottom: $space-1;
  border-radius: 50%;
  border: 3px solid rgba($color-primary, 0.18);
  border-top-color: $color-primary;
  animation: player-invite-spin 0.75s linear infinite;
}

.player-invite__state-title {
  margin: 0;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.player-invite__state-text {
  margin: 0;
  max-width: 280px;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: $color-text-muted;
}

.player-invite__error {
  @include stack($space-md);
}

.player-invite__error-card {
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  padding: $space-lg;
  border-radius: $radius-lg;
  border: 1px solid transparent;

  &--warning {
    background: linear-gradient(
      135deg,
      rgba($color-warning, 0.12) 0%,
      rgba($color-warning, 0.04) 100%
    );
    border-color: rgba($color-warning, 0.22);
  }

  &--info {
    background: linear-gradient(
      135deg,
      rgba($color-info, 0.1) 0%,
      rgba($color-info, 0.03) 100%
    );
    border-color: rgba($color-info, 0.18);
  }

  &--error {
    background: linear-gradient(
      135deg,
      rgba($color-error, 0.1) 0%,
      rgba($color-error, 0.03) 100%
    );
    border-color: rgba($color-error, 0.16);
  }
}

.player-invite__error-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: $radius-xl;

  &--warning {
    color: darken($color-warning, 8%);
    background: rgba($color-warning, 0.16);
  }

  &--info {
    color: $color-info;
    background: rgba($color-info, 0.12);
  }

  &--error {
    color: $color-error;
    background: rgba($color-error, 0.1);
  }
}

.player-invite__error-copy {
  min-width: 0;
}

.player-invite__error-title {
  margin: 0 0 $space-1;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  color: $color-text;
}

.player-invite__error-message {
  margin: 0;
  font-size: $font-size-sm;
  line-height: 1.5;
  color: $color-text-muted;
}

.player-invite__error-feedback {
  @include row($space-2);
  margin: 0;
  padding: $space-sm $space-md;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  line-height: 1.4;

  &--success {
    color: $color-primary;
    background: rgba($color-primary, 0.08);
    border: 1px solid rgba($color-primary, 0.12);
  }

  &--failed {
    color: $color-error;
    background: rgba($color-error, 0.06);
    border: 1px solid rgba($color-error, 0.12);
  }
}

.player-invite__error-actions {
  @include stack($space-sm);
}

.player-invite__link-card {
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  padding: $space-md;
  border-radius: $radius-lg;
  background: linear-gradient(
    135deg,
    rgba($color-primary, 0.08) 0%,
    rgba($color-primary, 0.03) 100%
  );
  border: 1px solid rgba($color-primary, 0.12);
}

.player-invite__link-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: $radius-md;
  color: $color-primary;
  background: rgba($color-primary, 0.12);
}

.player-invite__link-wrap {
  min-width: 0;
}

.player-invite__link-label {
  margin: 0 0 $space-1;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $color-primary;
}

.player-invite__link-url {
  margin: 0;
  font-family: $font-family-mono;
  font-size: $font-size-sm;
  line-height: 1.4;
  color: $color-text;
  word-break: break-all;
}

.player-invite__hint {
  margin: 0;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: $color-text-muted;
  text-align: center;
}

.player-invite__actions {
  @include stack($space-sm);
}

.player-invite__email-form {
  padding-top: $space-1;
}

.player-invite__email-row {
  display: flex;
  align-items: flex-end;
  gap: $space-sm;
}

.player-invite__email-field {
  flex: 1 1 auto;
  min-width: 0;
}

.player-invite__email-send {
  flex-shrink: 0;
  min-width: 88px;
}

.player-invite__email-success {
  @include row($space-2);
  margin: $space-sm 0 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-primary;
}

.player-invite-email-enter-active,
.player-invite-email-leave-active {
  transition:
    opacity $duration-fast $ease-standard,
    transform $duration-fast $ease-standard;
}

.player-invite-email-enter-from,
.player-invite-email-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes player-invite-spin {
  to { transform: rotate(360deg); }
}
</style>
