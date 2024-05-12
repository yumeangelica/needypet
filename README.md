# NeedyPet - Pet Care Management Application

#### Before using the application, read the [user guide](#how-to-use-the-application) for detailed instructions on how to use NeedyPet.

## Introduction

NeedyPet simplifies pet care coordination within households and pet care facilities. This user-friendly application empowers family members and pet caretakers to collaboratively manage pet health and activities. It ensures everyone is informed about the pets' daily needs and care activities, preventing common issues like overfeeding or missed medication, thus enhancing pet care through technology.

## Features

- **User Registration and Authentication**:
  - **Registration**: New users create an account by providing a username, password, email, and selecting their timezone.
  - **Login**: Users log in to access their profiles and manage pet details. Passwords are securely hashed and stored.

- **User Profiles**:
  - **Profile Management**: Users can update their profile information including name, email, password, and can delete their profiles.
  - **Roles and Permissions**:
    - **Pet Owners**: Can add, update, delete pets and manage detailed pet profiles including care needs.
    - **Carers** (Backend Only): Can complete needs but cannot modify pet ownership details or toggle need statuses. Frontend support for carer roles is planned.

- **Pet Management**:
  - Owner users can manage pet details such as name, birthday, species, breed, and specific care needs.

- **Care Activities (Needs)**:
  - Needs are specific care activities required by pets, such as feeding, walking, or medication.
  - **Need Details**:
    - **Category**: Type of care activity (e.g., Feeding, Walking).
    - **Description**: Detailed information about the need.
    - **Duration or Quantity**: Needs can specify a duration in minutes or a quantity in milliliters or grams.
  - **Need Management**:
    - Needs can be added, viewed, updated, deleted, or toggled by owners; only active needs are carried over to the next day.
    - Carers can view and complete needs.
  - **Daily needs algorithm**:
    - Needs are automatically carried over to the next day and set to uncompleted if they are not toggled inactive with a toggle switch from need card. Updating happens at midnight in the user's timezone.

- **Activity History**:
  - Logs of all care activities (completed, missed, or pending) provide comprehensive monitoring of pet care.

- **Responsive Design**:
  - The application is optimized for various devices, ensuring a consistent user experience across desktops, tablets, and smartphones.

- **Security and Data Integrity**:
  - Robust error handling and authentication mechanisms ensure data integrity and privacy.

## How to Use the Application

1. **Initial Setup**:
   - **New Users**: Register via the landing page by entering required details.
   - **Returning Users**: Log in to access your account.

2. **Pet Management**:
   - View your pets on the homepage after logging in.
   - Add new pets by clicking **Add Pet**, filling in details, and clicking **Save**.

3. **Viewing and Editing Pet Details**:
   - Access pet details by clicking on a pet card.
   - Edit pet details or delete pets as needed.
   - Add needs by clicking **Add Need** and filling out the relevant information.

4. **Managing Needs**:
   - Enter need details in the **Add Need** modal and save.
   - Needs can be managed on the need card on the pet’s page; add, edit, delete, toggle inactive/active, and complete as necessary.
   - Needs are automatically carried over to the next day and also set to uncompleted if they are not toggled inactive.

5. **User Profile and Security**:
   - Update personal details or log out via the **Profile** button.
   - Deleting your profile will remove all associated data and log you out permanently.

## Upcoming Features in the Next Versions

The following features are planned for the next version update of NeedyPet, enhancing functionality and user experience:

1. **Caretaker Support Throughout the Application**:
   - Extending caretaker functionalities to the frontend, allowing seamless management of caretaker permissions and responsibilities.

2. **Email Integration with Nodemailer**:
   - **Account Verification**: Enhance security by requiring email verification during registration.
   - **Password Recovery**: Implement password recovery features, allowing users to reset passwords via email.
   - **Caretaker Invitations**: Simplify adding caretakers with email invitations, managing roles and permissions efficiently.

3. **Activity Reminders and Notifications**:
   - Introduce a notification system to alert users of upcoming care activities, ensuring pets receive consistent care.

4. **Native Mobile Applications**:
   - Develop native applications for iOS and Android to provide a seamless mobile experience.

#### Note

  - Functions not yet implemented in the frontend are operational in the backend and marked for future integration. These include full carer capabilities, detailed in source code comments.

## Technical Setup

- **Backend Technologies**: MongoDB, Express.js, Node.js, JavaScript, ESLint
- **Frontend Technologies**: Vue.js, Ionic, TypeScript, ESLint, Jest
- **DevOps Tools**: Docker, Nginx

## Credits

This project was developed by yumeangelica. For more information on how this work can be used, please refer to the LICENSE.txt file.

Copyright © 2023 - present; yumeangelica

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. This allows you to share the work, with appropriate credit given, but not to use it for commercial purposes or to create derivative works.

For more details about the license, please visit [Creative Commons License](https://creativecommons.org/licenses/by-nc-nd/4.0/).
