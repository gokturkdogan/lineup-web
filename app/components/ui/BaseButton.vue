<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  block: false,
  loading: false,
  disabled: false,
  to: undefined,
})

defineEmits<{ click: [event: MouseEvent] }>()

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--block': block, 'btn--loading': loading, 'btn--disabled': isDisabled },
    ]"
    :aria-disabled="isDisabled || undefined"
  >
    <span class="btn__content"><slot /></span>
  </NuxtLink>

  <button
    v-else
    :type="type"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--block': block, 'btn--loading': loading },
    ]"
    :disabled="isDisabled"
    @click="(e) => $emit('click', e)"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__content" :class="{ 'btn__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped lang="scss">
.btn {
  --btn-bg: #{$color-primary};
  --btn-bg-hover: #{$color-primary-hover};
  --btn-fg: #{$color-text-on-primary};
  --btn-border: transparent;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-sm;
  border: 1px solid var(--btn-border);
  border-radius: $radius-md;
  background-color: var(--btn-bg);
  color: var(--btn-fg);
  font-weight: $font-weight-semibold;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition:
    background-color $duration-fast $ease-standard,
    transform $duration-fast $ease-standard,
    opacity $duration-fast $ease-standard;
  @include focus-ring(var(--btn-bg));
  @include tap-highlight-off;

  &:disabled,
  &.btn--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):not(.btn--disabled):active {
    transform: scale(0.985);
  }

  @include media-hover {
    &:not(:disabled):not(.btn--disabled):hover {
      background-color: var(--btn-bg-hover);
    }
  }

  // ---------- Sizes ----------
  &--sm {
    height: 36px;
    padding: 0 $space-md;
    font-size: $font-size-sm;
  }
  &--md {
    height: 44px;
    padding: 0 $space-lg;
    font-size: $font-size-base;
  }
  &--lg {
    height: 52px;
    padding: 0 $space-xl;
    font-size: $font-size-md;
  }

  // ---------- Variants ----------
  &--primary {
    --btn-bg: #{$color-primary};
    --btn-bg-hover: #{$color-primary-hover};
    --btn-fg: #{$color-text-on-primary};
  }

  &--secondary {
    --btn-bg: #{$color-surface};
    --btn-bg-hover: #{$color-surface-alt};
    --btn-fg: #{$color-text};
    --btn-border: #{$color-border};
  }

  &--ghost {
    --btn-bg: transparent;
    --btn-bg-hover: #{rgba($color-text, 0.06)};
    --btn-fg: #{$color-text};
    --btn-border: transparent;
  }

  &--danger {
    --btn-bg: #{$color-error};
    --btn-bg-hover: #{darken($color-error, 6%)};
    --btn-fg: #fff;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    gap: $space-sm;

    &--hidden {
      opacity: 0;
    }
  }

  &__spinner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid currentColor;
    border-right-color: transparent;
    animation: btn-spin 0.7s linear infinite;
  }
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
