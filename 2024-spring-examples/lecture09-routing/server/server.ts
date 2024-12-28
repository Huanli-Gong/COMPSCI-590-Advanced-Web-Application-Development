import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

// set up Express
const app = express()
const port = 8091
app.use(bodyParser.json())

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

app.use("/b*", async (req, res, next) => {
  // a completely artificial delay
  await new Promise<void>((resolve) => setTimeout(resolve, parseInt(req.query.delay as string) || 2000))
  next()
})

// app routes
app.get("/banana", (req, res) => {
  res.status(200).send("<h1>Banana</h1>")
})

// start server
app.listen(port, () => {
  console.log(`Routing example server listening on port ${port}`)
})
