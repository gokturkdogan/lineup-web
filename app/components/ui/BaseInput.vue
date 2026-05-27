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

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="field" :class="{ 'field--error': !!error, 'field--disabled': disabled }">
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
        {{ showPassword ? 'Gizle' : 'Göster' }}
      </button>
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
    transition: border-color $duration-fast $ease-standard,
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
    padding: 0 $space-sm;
    border-radius: $radius-sm;
    color: $color-text-muted;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    @include media-hover {
      &:hover { color: $color-text; }
    }
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
}
</style>
