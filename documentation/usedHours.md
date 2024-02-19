| Date      | Tasks                                                                                                                                                  | Hours Spent |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 11.12.23  | Plan the project idea: NeedyPet, a pet care management app                                                                                             | 2           |
|           | Plan main technologies: Back-end: Node.js, Express.js, MongoDB. Front-end: Vue.js                                                                      | 1           |
|           | Design wireframe models for NeedyPet using Figma                                                                                                       | 3           |
|           |                                                                                                                                                        |             |
| 12.12.23  | Setup initial server with Node.js and Express                                                                                                          | 2           |
|           | Implement basic REST operations using mock data                                                                                                        | 2           |
|           | Refactor routes, add controller file, implement request logger and error handling                                                                      | 2           |
|           |                                                                                                                                                        |             |
| 13.12.23  | Setup MongoDB database, install modules, connect to server, and remove mock data                                                                       | 2           |
|           | Create basic model for pets                                                                                                                            | 1           |
|           | Refactor and improve pet controller file, add new route for put requests                                                                               | 2           |
|           | Start improving petModel and testing its functionality                                                                                                 | 3           |
|           |                                                                                                                                                        |             |
| 14.12.23  | Fix deprecated mongodb connection options, rename router, install bcrypt & jsonwebtoken                                                                | 1           |
|           | Create basic userModel, userController and userRoutes                                                                                                  | 2           |
|           | Modify petModel, add custom functions, set toJSON, connect userModel and petModel                                                                      | 5           |
|           |                                                                                                                                                        |             |
| 15.12.23  | Create addNewNeed function, add validations, and new route. Fix pet's need \_id to id                                                                  | 1.5         |
|           | Update error handler. Also, test functionality with REST client calls                                                                                  | 1           |
|           | Write requirementSpecification document and update readme file                                                                                         | 2           |
|           |                                                                                                                                                        |             |
| 16.12.23  | Create and configure config file, and set NODE_ENV for different environments                                                                          | 1           |
|           | Update requestLogger for enhanced functionality and environment-based logging, and also test it                                                        | 1.5         |
|           |                                                                                                                                                        |             |
| 18.12.23  | Implement token-based authentication with expiration, handle expired tokens in errorHandler                                                            | 2           |
|           | Develop login functionality and corresponding route                                                                                                    | 1           |
|           | Implement token validation middleware, update errorHandler for JsonWebTokenError                                                                       | 1           |
|           | Perform REST client tests to check code functionality and validate token expiration mechanism                                                          | 0.5         |
|           |                                                                                                                                                        |             |
| 19.12.23  | Research ESLint configurations, select XO, install ESlint, write custom rules, lint and verify project functionality                                   | 2.5         |
|           | Begin setting up the test environment, refactor app logic from index.js to app.js, install Jest, and initiate test writing                             | 2           |
|           |                                                                                                                                                        |             |
| 20.12.23  | Configure test env for Node, add cross-env, establish test database and logic, configure Jest, configure ESLint rule, write tests                      | 3           |
|           | Add Supertest, write a basic API test, and resolve a globalTeardown issue by adding a globalTeardown file to utils                                     | 3           |
|           |                                                                                                                                                        |             |
| 21.12.23  | Add addNewRecord functionality and route, update careRecords array in the model, change object \_id to id in careRecords array, and test functionality | 2           |
|           | Update need and careRecord objects: Update unit and value properties, adjust emit validation, and rename timeLength to value in duration               | 1           |
|           | Update validations for addNewNeed and addNewRecord functions, configure ESlint, test code functionality with REST client                               | 1.5         |
|           |                                                                                                                                                        |             |
|           | ----- Note: 1 month break; Christmas holiday and focusing on other studies & my job -----                                                              |             |
|           |                                                                                                                                                        |             |
| 01.02.24  | Update user functionality: Add getUserById, updateUser, and deleteUser functions, and corresponding routes. Add email field for user                   | 2           |
|           | Update dependencies, install mongoose-unique-validator and use it in models, configurate eslint --fix script to package.json                           | 0.5         |
|           | Create and use passwordStrengthValidator middleware for ensuring strong password when creating and updating user                                       | 1           |
|           | Test with REST client calls that everything works                                                                                                      | 0.5         |
|           |                                                                                                                                                        |             |
| 02.02.24  | Implement dateFor validation, add formatted dateFor to newNeedObject. Update need quantity and duration validations                                    | 1.5         |
|           | Add dailyTaskCompleter function that toggles the need as completed if daily records meet the need, including its use to toggle daily tasks             |             |
|           | Ensure all updates were tested thoroughly to confirm functionality                                                                                     |             |
|           |                                                                                                                                                        |             |
| 08.02.24  | Add moment-timezone dependency, add timezone field for user, add helper which checks that timezone is valid, add validations                           | 0.5         |
|           |                                                                                                                                                        |             |
| 18.02.24  | Update JSDoc comments, add middleware validators for token, pet owner, and caretaker.                                                                  |             |
|           | Implement handlers for validating/setting user and pet to request, and retrieving them from request.                                                   |             |
|           | Integrate validators and handlers with the router, add timezone validation to userModel.                                                               |             |
|           | Disable object destructuring rule in ESLint, conduct manual functionality tests.                                                                       | 5.5         |
|           |                                                                                                                                                        |             |
| 19.02.24  | Update dependencies, update comments, fix bug in routes, fix link to used hours in README, update and run ESLint                                       | 1           |
|           |                                                                                                                                                        |             |
| **Total** |                                                                                                                                                        | **67.0**    |
