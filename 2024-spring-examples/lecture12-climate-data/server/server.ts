import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { MongoClient } from 'mongodb'

// set up Mongo
const url = 'mongodb://127.0.0.1:27017'
const client = new MongoClient(url)

// set up Express
const app = express()
const port = 8121
app.use(bodyParser.json())

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

// app routes
app.get("/api/data", async (req, res) => {
  const db = client.db("test")
  const collection = db.collection('climate')
  const data = await collection.find().toArray()

  res.status(200).json(data)
})

// connect to Mongo
client.connect().then(() => {
  console.log('Connected successfully to MongoDB')

  // start server
  app.listen(port, () => {
    console.log(`Climate data server listening on port ${port}`)
  })
})
