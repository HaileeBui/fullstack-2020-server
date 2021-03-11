require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(express.static('build'))
app.use(cors())
morgan.token('post', (req, res) => JSON.stringify(req.body))

const mongoose = require('mongoose')
const Person = require('./model/person')
const PORT = process.env.PORT

app.use(morgan((tokens, req, res) => {
  if (tokens.method(req, res) === 'POST') {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.post(req, res)
    ].join(' ')
  } else {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  }
}))
app.use(express.json())

/*let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "040-123457",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "040-123458",
    },
    {
        id: 4,
        name: "Marry Poppendick",
        number: "040-123459",
    },

]
*/
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(people => people ? people.length : 0)
    .then(entries => {
      const currentTime = new Date()
      const text = `
        <p>Phonebook has info for ${ entries } people</p>
        <p>${ currentTime }</p>
      `
      response.send(text)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    person ? response.json(person) : response.status(404).end()
  })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(person => {
    person ? response.status(204).end() : response.status(404).end()
  })
    .catch(error => console.log(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  //const foundPerson = persons.find(item => item.name === body.name)
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  /*if(foundPerson) {
        return response.status(400).json({
            error:'name is already exist'
        })
    }*/

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then((savedAndFormatted) =>{
      response.json(savedAndFormatted)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = {
    name,
    number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'requested resource cannot be found' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error('Error:', error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)


const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max))
}

app.listen(PORT, () => { console.log(`Server running on port ${ PORT }`) })
