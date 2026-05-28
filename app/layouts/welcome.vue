<script setup lang="ts">
/**
 * Karşılama ekranı kabuğu — auth layout ile aynı genişlik kısıtı,
 * ancak beyaz zemin yok; sayfa kendi gradient'ini taşır.
 */
</script>

<template>
  <div class="welcome-layout">
    <div class="welcome-layout__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome-layout {
  min-height: 100dvh;
  width: 100%;

  @include media-up(tablet) {
    display: flex;
    justify-content: center;
    background-color: $color-bg;
  }

  &__inner {
    width: 100%;
    min-height: 100dvh;

    @include media-up(tablet) {
      max-width: 440px;
    }
  }
}
</style>
