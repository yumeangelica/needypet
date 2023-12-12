const express = require('express')
const cors = require('cors')
const app = express()
const requestLogger = require('./middlewares/requestLoggerMiddleware')
const petsRoutes = require('./routes/petsRoutes')

// middleware
app.use(express.json()) // json parser for post requests
app.use(requestLogger) // custom middleware for logging requests
app.use(cors()) // allows cross-origin resource sharing

// routes
app.use(petsRoutes)

app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>')
})

// unknown endpoint handler
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// listen
const PORT = 5002
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})