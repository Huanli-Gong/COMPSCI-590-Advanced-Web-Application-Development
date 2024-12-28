import { MongoClient } from 'mongodb'
import { Operator, Customer, Ingredient} from './data'

// Connection URL
const url = 'mongodb://127.0.0.1:27017'
const client = new MongoClient(url)

const operators: Operator[] = [
  {
    _id: "jim",
    name: "Jim",
  },
  {
    _id: "mary",
    name: "Mary",
  },
]

const customers: Customer[] = [
  {
    _id: "alice",
    name: "Alice",
  },
  {
    _id: "bob",
    name: "Bob",
  },
]

const possibleIngredients: Ingredient[] = [
  { _id: "A", name: "strawberry", price: 1 },
  { _id: "B", name: "milk", price: 1 },
  { _id: "C", name: "banana", price: 1 },
  { _id: "D", name: "blueberry", price: 1 },
  { _id: "E", name: "mango", price: 1 },
  { _id: "F", name: "peach", price: 1 },
  { _id: "G", name: "apple", price: 1 },
  { _id: "H", name: "orange", price: 1 },
  { _id: "I", name: "pear", price: 1 },
  { _id: "J", name: "cherry", price: 1 }
]


async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db("test")

  // set up unique index for upsert -- to make sure a customer cannot have more than one draft order
  db.collection("orders").createIndex(
    { customerId: 1 }, 
    { unique: true, partialFilterExpression: { state: "draft" } }
  )

  // add data
  console.log("inserting customers", await db.collection("customers").insertMany(customers as any))
  console.log("inserting operators", await db.collection("operators").insertMany(operators as any))
  console.log("inserting ingredients", await db.collection("possibleIngredients").insertMany(possibleIngredients as any))

  process.exit(0)
}

main()
