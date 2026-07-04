# Requirement Specification for NeedyPet - Pet Care Management Application

## Purpose of the Application

NeedyPet is designed to streamline pet care management within households and pet care facilities. It provides a unified platform that allows multiple caretakers to collaboratively manage the health and daily activities of pets. This centralizes communication and task tracking, preventing common issues such as overfeeding or missed medication, and incorporates user-specific timezone settings for accurate activity scheduling.

## Repository Status

This repository is a modern showcase app on the Vue/Vite, Express, and MongoDB
stack, and stays on that stack — active development, polish, features, tests,
and documentation all happen here. A separate future product version will be
forked as a new Nuxt 4 application using Bun, SQLite locally, and
Postgres/Supabase in production. Rebuild notes are documented in
[migrationReadiness.md](migrationReadiness.md).

## Application User Roles

- **Pet Owner**: Primary user responsible for creating and managing pet profiles and setting up care schedules. Pet owners have full control over their pets' profiles and care activities.
- **Pet Carer**: Secondary users who can view assigned pets and complete care activities as per the owner's setup. Carer permissions are supported in the backend and partially surfaced in the frontend; a full caretaker management flow is planned.

## Functional Requirements

1. **User Management**:
   - **Registration**: Users create an account by providing a username, password, email, and selecting their timezone. Usernames must be unique.
   - **Login/Logout**: Secure login mechanism to access the application. Logout securely ends the session.
   - **Profile Management**: Users can update their profile information including email and password, and can delete their account, which removes all associated data.

2. **Pet Profile Management**:
   - **Adding/Editing Pets**: Owners can add new pets, edit pet information, or delete pet profiles.
   - **Pet Details**: Profiles include the pet’s name, species, breed, birthday, and a detailed description.
   - **Pet Images**: The application supports preset pet images. User-uploaded pet photos are planned for the future Nuxt 4 rebuild and should use object storage plus SQL metadata.
   - **Carer Access**: Pets can have carers in the backend data model. Carers can complete activities but cannot modify pet details or toggle activity statuses. Frontend caretaker assignment and invitation flows are planned.

3. **Care Activities (Needs/Tasks)**:
   - **Activity Details**:
     - **Category**: Type of care activity (e.g., Feeding, Walking).
     - **Description**: Detailed information about what the activity entails.
     - **Duration or Quantity**: Specifies either a duration in minutes or a quantity in milliliters or grams.
   - **Managing Activities**:
     - Owners can add, view, update, or delete activities.
     - Activities can be toggled as active or inactive by owners; only active activities are carried over to the next day.
     - Carers can only mark activities as completed.

4. **Notifications and Reminders**:
   - **Current Notifications**: The frontend shows in-app success, error, and informational notifications for user actions.
   - **Planned Reminders**: Automated reminders for upcoming or overdue activities are planned for a future version.

5. **Activity History and Reporting**:
   - **History Access**: Users can access a full history of all activities related to pet care, filtered by pet or date.

## Technical Requirements

- **Back-end**: Utilizes MongoDB with Mongoose for data storage, Express 5 and Node.js for server-side logic, Zod for request validation, jose for JWT-based authentication, bcryptjs for password hashing, Nodemailer for account emails, node-cron for scheduled need rollover, and Helmet for secure HTTP defaults.
- **Front-end**: Developed with Vue 3 (Composition API), Vite, TypeScript, Tailwind CSS v4, Pinia, Vue Router, Reka UI, Lucide Vue Next, and dayjs for responsive and state-driven UI across different devices and platforms.
- **HTTP Communication**: Frontend-backend communication uses the browser-native `fetch` API through an internal service wrapper (`apiClient`).
- **Email Services**: Nodemailer is used for account email verification and password resets.
- **Testing and Quality**: Backend tests use the Node.js test runner and Supertest. Frontend tests use Vitest. A single root Biome config lints and formats both the client and the server.
- **Security**: Implements JWT-based authentication, password hashing, input validation, secure HTTP headers, and GDPR-aware data handling practices.
- **Migration Readiness**: The current MongoDB model should be exported through a versioned JSON bundle before importing into the future relational schema. Embedded pet needs and care records should become separate SQL tables.

## Compliance and Standards

- The application is designed with GDPR-aware privacy practices, including account deletion and avoiding sensitive data in API responses. A production launch would still require a full legal and operational compliance review.
