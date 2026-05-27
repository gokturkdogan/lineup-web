<script setup lang="ts">
interface Props {
  title: string
  location?: string
  date?: string
  playersCount?: number
  status?: 'upcoming' | 'live' | 'completed'
}

withDefaults(defineProps<Props>(), {
  location: '',
  date: '',
  playersCount: 0,
  status: 'upcoming',
})

const statusLabel: Record<NonNullable<Props['status']>, string> = {
  upcoming: 'Yaklaşan',
  live: 'Canlı',
  completed: 'Tamamlandı',
}
</script>

<template>
  <BaseCard interactive class="match-card">
    <div class="match-card__head">
      <span class="match-card__status" :class="`match-card__status--${status}`">
        {{ statusLabel[status] }}
      </span>
      <span v-if="date" class="match-card__date">{{ date }}</span>
    </div>

    <h3 class="match-card__title">{{ title }}</h3>

    <div class="match-card__meta">
      <span v-if="location" class="match-card__meta-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"
            stroke="currentColor" stroke-width="1.6"
          />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6" />
        </svg>
        {{ location }}
      </span>
      <span v-if="playersCount" class="match-card__meta-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6" />
          <path
            d="M3 19c.7-2.7 3.1-4.4 6-4.4S14.3 16.3 15 19"
            stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
          />
        </svg>
        {{ playersCount }} oyuncu
      </span>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.match-card {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__head {
    @include flex-between;
    gap: $space-sm;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 $space-sm;
    border-radius: $radius-pill;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--upcoming {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }
    &--live {
      background-color: rgba($color-error, 0.1);
      color: $color-error;
    }
    &--completed {
      background-color: rgba($color-text, 0.08);
      color: $color-text-muted;
    }
  }

  &__date {
    color: $color-text-muted;
    font-size: $font-size-xs;
  }

  &__title {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    @include line-clamp(2);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $space-md;
    color: $color-text-muted;
    font-size: $font-size-xs;
  }

  &__meta-item {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
  }
}
</style>
