<script setup lang="ts">
import { authService } from '~/services/auth.service'
import { ApiError } from '~/types/api'
import { password as validatePassword } from '~/utils/validators'

definePageMeta({
  // Mailden gelen kullanıcı oturum açık olabilir; bu yüzden `guest` middleware
  // yok — sayfa hem oturumlu hem oturumsuz erişilebilir olmalı.
  layout: 'auth',
  title: 'Yeni şifre belirle',
})

type Status = 'no-token' | 'idle' | 'success' | 'token-error'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = computed(() => {
  const raw = route.query.token
  return Array.isArray(raw) ? raw[0] : raw
})

// Token yok ya da çok kısa → API'ye hiç istek atmadan "geçersiz" göster.
const initialStatus: Status =
  !token.value || token.value.length < 20 ? 'no-token' : 'idle'

const status = ref<Status>(initialStatus)
const loading = ref(false)
const generalError = ref<string | null>(null)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const fieldErrors = reactive<{ password: string | null; confirmPassword: string | null }>({
  password: null,
  confirmPassword: null,
})

const validateConfirm = (value: string): string | null => {
  if (!value) return 'Şifre tekrarı zorunludur.'
  if (value !== form.password) return 'Şifreler eşleşmiyor.'
  return null
}

const validate = (): boolean => {
  fieldErrors.password = validatePassword(form.password)
  fieldErrors.confirmPassword = validateConfirm(form.confirmPassword)
  return !fieldErrors.password && !fieldErrors.confirmPassword
}

const submit = async () => {
  if (loading.value || !token.value) return

  generalError.value = null
  if (!validate()) return

  loading.value = true
  try {
    await authService.resetPassword({
      token: token.value,
      newPassword: form.password,
    })

    // Başarılı sıfırlama bir güvenlik olayıdır: backend tüm refresh token'ları
    // iptal eder. Lokaldeki oturumu da temizleyip kullanıcıyı manuel girişe zorla.
    authStore.logout()
    status.value = 'success'

    setTimeout(() => {
      void router.replace({ path: '/login', query: { reset: '1' } })
    }, 1800)
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      // Tüm token problemleri (yok/süresi dolmuş/kullanılmış) tek 400 döner.
      if (/token/i.test(err.message)) {
        status.value = 'token-error'
      } else {
        // Parola politikası ihlali — backend mesajını alan altında göster.
        fieldErrors.password = err.message
      }
    } else {
      generalError.value = 'Sunucuya ulaşılamıyor, lütfen tekrar deneyin.'
    }
  } finally {
    loading.value = false
  }
}

const submitDisabled = computed(
  () => loading.value || !form.password || !form.confirmPassword,
)
</script>

