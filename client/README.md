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

## Scope

This client is a modern showcase app on the Vue 3 / Vite / TypeScript / Tailwind
v4 stack. Keep work within this architecture; don't migrate this app to Nuxt in
place — the Nuxt 4 rebuild is a separate forked project. Pet images are preset
assets; real upload support belongs in that future rebuild, described in
[../documentation/migrationReadiness.md](../documentation/migrationReadiness.md).

The canonical feature inventory and future rebuild target list live in the root
[README](../README.md) and
[migration readiness notes](../documentation/migrationReadiness.md). Keep this
client README focused on frontend setup and implementation details.

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

## API client

All backend calls go through a single fetch-based wrapper in
[`src/services/index.ts`](src/services/index.ts), imported as `apiClient`. It
prepends `VITE_APP_BACKEND_URL`, JSON-encodes request bodies, parses JSON
responses (204 → `null`), and throws an `ApiError` on non-2xx responses. The
surface intentionally mirrors the axios API it replaced:

- Callable form: `apiClient({ method, url, headers, data })`
- Shorthands: `apiClient.get/post/put/patch/delete(url, data?, config?)`
- Success shape: `{ status, data }`
- Error shape: `ApiError` with `error.response.{ status, data }`

Store actions wrap these calls and normalize outcomes through the helpers in
[`src/lib/apiError.ts`](src/lib/apiError.ts) (`getErrorStatus`,
`getErrorMessage`, `getErrorDetails`) into a shared `ApiResult`. A Nuxt 4 rebuild
would map this layer onto `$fetch` / `useFetch` while keeping the same
`ApiResult` contract for the stores. Request/response field validation lives on
the server (Zod schemas in `server/validations/`), so form-parity rules for the
rebuild should be read from there.

## Styling

The project uses Tailwind CSS v4 with a CSS-first setup. The styling boundary is:

1. **Global, reusable styles and all design tokens** live in [`src/app.css`](src/app.css) — the Tailwind `@theme` block (colors, radii, fonts) plus shared classes such as `.form-*`, `.auth-*`, and `.custom-button`.
2. **Component-private layout and visuals** stay in that component's `<style scoped>` block.
3. Prefer the `var(--color-*)` design tokens over hardcoded values inside scoped blocks.
4. Avoid `:deep()`; if a child component needs styling, pass a class or prop instead.
