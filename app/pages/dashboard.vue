<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { displayName, user } = useAuth()
const userStore = useUserStore()

const badgeName = computed(() => {
  const firstName = userStore.current?.name?.trim()
  if (firstName) return firstName
  if (displayName.value) return displayName.value
  return 'Üye'
})

// API entegrasyonu gelene kadar örnek veri — dashboard iskeleti.
const stats = [
  { id: 'matches', label: 'Oynanan maç', value: '4', trend: null },
  { id: 'players', label: 'Aktif oyuncu', value: '18', trend: null },
  { id: 'attendance', label: 'Ort. katılım', value: '%82', trend: null },
]

const quickActions = [
  {
    id: 'new-match',
    label: 'Yeni maç',
    to: '/matches',
    icon: 'match',
    accent: true,
  },
]

interface UpcomingMatch {
  title: string
  location: string
  dateLabel: string
  dateFull: string
  startsAt: string
  daysUntil: number
  format: string
  attendance: {
    confirmed: number
    declined: number
    pending: number
    capacity: number
  }
}

/** API entegrasyonu gelene kadar — `null` = henüz maç yok senaryosu */
const upcomingMatch = ref<UpcomingMatch | null>(null)

/** Dolu kart önizlemesi için mock veriyi buraya ata:
upcomingMatch.value = {
  title: 'Cumartesi Halı Saha Maçı',
  location: 'Kadıköy Spor Tesisleri',
  dateLabel: 'Cumartesi, 14:00',
  dateFull: '31 Mayıs 2026',
  startsAt: '2026-05-29T18:00:00',
  daysUntil: 2,
  format: '7v7 · Halı saha',
  attendance: {
    confirmed: 9,
    declined: 2,
    pending: 4,
    capacity: 16,
  },
}
*/

const squadFillPercent = computed(() => {
  const match = upcomingMatch.value
  if (!match) return 0
  const { confirmed, capacity } = match.attendance
  if (!capacity) return 0
  return Math.min(100, Math.round((confirmed / capacity) * 100))
})

const showInviteModal = ref(false)
</script>

