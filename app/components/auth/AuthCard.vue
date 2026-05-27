<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
})
</script>

<template>
  <section class="auth-card">
    <div class="auth-card__brand">
      <div class="auth-card__logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.12" />
          <path
            d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L6.2 7.2l4-.6L12 3z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h1 class="auth-card__title">{{ title || 'Lineup' }}</h1>
      <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
    </div>

    <div class="auth-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="auth-card__footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth-card {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  padding: $space-xl;
  background-color: $color-surface;
  border-radius: $radius-2xl;
  @include shadow(lg);

  &__brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-2;
    text-align: center;
  }

  &__logo {
    @include flex-center;
    width: 56px;
    height: 56px;
    border-radius: $radius-xl;
    background-color: rgba($color-primary, 0.1);
    color: $color-primary;
    margin-bottom: $space-2;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    letter-spacing: -0.01em;
  }

  &__subtitle {
    color: $color-text-muted;
    font-size: $font-size-sm;
    max-width: 28ch;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__footer {
    border-top: 1px solid $color-divider;
    padding-top: $space-md;
    text-align: center;
    color: $color-text-muted;
    font-size: $font-size-sm;
  }
}
</style>
