import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

import { addParticipantToList, addList, deleteParticipantOnList, deleteList, getList, getLists, updateParticipantOnList, load, save } from "./data"
import { Console } from 'console'

// set up Express
const app = express()
const port = 8081
app.use(bodyParser.json())

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

load()

// app routes
app.get("/api/lists", (req, res) => {
  res.status(200).json(getLists())
})

app.get("/api/list/:listId/participants", (req, res) => {
  const list = getList(req.params.listId)
  if (!list) {
    res.status(404).json({ status: "error" })
    return
  }
  res.status(200).json(list)
})

app.post("/api/new-list", (req, res) => {
  if (typeof req.body?.name !== "string" || getList(req.body?.name)) {
    res.status(400).json({ status: "error" })
    return
  }
  const listId = addList(req.body.name)
  res.status(200).json({ listId })
})

app.post("/api/list/:listId/new-participant", (req, res) => {
  if (typeof req.body?.name !== "string") {
    res.status(400).json({ status: "error" })
    return
  }
  const participantId = addParticipantToList(
    req.params.listId, 
    { 
      name: req.body.name,
      reviewed: req.body.reviewed
    }
  )
  if (participantId == null) {
    res.status(404).json({ status: "error" })
    return
  }
  res.status(200).json({ participantId })
})

app.put("/api/list/:listId/participant/:participantId", (req, res) => {
  const { name, reviewed } = req.body;

  // Validate input: check if at least one of the fields is present and correctly formatted
  if ((name !== undefined && typeof name !== "string") || (reviewed !== undefined && typeof reviewed !== "boolean")) {
    res.status(400).json({ status: "error", message: "Invalid input" });
    return;
  }

  // Prepare the update object, only including fields that are present in the request body
  interface UpdateParticipant {
    name?: string;
    reviewed?: boolean;
  }
  const update: UpdateParticipant = {};
  if (name !== undefined) {
    update.name = name;
  }
  if (reviewed !== undefined) {
    update.reviewed = reviewed;
  }

  const updatedCount = updateParticipantOnList(req.params.listId, req.params.participantId, update);
  
  if (updatedCount === 0) {
    res.status(404).json({ status: "error", message: "Participant not found" });
    return;
  }

  res.status(200).json({ updatedCount });
});


app.delete("/api/list/:listId", (req, res) => {
  if (deleteList(req.params.listId)) {
    res.status(200).json({ status: "ok" })
  } else {
    res.status(404).json({ status: "error" })
  }
})

app.delete("/api/list/:listId/participant/:participantId", (req, res) => {
  if (deleteParticipantOnList(req.params.listId, req.params.participantId)) {
    res.status(200).json({ status: "ok" })
  } else {
    res.status(404).json({ status: "error" })
  }
})

// start server
app.listen(port, () => {
  console.log(`Signup list server listening on port ${port}`)
})
