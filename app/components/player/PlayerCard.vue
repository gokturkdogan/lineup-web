<script setup lang="ts">
interface Props {
  name: string
  position?: string
  rating?: number
  matchesPlayed?: number
  avatarUrl?: string | null
}

withDefaults(defineProps<Props>(), {
  position: '',
  rating: 0,
  matchesPlayed: 0,
  avatarUrl: null,
})
</script>

<template>
  <BaseCard interactive class="player-card">
    <BaseAvatar :src="avatarUrl" :name="name" size="lg" />

    <div class="player-card__body">
      <h3 class="player-card__name">{{ name }}</h3>
      <p v-if="position" class="player-card__position">{{ position }}</p>
      <div class="player-card__stats">
        <span v-if="matchesPlayed" class="player-card__stat">
          <strong>{{ matchesPlayed }}</strong> maç
        </span>
        <span v-if="rating" class="player-card__stat">
          <strong>{{ rating.toFixed(1) }}</strong> puan
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.player-card {
  display: flex;
  align-items: center;
  gap: $space-md;

  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    @include truncate;
  }

  &__position {
    margin-top: 2px;
    color: $color-text-muted;
    font-size: $font-size-xs;
  }

  &__stats {
    margin-top: $space-1;
    display: flex;
    gap: $space-md;
    color: $color-text-muted;
    font-size: $font-size-xs;

    strong {
      color: $color-text;
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
