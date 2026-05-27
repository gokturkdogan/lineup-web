<script setup lang="ts">
import type { NuxtError } from '#app'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

const title = computed(() => {
  if (props.error.statusCode === 404) return 'Sayfa bulunamadı'
  if (props.error.statusCode === 403) return 'Bu sayfaya erişiminiz yok'
  return 'Bir şeyler ters gitti'
})

const message = computed(() => {
  if (props.error.statusCode === 404) {
    return 'Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.'
  }
  if (props.error.statusCode === 403) {
    return 'Bu içeriği görüntülemek için yetkiniz bulunmuyor.'
  }
  return 'Beklenmeyen bir hata oluştu. Lütfen birazdan tekrar deneyin.'
})

const handleHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error">
    <div class="error__inner">
      <span class="error__code">{{ error.statusCode || 500 }}</span>
      <h1 class="error__title">{{ title }}</h1>
      <p class="error__message">{{ message }}</p>
      <button type="button" class="error__action" @click="handleHome">
        Ana sayfaya dön
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-lg;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba($color-primary, 0.1) 0%, transparent 60%),
    $color-bg;

  &__inner {
    width: 100%;
    max-width: 360px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-md;
  }

  &__code {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    min-width: 64px;
    padding: 0 $space-md;
    border-radius: $radius-pill;
    background-color: rgba($color-primary, 0.12);
    color: $color-primary;
    font-weight: $font-weight-bold;
    font-size: $font-size-md;
    letter-spacing: 0.05em;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    letter-spacing: -0.01em;
  }

  &__message {
    color: $color-text-muted;
    font-size: $font-size-sm;
    line-height: $line-height-base;
  }

  &__action {
    @include reset-button;
    height: 48px;
    padding: 0 $space-lg;
    border-radius: $radius-md;
    background-color: $color-primary;
    color: $color-text-on-primary;
    font-weight: $font-weight-semibold;
    font-size: $font-size-base;
    cursor: pointer;
    transition: background-color $duration-fast $ease-standard,
                transform $duration-fast $ease-standard;
    @include focus-ring($color-primary);

    @include media-hover {
      &:hover { background-color: $color-primary-hover; }
    }
    &:active { transform: scale(0.985); }
  }
}
</style>
