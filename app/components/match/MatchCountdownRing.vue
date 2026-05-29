<script setup lang="ts">
interface Props {
  /** Maç başlangıç zamanı — ISO 8601 */
  target: string
}

const props = defineProps<Props>()

const COUNTDOWN_GREEN = '#22c55e'
const COUNTDOWN_YELLOW = '#facc15'
const COUNTDOWN_ORANGE = '#f97316'
const COUNTDOWN_RED = '#ef4444'

const HOUR_MS = 3_600_000
const FOUR_HOURS_MS = 4 * HOUR_MS

const route = useRoute()
const isFigmaCapture = computed(
  () => route.query.figma === '1' || route.query.figma === 'true',
)

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const remainingMs = ref(0)
const isExpired = ref(false)

let timerId: ReturnType<typeof setInterval> | null = null

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Sabit eşikler — maça kalan süreye göre (progress yok, halka hep tam):
 * > 4 saat: yeşil | 1–4 saat arası: sarı | 01:00:xx: turuncu | < 1 saat: kırmızı
 */
function colorFromRemaining(ms: number): string {
  if (ms <= 0) return COUNTDOWN_GREEN

  const h = Math.floor(ms / HOUR_MS)
  const m = Math.floor((ms % HOUR_MS) / 60_000)

  if (ms > FOUR_HOURS_MS) return COUNTDOWN_GREEN
  if (h === 1 && m === 0) return COUNTDOWN_ORANGE
  if (ms > HOUR_MS) return COUNTDOWN_YELLOW

  return COUNTDOWN_RED
}

function tick() {
  const targetMs = new Date(props.target).getTime()
  const left = Math.max(0, targetMs - Date.now())

  remainingMs.value = left

  if (left <= 0) {
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    isExpired.value = true
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    return
  }

  isExpired.value = false
  hours.value = Math.floor(left / HOUR_MS)
  minutes.value = Math.floor((left % HOUR_MS) / 60_000)
  seconds.value = Math.floor((left % 60_000) / 1_000)
}

const ringColor = computed(() => colorFromRemaining(remainingMs.value))

const ringBorderStyle = computed(() => ({
  borderColor: ringColor.value,
}))

const digitStyle = computed(() => ({
  color: ringColor.value,
}))

const ariaLabel = computed(() => {
  if (isExpired.value) return 'Maç oynandı'
  return `${hours.value} saat ${minutes.value} dakika ${seconds.value} saniye kaldı`
})

onMounted(() => {
  tick()
  timerId = setInterval(tick, 1_000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

watch(() => props.target, () => {
  isExpired.value = false
  tick()
  if (!timerId) {
    timerId = setInterval(tick, 1_000)
  }
})
</script>

<template>
  <div
    class="match-countdown"
    :class="{ 'match-countdown--figma': isFigmaCapture }"
    role="timer"
    aria-live="polite"
    :aria-label="ariaLabel"
  >
    <div class="match-countdown__ring-wrap">
      <!-- Figma capture: SVG stroke yerine düz div border (html-to-design uyumlu) -->
      <div
        class="match-countdown__ring match-countdown__ring--track"
        aria-hidden="true"
      />
      <div
        class="match-countdown__ring match-countdown__ring--color"
        aria-hidden="true"
        :style="ringBorderStyle"
      />

      <div class="match-countdown__face">
        <p
          v-if="isExpired"
          class="match-countdown__played"
          :style="{ color: ringColor }"
        >
          Oynandı
        </p>
        <div v-else class="match-countdown__digits">
          <span class="match-countdown__unit">
            <span class="match-countdown__value" :style="digitStyle">{{ pad(hours) }}</span>
            <span class="match-countdown__label">saat</span>
          </span>
          <span class="match-countdown__sep" aria-hidden="true" :style="digitStyle">:</span>
          <span class="match-countdown__unit">
            <span class="match-countdown__value" :style="digitStyle">{{ pad(minutes) }}</span>
            <span class="match-countdown__label">dk</span>
          </span>
          <span class="match-countdown__sep" aria-hidden="true" :style="digitStyle">:</span>
          <span class="match-countdown__unit">
            <span class="match-countdown__value" :style="digitStyle">{{ pad(seconds) }}</span>
            <span class="match-countdown__label">sn</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.match-countdown {
  @include flex-center;
  width: 100%;

  &__ring-wrap {
    position: relative;
    width: 140px;
    height: 140px;
    max-width: 100%;
    flex-shrink: 0;
  }

  &__ring {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border-radius: 50%;
    border: 7px solid transparent;
    pointer-events: none;

    &--track {
      border-color: rgba(239, 68, 68, 0.22);
      z-index: 0;
    }

    &--color {
      z-index: 1;
      transition: border-color 0.5s ease;
    }
  }

  &__face {
    position: absolute;
    inset: 12%;
    z-index: 2;
    @include flex-center;
    border-radius: 50%;
    background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
    box-shadow:
      inset 0 1px 0 rgba(#fff, 0.06),
      0 4px 12px rgba(#000, 0.15);
  }

  &--figma &__face {
    background: #1e293b;
    box-shadow: none;
  }

  &__played {
    margin: 0;
    font-size: 13px;
    font-weight: $font-weight-bold;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    transition: color 0.5s ease;
  }

  &__digits {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 1px;
    padding: 0 2px;
  }

  &__unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 22px;
  }

  &__value {
    font-size: 14px;
    font-weight: $font-weight-bold;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;
    transition: color 0.5s ease;
  }

  &__label {
    margin-top: 3px;
    color: rgba(#fff, 0.55);
    font-size: 8px;
    font-weight: $font-weight-medium;
    line-height: 1;
    text-transform: lowercase;
  }

  &__sep {
    font-size: 12px;
    font-weight: $font-weight-bold;
    line-height: 1;
    padding-top: 1px;
    opacity: 0.85;
    transition: color 0.5s ease;
  }
}
</style>
