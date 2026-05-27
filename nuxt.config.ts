import { fileURLToPath } from 'node:url'

const abstractsDir = fileURLToPath(new URL('./app/assets/styles/abstracts/', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'app/',
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  ssr: true,

  modules: ['@pinia/nuxt'],

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  imports: {
    dirs: ['composables/**', 'stores/**', 'utils/**'],
  },

  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/core', pathPrefix: false },
    { path: '~/components/layout', pathPrefix: false },
    { path: '~/components/auth', pathPrefix: false },
    { path: '~/components/match', pathPrefix: false },
    { path: '~/components/player', pathPrefix: false },
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/styles/main.scss'],

  app: {
    head: {
      title: 'Lineup',
      htmlAttrs: { lang: 'tr' },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#0b1320' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'description', content: 'Amatör futbol maçlarını organize edin, oyuncuları yönetin ve istatistikleri takip edin.' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
      appName: 'Lineup',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Inject global SCSS abstracts (variables, mixins, breakpoints, media)
          // into every component file – but skip the abstracts themselves to
          // avoid circular module loads.
          additionalData: (source: string, filename: string) => {
            if (filename.startsWith(abstractsDir)) {
              return source
            }
            return `@use "~/assets/styles/abstracts" as *;\n${source}`
          },
        },
      },
    },
  },
})
