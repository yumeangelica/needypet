# NeedyPet - Pet Care Management Application

#### Before using the application, read the [user guide](#how-to-use-the-application) for detailed instructions on how to use NeedyPet.

## Introduction

NeedyPet simplifies pet care coordination within households and pet care facilities. This user-friendly application empowers family members and pet caretakers to collaboratively manage pet health and activities. It ensures everyone is informed about the pets' daily needs and care activities, preventing common issues like overfeeding or missed medication, thus enhancing pet care through technology.

## Features

- **User Registration and Authentication**:
  - **Registration**: New users create an account by providing a username, password, email, and selecting their timezone.
  - **Email Verification**: Users receive a confirmation email upon registration and must verify their email before accessing full functionality.
  - **Login**: Users log in to access their profiles and manage pet details. Passwords are securely hashed and stored.
  - **Password Recovery**: Users can request a password reset link via email if they forget their password.

- **User Profiles**:
  - **Profile Management**: Users can update their profile information including username, email, timezone, and password, and can delete their accounts.
  - **Roles and Permissions**:
    - **Pet Owners**: Can add, update, delete pets and manage detailed pet profiles including care needs.
    - **Carers**: Can view shared pets and complete needs but cannot modify pet ownership details or toggle the active/inactive status of needs. Frontend caretaker management is planned.

- **Pet Management**:
  - Owner users can manage pet details such as name, birthday, species, breed, and specific care needs.

- **Care Activities (Needs)**:
  - Needs are specific care activities required by pets, such as feeding, walking, or medication.
  - **Need Details**:
    - **Category**: Type of care activity (e.g., Feeding, Walking).
    - **Description**: Detailed information about the need.
    - **Duration or Quantity**: Needs can specify a duration in minutes or a quantity in milliliters or grams.
  - **Need Management**:
    - Needs can be added, viewed, updated, deleted, or toggled active/inactive by owners.
    - Carers can view and complete needs.
  - **Daily needs algorithm**:
    - Active needs are automatically carried over to the next day and set to uncompleted. Inactive needs are not carried over. The rollover happens at midnight in the user's timezone.

- **Activity History**:
  - Logs of all care activities (completed, missed, or pending) provide comprehensive monitoring of pet care.

- **Responsive and Accessible Design**:
  - The application features a fully responsive layout with dedicated desktop and mobile navigation, optimized for various screen sizes including desktops, tablets, and smartphones.
  - Accessibility is a first-class concern: keyboard-operable controls, a skip-to-content link, semantic landmarks and headings, associated form labels with announced validation errors, screen-reader live regions for notifications, improved color contrast targeting WCAG AA, and respect for the `prefers-reduced-motion` setting.

- **Security and Data Integrity**:
  - Robust error handling and authentication mechanisms ensure data integrity and privacy.

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

## Upcoming Features

The following features are planned for future versions of NeedyPet:

1. **Caretaker Support Throughout the Application**:
   - Extending caretaker functionalities to the frontend, allowing seamless management of caretaker permissions and responsibilities, including email-based invitations for adding caretakers.

2. **Activity Reminders and Notifications**:
   - A notification system to alert users of upcoming care activities, ensuring pets receive consistent care.

3. **Native Mobile Applications**:
   - Native applications for iOS and Android to provide a seamless mobile experience.

#### Note

  - Functions not yet implemented in the frontend are operational in the backend and marked for future integration. These include full caretaker management capabilities, detailed in source code comments.

## Technical Setup

- **Runtime and package management**: Bun, with separate client and server packages.
- **Backend technologies**: Node.js, Express 5, MongoDB with Mongoose, JavaScript, Zod, jose, bcryptjs, Nodemailer, node-cron, Helmet, ESLint, Node.js test runner, and Supertest.
- **Frontend technologies**: Vue 3 with the Composition API, Vite, TypeScript, Tailwind CSS v4, Pinia, Vue Router, Reka UI, Lucide Vue Next, dayjs, Vitest, and ESLint.
- **Frontend API client**: Native `fetch` with an internal typed wrapper (`apiClient`) in `client/src/services/index.ts`.

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
bunx vitest run
```

## Credits

This project was developed by yumeangelica. For more information on how this work can be used, please refer to the LICENSE.txt file.

Copyright © 2023 - present; yumeangelica

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. This allows you to share the work, with appropriate credit given, but not to use it for commercial purposes or to create derivative works.

For more details about the license, please visit [Creative Commons License](https://creativecommons.org/licenses/by-nc-nd/4.0/).
