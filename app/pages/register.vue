<script setup lang="ts">
import {
  email as validateEmail,
  maxLength,
  password as validatePassword,
  required,
} from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  title: 'Kayıt ol',
})

const router = useRouter()
const { register, loading, error: authError } = useAuth()

const form = reactive({
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const fieldErrors = reactive<{
  name: string | null
  surname: string | null
  email: string | null
  password: string | null
  confirmPassword: string | null
}>({
  name: null,
  surname: null,
  email: null,
  password: null,
  confirmPassword: null,
})

const validateName = (value: string): string | null =>
  required(value, 'Ad') ?? maxLength(value, 60, 'Ad')

const validateSurname = (value: string): string | null =>
  required(value, 'Soyad') ?? maxLength(value, 60, 'Soyad')

const validateConfirmPassword = (value: string): string | null => {
  if (!value) return 'Şifre tekrarı zorunludur.'
  if (value !== form.password) return 'Şifreler eşleşmiyor.'
  return null
}

const validate = (): boolean => {
  fieldErrors.name = validateName(form.name)
  fieldErrors.surname = validateSurname(form.surname)
  fieldErrors.email = validateEmail(form.email)
  fieldErrors.password = validatePassword(form.password)
  fieldErrors.confirmPassword = validateConfirmPassword(form.confirmPassword)
  return !Object.values(fieldErrors).some(Boolean)
}

const onSubmit = async () => {
  if (loading.value) return
  if (!validate()) return

  try {
    await register({
      firstName: form.name.trim(),
      lastName: form.surname.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    // Otomatik login yok: kayıt sonrası kullanıcı e-postasını doğrulamalı.
    await router.replace({ path: '/login', query: { registered: '1' } })
  } catch {
    // Hata mesajı `authError` (auth store) içinde tutuluyor; UI banner gösterir.
  }
}

const submitDisabled = computed(
  () =>
    loading.value ||
    !form.name ||
    !form.surname ||
    !form.email ||
    !form.password ||
    !form.confirmPassword,
)

const isNameValid = computed(() => !validateName(form.name))
const isSurnameValid = computed(() => !validateSurname(form.surname))
const isEmailStructurallyValid = computed(() => !validateEmail(form.email))
</script>

<template>
  <div class="register">
    <header class="register__hero">
      <h1 class="register__hero-title">
        <span>Hesabını</span>
        <span>oluştur!</span>
      </h1>
    </header>

    <section class="register__sheet">
      <form id="register-form" class="register__form" novalidate @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.name"
          variant="underlined"
          label="Ad"
          type="text"
          placeholder="Ahmet"
          autocomplete="given-name"
          required
          :valid="isNameValid"
          :error="fieldErrors.name"
          @blur="fieldErrors.name = validateName(form.name)"
        />

        <BaseInput
          v-model="form.surname"
          variant="underlined"
          label="Soyad"
          type="text"
          placeholder="Yılmaz"
          autocomplete="family-name"
          required
          :valid="isSurnameValid"
          :error="fieldErrors.surname"
          @blur="fieldErrors.surname = validateSurname(form.surname)"
        />

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
          autocomplete="new-password"
          required
          :error="fieldErrors.password"
          @blur="fieldErrors.password = validatePassword(form.password)"
        />

        <BaseInput
          v-model="form.confirmPassword"
          variant="underlined"
          label="Şifre tekrar"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          required
          :error="fieldErrors.confirmPassword"
          @blur="fieldErrors.confirmPassword = validateConfirmPassword(form.confirmPassword)"
        />

        <Transition name="register-error">
          <p v-if="authError" class="register__error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <span>{{ authError }}</span>
          </p>
        </Transition>

        <div class="register__action">
          <button
            type="submit"
            class="register__cta"
            :disabled="submitDisabled"
            :aria-busy="loading || undefined"
          >
            <span v-if="loading" class="register__cta-spinner" aria-hidden="true" />
            <span
              class="register__cta-label"
              :class="{ 'register__cta-label--hidden': loading }"
            >
              Kayıt ol
            </span>
          </button>
        </div>
      </form>

      <p class="register__signin">
        <span class="register__signin-prompt">Zaten hesabın var mı?</span>
        <NuxtLink class="register__signin-link" to="/login">Giriş yap</NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
$hero-min-height: 280px;
$sheet-overlap: 32px;
$sheet-radius: 32px;

.register {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: $color-surface;
}

.register__hero {
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

.register__hero-title {
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
  animation: register-fade-in 480ms $ease-standard both;
}

.register__sheet {
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

.register__form {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  animation: register-fade-in 520ms $ease-standard 80ms both;
}

.register__error {
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

.register__action {
  margin-top: $space-md;
}

.register__cta {
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

.register__cta-label {
  transition: opacity $duration-fast $ease-standard;

  &--hidden { opacity: 0; }
}

.register__cta-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.4);
  border-right-color: #fff;
  animation: register-spin 0.7s linear infinite;
}

.register__signin {
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

.register__signin-prompt {
  color: $color-text-muted;
  font-size: $font-size-md;
}

.register__signin-link {
  color: $color-text;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  text-decoration: none;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover { color: $color-primary; }
  }
}

@keyframes register-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes register-spin {
  to { transform: rotate(360deg); }
}

.register-error-enter-active,
.register-error-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}
.register-error-enter-from,
.register-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
