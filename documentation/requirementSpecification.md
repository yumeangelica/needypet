# Requirement Specification for NeedyPet - Pet Care Management Application

## Purpose of the Application

Developed to manage pet care activities, NeedyPet serves households and pet care facilities by providing a unified platform where multiple carers, such as family members, can collaboratively manage the well-being of their pets. It centralizes the creation of pet profiles, the registration of pets, and the delineation of each pet's daily care needs, ensuring efficient communication and task tracking. This system is particularly beneficial in preventing miscommunications that could lead to overfeeding, underfeeding, or missed medication doses by providing real-time updates on completed care tasks, making it transparent whether the cat has been fed, the dog has been walked, or any pet has received their necessary care.

## Application User Roles

- **Pet Owner**: Primary user responsible for adding pets and managing their profiles and care schedules.
- **Pet Carer**: Users who are assigned to carry out specific pet care tasks and record their completion.

## Functional Requirements

1. **User Management**:

   - Users can register and create a profile with their details.
   - Authentication system that allows users to log in and log out securely.

2. **Pet Profile Management**:

   - Pet Owners can add, edit, and remove pets from their profile.
   - Pet Owners can assign carers to each pet via invitation.
   - Each pet profile includes details such as the pet's name, description, owner, birth date, and a list of carers etc.

3. **Pet Needs Management**:

   - Pet profiles will include a section for 'Pet Needs' which lists the daily requirements such as feeding, walking, medication etc.
   - Each need should specify the frequency and quantity or duration.

4. **Task Recording**:

   - Pet Carers can log when a task is completed with a timestamp and notes if necessary.
   - The system will keep a historical record of all care tasks performed for each pet.

5. **Notifications and Reminders**:

   - The system will notify carers of upcoming tasks for the pets they are responsible for.
   - Reminder notifications for tasks that are overdue.

6. **Reporting**:
   - Pet Owners can view reports on the care provided to their pets over a specified period.
   - Reports will include details of all completed tasks and any notes made by the carers.

## Technical Requirements

- Back-end will be built using the MongoDB, Express.js, and Node.js.
- Front-end will be built using Vue.js
- The system should support cross-platform functionality, being accessible on web and mobile devices.

## Compliance and Standards

- The application will comply with the General Data Protection Regulation (GDPR) for the protection of user data.
