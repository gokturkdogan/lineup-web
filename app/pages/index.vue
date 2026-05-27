<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
  title: 'Lineup',
})

const { displayName } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 5) return 'İyi geceler'
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi günler'
  return 'İyi akşamlar'
})
</script>

<template>
  <div class="home">
    <PageHeader :title="`${greeting},`" :subtitle="displayName || 'Lineup’a hoş geldin'" />

    <section class="home__section">
      <h3 class="home__section-title">Hızlı işlemler</h3>
      <div class="home__actions">
        <BaseButton variant="primary" size="md" to="/matches">Yeni maç</BaseButton>
        <BaseButton variant="secondary" size="md" to="/players">Oyuncu davet et</BaseButton>
      </div>
    </section>

    <section class="home__section">
      <h3 class="home__section-title">Yakında</h3>
      <BaseCard padding="lg">
        <p class="home__placeholder">
          Lineup’ın tüm deneyimi — maç planlama, kadrolar ve oyuncu istatistikleri
          — burada yer alacak. Bu ekran, uygulamanın iskeletini uçtan uca
          incelemek için bir yer tutucudur.
        </p>
      </BaseCard>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  gap: $space-lg;

  &__section {
    display: flex;
    flex-direction: column;
    gap: $space-sm;
  }

  &__section-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $color-text-muted;
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-sm;
  }

  &__placeholder {
    color: $color-text-muted;
    font-size: $font-size-sm;
    line-height: $line-height-base;
  }
}
</style>
