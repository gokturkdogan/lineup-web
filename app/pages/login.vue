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
</script>

<template>
  <AuthCard
    title="Tekrar hoş geldin"
    subtitle="Kadronu, oyuncularını ve yaklaşan maçlarını yönetmek için giriş yap."
  >
    <form class="login-form" novalidate @submit.prevent="onSubmit">
      <BaseInput
        v-model="form.email"
        label="E-posta"
        type="email"
        placeholder="ornek@eposta.com"
        autocomplete="email"
        inputmode="email"
        required
        :error="fieldErrors.email"
        @blur="fieldErrors.email = validateEmail(form.email)"
      />

      <BaseInput
        v-model="form.password"
        label="Şifre"
        type="password"
        placeholder="••••••••"
        autocomplete="current-password"
        required
        :error="fieldErrors.password"
        @blur="fieldErrors.password = required(form.password, 'Şifre')"
      />

      <p v-if="authError" class="login-form__error" role="alert">
        {{ authError }}
      </p>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="loading"
        :disabled="submitDisabled"
      >
        Giriş yap
      </BaseButton>
    </form>

    <template #footer>
      <span>Lineup &middot; v0.1</span>
    </template>
  </AuthCard>
</template>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: $space-md;

  &__error {
    margin: 0;
    padding: $space-sm $space-md;
    background-color: rgba($color-error, 0.08);
    color: $color-error;
    font-size: $font-size-sm;
    border-radius: $radius-md;
  }
}
</style>
