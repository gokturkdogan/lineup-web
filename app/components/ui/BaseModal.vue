<script setup lang="ts">
type ModalSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  size?: ModalSize
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  lockScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  lockScroll: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

const titleId = `modal-title-${useId()}`
const panelRef = ref<HTMLElement | null>(null)

const close = () => {
  if (!props.modelValue) return
  emit('update:modelValue', false)
  emit('close')
}

const open = () => {
  emit('update:modelValue', true)
  emit('open')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) close()
}

const handleEscape = (event: KeyboardEvent) => {
  if (!props.modelValue || !props.closeOnEscape) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

const setScrollLock = (locked: boolean) => {
  if (!import.meta.client || !props.lockScroll) return
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.modelValue,
  (isOpen) => {
    setScrollLock(isOpen)
    if (isOpen) {
      nextTick(() => {
        const focusable = panelRef.value?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        focusable?.focus()
      })
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  setScrollLock(false)
})

defineExpose({ close, open })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal"
        role="presentation"
      >
        <button
          type="button"
          class="modal__backdrop"
          aria-label="Modalı kapat"
          @click="handleBackdropClick"
        />

        <div
          ref="panelRef"
          class="modal__panel"
          :class="`modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title || $slots.header ? titleId : undefined"
        >
          <header
            v-if="title || subtitle || closable || $slots.header"
            class="modal__header"
          >
            <slot name="header">
              <div class="modal__header-text">
                <h2
                  v-if="title"
                  :id="titleId"
                  class="modal__title"
                >
                  {{ title }}
                </h2>
                <p
                  v-if="subtitle"
                  class="modal__subtitle"
                >
                  {{ subtitle }}
                </p>
              </div>
            </slot>

            <button
              v-if="closable"
              type="button"
              class="modal__close"
              aria-label="Kapat"
              @click="close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </header>

          <div class="modal__body">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="modal__footer"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  @include flex-center;
  padding: $space-lg;
  padding-top: calc(env(safe-area-inset-top, 0px) + #{$space-lg});
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + #{$space-lg});
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: $color-overlay;
  cursor: pointer;
  backdrop-filter: blur(2px);
}

.modal__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: min(90dvh, 640px);
  background: $color-surface;
  border-radius: $radius-2xl;
  border: 1px solid rgba($color-text, 0.06);
  @include shadow(lg);
  overflow: hidden;

  &--sm { max-width: 360px; }
  &--md { max-width: 420px; }
  &--lg { max-width: 520px; }
}

.modal__header {
  @include flex-between;
  align-items: flex-start;
  gap: $space-md;
  padding: $space-lg $space-lg $space-sm;
}

.modal__header-text {
  min-width: 0;
}

.modal__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;
  color: $color-text;
}

.modal__subtitle {
  margin: $space-1 0 0;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: $color-text-muted;
}

.modal__close {
  @include reset-button;
  @include flex-center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: $radius-pill;
  color: $color-text-muted;
  background: rgba($color-text, 0.04);
  transition:
    background-color $duration-fast $ease-standard,
    color $duration-fast $ease-standard;
  @include focus-ring($color-primary);
  @include tap-highlight-off;

  @include media-hover {
    &:hover {
      color: $color-text;
      background: rgba($color-text, 0.08);
    }
  }
}

.modal__body {
  flex: 1 1 auto;
  padding: $space-sm $space-lg $space-lg;
  overflow-y: auto;
  @include scroll-y;
}

.modal__footer {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: 0 $space-lg $space-lg;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity $duration-base $ease-standard;

  .modal__panel {
    transition:
      transform $duration-base $ease-standard,
      opacity $duration-base $ease-standard;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__panel {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
}
</style>
