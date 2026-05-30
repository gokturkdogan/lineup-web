<script setup lang="ts">
definePageMeta({
  layout: 'welcome',
  title: 'Lineup',
})

/** Google OAuth entegrasyonu sonraki aşamada eklenecek. */
const onGoogleSignIn = () => {}
</script>

<template>
  <div class="welcome">
    <div class="welcome__glow" aria-hidden="true" />

    <div class="welcome__content">
      <!-- 1. Üst üçte bir: marka -->
      <header class="welcome__brand">
        <div class="welcome__logo" aria-hidden="true">
          <img src="/welcome-logo.png" alt="Lineup logo" class="welcome__logo-image" />
        </div>
        <p class="welcome__brand-name">LINEUP</p>
      </header>

      <!-- Logo ↔ başlık arası (geniş) -->
      <div class="welcome__spacer welcome__spacer--brand-title" aria-hidden="true" />

      <!-- 2. Orta: başlık -->
      <h1 class="welcome__title">Tekrar hoş geldin</h1>

      <!-- Başlık ↔ butonlar arası (orta) -->
      <div class="welcome__spacer welcome__spacer--title-actions" aria-hidden="true" />

      <!-- 3. Alt yarı: CTA (birbirine yakın) -->
      <nav class="welcome__actions" aria-label="Giriş veya kayıt">
        <NuxtLink class="welcome__btn welcome__btn--outline" to="/login">
          Giriş yap
        </NuxtLink>
        <NuxtLink class="welcome__btn welcome__btn--solid" to="/register">
          Kayıt ol
        </NuxtLink>
      </nav>

      <!-- Butonlar ↔ sosyal arası (referanstaki geniş boşluk) -->
      <div class="welcome__spacer welcome__spacer--actions-social" aria-hidden="true" />

      <!-- 4. En alt: sosyal -->
      <div class="welcome__social">
        <p class="welcome__social-label">Google ile giriş yap</p>
        <button
          type="button"
          class="welcome__social-btn"
          aria-label="Google ile giriş yap"
          @click="onGoogleSignIn"
        >
          <GoogleIcon :size="26" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  color: #fff;
  // Soldan sağa yumuşak geçiş: canlı yeşilden derin koyu yeşile
  background:
    linear-gradient(
      to right,
      $color-primary 0%,
      #0c5a36 55%,
      #052b1a 100%
    );
}

.welcome__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }

  // Sol-üstte yumuşak aydınlık aksan (göz yormayan, derinlik hissi için)
  &::before {
    width: 360px;
    height: 360px;
    top: -120px;
    left: -120px;
    background: radial-gradient(circle, rgba($color-primary, 0.22) 0%, transparent 70%);
    filter: blur(8px);
  }

  // Sağ-alt çok hafif derinlik
  &::after {
    width: 280px;
    height: 280px;
    bottom: -120px;
    right: -100px;
    background: radial-gradient(circle, rgba(#000, 0.18) 0%, transparent 70%);
    filter: blur(8px);
  }
}

.welcome__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 440px;
  min-height: 100dvh;
  margin-inline: auto;
  padding-inline: $space-xl;
  padding-top: calc(env(safe-area-inset-top, 0px) + #{$space-md});
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + #{$space-lg});
  animation: welcome-fade-in 520ms $ease-standard both;
}

// --- Spacer'lar: referanstaki dikey nefes boşlukları ---
.welcome__spacer {
  flex-shrink: 0;
  width: 100%;

  &--brand-title {
    flex: 1 1 auto;
    min-height: clamp(32px, 8vh, 72px);
    max-height: 22vh;
  }

  &--title-actions {
    flex: 0 0 clamp(36px, 7vh, 56px);
  }

  &--actions-social {
    flex: 1 1 auto;
    min-height: clamp(56px, 14vh, 112px);
    max-height: 24vh;
  }
}

// --- Marka (üst) ---
.welcome__brand {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  padding-top: clamp(24px, 6vh, 48px);
}

.welcome__logo {
  @include flex-center;
  width: 132px;
  height: 132px;
}

.welcome__logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(#000, 0.16));
}

.welcome__brand-name {
  margin: 0;
  color: #fff;
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
}

// --- Başlık (orta bölge) ---
.welcome__title {
  flex: 0 0 auto;
  margin: 0;
  width: 100%;
  max-width: 320px;
  color: #fff;
  font-size: clamp(32px, 8.5vw, 42px);
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;
  text-align: center;
}

// --- CTA ---
.welcome__actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: $space-md;
  width: 100%;
  max-width: 320px;
}

.welcome__btn {
  @include flex-center;
  width: 100%;
  height: 58px;
  border-radius: $radius-pill;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-decoration: none;
  transition:
    transform $duration-fast $ease-standard,
    background-color $duration-fast $ease-standard,
    border-color $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring(#fff);

  &:active {
    transform: scale(0.985);
  }

    &--outline {
      border: 1.5px solid rgba(#fff, 0.42);
      color: #fff;
      background-color: transparent;

      @include media-hover {
        &:hover {
          background-color: rgba(#fff, 0.06);
          border-color: rgba(#fff, 0.55);
        }
      }
    }

  &--solid {
    border: 2px solid #fff;
    color: $color-primary-hover;
    background-color: #fff;
    box-shadow: 0 12px 32px rgba(#000, 0.12);

    @include media-hover {
      &:hover {
        background-color: rgba(#fff, 0.96);
        box-shadow: 0 16px 40px rgba(#000, 0.16);
      }
    }
  }
}

// --- Sosyal (en alt) ---
.welcome__social {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  width: 100%;
  max-width: 320px;
}

.welcome__social-label {
  margin: 0;
  color: #fff;
  font-size: $font-size-sm;
  font-weight: $font-weight-regular;
  text-align: center;
  opacity: 0.92;
}

.welcome__social-btn {
  @include reset-button;
  @include flex-center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(#000, 0.14);
  transition:
    transform $duration-fast $ease-standard,
    box-shadow $duration-fast $ease-standard;
  @include tap-highlight-off;
  @include focus-ring(#fff);

  @include media-hover {
    &:hover {
      box-shadow: 0 10px 28px rgba(#000, 0.18);
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

@keyframes welcome-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
