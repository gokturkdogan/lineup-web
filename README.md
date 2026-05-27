# Lineup — Web Frontend

Lineup is a platform for organizing amateur football matches, managing players, and tracking player stats and football history.

This repository contains **only the web frontend**.
The backend API and the mobile app live in separate repositories.

## Tech stack

- [Nuxt](https://nuxt.com/) (Vue 3 + Nitro)
- TypeScript
- [Pinia](https://pinia.vuejs.org/) for state management
- SCSS with a layered architecture (`abstracts`, `base`, `utilities`)
- Axios for HTTP

## Goals

- Mobile-first, **feels like a native app** on phones
- Clean, scalable architecture for future feature work
- Strong reusable component layer (`BaseButton`, `BaseInput`, `AuthCard`, …)
- Authentication ready (JWT in `useCookie`, Pinia auth store, route middleware)

## Project structure

```
lineup-web/
├── app/
│   ├── assets/
│   │   └── styles/
│   │       ├── abstracts/   # variables, mixins, breakpoints, media
│   │       ├── base/        # reset, typography, globals
│   │       ├── utilities/   # helper classes
│   │       └── main.scss    # global entry
│   ├── components/
│   │   ├── ui/              # BaseButton, BaseInput, BaseAvatar
│   │   ├── core/            # AppHeader, BottomNavigation
│   │   ├── layout/          # layout building blocks
│   │   ├── auth/            # AuthCard, …
│   │   ├── match/           # MatchCard, …
│   │   └── player/          # PlayerCard, …
│   ├── composables/
│   ├── layouts/             # default.vue (app shell), auth.vue
│   ├── middleware/          # auth.ts, guest.ts
│   ├── pages/               # login.vue, index.vue
│   ├── plugins/             # app bootstrapping (auth restore, etc.)
│   ├── services/
│   │   └── api/             # api.client.ts (Axios instance)
│   ├── stores/              # auth.ts, user.ts
│   ├── types/               # shared TS types
│   └── utils/
├── nuxt.config.ts
├── tsconfig.json
└── package.json
```

## Getting started

```bash
# install
npm install

# copy env
cp .env.example .env

# run
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable                   | Description                          | Default                       |
| -------------------------- | ------------------------------------ | ----------------------------- |
| `NUXT_PUBLIC_API_BASE_URL` | Base URL of the Lineup backend API   | `http://localhost:8080/api`   |

## Authentication

- JWT is stored in a cookie named `access_token` via `useCookie()`.
- The authenticated user is persisted in the Pinia `auth` store.
- Route middleware (`auth`, `guest`) enforces access:
  - Unauthenticated users are always redirected to `/login`.
  - Authenticated users visiting `/login` are redirected to `/`.

## Styling

- Global SCSS abstracts (`variables`, `mixins`, `breakpoints`, `media`) are
  auto-injected into every Vue `<style lang="scss">` block — no manual imports
  needed.
- Use `@include flex-center`, `@include card`, `@include page-padding`,
  `@include media-up(tablet)`, etc. directly inside components.

## Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `dev`         | Run the dev server                   |
| `build`       | Production build                     |
| `preview`     | Preview the production build         |
| `generate`    | Static-site generation               |
| `typecheck`   | Run `vue-tsc` over the project       |
