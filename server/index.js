const express = require('express')
const cors = require('cors')
const app = express()
const config = require('./utils/config')
const connectDatabase = require('./database/mongoConnection')
const authenticateToken = require('./middlewares/tokenValidatorMiddleware')
const requestLogger = require('./middlewares/requestLoggerMiddleware')
const errorHandler = require('./middlewares/errorHandlerMiddleware')
const unknownEndpoint = require('./middlewares/unknownEndpointHandler')
const petsRoutes = require('./routes/petRoutes')
const usersRoutes = require('./routes/userRoutes')

// middleware
app.use(express.json()) // json parser for post requests
app.use(requestLogger)
app.use(cors())

// connect to database
connectDatabase()

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>')
})

// routes
app.use('/auth', usersRoutes)

// app.use('/api', petsRoutes) // no authentication needed for this route, enable for testing if needed
app.use('/api', authenticateToken, petsRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

// listen
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})