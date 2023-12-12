const express = require('express')
const cors = require('cors')
const app = express()
const requestLogger = require('./middlewares/requestLoggerMiddleware')
const errorHandler = require('./middlewares/errorHandlerMiddleware')
const petsRoutes = require('./routes/petsRoutes')
const unknownEndpoint = require('./middlewares/unknownEndpointHandler')

// middleware
app.use(express.json()) // json parser for post requests
app.use(requestLogger)
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>')
})

// routes
app.use('/api', petsRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

// listen
const PORT = 5002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})