# NeedyPet Client

The frontend for NeedyPet, a pet care management application. See the [root README](../README.md) for the full project overview and feature list.

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vue Router](https://router.vuejs.org/) for routing
- [Pinia](https://pinia.vuejs.org/) for state management
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build tooling
- [Vitest](https://vitest.dev/) for unit tests
- [Biome](https://biomejs.dev/) for linting and formatting
- TypeScript in `strict` mode
- [Bun](https://bun.sh/) as the package manager and script runner

## Environment variables

Create a `.env.development` and `.env.production` (both gitignored):

| Variable                  | Description                                  |
| ------------------------- | -------------------------------------------- |
| `VITE_APP_BACKEND_URL`    | Base URL of the NeedyPet API (e.g. `/api`).  |

## Getting started

```bash
bun install        # install dependencies
bun run dev        # start the Vite dev server
```

## Scripts

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `bun run dev`         | Start the development server.                          |
| `bun run build`       | Type-safe production build; output is copied to the server's `dist`. |
| `bun run preview`     | Preview the production build locally.                  |
| `bun run test:unit`   | Run unit tests with Vitest.                            |
| `bun run typecheck`   | Type-check the project with `vue-tsc`.                 |
| `bun run lint`        | Lint with Biome.                                       |
| `bun run lint:fix`    | Lint and apply safe fixes with Biome.                  |

## Project structure

```
src/
├── assets/        Static assets and images
├── components/    Reusable UI components
├── lib/           Shared helpers (e.g. API error handling)
├── pages/         Route-level views
├── router/        Vue Router configuration
├── services/      API client
├── store/         Pinia stores
└── types/         Shared TypeScript types
```
