<script setup lang="ts">
/**
 * Davet kabul kabuğu — auth layout'tan bağımsız dosya, aynı genişlik kısıtı.
 * Sayfa hero + sheet görünümünü kendi taşır.
 */
</script>

<template>
  <div class="invite-layout">
    <div class="invite-layout__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.invite-layout {
  min-height: 100dvh;
  width: 100%;
  background-color: $color-bg;

  @include media-up(tablet) {
    display: flex;
    align-items: stretch;
    justify-content: center;
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
