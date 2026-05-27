<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), { subtitle: '' })
</script>

<template>
  <header class="page-header">
    <div>
      <h2 class="page-header__title">{{ title }}</h2>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  @include flex-between;
  gap: $space-md;
  margin-bottom: $space-lg;

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    letter-spacing: -0.01em;
  }

  &__subtitle {
    margin-top: 2px;
    color: $color-text-muted;
    font-size: $font-size-sm;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-sm;
  }
}
</style>
