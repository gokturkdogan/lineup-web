<script setup lang="ts">
import { authService } from '~/services/auth.service'
import { ApiError } from '~/types/api'

definePageMeta({
  layout: 'welcome',
  title: 'E-posta doğrulama',
})

type Status = 'verifying' | 'success' | 'invalid' | 'error'
type ResendStatus = 'idle' | 'sending' | 'sent' | 'failed'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = computed(() => {
  const raw = route.query.token
  return Array.isArray(raw) ? raw[0] : raw
})

const status = ref<Status>('verifying')
const resendStatus = ref<ResendStatus>('idle')

// Token tek kullanımlık olduğu için istek yalnızca bir kez atılmalı.
// (Hızlı çift mount / yeniden render durumlarına karşı koruma.)
let hasRequested = false

const verify = async () => {
  if (!token.value) {
    status.value = 'invalid'
    return
  }

  status.value = 'verifying'
  try {
    await authService.verifyEmail({ token: token.value })
    status.value = 'success'
  } catch (err) {
    // 400 → token geçersiz/süresi dolmuş/kullanılmış. Diğer her şey → tekrar denenebilir.
    status.value = err instanceof ApiError && err.status === 400 ? 'invalid' : 'error'
  }
}

const retry = () => {
  void verify()
}

const isAuthenticated = computed(() => authStore.isAuthenticated)

/**
 * "Yeniden gönder":
 * - Oturum açıksa doğrulama e-postasını yeniden gönderir (204).
 * - Oturum yoksa kullanıcıyı giriş ekranına yönlendirir (orada tekrar gönderebilir).
 */
const resend = async () => {
  if (!isAuthenticated.value) {
    await router.push({ path: '/login', query: { reason: 'verify-email' } })
    return
  }

  if (resendStatus.value === 'sending') return
  resendStatus.value = 'sending'
  try {
    await authService.resendVerification()
    resendStatus.value = 'sent'
  } catch {
    resendStatus.value = 'failed'
  }
}

onMounted(() => {
  if (hasRequested) return
  hasRequested = true
  void verify()
})
</script>

<template>
  <div class="verify">
    <div class="verify__glow" aria-hidden="true" />

    <div class="verify__content">
      <Transition name="verify-swap" mode="out-in">
        <!-- Doğrulanıyor -->
        <div v-if="status === 'verifying'" key="verifying" class="verify__panel">
          <div class="verify__badge" aria-hidden="true">
            <svg class="verify__spinner" viewBox="0 0 50 50" width="46" height="46">
              <circle class="verify__spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
              <circle class="verify__spinner-head" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>
          </div>
          <h1 class="verify__title">E-postan doğrulanıyor</h1>
          <p class="verify__text">Bağlantını kontrol ediyoruz, bir saniye…</p>
        </div>

        <!-- Başarılı -->
        <div v-else-if="status === 'success'" key="success" class="verify__panel">
          <div class="verify__badge" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="46" height="46" fill="none">
              <circle
                class="verify__draw-ring"
                cx="26"
                cy="26"
                r="23"
                stroke="currentColor"
                stroke-width="2.5"
              />
              <path
                class="verify__draw-check"
                d="M16 27l7 7 13-15"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h1 class="verify__title">E-postan doğrulandı</h1>
          <p class="verify__text">
            Hesabın artık aktif. Lineup’ı kullanmaya başlayabilirsin.
          </p>
          <div class="verify__actions">
            <NuxtLink
              v-if="isAuthenticated"
              class="verify__btn verify__btn--solid"
              to="/home"
            >
              Devam et
            </NuxtLink>
            <NuxtLink v-else class="verify__btn verify__btn--solid" to="/login">
              Giriş yap
            </NuxtLink>
          </div>
        </div>

        <!-- Geçersiz / süresi dolmuş token -->
        <div v-else-if="status === 'invalid'" key="invalid" class="verify__panel">
          <div class="verify__badge" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="46" height="46" fill="none">
              <circle cx="26" cy="26" r="23" stroke="currentColor" stroke-width="2.5" />
              <path d="M26 15v15" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              <circle cx="26" cy="37" r="1.7" fill="currentColor" />
            </svg>
          </div>
          <h1 class="verify__title">Bağlantı geçersiz veya süresi dolmuş</h1>
          <p class="verify__text">
            Bağlantı kullanılmış ya da süresi dolmuş olabilir. Yeni bir bağlantı
            isteyebilirsin.
          </p>

          <Transition name="verify-fade">
            <p v-if="resendStatus === 'sent'" class="verify__notice verify__notice--ok" role="status">
              Yeni doğrulama bağlantısı e-postana gönderildi.
            </p>
            <p
              v-else-if="resendStatus === 'failed'"
              class="verify__notice verify__notice--err"
              role="alert"
            >
              Gönderilemedi. Lütfen tekrar dene.
            </p>
          </Transition>

          <div class="verify__actions">
            <button
              v-if="resendStatus !== 'sent'"
              type="button"
              class="verify__btn verify__btn--solid"
              :disabled="resendStatus === 'sending'"
              :aria-busy="resendStatus === 'sending' || undefined"
              @click="resend"
            >
              <span v-if="resendStatus === 'sending'" class="verify__btn-spinner" aria-hidden="true" />
              <span :class="{ 'verify__btn-label--hidden': resendStatus === 'sending' }">
                Yeniden gönder
              </span>
            </button>
            <NuxtLink class="verify__btn verify__btn--outline" to="/login">
              Giriş ekranına dön
            </NuxtLink>
          </div>
        </div>

        <!-- Ağ / sunucu hatası -->
        <div v-else key="error" class="verify__panel">
          <div class="verify__badge" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="46" height="46" fill="none">
              <path
                d="M11 26a15 15 0 0 1 25.7-10.5L41 20"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M41 12v8h-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M41 26a15 15 0 0 1-25.7 10.5L11 32"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M11 40v-8h8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="verify__title">Bir şeyler ters gitti</h1>
          <p class="verify__text">
            Sunucuya ulaşırken bir sorun oluştu. Bağlantını kontrol edip tekrar dene.
          </p>
          <div class="verify__actions">
            <button type="button" class="verify__btn verify__btn--solid" @click="retry">
              Tekrar dene
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.verify {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  overflow: hidden;
  color: #fff;
  // Welcome ekranıyla aynı dil: soldan sağa yumuşak yeşil geçiş
  background:
    linear-gradient(
      to right,
      $color-primary 0%,
      #0c5a36 55%,
      #052b1a 100%
    );
}

