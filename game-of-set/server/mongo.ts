import { Auth, MongoClient, ObjectId } from "mongodb"
// import { createAdapter } from "@socket.io/mongo-adapter"
import { GameState, createEmptyGame, AuthenticatedPlayer, ScoreHistory, Card, Deck, Player, Table } from "./model"
export type CardId = string
const DB = "game"
// const SOCKET_IO_EVENTS_COLLECTION = "socket.io-adapter-events"
const GAMES_COLLECTION = "games"
const GAME_STATE_ID = new ObjectId("000000000000000000000000")
const AUTHENTICATED_PLAYER_COLLECTION = "authenticated_players"
const AUTHENTICATED_PLAYER_STATE_ID = new ObjectId("000000000000000000000001")
const group_players: AuthenticatedPlayer[] = [
    {
        _id: "yl967",
        name: "Yang Li",
        preferred_username: "yl967",
        nickname: "Young",
        email: "yang.li@duke.edu",
        preferredLevel: 1,
        scoreHistory: [
            {
                level: 1,
                win: 5,
                loss: 5,
            },
            {
                level: 2,
                win: 5,
                loss: 5,
            },
            {
                level: 3,
                win: 5,
                loss: 5,
            },
            {
                level: 4,
                win: 5,
                loss: 5,
            }
        ],
    },
    {
        _id: "hg163",
        name: "Huanli Gong",
        preferred_username: "hg163",
        nickname: "Huanli Gong",
        email: "huanli.gong@duke.edu",
        preferredLevel: 1,
        scoreHistory: [
            {
                level: 1,
                win: 5,
                loss: 5,
            },
            {
                level: 2,
                win: 5,
                loss: 5,
            },
            {
                level: 3,
                win: 5,
                loss: 5,
            },
            {
                level: 4,
                win: 5,
                loss: 5,
            }
        ],
    }
]

export interface MongoGameState extends GameState {
    _id: ObjectId
    version: number
}

export async function setupMongo() {
    // const mongoClient = new MongoClient(process.env.MONGO_URL || "mongodb://localhost/?replicaSet=rs0")
    // const mongoClient = new MongoClient(process.env.MONGO_URL || "mongodb://localhost/")
    const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
    const mongoClient = new MongoClient(mongoUrl)
    await mongoClient.connect()

    // try {
    // 	await mongoClient.db(DB).createCollection(SOCKET_IO_EVENTS_COLLECTION, {
    // 		capped: true,
    // 		size: 1e6
    // 	})
    // } catch (e) {
    // 	// collection already exists ignore
    // }

    const db = mongoClient.db(DB)
    // const socketIoEventsCollection = db.collection(SOCKET_IO_EVENTS_COLLECTION)
    const gamesCollection = db.collection(GAMES_COLLECTION)
    const playersCollection = db.collection(AUTHENTICATED_PLAYER_COLLECTION)
    try {
        // await playersCollection.insertMany(group_players as any)
        const bulkOperations = group_players.map(player => ({
            updateOne: {
                filter: { _id: player._id },
                update: { $setOnInsert: player },
                upsert: true
            }
        }))
        await playersCollection.bulkWrite(bulkOperations)

        // await gamesCollection.insertOne({ _id: GAME_STATE_ID, version: 0, ...createEmptyGame(["yl967", "hg163"], 1, 1) })
        const gameState = createEmptyGame(["yl967", "hg163"], 1, 1)
        await gamesCollection.replaceOne(
            { _id: GAME_STATE_ID },
            { version: 0, ...gameState },
            { upsert: true }
        )

    } catch (e) {
        // throw new Error("Insert error: " + e.message)
        throw new Error("Upsert error: " + e.message)
    }

    return {
        // socketIoEventsCollection,
        gamesCollection,
        playersCollection,
        // socketIoAdapter: createAdapter(socketIoEventsCollection),
        getGameState: async () => {
            const gameStateData = await gamesCollection.findOne({ _id: GAME_STATE_ID }) as unknown as MongoGameState
            if (!gameStateData) {
                throw new Error("Game state not found.")
            }

            // Reconstruct Players
            const players = gameStateData.players.map(p => new Player(p.PlayerId, p.name, p.score))

            const cardsById: Record<CardId, Card> = {}
            Object.keys(gameStateData.cardsById).forEach(key => {
                const c = gameStateData.cardsById[key]
                cardsById[key] = new Card(c.id, c.number, c.shape, c.color, c.shading, c.locationType)
            })

            // Reconstruct Table
            const savedCards = gameStateData.deck.cards.map(c => new Card(c.id, c.number, c.shape, c.color, c.shading, c.locationType))
            const deck = new Deck({}, 1, savedCards)
            const savedCards1 = gameStateData.table.cards.map(c => new Card(c.id, c.number, c.shape, c.color, c.shading, c.locationType))
            const table = new Table(new Deck(), savedCards1)
            const objectId = new ObjectId(gameStateData._id)

            return {
                _id: objectId,
                version: gameStateData.version,
                players,
                cardsById,
                deck,
                table,
                currentTurnPlayerIndex: gameStateData.currentTurnPlayerIndex,
                phase: gameStateData.phase,
                playCount: gameStateData.playCount,
                level: gameStateData.level,
                targetScore: gameStateData.targetScore,
                tableSize:gameStateData.tableSize
            }
        },
        tryToUpdateGameState: async (newGameState: MongoGameState) => {
            const result = await gamesCollection.replaceOne(
                { _id: GAME_STATE_ID, version: newGameState.version },
                { ...newGameState, version: newGameState.version + 1 },
            )
            if (result.modifiedCount > 0) {
                ++newGameState.version
                return true
            } else {
                return false
            }
        },
    }
}