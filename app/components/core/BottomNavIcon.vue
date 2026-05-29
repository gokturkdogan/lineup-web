<script setup lang="ts">
interface Props {
  icon: 'home' | 'organization' | 'matches' | 'players' | 'profile'
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    aria-hidden="true"
    class="bnb-icon"
  >
    <!-- Home -->
    <template v-if="icon === 'home'">
      <path
        v-if="active"
        d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
        fill="currentColor"
      />
      <template v-else>
        <path
          d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
          stroke="currentColor"
          stroke-width="1.65"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </template>
    </template>

    <!-- Organizasyon -->
    <template v-else-if="icon === 'organization'">
      <path
        v-if="active"
        d="M5 21V9.5L12 5l7 4.5V21H5zm2-2h3v-5H7v5zm7 0h3v-8h-3v8z"
        fill="currentColor"
      />
      <template v-else>
        <path
          d="M5 21V9.5L12 5l7 4.5V21H5z"
          stroke="currentColor"
          stroke-width="1.65"
          stroke-linejoin="round"
        />
        <path
          d="M7 19v-5h3v5M14 19v-8h3v8"
          stroke="currentColor"
          stroke-width="1.65"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </template>
    </template>

    <!-- Maçlar (tab) -->
    <template v-else-if="icon === 'matches'">
      <circle
        cx="12"
        cy="12"
        r="8.2"
        :stroke="active ? 'none' : 'currentColor'"
        :fill="active ? 'currentColor' : 'none'"
        :stroke-width="active ? 0 : 1.65"
      />
      <path
        v-if="!active"
        d="M12 5.5l2.5 1.8-1 3-3 0-1-3L12 5.5zM7.5 11l-1.7 2.5 1.2 2.6 3 .2 1.4-2.8L9 11l-1.5 0zM16.5 11L18.2 13.5l-1.2 2.6-3 .2-1.4-2.8L15 11l1.5 0z"
        stroke="currentColor"
        stroke-width="1.35"
        stroke-linejoin="round"
      />
    </template>

    <!-- Oyuncular -->
    <template v-else-if="icon === 'players'">
      <circle cx="9" cy="9" r="3.2" :stroke="active ? 'none' : 'currentColor'" :fill="active ? 'currentColor' : 'none'" :stroke-width="1.65" />
      <path
        d="M2.8 19.5c.7-3 3.4-4.8 6.2-4.8s5.5 1.8 6.2 4.8"
        :stroke="active ? 'none' : 'currentColor'"
        :fill="active ? 'currentColor' : 'none'"
        stroke-width="1.65"
        stroke-linecap="round"
      />
      <circle cx="17.5" cy="8" r="2.4" :stroke="active ? 'none' : 'currentColor'" :fill="active ? 'currentColor' : 'none'" stroke-width="1.45" />
      <path
        d="M14.5 14.2c.8-.4 1.8-.6 3-.6 2.1 0 4 1.1 4.6 3"
        :stroke="active ? 'none' : 'currentColor'"
        :fill="active ? 'currentColor' : 'none'"
        stroke-width="1.45"
        stroke-linecap="round"
      />
    </template>

    <!-- Profil -->
    <template v-else>
      <circle cx="12" cy="8" r="3.5" :stroke="active ? 'none' : 'currentColor'" :fill="active ? 'currentColor' : 'none'" :stroke-width="1.65" />
      <path
        d="M4.5 20c1.1-3.4 4.1-5.4 7.5-5.4S18.4 16.6 19.5 20"
        :stroke="active ? 'none' : 'currentColor'"
        :fill="active ? 'currentColor' : 'none'"
        stroke-width="1.65"
        stroke-linecap="round"
      />
    </template>
  </svg>
</template>

<style scoped lang="scss">
.bnb-icon {
  display: block;
  color: inherit;
}
</style>