.verify__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }

  &::before {
    width: 360px;
    height: 360px;
    top: -120px;
    left: -120px;
    background: radial-gradient(circle, rgba($color-primary, 0.22) 0%, transparent 70%);
    filter: blur(8px);
  }

  &::after {
    width: 280px;
    height: 280px;
    bottom: -120px;
    right: -100px;
    background: radial-gradient(circle, rgba(#000, 0.18) 0%, transparent 70%);
    filter: blur(8px);
  }
}

.verify__content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  padding-inline: $space-xl;
  padding-block: calc(env(safe-area-inset-top, 0px) + #{$space-lg})
    calc(env(safe-area-inset-bottom, 0px) + #{$space-lg});
}

.verify__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.verify__badge {
  @include flex-center;
  width: 96px;
  height: 96px;
  margin-bottom: $space-xl;
  color: #fff;
  border-radius: 50%;
  background: rgba(#fff, 0.10);
  border: 1px solid rgba(#fff, 0.18);
  box-shadow:
    0 16px 40px rgba(#000, 0.22),
    inset 0 1px 0 rgba(#fff, 0.18);
  backdrop-filter: blur(4px);
}

.verify__title {
  margin: 0 0 $space-3;
  font-size: clamp(24px, 6.5vw, 30px);
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  letter-spacing: -0.01em;
  color: #fff;
}

.verify__text {
  margin: 0;
  max-width: 300px;
  font-size: $font-size-md;
  line-height: 1.55;
  color: rgba(#fff, 0.82);
}

.verify__notice {
  margin: $space-lg 0 0;
  padding: $space-2 $space-md;
  width: 100%;
  font-size: $font-size-base;
  line-height: 1.4;
  border-radius: $radius-md;
  border: 1px solid transparent;

  &--ok {
    color: #fff;
    background-color: rgba(#fff, 0.12);
    border-color: rgba(#fff, 0.22);
  }

  &--err {
    color: #fff;
    background-color: rgba($color-error, 0.28);
    border-color: rgba(#fff, 0.20);
  }
}

.verify__actions {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  width: 100%;
  margin-top: $space-2xl;
}

.verify__btn {
  @include reset-button;
  @include flex-center;
  position: relative;
  width: 100%;
  height: 56px;
  padding: 0 $space-lg;
  border-radius: $radius-pill;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-decoration: none;
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard,
    background-color $duration-fast $ease-standard,
    border-color $duration-fast $ease-standard,
    opacity $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring(#fff);

  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  // Welcome --solid: beyaz dolgu, koyu yeşil yazı
  &--solid {
    color: $color-primary-hover;
    background-color: #fff;
    box-shadow: 0 12px 32px rgba(#000, 0.18);

    @include media-hover {
      &:hover:not(:disabled) {
        background-color: rgba(#fff, 0.96);
        box-shadow: 0 16px 40px rgba(#000, 0.24);
      }
    }
  }

  // Welcome --outline: şeffaf zemin, açık beyaz kenar
  &--outline {
    color: #fff;
    background-color: transparent;
    border: 1.5px solid rgba(#fff, 0.42);

    @include media-hover {
      &:hover {
        background-color: rgba(#fff, 0.06);
        border-color: rgba(#fff, 0.55);
      }
    }
  }
}

.verify__btn-label--hidden {
  opacity: 0;
}

// --- "Doğrulanıyor" spinner ---
.verify__spinner {
  animation: verify-rotate 1.4s linear infinite;
}

.verify__spinner-track {
  stroke: rgba(#fff, 0.22);
}

.verify__spinner-head {
  stroke: #fff;
  stroke-dasharray: 90 150;
  transform-origin: center;
  animation: verify-dash 1.4s $ease-standard infinite;
}

// --- Başarı: çizilen halka + tik ---
.verify__draw-ring {
  stroke-dasharray: 145;
  stroke-dashoffset: 145;
  animation: verify-draw 560ms $ease-standard forwards;
}

.verify__draw-check {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: verify-draw 420ms $ease-standard 380ms forwards;
}

.verify__btn-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba($color-primary-hover, 0.35);
  border-right-color: $color-primary-hover;
  animation: verify-rotate 0.7s linear infinite;
}

@keyframes verify-rotate {
  to { transform: rotate(360deg); }
}

@keyframes verify-dash {
  0%   { stroke-dashoffset: 0; }
  50%  { stroke-dashoffset: -60; }
  100% { stroke-dashoffset: -150; }
}

@keyframes verify-draw {
  to { stroke-dashoffset: 0; }
}

// Durumlar arası yumuşak geçiş
.verify-swap-enter-active,
.verify-swap-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}
.verify-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.verify-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.verify-fade-enter-active,
.verify-fade-leave-active {
  transition: opacity $duration-base $ease-standard;
}
.verify-fade-enter-from,
.verify-fade-leave-to {
  opacity: 0;
}
</style>
