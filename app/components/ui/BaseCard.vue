<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  interactive: false,
})
</script>

<template>
  <div
    class="card"
    :class="[`card--pad-${padding}`, { 'card--interactive': interactive }]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.card {
  background-color: $color-surface;
  border-radius: $radius-lg;
  border: 1px solid rgba($color-text, 0.04);
  @include shadow(sm);

  &--pad-none { padding: 0; }
  &--pad-sm   { padding: $space-md; }
  &--pad-md   { padding: $space-lg; }
  &--pad-lg   { padding: $space-xl; }

  &--interactive {
    cursor: pointer;
    transition: transform $duration-fast $ease-standard,
                box-shadow $duration-fast $ease-standard;
    @include tap-highlight-off;

    @include media-hover {
      &:hover { @include shadow(md); }
    }
    &:active { transform: scale(0.992); }
  }
}
</style>
