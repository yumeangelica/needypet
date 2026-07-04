# Migration Readiness Notes

## Purpose

This repository is a modern showcase app on the Vue/Vite, Express, and MongoDB
stack, and stays on that stack. The future product version will be built as a
separate, forked Nuxt 4 application — not by gradually mutating this repository
into the new stack.

These notes document the decisions that make that future rebuild easier.

## Target rebuild stack

- Nuxt 4 with Vue 3
- Pinia for client state where needed
- Tailwind CSS v4
- Bun for package scripts and dependency management
- Nuxt server routes for backend API behavior
- SQLite for local/demo development
- Postgres for production, preferably with Supabase
- Supabase Storage or another object store for future uploaded pet photos

## Current feature inventory

Preserve these behaviors unless a future product decision explicitly replaces
them:

- Users register with `userName`, `email`, strong password and IANA timezone.
- Email confirmation gates the main home experience; users can resend
  confirmation email when allowed by the backend token window.
- Users can log in, restore a saved session, request a password reset, reset the
  password from a token link, change password, update profile fields and delete
  their account.
- Owners can create, edit and delete pets with date-only birthdays and preset
  image metadata (`source: "preset"`, `key: "dog" | "cat" | "bunny"`).
- Owners can add, edit, delete, pause/resume and complete daily needs. Needs use
  exactly one measurement shape: duration in minutes or quantity in `ml`/`g`.
- Daily rollover copies active needs forward to the owner's local day and leaves
  inactive needs paused. Historical days remain browsable.
- Caretaker data and permissions exist in the backend. Caretakers can view pets
  shared with them and complete today's needs, but assignment/invitation UI is
  not complete in this repository.
- The frontend uses same-origin API calls in production, a Pinia `ApiResult`
  store contract and explicit client-side validation that mirrors server Zod
  rules for user-facing forms.

## Rebuild feature targets

Design these into the Nuxt 4 architecture instead of bolting them onto this
showcase:

- Household/facility workspaces for multi-caretaker pet care. The requirement
  spec mentions both households and pet care facilities, while this showcase
  effectively models owner-owned pets plus direct caretaker references.
- Full caretaker invitation and permission management flow.
- First-class relational tables for users, pets, pet caretakers, needs, care
  records and optional pet images, with nullable legacy ids for migration.
- httpOnly cookie auth managed by Nuxt server routes.
- Uploaded pet photos using object storage plus database metadata, while keeping
  preset images available.
- Reminder delivery, notification preferences and missed-care summaries.
- Filterable care history and audit-friendly caretaker activity records.
- Export/import tooling that can migrate this showcase's Mongo data through a
  reviewable JSON bundle.

## Requirement specification gaps for the rebuild

These are promised or implied by `requirementSpecification.md`, but are not
fully implemented in this showcase app. Treat them as product requirements for
the Nuxt 4 rebuild, not as in-place work for this repository:

- Household and pet-care-facility collaboration model, including whether pets
  belong directly to users, households, facilities or teams.
- Caretaker assignment, invitation and removal flow in the frontend, backed by
  explicit permissions for viewing assigned pets and completing assigned needs.
- Owner-only controls that are consistently enforced in the UI for editing pet
  details, editing needs and pausing/resuming needs.
- Carer-only completion flow that captures optional notes and preserves a clear
  audit trail of who completed each care activity, when and in which timezone.
- Automated reminders for upcoming or overdue activities, including delivery
  channels, notification preferences and missed-care summary behavior.
- Full care history and reporting filtered by pet and date, including completed,
  pending, inactive/paused and missed activity states.
- Activity scheduling/recurrence design beyond the current daily rollover model,
  if the future app needs frequencies other than "carry active needs to the next
  owner-local day".
- User-uploaded pet photos with object storage and SQL metadata, while keeping
  preset image keys available for migrated data and quick pet creation.

## What belongs in the separate Nuxt 4 rebuild instead

- User-uploaded pet photos
- SQLite/Postgres migrations
- Nuxt server routes
- Large data-model refactors that change this app's API shape
- New product flows such as full caretaker invitations or reminder delivery

Those should be designed in the new app with the relational schema from the
start.

## Current data model

Mongo/Mongoose stores the domain in a nested shape:

- `User`
  - account fields: `userName`, `email`, `passwordHash`, `timezone`
  - email confirmation and password reset token fields
  - `pets[]` references
