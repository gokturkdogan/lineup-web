<script setup lang="ts">
interface NavItem {
  to: string
  label: string
  icon: 'home' | 'matches' | 'players' | 'profile'
}

const items: NavItem[] = [
  { to: '/home', label: 'Ana Sayfa', icon: 'home' },
  { to: '/matches', label: 'Maçlar', icon: 'matches' },
  { to: '/players', label: 'Oyuncular', icon: 'players' },
  { to: '/profile', label: 'Profil', icon: 'profile' },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="Ana menü">
    <ul class="bottom-nav__list">
      <li v-for="item in items" :key="item.to" class="bottom-nav__item">
        <NuxtLink :to="item.to" class="bottom-nav__link" active-class="is-active">
          <span class="bottom-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <template v-if="item.icon === 'home'">
                <path
                  d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
                  stroke="currentColor" stroke-width="1.7"
                  stroke-linecap="round" stroke-linejoin="round"
                />
              </template>
              <template v-else-if="item.icon === 'matches'">
                <circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.7" />
                <path
                  d="M12 5.5l2.5 1.8-1 3-3 0-1-3L12 5.5zM7.5 11l-1.7 2.5 1.2 2.6 3 .2 1.4-2.8L9 11l-1.5 0zM16.5 11L18.2 13.5l-1.2 2.6-3 .2-1.4-2.8L15 11l1.5 0z"
                  stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"
                />
              </template>
              <template v-else-if="item.icon === 'players'">
                <circle cx="9" cy="9" r="3.2" stroke="currentColor" stroke-width="1.7" />
                <path
                  d="M2.8 19.5c.7-3 3.4-4.8 6.2-4.8s5.5 1.8 6.2 4.8"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                />
                <circle cx="17.5" cy="8" r="2.4" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M14.5 14.2c.8-.4 1.8-.6 3-.6 2.1 0 4 1.1 4.6 3"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                />
              </template>
              <template v-else>
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.7" />
                <path
                  d="M4.5 20c1.1-3.4 4.1-5.4 7.5-5.4S18.4 16.6 19.5 20"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                />
              </template>
            </svg>
          </span>
          <span class="bottom-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.bottom-nav {
  background-color: $color-bottom-nav-bg;
  border-top: 1px solid $color-divider;
  @include safe-area-bottom(0);

  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    height: $bottom-nav-height;
  }

  &__item {
    display: flex;
  }

  &__link {
    @include flex-center;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    color: $color-text-muted;
    font-size: 11px;
    font-weight: $font-weight-medium;
    transition: color $duration-fast $ease-standard;
    @include tap-highlight-off;

    &.is-active {
      color: $color-primary;
    }

    @include media-hover {
      &:hover { color: $color-text; }
      &.is-active:hover { color: $color-primary-hover; }
    }

    &:active { transform: scale(0.97); }
  }

  &__icon {
    @include flex-center;
    width: 28px;
    height: 28px;
  }

  &__label {
    line-height: 1;
  }
}
</style>
