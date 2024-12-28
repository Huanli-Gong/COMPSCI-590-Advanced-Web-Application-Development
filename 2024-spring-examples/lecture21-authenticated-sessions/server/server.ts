import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cors from 'cors'

// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8210

// set up body parsing for both JSON and URL encoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({ transport: { target: 'pino-pretty' }})
app.use(expressPinoLogger({ logger }))

// set up CORS
app.use(cors({
  // un-comment the following lines to allow the malicious server access
  // origin: "http://localhost:8219",
  // credentials: true,
}))

// set up session
app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  // the default store is memory-backed, so all sessions will be forgotten every time the server restarts
  // uncomment the following to use a Mongo-backed store that will work with a load balancer
  // store: MongoStore.create({
  //   mongoUrl: 'mongodb://127.0.0.1:27017',
  //   ttl: 14 * 24 * 60 * 60 // 14 days
  // })
}))
declare module 'express-session' {
  export interface SessionData {
    userId?: string
    credits?: number
  }
}

app.get(
  "/",
  (req, res) => {
    res.status(200).send(`
<h1>Hello, ${req.session?.userId || 'unknown'}</h1>
You have ${req.session?.credits || 'no credits'}.
<form method="POST" action="/login">
User ID: <input name="userId" value="alice">
<input type="submit" value="Login">
</form>
<form method="POST" action="/add-credit">
<input name="amount" value="1">
<input type="submit" value="Add Credit via POST">
</form>
<form method="GET" action="/add-credit">
<input name="amount" value="1">
<input type="submit" value="Add Credit via GET">
</form>
<button onclick="addCreditViaFetch()">Add 100 credits via fetch POST</button>
<script>
function addCreditViaFetch() {
  fetch(
    "/add-credit", 
    { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 100 }),
    }
  ).then(() => alert('done - refresh page to see result'))
}
</script>
    `)
  }
)

app.post(
  "/login",
  (req, res) => {
    req.session.userId = req.body.userId
    res.redirect("/")
  }
)

function addCredit(req: Request, res: Response) {
  if (!req.session.userId) {
    res.status(403).send("log in first")
    return
  }

  // NOTE: the following line is a bad idea!
  // for GET, the parameters come in via the query parameter
  // for POST, the parameters come in via the body
  const amount = parseInt(req.body.amount || req.query.amount) || 1

  // the following line is the "right" thing to do
  // const amount = parseInt(req.body.amount) || 1
  
  req.session.credits = (req.session.credits || 0) + amount
  res.redirect("/")
}

app.post("/add-credit", addCredit)

// NOTE: the following line is a bad idea!
app.get("/add-credit", addCredit)

// start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
