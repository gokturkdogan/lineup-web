<script setup lang="ts">
/**
 * Auth shell — frame yok, native ekran hissi.
 *
 * - Mobile: tüm ekran. Hero ve sheet'i sayfa kendi yönetir.
 * - Tablet+: içerik 440 px column'da ortalanır; üstte/altta brand-gradient
 *   bir matte kalır.
 */
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100dvh;
  width: 100%;
  background-color: $color-surface;

  // Desktop'ta sayfayı ortala; sayfa zaten %100 width'i alır.
  @include media-up(tablet) {
    display: flex;
    align-items: stretch;
    justify-content: center;
    background-color: $color-bg;
  }

  &__inner {
    width: 100%;
    min-height: 100dvh;
    background-color: $color-surface;

    @include media-up(tablet) {
      max-width: 440px;
      box-shadow: 0 24px 60px rgba($color-text, 0.10);
    }
  }
}
</style>
