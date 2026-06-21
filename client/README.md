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

Copy [`.env.example`](.env.example) to `.env.development` and `.env.production` (both gitignored) and fill in the values:

| Variable                  | Description                                  |
| ------------------------- | -------------------------------------------- |
| `VITE_APP_BACKEND_URL`    | Base origin of the NeedyPet server; leave empty for same-origin builds. |

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
| `bun run test:coverage` | Run unit tests with a v8 coverage report.            |
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

## Styling

The project uses Tailwind CSS v4 with a CSS-first setup. The styling boundary is:

1. **Global, reusable styles and all design tokens** live in [`src/app.css`](src/app.css) — the Tailwind `@theme` block (colors, radii, fonts) plus shared classes such as `.form-*`, `.auth-*`, and `.custom-button`.
2. **Component-private layout and visuals** stay in that component's `<style scoped>` block.
3. Prefer the `var(--color-*)` design tokens over hardcoded values inside scoped blocks.
4. Avoid `:deep()`; if a child component needs styling, pass a class or prop instead.