<template>
  <div class="reset">
    <header class="reset__hero">
      <h1 class="reset__hero-title">
        <span>Yeni şifreni</span>
        <span>belirle</span>
      </h1>
    </header>

    <section class="reset__sheet">
      <!-- Başarılı -->
      <template v-if="status === 'success'">
        <div class="reset__panel">
          <div class="reset__badge reset__badge--success" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="32" height="32" fill="none">
              <circle cx="26" cy="26" r="23" stroke="currentColor" stroke-width="2.5" />
              <path
                d="M16 27l7 7 13-15"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h2 class="reset__panel-title">Şifren yenilendi</h2>
          <p class="reset__panel-text">
            Yeni şifrenle giriş yapabilirsin. Birazdan giriş ekranına
            yönlendiriliyorsun…
          </p>
          <NuxtLink class="reset__btn reset__btn--solid" to="/login">
            Giriş yap
          </NuxtLink>
        </div>
      </template>

      <!-- Token yok / geçersiz -->
      <template v-else-if="status === 'no-token' || status === 'token-error'">
        <div class="reset__panel">
          <div class="reset__badge reset__badge--error" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="32" height="32" fill="none">
              <circle cx="26" cy="26" r="23" stroke="currentColor" stroke-width="2.5" />
              <path d="M26 15v15" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              <circle cx="26" cy="37" r="1.7" fill="currentColor" />
            </svg>
          </div>
          <h2 class="reset__panel-title">
            {{ status === 'no-token' ? 'Bağlantı eksik veya hatalı' : 'Bağlantı geçersiz veya süresi dolmuş' }}
          </h2>
          <p class="reset__panel-text">
            Sıfırlama bağlantısı geçersiz olabilir. Yeni bir sıfırlama isteği
            oluşturup tekrar dene.
          </p>
          <NuxtLink class="reset__btn reset__btn--solid" to="/forgot-password">
            Yeni bağlantı iste
          </NuxtLink>
        </div>
      </template>

      <!-- Form -->
      <template v-else>
        <p class="reset__lead">
          Hesabın için yeni bir şifre belirle. Şifren 6-12 karakter olmalı ve en az
          bir harf ile bir rakam içermeli.
        </p>

        <form id="reset-form" class="reset__form" novalidate @submit.prevent="submit">
          <BaseInput
            v-model="form.password"
            variant="underlined"
            label="Yeni şifre"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            :error="fieldErrors.password"
            @blur="fieldErrors.password = validatePassword(form.password)"
          />

          <BaseInput
            v-model="form.confirmPassword"
            variant="underlined"
            label="Yeni şifre (tekrar)"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            :error="fieldErrors.confirmPassword"
            @blur="fieldErrors.confirmPassword = validateConfirm(form.confirmPassword)"
          />

          <Transition name="reset-error">
            <p v-if="generalError" class="reset__error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{{ generalError }}</span>
            </p>
          </Transition>

          <div class="reset__action">
            <button
              type="submit"
              class="reset__cta"
              :disabled="submitDisabled"
              :aria-busy="loading || undefined"
            >
              <span v-if="loading" class="reset__cta-spinner" aria-hidden="true" />
              <span class="reset__cta-label" :class="{ 'reset__cta-label--hidden': loading }">
                Şifreyi güncelle
              </span>
            </button>
          </div>
        </form>
      </template>

      <p class="reset__back">
        <NuxtLink class="reset__back-link" to="/login">Giriş ekranına dön</NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
$hero-min-height: 280px;
$sheet-overlap: 32px;
$sheet-radius: 32px;

.reset {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: $color-surface;
}

.reset__hero {
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

.reset__hero-title {
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
  animation: reset-fade-in 480ms $ease-standard both;
}

.reset__sheet {
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

.reset__lead {
  margin: 0 0 $space-xl;
  color: $color-text-muted;
  font-size: $font-size-md;
  line-height: 1.5;
  animation: reset-fade-in 520ms $ease-standard 60ms both;
}

.reset__form {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  animation: reset-fade-in 520ms $ease-standard 80ms both;
}

.reset__error {
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

.reset__action {
  margin-top: $space-md;
}

.reset__cta {
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

.reset__cta-label {
  transition: opacity $duration-fast $ease-standard;
  &--hidden { opacity: 0; }
}

.reset__cta-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.4);
  border-right-color: #fff;
  animation: reset-spin 0.7s linear infinite;
}

// --- Durum panelleri (success / token error) ---
.reset__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: reset-fade-in 460ms $ease-standard both;
}

.reset__badge {
  @include flex-center;
  width: 76px;
  height: 76px;
  margin-bottom: $space-lg;
  border-radius: 50%;

  &--success {
    color: $color-primary;
    background-color: rgba($color-primary, 0.12);
  }

  &--error {
    color: $color-error;
    background-color: rgba($color-error, 0.10);
  }
}

.reset__panel-title {
  margin: 0 0 $space-3;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text;
}

.reset__panel-text {
  margin: 0 0 $space-xl;
  max-width: 320px;
  color: $color-text-muted;
  font-size: $font-size-md;
  line-height: 1.55;
}

.reset__btn {
  @include flex-center;
  width: 100%;
  height: 56px;
  padding: 0 $space-lg;
  border-radius: $radius-pill;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring($color-primary);

  &:active { transform: scale(0.985); }

  &--solid {
    color: #fff;
    background:
      linear-gradient(
        135deg,
        lighten($color-primary, 4%) 0%,
        $color-primary 35%,
        $color-primary-hover 75%,
        #064e3b 100%
      );
    box-shadow: 0 12px 28px rgba($color-primary, 0.30);
  }
}

.reset__back {
  margin: 0;
  margin-top: auto;
  padding-top: $space-xl;
  text-align: center;
}

.reset__back-link {
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

@keyframes reset-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes reset-spin {
  to { transform: rotate(360deg); }
}

.reset-error-enter-active,
.reset-error-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}
.reset-error-enter-from,
.reset-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
