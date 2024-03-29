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
|           |                                                                                                                                                                      |             |
| **Total** |                                                                                                                                                                      | **151**     |
