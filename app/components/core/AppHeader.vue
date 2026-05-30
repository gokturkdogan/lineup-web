<script setup lang="ts">
import { HOME_ROUTE } from '~/constants/routes'

interface Props {
  title?: string
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: false,
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appName = useRuntimeConfig().public.appName as string

const displayTitle = computed(() => props.title || headerTitle.value)

const headerTitle = computed(() => {
  if (route.meta?.title && typeof route.meta.title === 'string') return route.meta.title
  return appName
})

const avatarSrc = computed(() => userStore.current?.avatarUrl ?? null)

const onBack = () => {
  if (window.history.length > 1) router.back()
  else router.replace(HOME_ROUTE)
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__surface" aria-hidden="true">
      <div class="app-header__glow" />
    </div>

    <div class="app-header__inner">
      <div class="app-header__side app-header__side--start">
        <button
          v-if="showBack"
          type="button"
          class="app-header__back"
          aria-label="Geri dön"
          @click="onBack"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <NuxtLink
          v-else
          :to="HOME_ROUTE"
          class="app-header__brand"
          aria-label="Ana sayfa"
        >
          <span class="app-header__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L6.2 7.2l4-.6L12 3z"
                fill="currentColor"
              />
            </svg>
          </span>
        </NuxtLink>
      </div>

      <div class="app-header__center">
        <Transition name="app-header-title" mode="out-in">
          <h1 :key="displayTitle" class="app-header__title">
            {{ displayTitle }}
          </h1>
        </Transition>
      </div>

      <div class="app-header__side app-header__side--end">
        <NuxtLink to="/profile" class="app-header__avatar" aria-label="Profil">
          <span class="app-header__avatar-ring">
            <BaseAvatar
              size="sm"
              :name="userStore.displayName"
              :src="avatarSrc"
            />
          </span>
        </NuxtLink>
      </div>
    </div>

    <div class="app-header__accent" aria-hidden="true" />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: relative;
  z-index: $z-app-bar;
  @include safe-area-top(0);

  &__surface {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: rgba($color-surface, 0.82);
    border-bottom: 1px solid rgba($color-text, 0.06);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
  }

  &__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        120% 80% at 50% -40%,
        rgba($color-primary, 0.14) 0%,
        transparent 55%
      );
  }

  &__inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    gap: $space-sm;
    min-height: $app-header-height;
    padding: $space-2 $space-md;
  }

  &__side {
    display: flex;
    align-items: center;

    &--start {
      justify-content: flex-start;
    }

    &--end {
      justify-content: flex-end;
    }
  }

  &__back {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    color: $color-text;
    background: rgba($color-text, 0.04);
    border: 1px solid rgba($color-text, 0.06);
    transition:
      transform $duration-fast $ease-standard,
      background-color $duration-fast $ease-standard,
      border-color $duration-fast $ease-standard;
    @include focus-ring($color-primary);
    @include tap-highlight-off;

    @include media-hover {
      &:hover {
        background: rgba($color-primary, 0.08);
        border-color: rgba($color-primary, 0.12);
        color: $color-primary;
      }
    }

    &:active {
      transform: scale(0.94);
    }
  }

  &__brand {
    @include flex-center;
    text-decoration: none;
    @include focus-ring($color-primary);
    @include tap-highlight-off;

    &:active .app-header__brand-mark {
      transform: scale(0.94);
    }
  }

  &__brand-mark {
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    color: $color-text-on-primary;
    background:
      linear-gradient(
        145deg,
        lighten($color-primary, 6%) 0%,
        $color-primary 45%,
        $color-primary-hover 100%
      );
    box-shadow:
      0 4px 12px rgba($color-primary, 0.28),
      inset 0 1px 0 rgba(#fff, 0.22);
    transition: transform $duration-fast $ease-standard;
  }

  &__center {
    min-width: 0;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    letter-spacing: -0.02em;
    color: $color-text;
    @include truncate;
  }

  &__avatar {
    @include flex-center;
    text-decoration: none;
    @include focus-ring($color-primary);
    @include tap-highlight-off;

    &:active .app-header__avatar-ring {
      transform: scale(0.94);
    }
  }

  &__avatar-ring {
    display: inline-flex;
    padding: 2px;
    border-radius: $radius-full;
    background:
      linear-gradient(
        145deg,
        lighten($color-primary, 8%) 0%,
        $color-primary 50%,
        $color-primary-hover 100%
      );
    box-shadow: 0 4px 12px rgba($color-primary, 0.2);
    transition: transform $duration-fast $ease-standard;

    :deep(.avatar) {
      border: 2px solid $color-surface;
    }
  }

  &__accent {
    position: absolute;
    left: $space-lg;
    right: $space-lg;
    bottom: 0;
    z-index: 2;
    height: 2px;
    border-radius: $radius-pill;
    background:
      linear-gradient(
        90deg,
        transparent 0%,
        rgba($color-primary, 0.35) 20%,
        rgba($color-primary, 0.85) 50%,
        rgba($color-primary, 0.35) 80%,
        transparent 100%
      );
    opacity: 0.9;
  }
}

.app-header-title-enter-active,
.app-header-title-leave-active {
  transition:
    opacity $duration-base $ease-standard,
    transform $duration-base $ease-standard;
}

.app-header-title-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.app-header-title-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
