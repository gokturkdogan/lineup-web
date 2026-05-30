<script setup lang="ts">
import {
  email as validateEmail,
  maxLength,
  password as validatePassword,
  required,
} from '~/utils/validators'

definePageMeta({
  layout: 'invite',
  title: 'Takıma katıl',
})

const {
  organizationName,
  status,
  submitError,
  loading,
  submitRegistration,
} = useInviteAccept()

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
  if (loading.value || status.value !== 'ready') return
  if (!validate()) return

  try {
    const result = await submitRegistration({
      firstName: form.name,
      lastName: form.surname,
      email: form.email,
      password: form.password,
    })

    if (result?.emailConflict) {
      fieldErrors.email = submitError.value
    }
  } catch {
    // submitError composable içinde tutuluyor.
  }
}

const submitDisabled = computed(
  () =>
    loading.value ||
    status.value !== 'ready' ||
    !form.name ||
    !form.surname ||
    !form.email ||
    !form.password ||
    !form.confirmPassword,
)

const isNameValid = computed(() => !validateName(form.name))
const isSurnameValid = computed(() => !validateSurname(form.surname))
const isEmailStructurallyValid = computed(() => !validateEmail(form.email))

const heroOrgName = computed(() => organizationName.value.trim() || null)

const heroTitle = computed(() => {
  if (status.value === 'loading') return 'Davet kontrol ediliyor'
  if (status.value === 'invalid') return 'Geçersiz davet'
  return 'Ekibine davet edildin'
})

const heroSubtitle = computed(() => {
  if (status.value === 'loading') return 'Bağlantın doğrulanıyor…'
  if (status.value === 'invalid') return 'Bu bağlantı artık kullanılamıyor.'
  return 'Hemen hesabını oluştur ve ekibe katıl.'
})
</script>

<template>
  <div class="invite-accept">
    <header class="invite-accept__hero">
      <div class="invite-accept__hero-copy">
        <span
          v-if="heroOrgName && status === 'ready'"
          class="invite-accept__hero-org-badge"
        >
          {{ heroOrgName }}
        </span>

        <h1 class="invite-accept__hero-title">
          {{ heroTitle }}
        </h1>

        <p class="invite-accept__hero-subtitle">
          {{ heroSubtitle }}
        </p>
      </div>
    </header>

    <section class="invite-accept__sheet">
      <div
        v-if="status === 'loading'"
        class="invite-accept__state"
        role="status"
        aria-live="polite"
      >
        <span class="invite-accept__spinner" aria-hidden="true" />
        <p class="invite-accept__state-title">Davet doğrulanıyor</p>
        <p class="invite-accept__state-text">Bu işlem birkaç saniye sürebilir.</p>
      </div>

      <div
        v-else-if="status === 'invalid'"
        class="invite-accept__state invite-accept__state--invalid"
        role="alert"
      >
        <span class="invite-accept__state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path
              d="M12 3.5L2.5 19.5h19L12 3.5z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
            <path d="M12 9v5.5M12 16.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </span>
        <p class="invite-accept__state-title">Bağlantı geçersiz</p>
        <p class="invite-accept__state-text">
          Bu davet bağlantısı geçersiz, süresi dolmuş veya zaten kullanılmış olabilir.
          Kulüp yöneticinden yeni bir davet isteyebilirsin.
        </p>
      </div>

      <template v-else>
        <form
          id="invite-accept-form"
          class="invite-accept__form"
          novalidate
          @submit.prevent="onSubmit"
        >
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

          <Transition name="invite-accept-error">
            <p v-if="submitError && !fieldErrors.email" class="invite-accept__error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{{ submitError }}</span>
            </p>
          </Transition>

          <div class="invite-accept__action">
            <button
              type="submit"
              class="invite-accept__cta"
              :disabled="submitDisabled"
              :aria-busy="loading || undefined"
            >
              <span v-if="loading" class="invite-accept__cta-spinner" aria-hidden="true" />
              <span
                class="invite-accept__cta-label"
                :class="{ 'invite-accept__cta-label--hidden': loading }"
              >
                Takıma katıl
              </span>
            </button>
          </div>
        </form>
      </template>
    </section>
  </div>
</template>

<style scoped lang="scss">
$hero-min-height: 280px;
$sheet-overlap: 32px;
$sheet-radius: 32px;

.invite-accept {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: $color-surface;
}

.invite-accept__hero {
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

.invite-accept__hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  animation: invite-accept-fade-in 480ms $ease-standard both;
}

.invite-accept__hero-org-badge {
  align-self: flex-start;
  max-width: 100%;
  padding: $space-2 $space-3;
  border-radius: $radius-pill;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  line-height: 1.25;
  color: #fff;
  background: rgba(#fff, 0.16);
  border: 1px solid rgba(#fff, 0.24);
  backdrop-filter: blur(8px);
  @include truncate;
}

.invite-accept__hero-title {
  margin: 0;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: $font-weight-bold;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
}

.invite-accept__hero-subtitle {
  margin: 0;
  max-width: 280px;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: rgba(#fff, 0.88);
}

.invite-accept__sheet {
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

.invite-accept__state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  gap: $space-sm;
  padding: $space-xl $space-md;
  animation: invite-accept-fade-in 520ms $ease-standard 80ms both;

  &--invalid {
    .invite-accept__state-icon {
      color: $color-warning;
      background: rgba($color-warning, 0.12);
    }
  }
}

.invite-accept__state-icon {
  @include flex-center;
  width: 56px;
  height: 56px;
  border-radius: $radius-xl;
  margin-bottom: $space-1;
}

.invite-accept__spinner {
  width: 40px;
  height: 40px;
  margin-bottom: $space-1;
  border-radius: 50%;
  border: 3px solid rgba($color-primary, 0.18);
  border-top-color: $color-primary;
  animation: invite-accept-spin 0.75s linear infinite;
}

.invite-accept__state-title {
  margin: 0;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.invite-accept__state-text {
  margin: 0;
  max-width: 300px;
  font-size: $font-size-sm;
  line-height: 1.5;
  color: $color-text-muted;
}

.invite-accept__form {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  animation: invite-accept-fade-in 520ms $ease-standard 80ms both;
}

.invite-accept__error {
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

.invite-accept__action {
  margin-top: $space-md;
}

.invite-accept__cta {
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

.invite-accept__cta-label {
  transition: opacity $duration-fast $ease-standard;

  &--hidden { opacity: 0; }
}

.invite-accept__cta-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.4);
  border-right-color: #fff;
  animation: invite-accept-spin 0.7s linear infinite;
}

@keyframes invite-accept-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes invite-accept-spin {
  to { transform: rotate(360deg); }
}

.invite-accept-error-enter-active,
.invite-accept-error-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}

.invite-accept-error-enter-from,
.invite-accept-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
