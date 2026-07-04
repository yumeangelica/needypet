# Frontend — deferred backlog

Frontend improvements that are intentionally out of scope for the current
showcase. The polish passes implemented the small, safe fixes (see **Done**
below); what remains here belongs in the Nuxt 4 + Bun + Postgres rebuild rather
than this Vue 3 / Express app.

Related code:
- `client/src/store/user.ts` — auth/session, localStorage token handling
- `documentation/migrationReadiness.md` — current feature inventory and rebuild
  targets

---

## 1. Auth token storage (`localStorage` → httpOnly cookie)

**Status:** deferred — architectural, cross-stack; belongs in the rebuild.

**Now:** the JWT is stored in `localStorage` (see `store/user.ts`,
`initializeFromLocalStorage` / `setAuthData`). This is the documented trade-off
for this showcase and is also noted in the server security notes.

**Direction if picked up:** move to an httpOnly, `Secure`, `SameSite` cookie set
by the server, dropping client-side token handling entirely. This is a natural
thing to do correctly in the Nuxt 4 rebuild (server routes + `useCookie`) rather
than retrofitting the current SPA + Express split.

**Why not now:** it spans client and server auth flow and is better designed into
the rebuild than bolted onto the showcase.

## 2. Full caretaker management

**Status:** deferred — product flow; belongs in the rebuild.

**Now:** backend models and permissions support caretakers. The current frontend
can show pets a user helps care for, and caretakers can complete today's tasks,
but owners cannot invite, assign, remove or manage caretakers through a complete
frontend flow.

**Direction if picked up:** build owner-managed email invitations, acceptance,
removal and permission surfaces around a relational `pet_caretakers` table.

**Why not now:** this is a larger product workflow and should be designed with
the new relational model, auth/session model and email handling in the Nuxt app.

## 3. Reminders and richer activity history

**Status:** deferred — product expansion; belongs in the rebuild.

**Now:** users can browse daily needs by date and completed needs retain care
records. There is no product-grade reminder delivery, missed-care summary or
filterable activity history UI.

**Direction if picked up:** model reminders, notification preferences and
auditable care history as first-class rebuild features.

---

## Done in the polish pass

These earlier backlog items were implemented and are no longer deferred:

1. **Notification id collision** — `store/app.ts` now uses a module-level
   monotonic counter instead of `Date.now()`, so two toasts in the same
   millisecond get distinct ids; `store/__tests__/app.spec.ts` has a regression
   test and no longer needs `advanceTimersByTime(1)` to force unique ids.
2. **Unused `email` localStorage write** — removed the dead
   `setLocalStorageItem('email', …)` call in `store/user.ts`
   (`updateUserProfile`); it was written but never read.
3. **Component unit tests** — added specs for the previously untested
   `components/ui/*` wrappers (`Button`, `Dialog`, `AlertDialog`, `Card`,
   `CardContent`, `Select`), covering variant/size mapping, delayed-unmount
   logic, confirm/cancel emits and model forwarding.
4. **Coverage lift** — added owner-vs-caretaker, edit-navigation and not-found
   branch tests to `PagePet.spec.ts`, and logout / delete-failure / redirect-toast
   tests to `PageProfile.spec.ts`.
5. **`setLocalStorageItem` made synchronous** — dropped the needless `async`
   wrapper (and the `await`s at its call sites) around synchronous
   `localStorage.setItem` in `store/user.ts`.
6. **Auth guard bootstrap** — the guarded router setup now happens before the
   router is installed, so unauthenticated protected deep links redirect to the
   landing page while valid-token deep links are preserved.
7. **Register API errors** — top-level registration errors such as duplicate
   username/email now render in the form instead of being stored in an unused
   local ref.
8. **Client/server validation parity** — care task add/edit forms now block
   category, duration and quantity values that the server Zod schemas would
   reject; change-password uses the same strength precheck as register/reset.
9. **Profile redirect toasts** — success query parameters are cleared after the
   toast is shown, preventing repeat notifications on refresh/re-entry.
10. **Pet image picker accessibility** — preset image choices now use button
    pressed state instead of incomplete listbox semantics.
11. **API same-origin fallback** — the fetch client falls back to an empty base
    URL even if `VITE_APP_BACKEND_URL` is missing entirely.
12. **Migration docs** — the root README and migration readiness notes now list
    current showcase features, intentional boundaries and rebuild feature
    targets.
