import { createServer } from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, Card, AuthenticatedPlayer, Config, GameState } from "./model"
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy, generators } from 'openid-client'
import passport from 'passport'
import { Strategy as CustomStrategy } from "passport-custom"
import { gitlab } from "./secrets"
import cors from "cors"
import { setupMongo } from "./mongo"
import { setupRedis } from "./redis"

declare module 'express-session' {
    export interface SessionData {
        credits?: number
    }
}

async function main() {
    const OPERATOR_GROUP_ID = "advancedPlayer"
    // const DISABLE_SECURITY = !!process.env.DISABLE_SECURITY
    // const DISABLE_SECURITY = true
    const DISABLE_SECURITY = process.env.DISABLE_SECURITY

    const passportStrategies = [
        ...(DISABLE_SECURITY ? ["disable-security"] : []),
        "oidc",
    ]


    // set up Mongo
    // const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
    // const client = new MongoClient(mongoUrl)
    // let db: Db
    // let players: Collection
    // let authenticated_players: Collection
    // let cards: Collection
    const { gamesCollection, playersCollection, getGameState, tryToUpdateGameState } = await setupMongo()
    const { socketIoAdapter: adapter } = await setupRedis()


    // set up Express
    const app = express()
    const server = createServer(app)
    const port = parseInt(process.env.SERVER_PORT || "8228")
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    let config: Config = {
        numberOfDecks: 1,
        level: 1,
        targetScore: 5,
        tableSize: 12
    }

    // set up Pino logging
    const logger = pino({
        transport: {
            target: 'pino-pretty'
        }
    })
    app.use(expressPinoLogger({ logger }))

    // set up CORS
    app.use(cors({
        origin: "http://127.0.0.1:" + port,
        credentials: true,
    }))

    // set up session
    const sessionMiddleware = session({
        secret: 'a just so-so secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
            ttl: 14 * 24 * 60 * 60 // 14 days
        })
    })
    app.use(sessionMiddleware)

    app.use(passport.initialize())
    app.use(passport.session())
    passport.serializeUser((user: any, done) => {
        console.log("serializeUser", user)
        done(null, user)
    })
    passport.deserializeUser((user: any, done) => {
        console.log("deserializeUser", user)
        done(null, user)
    })

    app.get(
        "/api/login",
        passport.authenticate(passportStrategies, { failureRedirect: "/api/login" }),
        (req, res) => res.redirect("/")
    )

    app.get(
        "/login-callback",
        passport.authenticate(passportStrategies, {
            successRedirect: "/",
            failureRedirect: "/api/login",
        })
    )


    ////////////////////////////////////////////////////////////////////////////////////////////
    // set up Socket.IO
    // const io = new Server(server)
    const io = new Server(server, { adapter })
    console.log("SERVER_PORT", JSON.stringify(process.env.SERVER_PORT))

    // convert a connect middleware to a Socket.IO middleware
    const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next)
    io.use(wrap(sessionMiddleware))

    // TODO: change hard-coded game configuration
    // const playerUserIds = ["yl967", "hg163"]
    const gameState = await getGameState()
    Object.assign(gameState, createEmptyGame(gameState.players.map(player => player.name)))

    io.on('connection', client => {
        const user = (client.request as any).session?.passport?.user
        logger.info("new socket connection for user " + JSON.stringify(user))
        if (!user) {
            client.disconnect()
            return
        }

        function emitGameState(gameState: GameState) {
            client.emit(
                "game-state",
                playerIndex,
                gameState.currentTurnPlayerIndex,
                gameState.level,
                gameState.phase,
                gameState.playCount,
                gameState.table.cards,
            )
            // console.log("Start: " + gameState.players)
        }

        console.log("New client")
        let playerIndex: number = gameState.players.map(player => player.name).indexOf(user.preferred_username)
        console.log("dc", playerIndex)
        client.join(String(playerIndex))
        emitGameState(gameState)

        client.on("gamestate", async () => {
            const gameState = await getGameState()
            client.emit(
                "game-update",
                gameState
            )
        })

        client.on("action", async (action: Action) => {
            const gameState = await getGameState()
            console.log("current action done by", action.playerIndex)
            const result = doAction(gameState, action)
            if (await tryToUpdateGameState(gameState)) {
                io.emit("game-update", gameState)
                client.emit("player-update", result)
            }
            else {
                // TODO: do error handling
            }
        })

        client.on("new-game", async () => {
            const gameState = await getGameState()
            Object.assign(gameState, createEmptyGame(gameState.players.map(player => player.name), config.numberOfDecks, config.level, config.targetScore, config.tableSize))
            if (await tryToUpdateGameState(gameState)) {
                io.emit(
                    "game-state",
                    null,
                    gameState.currentTurnPlayerIndex,
                    gameState.level,
                    gameState.phase,
                    gameState.playCount,
                    gameState.table.cards,
                )
                console.log("new-game")
            }
            else {
                // TODO: do error handling
            }
        })

        client.on('get-config', () => {
            client.emit('get-config-reply', config)
        })

        client.on('update-config', (updatedConfig: Config) => {
            setTimeout(async () => {
                if (typeof updatedConfig === 'object' && !Array.isArray(updatedConfig) &&
                    'numberOfDecks' in updatedConfig &&
                    !isNaN(Number(updatedConfig.numberOfDecks)) &&
                    Number.isInteger(Number(updatedConfig.numberOfDecks)) &&
                    Number(updatedConfig.numberOfDecks) > 0 &&
                    Number(updatedConfig.numberOfDecks) <= 10 &&
                    'level' in updatedConfig &&
                    !isNaN(Number(updatedConfig.level)) &&
                    Number.isInteger(Number(updatedConfig.level)) &&
                    Number(updatedConfig.level) > 0 &&
                    (updatedConfig.level) <= 4 &&
                    'targetScore' in updatedConfig &&
                    !isNaN(Number(updatedConfig.targetScore)) &&
                    Number.isInteger(Number(updatedConfig.targetScore)) &&
                    Number(updatedConfig.targetScore) > 2 &&
                    (updatedConfig.targetScore) <= 10 &&
                    'tableSize' in updatedConfig &&
                    !isNaN(Number(updatedConfig.tableSize)) &&
                    Number.isInteger(Number(updatedConfig.tableSize)) &&
                    Number(updatedConfig.tableSize) > 3 &&
                    (updatedConfig.tableSize) <= 21 &&
                    Object.keys(updatedConfig).length === 4) {

                    config = updatedConfig
                    const gameState = await getGameState()
                    Object.assign(gameState, createEmptyGame(gameState.players.map(player => player.name), config.numberOfDecks, config.level, config.targetScore, config.tableSize))
                    if (await tryToUpdateGameState(gameState)) {
                        io.emit(
                            "game-state",
                            null,
                            gameState.currentTurnPlayerIndex,
                            gameState.level,
                            gameState.phase,
                            gameState.playCount,
                            gameState.table.cards,
                        )
                        client.emit('update-config-reply', true)
                    }
                    else {
                        // TODO: do error handling
                    }
                } else {
                    client.emit('update-config-reply', false)
                }
            }, 2000)
        })
    })

    ////////////////////////////////////////////////////////////////////////////////////////////
    // app routes
    app.post(
        "/api/logout",
        (req, res, next) => {
            req.logout((err) => {
                if (err) {
                    return next(err)
                }
                res.redirect("/")
            })
        }
    )

    app.get("/api/user", (req, res) => {
        res.json(req.user || {})
    })

    function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            res.sendStatus(401)
            return
        }

        next()
    }


    function checkRole(requiredRoles: string[]) {
        return function (req: Request, res: Response, next: NextFunction) {
            const roles = [].concat(req.user?.roles) || []
            const hasRequiredRole = roles.some((role: string) => requiredRoles.includes(role))
            console.log("hasRequiredRole", hasRequiredRole)
            if (hasRequiredRole) {
                next() // User has one of the required roles, proceed
            } else {
                console.log("hasRequiredRole2", hasRequiredRole)

                res.status(403).json({ message: "Access denied: Insufficient permissions" })
            }
        }
    }

    // GET route to get player information
    app.get('/api/player-info', checkAuthenticated, checkRole(['regularPlayer', 'advancedPlayer']), async (req, res) => {
        const playerInfo = await playersCollection.findOne({ _id: req.user.preferred_username })
        if (playerInfo) {
            res.json(playerInfo)
        } else {
            // If no player is found in the database, send back an error
            res.status(400).json({ error: "no player found" })
            return
        }
    })


    // PUT route to update player information
    app.put("/api/update-player-info", checkAuthenticated, checkRole(['regularPlayer', 'advancedPlayer']), async (req, res) => {
        const { preferred_username, name, nickname, email, preferredLevel, scoreHistory } = req.body

        const updateData = {
            name: name || "",
            nickname: nickname || "",
            email: email || "",
            preferredLevel: preferredLevel || 1,
        }

        try {
            const result = await playersCollection.updateOne(
                { _id: req.user.preferred_username },
                { $set: updateData },
                { upsert: true }
            )

            if (result.upsertedCount > 0) {
                res.status(201).json({ message: "Player created successfully", data: updateData })
            } else {
                res.status(200).json({ message: "Player info updated successfully", data: updateData })
            }
        } catch (error) {
            console.error("Error updating player info:", error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    })


    // GET route to get player history for advanced-player
    app.get('/api/player-history', checkAuthenticated, checkRole(['advancedPlayer']), async (req, res) => {
        const playerInfo = await playersCollection.findOne({ _id: req.user.preferred_username })
        if (playerInfo) {
            res.json(playerInfo)
        } else {
            // If no player is found in the database, send back an error
            res.status(400).json({ error: "no player found" })
            return
        }
    })

    // PATCH route to update player history
    app.patch("/api/update-player-history", checkAuthenticated, checkRole(['regularPlayer', 'advancedPlayer']), async (req, res) => {
        const { playerId, didWin, level } = req.body
        try {
            const updateField = didWin ? 'win' : 'loss'
            const result = await playersCollection.updateOne(
                { _id: playerId, 'scoreHistory.level': level },
                { $inc: { [`scoreHistory.$.${updateField}`]: 1 } },
                { upsert: true }
            )
            if (result.modifiedCount === 0) {
                await playersCollection.updateOne(
                    { _id: playerId },
                    { $push: { 'scoreHistory': { level: level, win: didWin ? 1 : 0, loss: didWin ? 0 : 1 } } },
                    { upsert: true }
                )
            }
            res.send({ message: 'Score history updated successfully' })
        } catch (error) {
            console.error('Failed to update score history:', error)
            res.status(400).send('Error updating score history')
        }
    })


    ////////////////////////////////////////////////////////////////////////////////////////////
    // connect to Mongo
    // client.connect().then(async () => {
    //     logger.info('connected successfully to MongoDB')
    //     db = client.db("games")
    //     players = db.collection('players')
    //     authenticated_players = db.collection('authenticated_players')
    //     cards = db.collection('cards')

    passport.use("disable-security", new CustomStrategy((req, done) => {
        if (req.query.key !== DISABLE_SECURITY) {
            console.log(DISABLE_SECURITY)
            console.log("you must supply ?key=" + DISABLE_SECURITY + " to log in via DISABLE_SECURITY")
            done(null, false)
        } else {
            done(null, { preferred_username: req.query.user, roles: [].concat(req.query.role) })
        }
    }))

    {
        const issuer = await Issuer.discover("https://coursework.cs.duke.edu/")
        const client = new issuer.Client(gitlab)

        console.log("my ui port is", process.env.UI_PORT)
        const params = {
            scope: 'openid profile email',
            nonce: generators.nonce(),
            // redirect_uri: `http://localhost:${parseInt(process.env.UI_PORT || "31000")}/login-callback`,
            redirect_uri: `http://localhost:31000/login-callback`,
            state: generators.state(),
        }

        async function verify(tokenSet: any, userInfo: any, done: any) {
            logger.info("oidc " + JSON.stringify(userInfo))
            // console.log('userInfo', userInfo)
            userInfo.roles = userInfo.groups.includes(OPERATOR_GROUP_ID) ? ["regularPlayer"] : ["advancedPlayer"]
            return done(null, userInfo)
        }

        passport.use('oidc', new Strategy({ client, params }, verify))
    }

    // start server
    server.listen(port)
    logger.info(`Game server listening on port ${port}`)
    // })
}

main()
