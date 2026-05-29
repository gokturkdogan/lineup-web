<script setup lang="ts">
import { authService } from '~/services/auth.service'
import { ApiError } from '~/types/api'
import { email as validateEmail } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  title: 'Şifremi unuttum',
})

const form = reactive({ email: '' })
const emailError = ref<string | null>(null)
const generalError = ref<string | null>(null)
const loading = ref(false)
const sent = ref(false)

const isEmailStructurallyValid = computed(() => !validateEmail(form.email))

const submit = async () => {
  if (loading.value) return

  emailError.value = validateEmail(form.email)
  generalError.value = null
  if (emailError.value) return

  loading.value = true
  try {
    await authService.forgotPassword({ email: form.email.trim() })
    // 204 — hesabın var olup olmadığı sızdırılmaz; nötr başarı ekranı.
    sent.value = true
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      emailError.value = 'Geçerli bir e-posta girin.'
    } else {
      generalError.value = 'Bir sorun oluştu, lütfen tekrar deneyin.'
    }
  } finally {
    loading.value = false
  }
}

// "Mail gelmedi mi? Tekrar gönder" — aynı endpoint'i yeniden çağırır.
const resend = async () => {
  if (loading.value) return
  loading.value = true
  generalError.value = null
  try {
    await authService.forgotPassword({ email: form.email.trim() })
  } catch {
    generalError.value = 'Bir sorun oluştu, lütfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

const submitDisabled = computed(() => loading.value || !form.email)
</script>

<template>
  <div class="forgot">
    <header class="forgot__hero">
      <h1 class="forgot__hero-title">
        <span>Şifreni mi</span>
        <span>unuttun?</span>
      </h1>
    </header>

    <section class="forgot__sheet">
      <!-- Gönderildi: nötr başarı ekranı -->
      <template v-if="sent">
        <div class="forgot__sent">
          <div class="forgot__sent-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
              <path d="M4 6.5h16v11H4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h2 class="forgot__sent-title">Mailini kontrol et</h2>
          <p class="forgot__sent-text">
            Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı içeren bir mail
            yolladık. Gelen kutunu (ve spam klasörünü) kontrol et.
          </p>

          <Transition name="forgot-error">
            <p v-if="generalError" class="forgot__error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{{ generalError }}</span>
            </p>
          </Transition>

          <p class="forgot__resend">
            Mail gelmedi mi?
            <button type="button" class="forgot__resend-btn" :disabled="loading" @click="resend">
              Tekrar gönder
            </button>
          </p>
        </div>
      </template>

      <!-- Form -->
      <template v-else>
        <p class="forgot__lead">
          E-posta adresini gir; sana şifreni sıfırlaman için bir bağlantı gönderelim.
        </p>

        <form id="forgot-form" class="forgot__form" novalidate @submit.prevent="submit">
          <BaseInput
            v-model="form.email"
            variant="underlined"
            label="E-posta"
            type="email"
            placeholder="ornek@eposta.com"
            autocomplete="email"
            inputmode="email"
            required
            :valid="isEmailStructurallyValid"
            :error="emailError"
            @blur="emailError = validateEmail(form.email)"
          />

          <Transition name="forgot-error">
            <p v-if="generalError" class="forgot__error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{{ generalError }}</span>
            </p>
          </Transition>

          <div class="forgot__action">
            <button
              type="submit"
              class="forgot__cta"
              :disabled="submitDisabled"
              :aria-busy="loading || undefined"
            >
              <span v-if="loading" class="forgot__cta-spinner" aria-hidden="true" />
              <span class="forgot__cta-label" :class="{ 'forgot__cta-label--hidden': loading }">
                Sıfırlama bağlantısı gönder
              </span>
            </button>
          </div>
        </form>
      </template>

      <p class="forgot__back">
        <NuxtLink class="forgot__back-link" to="/login">Giriş ekranına dön</NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
$hero-min-height: 280px;
$sheet-overlap: 32px;
$sheet-radius: 32px;

.forgot {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: $color-surface;
}

.forgot__hero {
  position: relative;
  min-height: $hero-min-height;
  padding: $space-lg $space-lg ($sheet-overlap + $space-xl);
  padding-top: calc(env(safe-area-inset-top, 0px) + #{$space-2xl});
  display: flex;
  align-items: flex-start;
  color: #fff;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      lighten($color-primary, 4%) 0%,
      $color-primary 28%,
      $color-primary-hover 62%,
      #064e3b 100%
    );

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  &::before {
    width: 220px;
    height: 220px;
    top: -80px;
    right: -60px;
    background: radial-gradient(circle, rgba(#fff, 0.16) 0%, transparent 70%);
  }
  &::after {
    width: 180px;
    height: 180px;
    bottom: -40px;
    left: -50px;
    background: radial-gradient(circle, rgba(#fff, 0.10) 0%, transparent 70%);
  }
}

.forgot__hero-title {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $space-1;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: $font-weight-bold;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
  animation: forgot-fade-in 480ms $ease-standard both;
}

.forgot__sheet {
  position: relative;
  margin-top: -$sheet-overlap;
  padding: ($space-xl + $space-2) $space-lg $space-lg;
  background-color: $color-surface;
  border-top-left-radius: $sheet-radius;
  border-top-right-radius: $sheet-radius;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -12px 24px rgba($color-text, 0.06);
  @include safe-area-bottom($space-md);
}

.forgot__lead {
  margin: 0 0 $space-xl;
  color: $color-text-muted;
  font-size: $font-size-md;
  line-height: 1.5;
  animation: forgot-fade-in 520ms $ease-standard 60ms both;
}

.forgot__form {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  animation: forgot-fade-in 520ms $ease-standard 80ms both;
}

.forgot__error {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  margin: 0;
  padding: $space-3 $space-md;
  background-color: rgba($color-error, 0.08);
  color: $color-error;
  font-size: $font-size-base;
  line-height: 1.4;
  border-radius: $radius-md;

  svg { flex: 0 0 auto; margin-top: 1px; }
}

.forgot__action {
  margin-top: $space-md;
}

.forgot__cta {
  @include reset-button;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 58px;
  padding: 0 $space-xl;
  border-radius: $radius-pill;
  color: #fff;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background:
    linear-gradient(
      135deg,
      lighten($color-primary, 4%) 0%,
      $color-primary 35%,
      $color-primary-hover 75%,
      #064e3b 100%
    );
  box-shadow:
    0 14px 32px rgba($color-primary, 0.34),
    inset 0 1px 0 rgba(#fff, 0.22);
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard,
    opacity $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring($color-primary);

  @include media-hover {
    &:hover:not(:disabled) {
      box-shadow:
        0 18px 40px rgba($color-primary, 0.42),
        inset 0 1px 0 rgba(#fff, 0.26);
    }
  }

  &:active:not(:disabled) { transform: scale(0.985); }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.forgot__cta-label {
  transition: opacity $duration-fast $ease-standard;
  &--hidden { opacity: 0; }
}

.forgot__cta-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.4);
  border-right-color: #fff;
  animation: forgot-spin 0.7s linear infinite;
}

// --- Gönderildi ekranı ---
.forgot__sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: forgot-fade-in 460ms $ease-standard both;
}

.forgot__sent-badge {
  @include flex-center;
  width: 76px;
  height: 76px;
  margin-bottom: $space-lg;
  color: $color-primary;
  border-radius: 50%;
  background-color: rgba($color-primary, 0.12);
}

.forgot__sent-title {
  margin: 0 0 $space-3;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text;
}

.forgot__sent-text {
  margin: 0;
  max-width: 320px;
  color: $color-text-muted;
  font-size: $font-size-md;
  line-height: 1.55;
}

.forgot__resend {
  margin: $space-xl 0 0;
  color: $color-text-muted;
  font-size: $font-size-base;
}

.forgot__resend-btn {
  @include reset-button;
  color: $color-primary;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover:not(:disabled) { color: $color-primary-hover; }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.forgot__back {
  margin: 0;
  margin-top: auto;
  padding-top: $space-xl;
  text-align: center;
}

.forgot__back-link {
  color: $color-text;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover { color: $color-primary; }
  }
}

@keyframes forgot-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes forgot-spin {
  to { transform: rotate(360deg); }
}

.forgot-error-enter-active,
.forgot-error-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}
.forgot-error-enter-from,
.forgot-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
