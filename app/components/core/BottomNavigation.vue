<script setup lang="ts">
/**
 * BNB-45 bottom nav — Figma: 50 Mobile Bottom Navigation Bar (Community)
 * https://www.figma.com/design/3stW8xcwehACaWUclhPnWw
 */

interface NavItem {
  id: string
  to: string
  label: string
  side: 'left' | 'right'
  icon: 'organization' | 'matches' | 'players' | 'profile'
}

const items: NavItem[] = [
  {
    id: 'organization',
    to: '/organization',
    label: 'Organizasyon',
    side: 'left',
    icon: 'organization',
  },
  { id: 'matches', to: '/matches', label: 'Maçlar', side: 'left', icon: 'matches' },
  { id: 'players', to: '/players', label: 'Oyuncular', side: 'right', icon: 'players' },
  { id: 'profile', to: '/profile', label: 'Profil', side: 'right', icon: 'profile' },
]

const centerFab = {
  id: 'home',
  to: '/dashboard',
  label: 'Ana Sayfa',
}

const route = useRoute()

/** Geçici mock — organizasyon active önizlemesi; bitince `null` yap veya kaldır */
const MOCK_ACTIVE_TO: string | null = '/organization'

const leftItems = computed(() => items.filter((item) => item.side === 'left'))
const rightItems = computed(() => items.filter((item) => item.side === 'right'))

