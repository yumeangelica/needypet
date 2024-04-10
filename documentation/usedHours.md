| Date      | Tasks                                                                                                                                                                | Hours Spent |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 11.12.23  | Plan the project idea: NeedyPet, a pet care management app.                                                                                                          | 2           |
|           | Plan main technologies: Back-end: Node.js, Express.js, MongoDB. Front-end: Vue.js.                                                                                   | 1           |
|           | Design wireframe models for NeedyPet using Figma.                                                                                                                    | 3           |
|           |                                                                                                                                                                      |             |
| 12.12.23  | Setup initial server with Node.js and Express.                                                                                                                       | 2           |
|           | Implement basic REST operations using mock data.                                                                                                                     | 2           |
|           | Refactor routes, add controller file, implement request logger and error handling.                                                                                   | 2           |
|           |                                                                                                                                                                      |             |
| 13.12.23  | Setup MongoDB database, install modules, connect to server, and remove mock data.                                                                                    | 2           |
|           | Create basic model for pet.                                                                                                                                          | 1           |
|           | Refactor and improve pet controller file, add new route for put requests.                                                                                            | 2           |
|           | Start improving petModel and testing its functionality.                                                                                                              | 3           |
|           |                                                                                                                                                                      |             |
| 14.12.23  | Fix deprecated mongodb connection options, rename router, install bcrypt & jsonwebtoken.                                                                             | 1           |
|           | Create basic userModel, userController and userRoutes.                                                                                                               | 2           |
|           | Modify petModel, add custom functions, set toJSON, connect userModel and petModel.                                                                                   | 5           |
|           |                                                                                                                                                                      |             |
| 15.12.23  | Create addNewNeed function, add validations, and new route. Fix pet's need \_id to id.                                                                               | 1.5         |
|           | Update error handler. Also, test functionality with REST client calls.                                                                                               | 1           |
|           | Write requirementSpecification document and update readme file.                                                                                                      | 2           |
|           |                                                                                                                                                                      |             |
| 16.12.23  | Create and configure config file, and set NODE_ENV for different environments.                                                                                       | 1           |
|           | Update requestLogger for enhanced functionality and environment-based logging, and also test it.                                                                     | 1.5         |
|           |                                                                                                                                                                      |             |
| 18.12.23  | Implement token-based authentication with expiration, handle expired tokens in errorHandler.                                                                         | 2           |
|           | Develop login functionality and corresponding route.                                                                                                                 | 1           |
|           | Implement token validation middleware, update errorHandler for JsonWebTokenError.                                                                                    | 1           |
|           | Perform REST client tests to check code functionality and validate token expiration mechanism.                                                                       | 0.5         |
|           |                                                                                                                                                                      |             |
| 19.12.23  | Research ESLint configurations, select XO, install ESlint, write custom rules, lint and verify project functionality.                                                | 2.5         |
|           | Begin setting up the test environment, refactor app logic from index.js to app.js, install Jest, and initiate test writing.                                          | 2           |
|           |                                                                                                                                                                      |             |
| 20.12.23  | Configure test env for Node, add cross-env, establish test database and logic, configure Jest, configure ESLint rule, write tests.                                   | 3           |
|           | Add Supertest, write a basic API test, and resolve a globalTeardown issue by adding a globalTeardown file to utils.                                                  | 3           |
|           |                                                                                                                                                                      |             |
| 21.12.23  | Add addNewRecord functionality and route, update careRecords array in the model, change object \_id to id in careRecords array, and test functionality.              | 2           |
|           | Update need and careRecord objects: Update unit and value properties, adjust emit validation, and rename timeLength to value in duration.                            | 1           |
|           | Update validations for addNewNeed and addNewRecord functions, configure ESlint, test code functionality with REST client.                                            | 1.5         |
|           |                                                                                                                                                                      |             |
|           | ----- Note: 1 month break; Christmas holiday and focusing on other studies & my job -----                                                                            |             |
|           |                                                                                                                                                                      |             |
| 01.02.24  | Update user functionality: Add getUserById, updateUser, and deleteUser functions, and corresponding routes. Add email field for user.                                | 2           |
|           | Update dependencies, install mongoose-unique-validator and use it in models, configurate eslint --fix script to package.json.                                        | 0.5         |
|           | Create and use passwordStrengthValidator middleware for ensuring strong password when creating and updating user.                                                    | 1           |
|           | Test with REST client calls that everything works.                                                                                                                   | 0.5         |
|           |                                                                                                                                                                      |             |
| 02.02.24  | Implement dateFor validation, add formatted dateFor to newNeedObject. Update need quantity and duration validations.                                                 | 1.5         |
|           | Add dailyTaskCompleter function that toggles the need as completed if daily records meet the need, including its use to toggle daily tasks.                          |             |
|           | Ensure all updates were tested thoroughly to confirm functionality.                                                                                                  |             |
|           |                                                                                                                                                                      |             |
| 08.02.24  | Add moment-timezone dependency, add timezone field for user, add helper which checks that timezone is valid, add validations.                                        | 0.5         |
|           |                                                                                                                                                                      |             |
| 18.02.24  | Update JSDoc comments, add middleware validators for token, pet owner, and caretaker.                                                                                |             |
|           | Implement handlers for validating/setting user and pet to request, and retrieving them from request.                                                                 |             |
|           | Integrate validators and handlers with the router, add timezone validation to userModel.                                                                             |             |
|           | Disable object destructuring rule in ESLint, conduct manual functionality tests.                                                                                     | 5.5         |
|           |                                                                                                                                                                      |             |
| 19.02.24  | Update dependencies, update comments, fix bug in routes, fix link to used hours in README, update and run ESLint.                                                    | 1           |
|           |                                                                                                                                                                      |             |
| 27.02.24  | Implement algorithm for processing and archiving past day's pet needs for users in midnight timezones, while generating fresh, unfulfilled tasks for the new day.    |             |
|           | Add node-cron dependency, and set hourly cron job for petNeedsToNextDays. Add deleteNeed function. Add populate methods to getAllUsers function.                     |             |
|           | Add deleteNeed function, add populate methods to getAllUsers function, and add corresponding route for deleteNeed. Test that everything works.                       | 10          |
|           |                                                                                                                                                                      |             |
| 28.02.24  | Update CORS configuration by creating a corsConfig.js file. Refactor config.js to export and import variables individually, improving security and modularity.       |             |
|           | Improve environment variable naming and apply necessary changes across files, update dependencies, and rename routes to plural form.                                 | 2           |
|           |                                                                                                                                                                      |             |
| 28.02.24  | Read about licensing and add Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License, update readme and package.json to contain license.  |             |
|           | Update readme to contain credits. Add robots.txt to prevent search engine indexing.                                                                                  | 2           |
|           |                                                                                                                                                                      |             |
| 29.02.24  | Optimize cron function for asynchronous operation. Enhance pet management with improved need handling and model updates.                                             |             |
|           | Add user search and timezone-aware date formatting functionalities. Adjust eslint settings. Test that everything works properly.                                     | 4           |
|           |                                                                                                                                                                      |             |
| 29.02.24  | Read about Ionic framework and how to use it with Vue.js. Initialize frontend for the project.                                                                       | 3           |
|           |                                                                                                                                                                      |             |
| 01.03.24  | Create login and logout functionality for frontend, add axios dependency. Create api and auth service files. Configure frontend.                                     |             |
|           | Create login page and update home page. Show username and logout button in navbar.                                                                                   |             |
|           | Fix cors configuration, and cron function in backend.                                                                                                                |             |
|           | Add validateUserToken function which validates the token, and add route for it. Update token expiresIn. Test that everything works.                                  | 10          |
|           |                                                                                                                                                                      |             |
| 02.03.24  | Update pet update function, so updated pet is added to all new caretakers pet list.                                                                                  | 0.25        |
|           |                                                                                                                                                                      |             |
| 02.03.24  | Backend: Update dev routes, and add getAllUserPets GET route. Fix addNewPet route by disabling petOwnerValidationMiddleware. Update comments.                        |             |
|           | Add getAllUserPets function. Improve pet ownership/caretaker validation. Test that everything works.                                                                 |             |
|           | Frontend: Implement getAllUserPets function, add getToken function.                                                                                                  | 2           |
|           |                                                                                                                                                                      |             |
| 08.03.24  | Comprehensive update of login, routing, and pet features. Update the login page to utilize Ionic framework, enhancing user experience.                               |             |
|           | Implement a dynamic header display for mobile and desktop.                                                                                                           |             |
|           | Integrate Pinia for state management, enabling improved login functionality and seamless state persistence.                                                          |             |
|           | Add 'initializeFromLocalStorage' to maintain user session.                                                                                                           |             |
|           | Redesign file structure: Isolate header into its own component for better modularity, complemented with basic styling adjustments.                                   |             |
|           | Implement adaptive routing views for mobile and desktop, enhancing the app's responsiveness and user interaction.                                                    |             |
|           | Develop a comprehensive Pinia store for pets, featuring actions like 'getAllPets', and getters including 'getOwnerPets', 'getCarerPets', and 'getPetById'.           |             |
|           | Establish a user-focused Pinia store, adding critical functionalities such as 'logout', 'login', 'initializeFromLocalStorage', and token validation methods.         |             |
|           | Create 'TheHeader' component, showcasing home button, username, and logout features, visible only to logged-in users and hidden in mobile mode.                      |             |
|           | In mobile mode, transition the header to an Ionic tab, positioned at the bottom of the application, optimizing user interface for mobile users.                      |             |
|           | Develop 'PagePet' component to display detailed pet information based on ID.                                                                                         |             |
|           | Modify the router configuration to include a route for 'PagePet', streamlining navigation within the application.                                                    |             |
|           | Create a dedicated Axios instance file for backend connectivity, ensuring efficient and centralized API communication.                                               |             |
|           | Innovate a Pinia store dedicated to application UI, managing screen states for enhanced user interface control.                                                      |             |
|           | Create styles CSS file for the app.                                                                                                                                  |             |
|           | Create a 'Pet Card' component that showcases pet names and serves as a navigational link to individual pet views.                                                    |             |
|           | Test that everything works properly.                                                                                                                                 | 12          |
|           |                                                                                                                                                                      |             |
|           | Create types for the frontend. Create 'TheMobileHeader' component for mobile mode. Enhance functions and Pinia state with type annotations.                          |             |
|           | Integrate 'TheMobileHeader' into the app.vue file. Bugfixes: modify the 'userName' handling to utilize a computed method.                                            |             |
|           | Also refactor the homepage functionality to fetch filtered pets initially. Implement a watch method for dynamic list updates. Test with different browsers.          | 4           |
|           |                                                                                                                                                                      |             |
| 18.03.24  | Create profile page which displays authenticated user.                                                                                                               |             |
|           | Add navigation bar links for the profile page in both mobile and desktop versions. Integrate the `/profile` route into the app's routing.                            |             |
|           | Create the `getUserById` function for user data retrieval. Perform CSS fixes for layout. Delete unnecessary files. Test that everything works.                       | 2.5         |
|           |                                                                                                                                                                      |             |
| 18.03.24  | Backend: Modify `addNewNeed` route to `/pets/:id/newneed`. Modify `addNewRecord` route to `/pets/:id/newrecord`. Remove "minute" from validation.                    |             |
|           | Frontend: Add more types. Update `getAllPets` Axios call. Add `addNewNeed` function to post new needs for pets. Add promise type for `getPetById`.                   |             |
|           | Add custom pink palette variables. Override `ion-color-primary` class with custom pink palette. Remove custom class and use modified primary color on buttons.       |             |
|           | Add 'Add Need' button and modal form for adding a new need. Implement functionality for adding new needs. Modify `getPetById` function to filter not archived needs. |             |
|           | Add styling to various components. Manually test that everything works properly.                                                                                     | 7           |
|           |                                                                                                                                                                      |             |
| 20.03.24  | Implement navigation error handling features including a 404 page for undefined routes.                                                                              |             |
|           | Add sessionStorage logic for persisting page state across refreshes, and conditional rendering for "Pet not found" scenarios.                                        |             |
|           | Also add a beforeEach navigation guard for storing current fullPath in sessionStorage. Test with different browsers that everything works.                           | 2.25        |
|           |                                                                                                                                                                      |             |
| 25.03.24  | Fix userController test cases and add new tests. Implement API tests for user creation and login. Correct status code in deleteUser function in userController.      |             |
|           | Exclude cron and logger in test env with NODE_ENV. Add detectOpenHandles to test script. Test that everything works.                                                 | 5           |
|           |                                                                                                                                                                      |             |
| 26.3.24   | Backend: Enhance addNewPet by adding species field and initializing fields with empty strings for integrity.                                                         |             |
|           | Disable dev routes in production for security. Add checks in dateFor and an update boolean. Make owner required in petModel. Manually test that everything works.    | 3           |
|           |                                                                                                                                                                      |             |
| 27.3.24   | Frontend: Add eslint typescript dependencies, run eslint and format code. Update all outdated dependencies. Add species for pet. Test that everything works.         | 1.25        |
|           |                                                                                                                                                                      |             |
| 28.3.24   | Frontend: Implement Need card component and addRecord function for updating specific needs. Introduce eslint rule for capitalized comments and run eslint.           |             |
|           | Add `moment-timezone` dependency for timezones. Refactor need display to a calendar style. Add `addRecord` function for needs. Change onMounted to onBeforeMount.    |             |
|           | Change type definitions from `CareRecord` to `DurationRecord` and `QuantityRecord`. Ensure user timezone support in UserStoreState. Test all changes thoroughly.     |             |
|           | Backend: Update `newRecord`route and refactor need ID fetching from parameters. Implement timezone support in `loginUser` response.                                  |             |
|           | Clean up commented-out code. Manually test that everything works.                                                                                                    | 3           |
|           |                                                                                                                                                                      |             |
| 28.3.24   | Frontend visual updates and bug fixes: Add custom CSS color variables, update header texts in PageHome, and remove duplicate ion-content in PagePet.                 |             |
|           | Implement 'currentDate' as a key for optimized rendering in PagePet.                                                                                                 |             |
|           | Create a custom background picture with Procreate and initiate app design with Figma.                                                                                |             |
|           | Update PagePet, PageLogin, PageProfile, TheNeedCard, and header styles to match my design vision.                                                                    |             |
|           | Import Google font Krona for aesthetic enhancement. Fix a mobile view bug in app.vue for improved responsiveness.                                                    | 10.75       |
|           |                                                                                                                                                                      |             |
| 29.3.24   | Frontend styling and design updates: Implement comprehensive style enhancements across the application following design improvements in Figma.                       |             |
|           | Introduce new custom CSS color variables and updated CSS styles. Use WebAIM Contrast Checker for accessibility-conscious color choices.                              |             |
|           | Ensure that all styling changes, especially color selections, meet accessibility standards by checking contrast ratios, enhancing the usability.                     |             |
|           | Refine the styling of User Profile and Pet Cards, including borders, shadows, and overall layout.                                                                    |             |
|           | Update the Login Form, adding stylistic details like drop shadows and borders.                                                                                       |             |
|           | Design PageHome completely, updating styles to align with the new design.                                                                                            |             |
|           | Update the styling of Need Cards, including the Complete Button and Done label.                                                                                      |             |
|           | Enhance header elements by adding Paw and Person ion-icons for a more intuitive navigation experience. Now mobile header and desktop header have matching design.    |             |
|           | Improve modal presentation in PagePet, introducing return button for better user navigation.                                                                         |             |
|           | Conduct thorough testing across all pages to ensure that the new styles are applied correctly and work in mobile mode and in desktop mode.                           | 12          |
|           |                                                                                                                                                                      |             |
| 30.3.24   | Frontend: Create `PageRegister` for account creation with timezone selection using `moment-timezone`. Also style the entire page.                                    |             |
|           | Implement `createAccount` action function in user store. Add route for account creation (register).                                                                  |             |
|           | Refactor `main.ts` to enhance token validation and navigation logic based on user authentication.                                                                    |             |
|           | Implement computed properties and conditions to hide headers on PageRegister and PageLogin.                                                                          |             |
|           | Add global CSS class for centering texts. Implement a display message in `PageHome` for users without pets, enhancing user feedback.                                 |             |
|           | Backend: Update timezone validator logic to validate timezones more effectively. Test that everything works properly.                                                | 7           |
|           |                                                                                                                                                                      |             |
| 31.3.24   | Create landing page for improved initial user navigation with options to log in or create an account, and style it to align with the app's design.                   |             |
|           | Add `PageLanding` route as public in `main.ts` and redirect unauthenticated users, enhancing security and flow.                                                      |             |
|           | Modify the logout function in the user store to redirect to `PageLanding`.                                                                                           |             |
|           | Implement computed properties and conditions to hide headers on `PageLanding`.                                                                                       |             |
|           | Add a custom CSS color variable for the "Create Account" button, enhancing app styling.                                                                              | 2           |
|           |                                                                                                                                                                      |             |
| 1.4.24    | Frontend: Create new pet creation page and implement logic for submitting pet details. Add addNewPet action function to pet store.                                   |             |
|           | Add button for adding new pets and redirect logic to PageAddPet in PageHome. Add add-pet route for PageAddPet.                                                       |             |
|           | Modify UserId type to User type; modify Pet interface so id, owner, careTakers, and needs are optional.                                                              |             |
|           | Fix bugs in headers buttons and logic.                                                                                                                               |             |
|           | Backend: update validation in addNewPet function. Change minlength to 0 in species and breed in petModel.                                                            |             |
|           | Test that everything works properly.                                                                                                                                 | 6           |
|           |                                                                                                                                                                      |             |
| 2.4.24    | Frontend updates:                                                                                                                                                    |             |
|           | Implement and style `PageEditProfile` with complete logic for updating user details, including username, email, timezone selection, and password verification.       |             |
|           | Add notification for password field validation and customize styles for cohesive user interface.                                                                     |             |
|           | Add settings toggle for account deletion, add icons for actions, and confirmation prompts in `PageProfile` to enhance user experience and app functionality.         |             |
|           | Integrate `deleteAccount` action function and `updateUserProfile` action to user store, enabling account management functionalities.                                 |             |
|           | Add "Edit Profile" button with navigation logic in `PageProfile`, and establish `edit-profile` route for user navigation to `PageEditProfile`.                       |             |
|           | Move logout button and associated logic from header to `PageProfile` for a more intuitive user interface.                                                            |             |
|           | Update ion-icon colors in header and customize UI elements with Google font Krona to unify and enhance the application's visual design.                              |             |
|           | Test that new features work properly.                                                                                                                                | 6           |
|           |                                                                                                                                                                      |             |
| 3.4.24    | Frontend updates: Refactor and enhance global and specific page CSS for clarity and maintainability.                                                                 |             |
|           | Implement and improve responsiveness across multiple pages (`PageLogin`, `PageRegister`, `PageEditProfile`, `PageLanding`, `PagePet`, `PageAddPet`, `TheNeedCard`).  |             |
|           | Adjust UI elements and styling to enhance user interface consistency and aesthetics.                                                                                 |             |
|           | Update class naming conventions for better alignment with Ionic framework standards (e.g., replace custom `text-center` with `ion-text-center`).                     |             |
|           | Clean up unnecessary elements and organize CSS to simplify and ensure maintainability.                                                                               |             |
|           | Add new header for the app in `PageLanding` and center elements in `PageNotFound`.                                                                                   |             |
|           | Move the add pet button in `PageHome` to improve navigation and user experience.                                                                                     |             |
|           | Focus on enhancing page and component responsiveness to ensure a better user experience across various device sizes.                                                 |             |
|           | Test with different screen sizes that everything works.                                                                                                              | 8           |
|           |                                                                                                                                                                      |             |
| 4.4.24    | Frontend updates:                                                                                                                                                    |             |
|           | Set `ion-router-outlet` animated to false for smoother transitions.                                                                                                  |             |
|           | Add global styles for buttons in `PageLanding`, `PageRegister`, and `PageLogin` to enhance UI consistency.                                                           |             |
|           | Remove headers and add go back buttons in `PageRegister` and `PageLogin` for improved navigation and user experience.                                                |             |
|           | Change duplicate `ion-content` to `div` with `datetime-wrapper` in `PagePet`.                                                                                        |             |
|           | Add global error message class to standardize error feedback across the app.                                                                                         |             |
|           | Refactor global CSS for DRY principles, adding universal classes to reduce redundancy and improve maintainability.                                                   |             |
|           | Implement responsive design and refactor duplicate local CSS classes to global CSS for DRY compliance across multiple files.                                         |             |
|           | Testing of new features and responsiveness across different screen sizes to ensure functionality and user experience.                                                | 8           |
|           |                                                                                                                                                                      |             |
| 6.4.24    | Frontend updates:                                                                                                                                                    |             |
|           | Create `PageEditPet` with comprehensive editing features, including dynamic form fields, date selection, and user input validation.                                  |             |
|           | Add nested 'edit-pet' route for `PageEditPet` page, ensuring seamless navigation within the app's pet management features.                                           |             |
|           | Improve `PageHome` UI: Move 'Add Pet' button and add an icon for better visibility and interaction, making pet addition more intuitive and accessible.               |             |
|           | Enhance pet management in `PagePet`: Restrict edit/delete buttons to owner and sanitize inputs.                                                                      |             |
|           | Add `updatePet` and `deletePet` action functions, integrating backend support for critical pet management functionalities.                                           |             |
|           | Implement `isTodayOrFuture` logic in `TheNeedCard` component to enable conditional display of the complete button.                                                   |             |
|           | Enhance need completion with validation and feedback messages in `TheNeedCard`.                                                                                      |             |
|           | Modify edit pet button to include an icon, add delete pet button and functionality, and implement conditional rendering for router-views.                            |             |
|           | Add a button which sets the current date for needs and modify the modal date selection to a read-only input.                                                         |             |
|           | Add check for `dateFor` value to validate only today and future dates.                                                                                               |             |
|           | Add route watcher in `PagePet` to fetch pet details dynamically, enhancing data accuracy and user experience.                                                        |             |
|           | Add cancel button to `PageAddPet` for improved navigation back to `PageHome`.                                                                                        |             |
|           | Modify `addNewNeed` function to filter the newest need from `response.data.needs` and update the pet's need list.                                                    |             |
|           | Add global CSS for valid message color.                                                                                                                              |             |
|           | Backend updates:                                                                                                                                                     |             |
|           | Enhance `addNewRecord` in `petController` with validation for completed, archived needs, and date matching, ensuring data integrity and user action relevance.       |             |
|           | Improve `dailyTaskCompleter` helper validation to check if quantity or duration exists, refining task completion logic for accuracy and reliability.                 | 11          |
|           |                                                                                                                                                                      |             |
| 7.4.24    | Frontend updates:                                                                                                                                                    |             |
|           | Create TimezoneSelector modal component with search functionality.                                                                                                   |             |
|           | Refactor `PageEditProfile` to TypeScript, introduce TimezoneSelector component, ensure inputs reset to original data if unsaved.                                     |             |
|           | Add `getTimezones` action function to app store for dynamically fetching timezone data.                                                                              |             |
|           | Update `PageRegister` with TypeScript, inline navigation; modularize timezone selector and its functionality.                                                        |             |
|           | Update `PageProfile` with TypeScript and inline navigation; implement route watch for user data fetch.                                                               |             |
|           | Refactor `ThePetCard` to use script setup for more concise component definition.                                                                                     |             |
|           | Update `PagePet`, `PageLogin`, `PageLanding`, and `PageHome` with TypeScript and inline navigation; remove unnecessary console logs.                                 |             |
|           | Enable TypeScript in header components for type safety enhancements.                                                                                                 |             |
|           | Set 'Krona One' as the global font across the application, update default text styles for consistency.                                                               | 5           |
|           |                                                                                                                                                                      |             |
| 8.4.24    | Frontend updates & bugfix:                                                                                                                                           |             |
|           | Refine pet update logic in `PetStore` to refresh state post-update, ensuring accurate representation of pets data without needing manual refresh.                    |             |
|           | Fix visibility issue with the "Add Pet" button on `PageHome`, ensuring it remains visible when a user has no pets, enhancing user experience.                        |             |
|           | Implement route leave guard in `PageAddPet` to clear form fields upon navigation away from the page and after successful pet submission.                             | 2           |
|           |                                                                                                                                                                      |             |
| 8.4.24    | Frontend visual updates & enhancements:                                                                                                                              |             |
|           | Design and create a logo for the NeedyPet app using Procreate and integrate it into the landing, login, and register pages to enhance branding.                      |             |
|           | Add a title for the app in index.html. Create and implement a favicon for the app to enhance brand visibility in browser tabs.                                       |             |
|           | Refactor CSS to adhere to DRY principles, moving specific styles to global.css for consistency and easier maintenance.                                               |             |
|           | Enhance mobile responsiveness across pages, ensuring a consistent and optimal user experience on various devices.                                                    |             |
|           | Add 'Arial' as a fallback font in global CSS for better cross-platform compatibility.                                                                                | 9           |
|           |                                                                                                                                                                      |             |
| 8.4.24    | Backend optimizations and updates:                                                                                                                                   |             |
|           | Update application dependencies. Remove development routes in `app.js` to tighten security.                                                                          |             |
|           | Remove `getAllPets` and `getPetById` methods from `petController`. Also remove `getPetById` route.                                                                   |             |
|           | Remove `getAllUsers` function from `userController` and comment `getUserByName` for potential future use.                                                            |             |
|           | Refactor `tzIdentifierChecker` helper to leverage updated `moment-timezone` library latest json for improved timezone validation.                                    |             |
|           | Clean up `petModel` by removing unused methods, further simplifying the model's structure.                                                                           | 1.5         |
|           |                                                                                                                                                                      |             |
| 8.4.24    | Backend optimizations & cyber security updates:                                                                                                                      | 1           |
|           | Implement Helmet in app.js with no-referrer and noSniff policies for improved security.                                                                              |             |
|           | Refine logging format and clarify variable naming in request logger.                                                                                                 |             |
|           | Add comment for future frequency field usage in Pet model, preparing for upcoming features.                                                                          |             |
|           |                                                                                                                                                                      |             |
| 9.4.24    | Frontend updates:                                                                                                                                                    |             |
|           | Enhance TheNeedCard with UI interactions, ownership checks, dynamic options menu, icons for actions, and handling for need deletion feedback.                        |             |
|           | Add updateNeed function and enhance state handling in getAllPets function for improved frontend data flow.                                                           |             |
|           | Add deleteNeed action function and isOwner getter function to pet store for better state management in the frontend.                                                 |             |
|           | Add return types and toggleNeedIsActive action function to enhance frontend state updates.                                                                           |             |
|           | Improve responsiveness in PagePet by adding screenSize watcher. Redesign card styles and add fully functional edit need modal in TheNeedCard component.              |             |
|           | Add errorMessage and center page header in PageAddPet. Update button styling in PageEditPet and global styles for headers.                                           |             |
|           | Enhance PagePet with async onBeforeMount, handleNeedDeleted & isOwner providers, and user feedback messages to improve frontend interactivity.                       |             |
|           | Remove outcommented code and console logs to clean up frontend codebase. Test that everything works properly.                                                        | 11          |
|           |                                                                                                                                                                      |             |
| 9.4.24    | Backend enhancements for dynamic need management:                                                                                                                    |             |
|           | Add toggleNeedisActive and updateNeed functions to petController for managing needs. Implement routes for toggleNeedisActive and updateNeed functions.               |             |
|           | Fix bug in the need updating algorithm that generates new needs for the next day, ensuring correct data handling. Test that everything works.                        | 2.5         |
|           |                                                                                                                                                                      |             |
| 10.4.24   | Docker setup and app configuration updates:                                                                                                                          |             |
|           | Add Dockerfiles for building and serving the frontend with Nginx, and setting up the backend service.                                                                |             |
|           | Implement Nginx configuration to handle proper routing and client-side navigation.                                                                                   |             |
|           | Modify frontend build script to clean previous builds, ensuring fresh deployments.                                                                                   |             |
|           | Add docker-compose file for orchestrating container deployment and dockerignore file for both services.                                                              |             |
|           | Replace bcrypt with bcryptjs in backend to fix Docker compatibility issues.                                                                                          |             |
|           | Introduce 'isTesting' environment variable to conditionally disable cron jobs during tests.                                                                          |             |
|           | Modify need updating algorithm to switch all not archived and not active needs to archived.                                                                          |             |
|           | Conduct comprehensive tests to verify Docker configurations and app functionalities.                                                                                 | 10          |
|           |                                                                                                                                                                      |             |
| **Total** |                                                                                                                                                                      | **253**     |
