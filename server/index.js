const express = require('express')
const cors = require('cors')
const app = express()
const config = require('./utils/config')
const requestLogger = require('./middlewares/requestLoggerMiddleware')
const errorHandler = require('./middlewares/errorHandlerMiddleware')
const petsRoutes = require('./routes/petRoutes')
const usersRoutes = require('./routes/userRoutes')
const unknownEndpoint = require('./middlewares/unknownEndpointHandler')
const connectDatabase = require('./database/mongoConnection')

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
app.use('/api', petsRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

// listen
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})