<script setup lang="ts">
interface Props {
  modelValue?: string | number | null
  label?: string
  type?: string
  placeholder?: string
  autocomplete?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string | null
  hint?: string
  id?: string
  name?: string
  /** Görsel tasarım stili. `underlined` = native-feel alt-çizgili input. */
  variant?: 'outlined' | 'underlined'
  /** Geçerli (valid) görsel imleci — değer geçerli olduğunda trailing'de check ikon gösterir. */
  valid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  type: 'text',
  placeholder: '',
  autocomplete: undefined,
  inputmode: undefined,
  disabled: false,
  readonly: false,
  required: false,
  error: null,
  hint: '',
  id: undefined,
  name: undefined,
  variant: 'outlined',
  valid: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const internalId = computed(() => props.id || `input-${useId()}`)
const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)

const resolvedType = computed(() => {
  if (!isPassword.value) return props.type
  return showPassword.value ? 'text' : 'password'
})

const showValidIcon = computed(
  () =>
    props.valid &&
    !isPassword.value &&
    !props.error &&
    !!props.modelValue &&
    String(props.modelValue).length > 0,
)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div
    class="field"
    :class="[
      `field--${variant}`,
      { 'field--error': !!error, 'field--disabled': disabled },
    ]"
  >
    <label v-if="label" :for="internalId" class="field__label">
      {{ label }}
      <span v-if="props.required" aria-hidden="true" class="field__required">*</span>
    </label>

    <div class="field__control">
      <input
        :id="internalId"
        class="field__input"
        :type="resolvedType"
        :name="name"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error || hint ? `${internalId}-desc` : undefined"
        @input="onInput"
        @blur="(e) => $emit('blur', e)"
        @focus="(e) => $emit('focus', e)"
      />

      <button
        v-if="isPassword"
        type="button"
        class="field__toggle"
        :aria-label="showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'"
        :aria-pressed="showPassword"
        tabindex="-1"
        @click="showPassword = !showPassword"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <template v-if="showPassword">
            <path
              d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"
              stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
            />
            <path d="M4 4l16 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </template>
          <template v-else>
            <path
              d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"
              stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"
            />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6" />
          </template>
        </svg>
      </button>

      <span v-else-if="showValidIcon" class="field__valid" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M5 12.5l4 4 10-10"
            stroke="currentColor" stroke-width="2.4"
            stroke-linecap="round" stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <p v-if="error" :id="`${internalId}-desc`" class="field__msg field__msg--error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${internalId}-desc`" class="field__msg">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  width: 100%;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text;
  }

  &__required {
    color: $color-error;
    margin-left: 2px;
  }

  &__control {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    height: 48px;
    padding: 0 $space-md;
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text;
    font-size: $font-size-md;
    line-height: 1.2;
    transition:
      border-color $duration-fast $ease-standard,
      box-shadow $duration-fast $ease-standard;
    appearance: none;

    &::placeholder {
      color: $color-text-faint;
    }

    &:hover:not(:disabled):not(:focus) {
      border-color: $color-border-strong;
    }

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 4px rgba($color-primary, 0.14);
    }

    &:disabled {
      background-color: $color-surface-alt;
      color: $color-text-muted;
      cursor: not-allowed;
    }
  }

  &__toggle {
    @include reset-button;
    position: absolute;
    right: $space-sm;
    height: 32px;
    width: 32px;
    @include flex-center;
    border-radius: $radius-sm;
    color: $color-text-muted;
    transition: color $duration-fast $ease-standard;

    @include media-hover {
      &:hover { color: $color-text; }
    }
  }

  &__valid {
    position: absolute;
    right: 0;
    @include flex-center;
    width: 24px;
    height: 24px;
    color: $color-primary;
    pointer-events: none;
    animation: field-valid-in 220ms $ease-emphasized both;
  }

  &__msg {
    margin: 0;
    font-size: $font-size-xs;
    color: $color-text-muted;

    &--error {
      color: $color-error;
    }
  }

  &--error &__input {
    border-color: $color-error;

    &:focus {
      box-shadow: 0 0 0 4px rgba($color-error, 0.14);
    }
  }

  &--disabled {
    opacity: 0.8;
  }

  // -------------------------------------------------------------------------
  // Underlined variant — native-app feel, no box, only bottom rule.
  // -------------------------------------------------------------------------
  &--underlined {
    gap: $space-1;
  }

  &--underlined &__label {
    color: $color-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    letter-spacing: 0.01em;
  }

  &--underlined &__input {
    height: 44px;
    padding: 0;
    padding-right: 32px; // alan açar — toggle/valid ikonlar üzerine basmasın
    background-color: transparent;
    border: 0;
    border-bottom: 1px solid $color-border;
    border-radius: 0;
    color: $color-text;
    font-size: $font-size-md;

    &::placeholder {
      color: $color-text-faint;
    }

    &:hover:not(:disabled):not(:focus) {
      border-color: $color-border-strong;
      box-shadow: none;
    }

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 1px 0 0 $color-primary; // ince ikinci alt çizgi (kalınlık vurgusu)
    }

    &:disabled {
      background-color: transparent;
      color: $color-text-muted;
    }
  }

  &--underlined &__toggle {
    right: 0;
  }

  &--underlined.field--error &__input {
    border-bottom-color: $color-error;
    &:focus { box-shadow: 0 1px 0 0 $color-error; }
  }
}

@keyframes field-valid-in {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