function isActive(to: string): boolean {
  if (to === '/dashboard') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

const isCenterActive = computed(() => !MOCK_ACTIVE_TO && isActive(centerFab.to))

const isSideItemActive = (to: string) => {
  if (MOCK_ACTIVE_TO) return to === MOCK_ACTIVE_TO
  return isActive(to) && !isCenterActive.value
}
</script>

<template>
  <nav class="bnb45" aria-label="Ana menü">
    <div class="bnb45__track">
      <svg
        class="bnb45__shape"
        viewBox="0 0 428 107"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="bnb45-hero-gradient"
            x1="0"
            y1="0"
            x2="428"
            y2="107"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="var(--bnb-grad-start)" />
            <stop offset="35%" stop-color="var(--bnb-grad-mid)" />
            <stop offset="70%" stop-color="var(--bnb-grad-deep)" />
            <stop offset="100%" stop-color="var(--bnb-grad-end)" />
          </linearGradient>
        </defs>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 107L0 56Q0 32 24 32H165.682C172.819 32 178.558 26.422 181.728 20.0282C187.613 8.15917 199.854 0 214 0C228.146 0 240.387 8.15917 246.272 20.0282C249.442 26.422 255.181 32 262.318 32H404Q428 32 428 56L428 107H0Z"
          fill="url(#bnb45-hero-gradient)"
        />
      </svg>

      <div class="bnb45__content">
        <div class="bnb45__group">
          <NuxtLink
            v-for="item in leftItems"
            :key="item.id"
            :to="item.to"
            class="bnb45__item"
            :class="{ 'bnb45__item--active': isSideItemActive(item.to) }"
          >
            <span v-if="isSideItemActive(item.to)" class="bnb45__indicator" aria-hidden="true" />
            <span class="bnb45__icon" aria-hidden="true">
              <BottomNavIcon
                :icon="item.icon"
                :active="isSideItemActive(item.to)"
              />
            </span>
            <span class="bnb45__label">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <p
          class="bnb45__center-label"
          :class="{ 'bnb45__center-label--active': isCenterActive }"
        >
          {{ centerFab.label }}
        </p>

        <div class="bnb45__group">
          <NuxtLink
            v-for="item in rightItems"
            :key="item.id"
            :to="item.to"
            class="bnb45__item"
            :class="{ 'bnb45__item--active': isSideItemActive(item.to) }"
          >
            <span v-if="isSideItemActive(item.to)" class="bnb45__indicator" aria-hidden="true" />
            <span class="bnb45__icon" aria-hidden="true">
              <BottomNavIcon
                :icon="item.icon"
                :active="isSideItemActive(item.to)"
              />
            </span>
            <span class="bnb45__label">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <NuxtLink
          :to="centerFab.to"
          class="bnb45__fab"
          :class="{ 'bnb45__fab--active': isCenterActive }"
          :aria-label="centerFab.label"
        >
          <BottomNavIcon icon="home" :active="isCenterActive" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
// Hero ile aynı gradient — dashboard__hero
$bnb-grad-start: lighten($color-primary, 4%);
$bnb-grad-mid: $color-primary;
$bnb-grad-deep: $color-primary-hover;
$bnb-grad-end: #064e3b;
$bnb-inactive: #ffffff;
$bnb-active: #ffffff;
$bnb-fab-bg: #ffffff;
$bnb-fab-icon: $color-primary;
$bnb-fab-shadow: 0 4px 14px rgba(#000, 0.22);

.bnb45 {
  --bnb-grad-start: #{$bnb-grad-start};
  --bnb-grad-mid: #{$bnb-grad-mid};
  --bnb-grad-deep: #{$bnb-grad-deep};
  --bnb-grad-end: #{$bnb-grad-end};

  padding: 0;
  pointer-events: none;

  &__track {
    position: relative;
    height: calc(107px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    pointer-events: auto;
    filter: drop-shadow(0 -4px 20px rgba($bnb-grad-end, 0.35));
  }

  &__shape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  &__content {
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 75px;
    padding: 0 10px;
  }

  &__group {
    display: flex;
    flex: 0 1 calc(50% - 34px);
    gap: 2px;
    align-items: flex-start;
    justify-content: space-around;
    min-width: 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 0;
    min-width: 0;
    max-width: 88px;
    height: 75px;
    padding: 10px 2px 8px;
    gap: 10px;
    color: $bnb-inactive;
    text-decoration: none;
    transition: color $duration-fast $ease-standard;
    @include tap-highlight-off;
    @include focus-ring(#fff);

    &--active {
      gap: 4px;
      color: $bnb-active;

      .bnb45__label {
        font-weight: $font-weight-medium;
      }
    }

    &:active {
      transform: scale(0.97);
    }
  }

  &__indicator {
    display: block;
    width: 17px;
    height: 1.5px;
    border-radius: 1px;
    background-color: $bnb-active;
    flex-shrink: 0;
  }

  &__icon {
    @include flex-center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  &__label {
    width: 100%;
    font-size: clamp(9.5px, 2.75vw, 11px);
    font-weight: $font-weight-regular;
    line-height: 1.15;
    letter-spacing: -0.02em;
    text-align: center;
    white-space: nowrap;
  }

  &__center-label {
    position: absolute;
    left: 50%;
    bottom: 32px;
    transform: translate(-50%, 100%);
    margin: 0;
    font-size: clamp(9.5px, 2.75vw, 11px);
    font-weight: $font-weight-regular;
    letter-spacing: -0.02em;
    color: $bnb-inactive;
    white-space: nowrap;
    pointer-events: none;

    &--active {
      color: $bnb-active;
      font-weight: $font-weight-medium;
    }
  }

  &__fab {
    position: absolute;
    top: -22px;
    left: calc(50% + 0.5px);
    transform: translateX(-50%);
    @include flex-center;
    width: 55px;
    height: 55px;
    border-radius: 50px;
    background-color: $bnb-fab-bg;
    box-shadow: $bnb-fab-shadow;
    color: $bnb-fab-icon;
    text-decoration: none;
    transition:
      transform $duration-fast $ease-standard,
      box-shadow $duration-base $ease-standard;
    @include tap-highlight-off;
    @include focus-ring($color-primary);

    &:active {
      transform: translateX(-50%) scale(0.96);
    }

    &--active {
      box-shadow: 0 6px 18px rgba(#000, 0.28);
    }
  }
}
</style>