<template>
  <div class="dashboard">
    <section class="dashboard__hero">
      <div class="dashboard__hero-glow" aria-hidden="true" />

      <div class="dashboard__hero-top">
        <div class="dashboard__hero-text">
          <h1 class="dashboard__name">{{ displayName || "Lineup'a hoş geldin" }}</h1>
          <span class="dashboard__role">{{ badgeName }}</span>
        </div>
        <NuxtLink to="/profile" class="dashboard__avatar-link" aria-label="Profil">
          <BaseAvatar
            size="lg"
            :name="displayName"
            :src="user?.avatarUrl"
          />
        </NuxtLink>
      </div>

      <div class="dashboard__stats">
        <article
          v-for="stat in stats"
          :key="stat.id"
          class="dashboard__stat"
        >
          <p class="dashboard__stat-value">
            {{ stat.value }}
            <span v-if="stat.trend" class="dashboard__stat-trend">{{ stat.trend }}</span>
          </p>
          <p class="dashboard__stat-label">{{ stat.label }}</p>
        </article>
      </div>
    </section>

    <div class="dashboard__body">
      <section class="dashboard__section">
        <h2 class="dashboard__section-title">Hızlı işlemler</h2>
        <div class="dashboard__actions">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.id"
            :to="action.to"
            class="dashboard__action"
            :class="{ 'dashboard__action--accent': action.accent }"
          >
            <span class="dashboard__action-icon" aria-hidden="true">
              <SoccerBallIcon v-if="action.icon === 'match'" :size="20" />
            </span>
            <span class="dashboard__action-label">{{ action.label }}</span>
          </NuxtLink>

          <button
            type="button"
            class="dashboard__action"
            @click="showInviteModal = true"
          >
            <span class="dashboard__action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8" />
                <path d="M3 19c.8-3 3.4-4.8 6-4.8s5.2 1.8 6 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M19 8v6M16 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span class="dashboard__action-label">Oyuncu davet et</span>
          </button>
        </div>
      </section>

      <section class="dashboard__section">
        <div class="dashboard__section-head">
          <h2 class="dashboard__section-title">Yaklaşan maç</h2>
          <NuxtLink class="dashboard__section-link" to="/matches">Tümü</NuxtLink>
        </div>

        <BaseCard v-if="upcomingMatch" padding="none" class="dashboard__upcoming">
          <div class="dashboard__upcoming-head">
            <span class="dashboard__upcoming-badge">Yaklaşan</span>
            <span class="dashboard__upcoming-countdown">{{ upcomingMatch.daysUntil }} gün kaldı</span>
          </div>

          <div class="dashboard__upcoming-body">
            <div class="dashboard__upcoming-details-row">
              <ul class="dashboard__upcoming-details">
                <li class="dashboard__upcoming-detail">
                  <span class="dashboard__upcoming-detail-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" />
                      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span>
                    <strong>{{ upcomingMatch.dateLabel }}</strong>
                    <span class="dashboard__upcoming-detail-sub">{{ upcomingMatch.dateFull }}</span>
                  </span>
                </li>
                <li class="dashboard__upcoming-detail">
                  <span class="dashboard__upcoming-detail-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" stroke-width="1.6" />
                      <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6" />
                    </svg>
                  </span>
                  <span>{{ upcomingMatch.location }}</span>
                </li>
                <li class="dashboard__upcoming-detail">
                  <span class="dashboard__upcoming-detail-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6" />
                      <path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span>{{ upcomingMatch.format }}</span>
                </li>
              </ul>

              <div class="dashboard__upcoming-details-side">
                <MatchCountdownRing :target="upcomingMatch.startsAt" />
              </div>
            </div>

            <div class="dashboard__upcoming-attendance">
              <div class="dashboard__upcoming-attendance-head">
                <p class="dashboard__upcoming-attendance-title">Katılım durumu</p>
                <p class="dashboard__upcoming-attendance-count">
                  {{ upcomingMatch.attendance.confirmed }}/{{ upcomingMatch.attendance.capacity }} oyuncu
                </p>
              </div>

              <div
                class="dashboard__upcoming-progress"
                role="progressbar"
                :aria-valuenow="upcomingMatch.attendance.confirmed"
                :aria-valuemin="0"
                :aria-valuemax="upcomingMatch.attendance.capacity"
                :aria-label="`Kadro doluluk oranı %${squadFillPercent}`"
              >
                <div
                  class="dashboard__upcoming-progress-fill"
                  :style="{ width: `${squadFillPercent}%` }"
                />
              </div>

              <div class="dashboard__upcoming-rsvp">
                <div class="dashboard__upcoming-rsvp-item">
                  <span class="dashboard__upcoming-rsvp-value dashboard__upcoming-rsvp-value--yes">
                    {{ upcomingMatch.attendance.confirmed }}
                  </span>
                  <span class="dashboard__upcoming-rsvp-label">Gelecek</span>
                </div>
                <div class="dashboard__upcoming-rsvp-item">
                  <span class="dashboard__upcoming-rsvp-value dashboard__upcoming-rsvp-value--no">
                    {{ upcomingMatch.attendance.declined }}
                  </span>
                  <span class="dashboard__upcoming-rsvp-label">Gelmeyecek</span>
                </div>
                <div class="dashboard__upcoming-rsvp-item">
                  <span class="dashboard__upcoming-rsvp-value dashboard__upcoming-rsvp-value--wait">
                    {{ upcomingMatch.attendance.pending }}
                  </span>
                  <span class="dashboard__upcoming-rsvp-label">Yanıt yok</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-else padding="none" class="dashboard__upcoming dashboard__upcoming--empty">
          <div class="dashboard__upcoming-empty">
            <div class="dashboard__upcoming-empty-icon" aria-hidden="true">
              <SoccerBallIcon :size="28" />
            </div>

            <h3 class="dashboard__upcoming-empty-title">Henüz maç oluşturulmadı</h3>
            <p class="dashboard__upcoming-empty-text">
              İlk maçını planlayarak kadro ve katılım takibine başlayabilirsin.
            </p>

            <NuxtLink to="/matches" class="dashboard__upcoming-empty-cta">
              <SoccerBallIcon :size="18" />
              Maç oluştur
            </NuxtLink>
          </div>
        </BaseCard>
      </section>
    </div>

    <PlayerInviteModal v-model="showInviteModal" />
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  animation: dashboard-fade-in 480ms $ease-standard both;
}

