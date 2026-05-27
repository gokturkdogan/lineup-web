<script setup lang="ts">
/**
 * Minimal layout for the auth flow.
 * - Full viewport height
 * - Centered content
 * - Subtle brand background
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
  position: relative;
  min-height: 100dvh;
  width: 100%;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba($color-primary, 0.12) 0%, transparent 60%),
    $color-bg;
  @include safe-area-top($space-lg);
  @include safe-area-bottom($space-lg);

  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-lg;

  &__inner {
    width: 100%;
    max-width: 420px;
  }
}
</style>
