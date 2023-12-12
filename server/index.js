const express = require('express')
const app = express()
const requestLogger = require('./middlewares/requestLoggerMiddleware')
const cors = require('cors')

// middleware
app.use(express.json()) // json parser for post requests
app.use(requestLogger) // custom middleware for logging requests
app.use(cors()) // allows cross-origin resource sharing



// mock data for pets
let pets = [
  {
    id: 1,
    petName: 'Dia',
    type: 'dog'
  },
  {
    id: 2,
    petName: 'Neko',
    type: 'cat'
  },
  {
    id: 3,
    petName: 'Pate',
    type: 'cat'
  }
]

// routes
app.get('/', (request, response) => {
  response.send('<h1>Welcome to NeedyPet backend!</h1>')
})

// get all pets
app.get('/api/pets', (request, response) => {
  response.json(pets)
})

// get one pet
app.get('/api/pets/:id', (request, response) => {
  const id = Number(request.params.id)
  const pet = pets.find(pet => pet.id === id)
  if (pet) {
    response.json(pet)
  } else {
    response.status(404).end()
  }
})

// post pet to list
app.post('/api/pets', (request, response) => {

  const pet = request.body

  if(pet.petName === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  pets = pets.concat(pet)
  response.json(pet)
})



// delete pet from list
app.delete('/api/pets/:id', (request, response) => {
  const id = Number(request.params.id)
  pets = pets.filter(pet => pet.id !== id)
  response.status(204).end()
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