<script setup lang="ts">
import { email as validateEmail, required } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  title: 'Giriş yap',
})

const route = useRoute()
const router = useRouter()
const { login, loading, error: authError } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive<{ email: string | null; password: string | null }>({
  email: null,
  password: null,
})

const validate = (): boolean => {
  fieldErrors.email = validateEmail(form.email)
  fieldErrors.password = required(form.password, 'Şifre')
  return !fieldErrors.email && !fieldErrors.password
}

const onSubmit = async () => {
  if (loading.value) return
  if (!validate()) return

  try {
    await login({ email: form.email.trim(), password: form.password })
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch {
    // Hata mesajı auth store içinde (`authError`) tutuluyor.
  }
}

const submitDisabled = computed(
  () => loading.value || !form.email || !form.password,
)

// Inline doğrulama — kullanıcı yazarken e-posta yapısal olarak geçerliyse
// trailing check ikonunu göstermek için kullanılıyor.
const isEmailStructurallyValid = computed(
  () => !validateEmail(form.email),
)
</script>

<template>
  <div class="login">
    <header class="login__hero">
      <h1 class="login__hero-title">
        <span>Hoş geldin</span>
        <span>Giriş yap!</span>
      </h1>
    </header>

    <section class="login__sheet">
      <form id="login-form" class="login__form" novalidate @submit.prevent="onSubmit">
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
          :error="fieldErrors.email"
          @blur="fieldErrors.email = validateEmail(form.email)"
        />

        <BaseInput
          v-model="form.password"
          variant="underlined"
          label="Şifre"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          required
          :error="fieldErrors.password"
          @blur="fieldErrors.password = required(form.password, 'Şifre')"
        />

        <a class="login__forgot" href="#" @click.prevent>Şifremi unuttum?</a>

        <Transition name="login-error">
          <p v-if="authError" class="login__error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <span>{{ authError }}</span>
          </p>
        </Transition>

        <div class="login__action">
          <button
            type="submit"
            class="login__cta"
            :disabled="submitDisabled"
            :aria-busy="loading || undefined"
          >
            <span v-if="loading" class="login__cta-spinner" aria-hidden="true" />
            <span class="login__cta-label" :class="{ 'login__cta-label--hidden': loading }">
              Giriş yap
            </span>
          </button>
        </div>
      </form>

      <p class="login__signup">
        <span class="login__signup-prompt">Hesabın yok mu?</span>
        <a class="login__signup-link" href="#" @click.prevent>Kayıt ol</a>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
$hero-min-height: 280px;
$sheet-overlap: 32px;
$sheet-radius: 32px;

.login {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: $color-surface;
}

// =====================================================================
// Hero
// =====================================================================
.login__hero {
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

  // Soft decorative orbs — referansa benzer derinlik
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

.login__hero-title {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $space-1;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: $font-weight-bold;
  line-height: 1.05;
  letter-spacing: -0.02em;
  animation: login-fade-in 480ms $ease-standard both;
  color: #fff;
}

// =====================================================================
// Sheet
// =====================================================================
.login__sheet {
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

.login__form {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  animation: login-fade-in 520ms $ease-standard 80ms both;
}

// =====================================================================
// Forgot password
// =====================================================================
.login__forgot {
  align-self: flex-end;
  margin-top: -$space-2;
  color: $color-primary;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover { color: $color-primary-hover; }
  }
}

// =====================================================================
// Error banner
// =====================================================================
.login__error {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  margin: 0;
  padding: $space-3 $space-md;
  background-color: rgba($color-error, 0.08);
  color: $color-error;
  font-size: $font-size-sm;
  line-height: 1.4;
  border-radius: $radius-md;

  svg { flex: 0 0 auto; margin-top: 1px; }
}

// =====================================================================
// CTA — pill, gradient yeşil
// =====================================================================
.login__action {
  margin-top: $space-lg;
}

.login__cta {
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
  letter-spacing: 0.12em;
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

  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.login__cta-label {
  transition: opacity $duration-fast $ease-standard;

  &--hidden { opacity: 0; }
}

.login__cta-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.4);
  border-right-color: #fff;
  animation: login-spin 0.7s linear infinite;
}

// =====================================================================
// Signup
// =====================================================================
.login__signup {
  margin: 0;
  margin-top: auto;
  padding-top: $space-xl;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  line-height: $line-height-tight;
}

.login__signup-prompt {
  color: $color-text-muted;
  font-size: $font-size-sm;
}

.login__signup-link {
  color: $color-text;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  text-decoration: none;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover { color: $color-primary; }
  }
}

// =====================================================================
// Motion
// =====================================================================
@keyframes login-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

.login-error-enter-active,
.login-error-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}
.login-error-enter-from,
.login-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
