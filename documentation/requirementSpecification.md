# Requirement Specification for NeedyPet - Pet Care Management Application

## Purpose of the Application

NeedyPet is designed to streamline pet care management within households and pet care facilities. It provides a unified platform that allows multiple caretakers to collaboratively manage the health and daily activities of pets. This centralizes communication and task tracking, preventing common issues such as overfeeding or missed medication, and incorporates user-specific timezone settings for accurate activity scheduling.

## Application User Roles

- **Pet Owner**: Primary user responsible for creating and managing pet profiles, setting up care schedules, and assigning caretakers. Pet owners have full control over their pets' profiles and care activities.
- **Pet Carer**: Secondary users who can view assigned pets and are responsible for completing care activities as per the owner's setup. Carers can mark activities as complete but cannot modify the details or statuses beyond that.

## Functional Requirements

1. **User Management**:
   - **Registration**: Users create an account by providing a username, password, email, and selecting their timezone. Usernames must be unique.
   - **Login/Logout**: Secure login mechanism to access the application. Logout securely ends the session.
   - **Profile Management**: Users can update their profile information including email and password, and can delete their account, which removes all associated data.

2. **Pet Profile Management**:
   - **Adding/Editing Pets**: Owners can add new pets, edit pet information, or delete pet profiles.
   - **Pet Details**: Profiles include the pet’s name, species, breed, birthday, and a detailed description.
   - **Assign Carers**: Owners assign carers to pets. Carers can complete activities but cannot modify pet details or toggle activity statuses.

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
   - **Reminders**: Automated reminders for upcoming or overdue activities to ensure all pet needs are met timely.
   - **Alerts**: Notifications for significant activities within the account, such as impending activity deadlines or system updates.

5. **Activity History and Reporting**:
   - **History Access**: Users can access a full history of all activities related to pet care, filtered by pet or date.

## Technical Requirements

- **Back-end**: Utilizes MongoDB for data storage, Express.js, and Node.js for server-side logic. Secure password hashing with bcryptjs is used for data protection.
- **Front-end**: Developed with Vue.js and styled using Ionic for responsive design, ensuring compatibility across different devices and platforms.
- **Email Services** (Planned Feature): Nodemailer will be used for account email verification, password resets, and sending activity reminders and alerts.
- **Security**: Implements industry-standard security measures including encrypted sessions and GDPR-compliant data handling practices.

## Compliance and Standards

- The application adheres to the General Data Protection Regulation (GDPR) for the protection and privacy of user data across the European Union and beyond.
