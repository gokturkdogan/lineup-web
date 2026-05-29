<script setup lang="ts">
interface Props {
  title?: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showBack: false,
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const headerTitle = computed(() => {
  if (route.meta?.title && typeof route.meta.title === 'string') return route.meta.title
  return useRuntimeConfig().public.appName as string
})

const onBack = () => {
  if (window.history.length > 1) router.back()
  else router.replace('/home')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <button
        v-if="showBack"
        type="button"
        class="app-header__icon-btn"
        aria-label="Geri dön"
        @click="onBack"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div v-else class="app-header__spacer" />

      <h1 class="app-header__title">{{ title || headerTitle }}</h1>

      <NuxtLink to="/profile" class="app-header__avatar" aria-label="Profil">
        <BaseAvatar size="sm" :name="userStore.displayName" />
      </NuxtLink>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  background-color: $color-app-bar-bg;
  border-bottom: 1px solid $color-divider;
  @include safe-area-top(0);
  @include shadow(xs);

  &__inner {
    display: grid;
    grid-template-columns: 40px 1fr 40px;
    align-items: center;
    height: $app-header-height;
    padding: 0 $space-md;
  }

  &__icon-btn {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    color: $color-text;
    @include focus-ring;
    @include tap-highlight-off;

    @include media-hover {
      &:hover { background-color: rgba($color-text, 0.05); }
    }
    &:active { transform: scale(0.96); }
  }

  &__spacer { width: 40px; height: 40px; }

  &__title {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    text-align: center;
    @include truncate;
  }

  &__avatar {
    @include flex-center;
    justify-self: end;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    @include focus-ring;
  }
}
</style>