// --- Hero ---
.dashboard__hero {
  position: relative;
  padding: $space-lg $space-lg $space-xl;
  padding-top: calc(env(safe-area-inset-top, 0px) + #{$space-lg});
  color: $color-text-on-primary;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      lighten($color-primary, 4%) 0%,
      $color-primary 35%,
      $color-primary-hover 70%,
      #064e3b 100%
    );
  border-bottom-left-radius: $radius-2xl;
  border-bottom-right-radius: $radius-2xl;
}

.dashboard__hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    top: -80px;
    right: -60px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(#fff, 0.14) 0%, transparent 70%);
  }
}

.dashboard__hero-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-md;
  margin-bottom: $space-lg;
}

.dashboard__name {
  margin: 0;
  color: $color-text-on-primary;
  font-size: clamp(22px, 5.5vw, 26px);
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;
  text-shadow: 0 1px 8px rgba(#000, 0.12);
}

.dashboard__role {
  display: inline-flex;
  margin-top: $space-2;
  padding: 4px $space-2;
  color: $color-text-on-primary;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.01em;
  background: rgba(#fff, 0.16);
  border-radius: $radius-pill;
}

.dashboard__avatar-link {
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(#000, 0.2);
  @include focus-ring(#fff);

  :deep(.avatar) {
    background-color: rgba(#fff, 0.95);
    color: $color-primary;
    border: 2px solid rgba(#fff, 0.6);
  }
}

.dashboard__stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-2;
}

.dashboard__stat {
  padding: $space-3 $space-2;
  text-align: center;
  background: rgba(#fff, 0.12);
  border: 1px solid rgba(#fff, 0.14);
  border-radius: $radius-lg;
  backdrop-filter: blur(4px);
}

.dashboard__stat-value {
  margin: 0;
  color: $color-text-on-primary;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  line-height: 1;
}

.dashboard__stat-trend {
  margin-left: 2px;
  color: $color-text-on-primary;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  opacity: 0.9;
}

.dashboard__stat-label {
  margin: $space-1 0 0;
  color: $color-text-on-primary;
  font-size: 10px;
  font-weight: $font-weight-medium;
  opacity: 0.92;
  line-height: 1.3;
}

// --- Body ---
.dashboard__body {
  padding: $space-md $space-lg $space-md;
  display: flex;
  flex-direction: column;
  gap: $space-lg;
}

.dashboard__section {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.dashboard__section-head {
  @include flex-between;
  gap: $space-sm;
}

.dashboard__section-title {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-text-muted;
}

.dashboard__section-link {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-primary;
  text-decoration: none;
  @include focus-ring;
  @include tap-highlight-off;

  @include media-hover {
    &:hover { color: $color-primary-hover; }
  }
}

// --- Quick actions ---
.dashboard__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-sm;
}

.dashboard__action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-3;
  padding: $space-3;
  min-height: 82px;
  width: 100%;
  background-color: $color-surface;
  border: 1px solid rgba($color-text, 0.04);
  border-radius: $radius-lg;
  color: $color-text;
  text-decoration: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
  @include shadow(sm);
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring($color-primary);

  @include media-hover {
    &:hover { @include shadow(md); }
  }

  &:active {
    transform: scale(0.985);
  }

  &--accent {
    color: #fff;
    background:
      linear-gradient(
        135deg,
        lighten($color-primary, 2%) 0%,
        $color-primary 50%,
        $color-primary-hover 100%
      );
    border-color: transparent;
    box-shadow: 0 8px 20px rgba($color-primary, 0.28);

    .dashboard__action-icon {
      background: rgba(#fff, 0.18);
      color: #fff;
    }

    @include media-hover {
      &:hover {
        box-shadow: 0 12px 28px rgba($color-primary, 0.34);
      }
    }
  }
}

.dashboard__action-icon {
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: $radius-md;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
}

.dashboard__action-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  line-height: 1.2;
}

// --- Upcoming match ---
.dashboard__upcoming {
  overflow: hidden;
}

.dashboard__upcoming-head {
  @include flex-between;
  gap: $space-sm;
  padding: $space-md $space-lg;
  background: linear-gradient(
    135deg,
    rgba($color-primary, 0.08) 0%,
    rgba($color-primary, 0.03) 100%
  );
  border-bottom: 1px solid rgba($color-text, 0.05);
}

.dashboard__upcoming-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 $space-2;
  border-radius: $radius-pill;
  background-color: rgba($color-primary, 0.12);
  color: $color-primary;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dashboard__upcoming-countdown {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-muted;
}

.dashboard__upcoming-body {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding: $space-lg;
}

.dashboard__upcoming-details-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: $space-md;
  align-items: center;
}

.dashboard__upcoming-details {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;
}

.dashboard__upcoming-details-side {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 100%;
}

.dashboard__upcoming-detail {
  display: flex;
  align-items: center;
  gap: $space-md;
  font-size: $font-size-sm;
  color: $color-text;
  line-height: 1.35;

  strong {
    display: block;
    font-weight: $font-weight-semibold;
  }
}

.dashboard__upcoming-detail-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: $radius-md;
  background: rgba($color-primary, 0.08);
  color: $color-primary;
}

.dashboard__upcoming-detail-sub {
  display: block;
  margin-top: 1px;
  color: $color-text-muted;
  font-size: $font-size-xs;
}

.dashboard__upcoming-attendance {
  padding: $space-md;
  border-radius: $radius-md;
  background: rgba($color-text, 0.03);
  border: 1px solid rgba($color-text, 0.05);
}

.dashboard__upcoming-attendance-head {
  @include flex-between;
  gap: $space-sm;
  margin-bottom: $space-sm;
}

.dashboard__upcoming-attendance-title {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.dashboard__upcoming-attendance-count {
  margin: 0;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}

.dashboard__upcoming-progress {
  height: 8px;
  border-radius: $radius-pill;
  background: rgba($color-text, 0.08);
  overflow: hidden;
}

.dashboard__upcoming-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    $color-primary 0%,
    lighten($color-primary, 8%) 100%
  );
  transition: width $duration-base $ease-standard;
}

.dashboard__upcoming-rsvp {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-sm;
  margin-top: $space-md;
}

.dashboard__upcoming-rsvp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: $space-sm $space-2;
  border-radius: $radius-sm;
  background: $color-surface;
}

.dashboard__upcoming-rsvp-value {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  line-height: 1;

  &--yes { color: $color-primary; }
  &--no { color: $color-error; }
  &--wait { color: $color-text-muted; }
}

.dashboard__upcoming-rsvp-label {
  font-size: 10px;
  font-weight: $font-weight-medium;
  color: $color-text-muted;
  text-align: center;
  line-height: 1.2;
}

.dashboard__upcoming--empty {
  border: 1px dashed rgba($color-primary, 0.22);
  background:
    linear-gradient(
      180deg,
      rgba($color-primary, 0.04) 0%,
      rgba($color-primary, 0.01) 100%
    );
}

.dashboard__upcoming-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-sm;
  padding: $space-xl $space-lg;
}

.dashboard__upcoming-empty-icon {
  @include flex-center;
  width: 56px;
  height: 56px;
  margin-bottom: $space-1;
  border-radius: $radius-xl;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
}

.dashboard__upcoming-empty-title {
  margin: 0;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-text;
  letter-spacing: -0.01em;
}

.dashboard__upcoming-empty-text {
  margin: 0;
  max-width: 260px;
  font-size: $font-size-sm;
  line-height: 1.45;
  color: $color-text-muted;
}

.dashboard__upcoming-empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  margin-top: $space-sm;
  min-height: 44px;
  padding: 0 $space-lg;
  border-radius: $radius-pill;
  background: linear-gradient(
    135deg,
    lighten($color-primary, 2%) 0%,
    $color-primary 55%,
    $color-primary-hover 100%
  );
  color: #fff;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba($color-primary, 0.24);
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring($color-primary);

  @include media-hover {
    &:hover {
      box-shadow: 0 10px 24px rgba($color-primary, 0.3);
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

@keyframes dashboard-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
