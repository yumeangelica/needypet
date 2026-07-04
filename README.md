# NeedyPet - Pet Care Management Application

#### Before using the application, read the [user guide](#how-to-use-the-application) for detailed instructions on how to use NeedyPet.

## Introduction

NeedyPet simplifies pet care coordination within households and pet care facilities. This user-friendly application empowers family members and pet caretakers to collaboratively manage pet health and activities. It ensures everyone is informed about the pets' daily needs and care activities, preventing common issues like overfeeding or missed medication, thus enhancing pet care through technology.

## Project Status

This repository is a modern showcase app on the Vue/Vite, Express, and MongoDB stack, actively developed and maintained on that stack. A separate future product version will be forked into a new repository, where the domain is rebuilt with Nuxt 4, Bun, and Postgres — that rebuild is a distinct project, not an in-place migration of this app.

For coding agents and future maintainers, start with [AGENTS.md](AGENTS.md) and
[CLAUDE.md](CLAUDE.md). The future Nuxt 4 rebuild notes live in
[documentation/migrationReadiness.md](documentation/migrationReadiness.md).

## Current Showcase Features

This repository is the finished Vue/Vite + Express/Mongo showcase version. It
currently includes:

- **Account flow:** register with username, email, password and timezone; confirm
  email; log in; request/reset a forgotten password; validate saved sessions;
  log out; delete the account.
- **Profile management:** view username, email verification status and timezone;
  resend confirmation email; update username/email/timezone with the current
  password; change password with matching client/server strength rules.
- **Pet management:** owners can create, view, update and delete pets with name,
  species, breed, description, birthday and preset image metadata.
- **Care tasks:** owners can add, edit, delete, complete and pause/resume daily
  needs. Needs support duration in minutes or quantity in milliliters/grams.
- **Daily rollover:** active needs are copied forward to the next owner-local
  day; inactive needs stay paused; historical needs remain browsable by date.
- **Caretaker permissions:** backend data and permissions support caretakers.
  Caretakers can view assigned pets and complete today's care tasks, but the
  current frontend does not include a complete caretaker invitation/assignment
  flow.
- **Responsive accessible UI:** desktop and mobile navigation, skip-to-content,
  semantic landmarks, keyboard-operable controls, focus-visible states,
  announced validation errors/toasts, color contrast polish targeting WCAG AA,
  and reduced-motion handling.
- **Frontend API layer:** a fetch-based `apiClient` normalizes JSON requests,
  same-origin production calls and backend error shapes for the Pinia stores.

## Current Boundaries

- This app stays on Vue 3, Vite, Express and MongoDB/Mongoose. The Nuxt 4,
  Bun and Postgres version will be a separate forked repository.
- Pet images are preset metadata only (`dog`, `cat`, `bunny`). User-uploaded
  pet photos belong in the rebuild with object storage metadata.
- Auth tokens are stored in `localStorage` in this showcase. The rebuild should
  move auth to httpOnly, `Secure`, `SameSite` cookies.
- Full caretaker invitations, caretaker management screens, reminders and
  product-grade activity analytics are future-product work, not unfinished
  bugs in this showcase.

## How to Use the Application

1. **Initial Setup**:
   - **New Users**: Register via the landing page by entering your username, email, password, and selecting your timezone.
   - **Email Verification**: Check your inbox for a confirmation email and verify your account.
   - **Returning Users**: Log in to access your account.

2. **Pet Management**:
   - View your pets on the homepage after logging in.
   - Add new pets by clicking **Add Pet**, filling in details (name, breed, species, description, birthday), and submitting.

3. **Viewing and Editing Pet Details**:
   - Access pet details by clicking on a pet card.
   - Edit pet details or delete pets via the settings icon on the pet's page.
   - Add needs by clicking **Add Need** and filling out the relevant information.

4. **Managing Needs**:
   - Enter need details in the **Add Need** modal (category, description, measurement type, and value) and save.
   - Needs can be managed on the need card on the pet's page: complete, edit, delete, or toggle active/inactive as necessary.
   - Navigate between dates to view needs for different days.
   - Active needs are automatically carried over to the next day and set to uncompleted.

5. **User Profile and Security**:
   - Update personal details, change password, or log out via the **Profile** page.
   - Access profile settings by clicking the settings icon next to your username.
   - Deleting your account will remove all associated data and log you out permanently.

## Future Product Direction

The separate Nuxt 4 + Bun + Postgres rebuild should preserve the current domain
rules and add the next product layer deliberately:

1. **Full caretaker workflow:** invitation by email, acceptance, removal,
   owner-managed permissions and clear shared-pet dashboards.
2. **Relational data model:** users, pets, pet caretakers, needs, care records
   and pet images as first-class tables with migration traceability from legacy
   Mongo ids.
3. **Cookie-based auth:** httpOnly, `Secure`, `SameSite` sessions implemented in
   Nuxt server routes.
4. **Uploaded pet photos:** Supabase Storage or equivalent object storage with
   SQL metadata, while preserving preset-image support.
5. **Reminders and notifications:** scheduled care reminders, missed-task
   summaries and notification preferences.
6. **Activity history and analytics:** filterable care history, caretaker audit
   trail and simple household consistency insights.
7. **Future native clients:** optional iOS/Android work after the web rebuild
   has stable API and auth contracts.

#### Note

  - Functions not yet implemented in the frontend are operational in the backend and marked for future integration. These include full caretaker management capabilities, detailed in source code comments.

## Technical Setup

- **Runtime and package management**: Bun, with separate client and server packages.
- **Backend technologies**: Node.js, Express 5, MongoDB with Mongoose, JavaScript, Zod, jose, bcryptjs, Nodemailer, node-cron, Helmet, Biome, Node.js test runner, and Supertest.
- **Frontend technologies**: Vue 3 with the Composition API, Vite, TypeScript, Tailwind CSS v4, Pinia, Vue Router, Reka UI, Lucide Vue Next, dayjs, Vitest, and Biome.
- **Frontend API client**: Native `fetch` with an internal typed wrapper (`apiClient`) in `client/src/services/index.ts`.
- **Rebuild direction**: This app stays on MongoDB/Mongoose. The separate future app uses a new Nuxt 4 codebase with SQLite locally, Postgres/Supabase in production, and the relational model outlined in [documentation/migrationReadiness.md](documentation/migrationReadiness.md).

## Development

Install dependencies separately in the client and server folders:

```bash
cd client
bun install

cd ../server
bun install
```

Run the application locally with the backend and frontend in separate terminals:

```bash
cd server
bun run dev
```

```bash
cd client
bun run dev
```

Useful verification commands:

```bash
cd server
bun run lint
bun run test

cd ../client
bun run lint
bun run typecheck
bunx vitest run
```

## Credits

This project was developed by yumeangelica. For more information on how this work can be used, please refer to the LICENSE.txt file.

Copyright © 2023 - present; yumeangelica

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. This allows you to share the work, with appropriate credit given, but not to use it for commercial purposes or to create derivative works.

For more details about the license, please visit [Creative Commons License](https://creativecommons.org/licenses/by-nc-nd/4.0/).