- `Pet`
  - profile fields: `name`, `species`, `breed`, `description`, `birthday`
  - `image` preset metadata
  - `owner` reference
  - `careTakers[]` references
  - embedded `needs[]`
- `Need`
  - `dateFor`, `category`, `description`
  - optional `quantity` or `duration`
  - `completed`, `archived`, `isActive`
  - optional `frequency`
  - embedded `careRecords[]`
- `CareRecord`
  - `date`, `careTaker`, `note`
  - optional `quantity` or `duration`
  - `timezone`

## Target relational shape

Use stable primary keys generated by the new app, and keep nullable `legacy_id`
columns during migration for traceability.

### `users`

- `id`
- `legacy_id`
- `user_name`
- `email`
- `password_hash` or a new-auth migration marker
- `email_confirmed`
- `timezone`
- `created_at`
- `updated_at`

### `pets`

- `id`
- `legacy_id`
- `owner_id`
- `name`
- `species`
- `breed`
- `description`
- `birthday`
- `image_source`
- `image_key`
- `image_url`
- `image_storage_key`
- `last_rolled_need_date`
- `created_at`
- `updated_at`

### `pet_caretakers`

- `pet_id`
- `user_id`
- optional `legacy_pet_id`
- optional `legacy_user_id`

### `needs`

- `id`
- `legacy_id`
- `pet_id`
- `date_for`
- `category`
- `description`
- `quantity_value`
- `quantity_unit`
- `duration_value`
- `duration_unit`
- `completed`
- `archived`
- `is_active`
- optional recurrence fields, if recurrence is redesigned
- `created_at`
- `updated_at`

### `care_records`

- `id`
- `legacy_id`
- `need_id`
- `pet_id`
- `care_taker_id`
- `date`
- `note`
- `quantity_value`
- `quantity_unit`
- `duration_value`
- `duration_unit`
- `timezone`
- `created_at`

## Date and timezone rules to preserve

- `users.timezone` is an IANA timezone identifier.
- `pets.birthday` is a date-only value.
- `needs.date_for` is a date-only value representing the owner's local care day.
- `care_records.date` is a UTC timestamp.
- Need rollover should use the pet owner's timezone, not the caretaker's
  timezone.
- Client and server should compare date-only values at day granularity, never by
  shifting `YYYY-MM-DD` through the browser timezone.
- The acting caretaker's timezone can be stored on care records for audit
  context, but it must not decide whether a need belongs to the owner's current
  day.

## Pet image strategy

This app uses preset pet image metadata:

```json
{ "source": "preset", "key": "cat" }
```

Keep this in exports and imports. In the new app, support uploads by adding
storage metadata without storing image blobs in the database:

```json
{
  "source": "upload",
  "url": "https://example.com/path/to/image.webp",
  "storageKey": "pets/pet-id/profile.webp"
}
```

For local SQLite demos, uploaded files can live in a local `uploads/` directory.
For production, store files in Supabase Storage or another object store and keep
only metadata in Postgres.

## Recommended legacy export format

When migration work begins, add an export script to this repository that writes a
versioned JSON bundle. Do not import directly from MongoDB in the new app without
a reviewable intermediate format.

Suggested files:

- `users.json`
- `pets.json`
- `pet_caretakers.json`
- `needs.json`
- `care_records.json`
- `manifest.json`

Each exported row should include:

- `legacyId`
- all fields needed by the target schema
- source timestamps if available
- enough parent ids to rebuild relationships

## Import order for the Nuxt 4 app

1. Import users.
2. Import pets and map `owner.legacyId` to the new user id.
3. Import pet caretakers.
4. Import needs and map each `pet.legacyId`.
5. Import care records and map each `need.legacyId`, `pet.legacyId`, and
   `careTaker.legacyId`.
6. Run consistency checks.

## Consistency checks

Before considering a migration successful:

- every pet has an owner
- every caretaker relation points to an existing user and pet
- every need points to an existing pet
- every care record points to an existing need and pet
- `birthday` and `date_for` are valid date-only values
- `care_records.date` is a valid UTC timestamp
- preset images use only known keys: `dog`, `cat`, `bunny`
- quantity and duration units match the legacy enums

## Practical next step

In this repository, the useful prep work is documentation and a future export
script. For the new Nuxt 4 repository, start with the relational schema and a
small test fixture generated from this app's export shape.
