import express from 'express'
import bodyParser from 'body-parser'

// data managed by server
const participantList = [] as string[]

// set up Express
const app = express()
const PORT = 8071
app.use(bodyParser.json())

// app routes
app.get("/api/list", (req, res) => {
  res.status(200).json(participantList)
})

app.put("/api/list/participant/:name", async (req, res) => {
  if (!req.params.name) {
    res.status(400).json({ message: "invalid name" })
    return
  }
  participantList.push(req.params.name)

  // a completely artificial delay
  await new Promise<void>((resolve) => setTimeout(resolve, 2000))

  res.status(200).json({ status: "added" })
})

// start server
app.listen(PORT, () => {
  console.log(`Signup server listening on port ${PORT}`)
})
