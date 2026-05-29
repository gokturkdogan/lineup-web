<script setup lang="ts">
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  src?: string | null
  name?: string
  size?: Size
  alt?: string
}

const DEFAULT_AVATAR = '/images/default-avatar.svg'

const props = withDefaults(defineProps<Props>(), {
  src: null,
  name: '',
  size: 'md',
  alt: undefined,
})

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
})

const loadFailed = ref(false)
watch(
  () => props.src,
  () => {
    loadFailed.value = false
  },
)

const resolvedSrc = computed(() => {
  if (props.src && !loadFailed.value) return props.src
  if (!initials.value) return DEFAULT_AVATAR
  return null
})

const showImage = computed(() => !!resolvedSrc.value)
const showInitials = computed(() => !showImage.value && !!initials.value)

function onImageError() {
  if (props.src && resolvedSrc.value === props.src) {
    loadFailed.value = true
  }
}
</script>

<template>
  <div class="avatar" :class="[`avatar--${size}`]">
    <img
      v-if="showImage"
      :src="resolvedSrc!"
      :alt="alt ?? name ?? 'profil'"
      class="avatar__img"
      @error="onImageError"
    />
    <span v-else-if="showInitials" class="avatar__initials" aria-hidden="true">{{ initials }}</span>
  </div>
</template>

<style scoped lang="scss">
.avatar {
  --avatar-size: 40px;
  --avatar-font-size: #{$font-size-sm};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  background-color: rgba($color-primary, 0.12);
  color: $color-primary;
  font-weight: $font-weight-semibold;
  font-size: var(--avatar-font-size);
  overflow: hidden;
  flex: 0 0 auto;
  user-select: none;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__initials {
    line-height: 1;
  }

  &--xs { --avatar-size: 24px; --avatar-font-size: 10px; }
  &--sm { --avatar-size: 32px; --avatar-font-size: 12px; }
  &--md { --avatar-size: 40px; --avatar-font-size: #{$font-size-sm}; }
  &--lg { --avatar-size: 56px; --avatar-font-size: #{$font-size-md}; }
  &--xl { --avatar-size: 80px; --avatar-font-size: #{$font-size-xl}; }
}
</style>
