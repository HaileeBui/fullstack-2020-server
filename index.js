// const http = require('http')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(cors())
morgan.token('post', (req, res) => JSON.stringify(req.body))

app.use(morgan((tokens, req, res) => {
    if (tokens.method(req, res) === 'POST'){
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

let persons = [
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

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${ persons.length } people</p><p>${ new Date() }</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(item => item.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(note => note.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
    const foundPerson = persons.find(item => item.name === body.name)
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    if(foundPerson) {
        return response.status(400).json({
            error:'name is already exist'
        })
    }
    
    const person = {
        id: Number(getRandomInt(100)),
        name: body.name,
        number: body.number,
    }
    persons.push(person)
    console.log(persons)
    response.json(person)
})

const getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => { console.log(`Server running on port ${ PORT }`) })
