<script setup lang="ts">
/**
 * Mobile-app shell: fixed top app bar, scrollable content, fixed bottom nav.
 * The shell is constrained to `$app-max-width` so it keeps a phone-like
 * silhouette on tablets and desktops.
 */
</script>

<template>
  <div class="app-shell">
    <AppHeader class="app-shell__header" />

    <main class="app-shell__content">
      <div class="app-shell__content-inner">
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

  &__header {
    position: sticky;
    top: 0;
    z-index: $z-app-bar;
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
  }

  &__bottom-nav {
    position: sticky;
    bottom: 0;
    z-index: $z-bottom-nav;
  }
}
</style>
