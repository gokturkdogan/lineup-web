<script setup lang="ts">
/**
 * Dashboard kabuğu — üst app bar yok; hero tam genişlik, alt navigasyon var.
 */
</script>

<template>
  <div class="app-shell">
    <main class="app-shell__content">
      <div class="app-shell__content-inner app-shell__content-inner--flush">
        <slot />
      </div>
    </main>

    <BottomNavigation class="app-shell__bottom-nav" />
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: $app-max-width;
  min-height: 100dvh;
  margin: 0 auto;
  background-color: $color-bg;
  box-shadow: 0 0 0 1px rgba($color-text, 0.04);

  @include media-up(tablet) {
    border-radius: 0;
  }

  &__content {
    flex: 1 1 auto;
    @include scroll-y;
    padding-bottom: calc(
      var(--bottom-nav-height) + var(--safe-bottom) + #{$space-md}
    );
  }

  &__content-inner {
    padding: $space-lg $space-lg $space-xl;

    &--flush {
      padding-top: 0;
      padding-inline: 0;
    }
  }

  &__bottom-nav {
    position: sticky;
    bottom: 0;
    z-index: $z-bottom-nav;
  }
}
</style>
